package com.ecommerce.analytics.controllers;

import com.ecommerce.analytics.entities.*;
import com.ecommerce.analytics.repositories.*;
import com.ecommerce.analytics.security.UserDetailsImpl;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    @Value("${STRIPE_SECRET_KEY:}")
    private String stripeSecretKey;

    @Value("${STRIPE_PUBLISHABLE_KEY:}")
    private String stripePublishableKey;

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final NotificationRepository notificationRepository;
    private final CouponRepository couponRepository;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("publishableKey", stripePublishableKey);
        return ResponseEntity.ok(config);
    }

    /**
     * Creates a Stripe Checkout Session for cart items.
     * After successful payment, creates order + order_items and reduces stock.
     */
    @PostMapping("/create-checkout-session")
    public ResponseEntity<?> createCheckoutSession(@RequestBody CheckoutRequest request) {
        try {
            // Build line items for Stripe
            SessionCreateParams.Builder builder = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(request.getSuccessUrl() + "?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(request.getCancelUrl());

            for (CartItem item : request.getItems()) {
                builder.addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity((long) item.getQuantity())
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("usd")
                                                .setUnitAmount((long) (item.getPrice() * 100))
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName(item.getProductName())
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                );
            }

            Session session = Session.create(builder.build());

            Map<String, String> response = new HashMap<>();
            response.put("sessionId", session.getId());
            response.put("url", session.getUrl());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Called after successful Stripe payment to create the order and reduce stock.
     */
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(@RequestBody ConfirmRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            User user = userRepository.findById(userDetails.getId()).orElseThrow();

            // Group items by store
            Map<Long, List<CartItem>> itemsByStore = new HashMap<>();
            for (CartItem item : request.getItems()) {
                Product product = productRepository.findById(item.getProductId()).orElseThrow();
                Long storeId = product.getStore().getId();
                itemsByStore.computeIfAbsent(storeId, k -> new ArrayList<>()).add(item);
            }

            List<Map<String, Object>> createdOrders = new ArrayList<>();

            // Create one order per store
            for (Map.Entry<Long, List<CartItem>> entry : itemsByStore.entrySet()) {
                Store store = storeRepository.findById(entry.getKey()).orElseThrow();
                List<CartItem> items = entry.getValue();

                BigDecimal total = BigDecimal.ZERO;
                for (CartItem ci : items) {
                    total = total.add(BigDecimal.valueOf(ci.getPrice() * ci.getQuantity()));
                }

                // Apply Coupon Discount
                if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
                    Optional<Coupon> couponOpt = couponRepository.findByCodeAndIsActiveTrue(request.getCouponCode());
                    if (couponOpt.isPresent()) {
                        Coupon coupon = couponOpt.get();
                        if (coupon.getExpiryDate().isAfter(LocalDateTime.now())) {
                            BigDecimal discount = total.multiply(coupon.getDiscountPercentage().divide(BigDecimal.valueOf(100)));
                            total = total.subtract(discount);
                        }
                    }
                }

                Order order = Order.builder()
                        .user(user)
                        .store(store)
                        .status(Order.OrderStatus.PROCESSING)
                        .grandTotal(total)
                        .shippingAddress(request.getShippingAddress())
                        .build();
                orderRepository.save(order);

                // Create Notification
                Notification notification = new Notification();
                notification.setUser(user);
                notification.setMessage("Your order #" + order.getId() + " has been created and is being processed.");
                notificationRepository.save(notification);

                // Create order items and reduce stock
                for (CartItem ci : items) {
                    Product product = productRepository.findById(ci.getProductId()).orElseThrow();

                    OrderItem oi = OrderItem.builder()
                            .order(order)
                            .product(product)
                            .quantity(ci.getQuantity())
                            .price(BigDecimal.valueOf(ci.getPrice() * ci.getQuantity()))
                            .build();
                    orderItemRepository.save(oi);

                    // Reduce stock
                    product.setStockQuantity(Math.max(0, product.getStockQuantity() - ci.getQuantity()));
                    productRepository.save(product);
                }

                Map<String, Object> orderInfo = new HashMap<>();
                orderInfo.put("orderId", order.getId());
                orderInfo.put("total", total);
                orderInfo.put("status", order.getStatus().name());
                createdOrders.add(orderInfo);
            }

            return ResponseEntity.ok(Map.of("message", "Orders created successfully", "orders", createdOrders));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── DTOs ──
    static class CartItem {
        private Long productId;
        private String productName;
        private double price;
        private int quantity;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }

    static class CheckoutRequest {
        private List<CartItem> items;
        private String successUrl;
        private String cancelUrl;
        private String couponCode;

        public List<CartItem> getItems() { return items; }
        public void setItems(List<CartItem> items) { this.items = items; }
        public String getSuccessUrl() { return successUrl; }
        public void setSuccessUrl(String successUrl) { this.successUrl = successUrl; }
        public String getCancelUrl() { return cancelUrl; }
        public void setCancelUrl(String cancelUrl) { this.cancelUrl = cancelUrl; }
        public String getCouponCode() { return couponCode; }
        public void setCouponCode(String couponCode) { this.couponCode = couponCode; }
    }

    static class ConfirmRequest {
        private String sessionId;
        private List<CartItem> items;
        private String couponCode;
        private String shippingAddress;

        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        public List<CartItem> getItems() { return items; }
        public void setItems(List<CartItem> items) { this.items = items; }
        public String getCouponCode() { return couponCode; }
        public void setCouponCode(String couponCode) { this.couponCode = couponCode; }
        public String getShippingAddress() { return shippingAddress; }
        public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    }
}
