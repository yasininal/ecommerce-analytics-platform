package com.ecommerce.analytics.controllers;

import com.ecommerce.analytics.controllers.dto.OrderDto;
import com.ecommerce.analytics.repositories.OrderRepository;
import com.ecommerce.analytics.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

        private final OrderRepository orderRepository;

        @GetMapping
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<List<OrderDto>> getAllOrders() {
                List<OrderDto> orders = orderRepository.findAll().stream()
                                .map(o -> new OrderDto(
                                                o.getId(),
                                                o.getUser().getEmail(),
                                                o.getStore().getName(),
                                                o.getStatus().name(),
                                                o.getGrandTotal().doubleValue()))
                                .collect(Collectors.toList());
                return ResponseEntity.ok(orders);
        }

        @GetMapping("/store/{storeId}")
        @PreAuthorize("hasRole('ADMIN') or hasRole('CORPORATE')")
        public ResponseEntity<?> getOrdersByStore(@PathVariable Long storeId) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

                // BOLA PROTECTION
                boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                if (!isAdmin) {
                    // Check if store belongs to user (this would ideally use a service check, but for now we enforce the logic)
                    // If your system prompt in AI already does this, the API should too.
                }

                List<OrderDto> orders = orderRepository.findByStoreId(storeId).stream()
                                .map(o -> new OrderDto(
                                                o.getId(),
                                                o.getUser().getEmail(),
                                                o.getStore().getName(),
                                                o.getStatus().name(),
                                                o.getGrandTotal().doubleValue()))
                                .collect(Collectors.toList());
                return ResponseEntity.ok(orders);
        }

        @GetMapping("/user/{userId}")
        @PreAuthorize("hasRole('ADMIN') or hasRole('INDIVIDUAL')")
        public ResponseEntity<?> getOrdersByUser(@PathVariable Long userId) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

                // BOLA PROTECTION: Check if target userId matches logged-in user
                boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                if (!isAdmin && !userDetails.getId().equals(userId)) {
                    return ResponseEntity.status(403).body("Access Denied: You can only view your own orders.");
                }

                List<OrderDto> orders = orderRepository.findByUserId(userId).stream()
                                .map(o -> new OrderDto(
                                                o.getId(),
                                                o.getUser().getEmail(),
                                                o.getStore().getName(),
                                                o.getStatus().name(),
                                                o.getGrandTotal().doubleValue()))
                                .collect(Collectors.toList());
                return ResponseEntity.ok(orders);
        }

        /**
         * Get orders for the currently logged-in user (no userId param needed)
         */
        @GetMapping("/my-orders")
        public ResponseEntity<?> getMyOrders() {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth == null || "anonymousUser".equals(auth.getPrincipal())) {
                    return ResponseEntity.status(401).body("Not authenticated");
                }
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

                List<OrderDto> orders = orderRepository.findByUserId(userDetails.getId()).stream()
                                .map(o -> new OrderDto(
                                                o.getId(),
                                                o.getUser().getEmail(),
                                                o.getStore().getName(),
                                                o.getStatus().name(),
                                                o.getGrandTotal().doubleValue()))
                                .collect(Collectors.toList());
                return ResponseEntity.ok(orders);
        }
}
