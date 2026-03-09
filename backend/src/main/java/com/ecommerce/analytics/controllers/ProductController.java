package com.ecommerce.analytics.controllers;

import com.ecommerce.analytics.controllers.dto.ProductDto;
import com.ecommerce.analytics.repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

        private final ProductRepository productRepository;

        @GetMapping
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<List<ProductDto>> getAllProducts() {
                List<ProductDto> products = productRepository.findAll().stream()
                                .map(p -> new ProductDto(
                                                p.getId(),
                                                p.getName(),
                                                p.getSku(),
                                                p.getUnitPrice().doubleValue(),
                                                p.getCategory() != null ? p.getCategory().getName() : "Uncategorized",
                                                p.getStore().getName()))
                                .collect(Collectors.toList());
                return ResponseEntity.ok(products);
        }

        @GetMapping("/store/{storeId}")
        @PreAuthorize("hasRole('ADMIN') or hasRole('CORPORATE')")
        public ResponseEntity<List<ProductDto>> getProductsByStore(@PathVariable Long storeId) {
                List<ProductDto> products = productRepository.findByStoreId(storeId).stream()
                                .map(p -> new ProductDto(
                                                p.getId(),
                                                p.getName(),
                                                p.getSku(),
                                                p.getUnitPrice().doubleValue(),
                                                p.getCategory() != null ? p.getCategory().getName() : "Uncategorized",
                                                p.getStore().getName()))
                                .collect(Collectors.toList());
                return ResponseEntity.ok(products);
        }
}
