package com.ecommerce.analytics.controllers;

import com.ecommerce.analytics.controllers.dto.OrderDto;
import com.ecommerce.analytics.repositories.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
        public ResponseEntity<List<OrderDto>> getOrdersByStore(@PathVariable Long storeId) {
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
        public ResponseEntity<List<OrderDto>> getOrdersByUser(@PathVariable Long userId) {
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
}
