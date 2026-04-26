package com.ecommerce.analytics.controllers;

import com.ecommerce.analytics.controllers.dto.OrderDto;
import com.ecommerce.analytics.entities.Order;
import com.ecommerce.analytics.entities.Store;
import com.ecommerce.analytics.repositories.OrderRepository;
import com.ecommerce.analytics.repositories.StoreRepository;
import com.ecommerce.analytics.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

        private final OrderRepository orderRepository;
        private final StoreRepository storeRepository;

        @GetMapping
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<List<OrderDto>> getAllOrders() {
                List<OrderDto> orders = orderRepository.findAll().stream()
                                .map(this::toDto)
                                .collect(Collectors.toList());
                return ResponseEntity.ok(orders);
        }

        @GetMapping("/store/{storeId}")
        @PreAuthorize("hasRole('ADMIN') or hasRole('CORPORATE')")
        public ResponseEntity<?> getOrdersByStore(@PathVariable Long storeId) {
                List<OrderDto> orders = orderRepository.findByStoreId(storeId).stream()
                                .map(this::toDto)
                                .collect(Collectors.toList());
                return ResponseEntity.ok(orders);
        }

        @GetMapping("/user/{userId}")
        @PreAuthorize("hasRole('ADMIN') or hasRole('INDIVIDUAL')")
        public ResponseEntity<?> getOrdersByUser(@PathVariable Long userId) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

                boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                if (!isAdmin && !userDetails.getId().equals(userId)) {
                    return ResponseEntity.status(403).body("Access Denied: You can only view your own orders.");
                }

                List<OrderDto> orders = orderRepository.findByUserId(userId).stream()
                                .map(this::toDto)
                                .collect(Collectors.toList());
                return ResponseEntity.ok(orders);
        }

        /**
         * Get orders for the currently logged-in user
         */
        @GetMapping("/my-orders")
        public ResponseEntity<?> getMyOrders() {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth == null || "anonymousUser".equals(auth.getPrincipal())) {
                    return ResponseEntity.status(401).body("Not authenticated");
                }
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

                List<OrderDto> orders = orderRepository.findByUserId(userDetails.getId()).stream()
                                .map(this::toDto)
                                .collect(Collectors.toList());
                return ResponseEntity.ok(orders);
        }

        /**
         * Get orders for the currently logged-in seller's store
         */
        @GetMapping("/my-store-orders")
        @PreAuthorize("hasRole('CORPORATE')")
        public ResponseEntity<?> getMyStoreOrders() {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

                // Find the store owned by this user
                Store store = storeRepository.findByOwnerId(userDetails.getId()).orElse(null);
                if (store == null) {
                    return ResponseEntity.ok(List.of());
                }

                List<OrderDto> orders = orderRepository.findByStoreIdOrderByIdDesc(store.getId()).stream()
                                .map(this::toDto)
                                .collect(Collectors.toList());
                return ResponseEntity.ok(orders);
        }

        /**
         * Update order status (seller confirms, ships, etc.)
         */
        @PatchMapping("/{orderId}/status")
        @PreAuthorize("hasRole('ADMIN') or hasRole('CORPORATE')")
        public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId, @RequestBody Map<String, String> body) {
                String newStatus = body.get("status");
                if (newStatus == null) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
                }

                Order order = orderRepository.findById(orderId).orElse(null);
                if (order == null) {
                    return ResponseEntity.notFound().build();
                }

                // Corporate users can only update their own store's orders
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

                if (!isAdmin) {
                    Store store = storeRepository.findByOwnerId(userDetails.getId()).orElse(null);
                    if (store == null || !order.getStore().getId().equals(store.getId())) {
                        return ResponseEntity.status(403).body(Map.of("error", "You can only manage your own store's orders"));
                    }
                }

                try {
                    order.setStatus(Order.OrderStatus.valueOf(newStatus));
                    orderRepository.save(order);
                    return ResponseEntity.ok(Map.of(
                        "message", "Order status updated",
                        "orderId", order.getId(),
                        "status", order.getStatus().name()
                    ));
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid status: " + newStatus));
                }
        }

        /**
         * Cancel order (user cancels their own order)
         */
        @PostMapping("/{orderId}/cancel")
        @PreAuthorize("hasRole('INDIVIDUAL') or hasRole('CORPORATE') or hasRole('ADMIN')")
        public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
                Order order = orderRepository.findById(orderId).orElse(null);
                if (order == null) {
                    return ResponseEntity.notFound().build();
                }

                // Check ownership
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

                if (!isAdmin && !order.getUser().getId().equals(userDetails.getId())) {
                    return ResponseEntity.status(403).body(Map.of("error", "You can only cancel your own orders"));
                }

                // Only allow cancellation if PENDING or PROCESSING
                if (order.getStatus() != Order.OrderStatus.PENDING && order.getStatus() != Order.OrderStatus.PROCESSING) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Order cannot be cancelled in its current status: " + order.getStatus()));
                }

                order.setStatus(Order.OrderStatus.CANCELLED);
                orderRepository.save(order);
                return ResponseEntity.ok(Map.of(
                    "message", "Order cancelled successfully",
                    "orderId", order.getId(),
                    "status", order.getStatus().name()
                ));
        }

        private OrderDto toDto(Order o) {
                return new OrderDto(
                        o.getId(),
                        o.getUser().getEmail(),
                        o.getStore().getName(),
                        o.getStatus().name(),
                        o.getGrandTotal().doubleValue()
                );
        }
}
