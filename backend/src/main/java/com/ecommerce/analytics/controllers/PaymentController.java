package com.ecommerce.analytics.controllers;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    @Value("${STRIPE_SECRET_KEY:}")
    private String stripeSecretKey;

    @Value("${STRIPE_PUBLISHABLE_KEY:}")
    private String stripePublishableKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    /**
     * Returns the Stripe publishable key to the frontend
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("publishableKey", stripePublishableKey);
        return ResponseEntity.ok(config);
    }

    /**
     * Creates a Stripe Checkout Session for a product purchase
     */
    @PostMapping("/create-checkout-session")
    public ResponseEntity<?> createCheckoutSession(@RequestBody CheckoutRequest request) {
        try {
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(request.getSuccessUrl() + "?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(request.getCancelUrl())
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setQuantity((long) request.getQuantity())
                                    .setPriceData(
                                            SessionCreateParams.LineItem.PriceData.builder()
                                                    .setCurrency("usd")
                                                    .setUnitAmount((long) (request.getPrice() * 100)) // Stripe uses cents
                                                    .setProductData(
                                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                    .setName(request.getProductName())
                                                                    .setDescription("SKU: " + request.getSku())
                                                                    .build()
                                                    )
                                                    .build()
                                    )
                                    .build()
                    )
                    .build();

            Session session = Session.create(params);

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
     * DTO for checkout requests from frontend
     */
    static class CheckoutRequest {
        private String productName;
        private String sku;
        private double price;
        private int quantity;
        private String successUrl;
        private String cancelUrl;

        // Getters and Setters
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        public String getSku() { return sku; }
        public void setSku(String sku) { this.sku = sku; }
        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
        public String getSuccessUrl() { return successUrl; }
        public void setSuccessUrl(String successUrl) { this.successUrl = successUrl; }
        public String getCancelUrl() { return cancelUrl; }
        public void setCancelUrl(String cancelUrl) { this.cancelUrl = cancelUrl; }
    }
}
