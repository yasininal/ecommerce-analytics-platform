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
        private final com.ecommerce.analytics.repositories.StoreRepository storeRepository;
        private final com.ecommerce.analytics.repositories.CategoryRepository categoryRepository;

        @GetMapping
        @PreAuthorize("permitAll()")
        public ResponseEntity<List<ProductDto>> getAllProducts() {
                List<ProductDto> products = productRepository.findAll().stream()
                                .map(this::convertToDto)
                                .collect(Collectors.toList());
                return ResponseEntity.ok(products);
        }

        @GetMapping("/search")
        @PreAuthorize("permitAll()")
        public ResponseEntity<List<ProductDto>> searchProducts(
                @RequestParam(required = false) Long categoryId,
                @RequestParam(required = false) java.math.BigDecimal minPrice,
                @RequestParam(required = false) java.math.BigDecimal maxPrice,
                @RequestParam(required = false) String search
        ) {
            List<ProductDto> products = productRepository.searchProducts(categoryId, minPrice, maxPrice, search).stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(products);
        }

        @GetMapping("/{id}")
        @PreAuthorize("permitAll()")
        public ResponseEntity<ProductDto> getProductById(@PathVariable Long id) {
            com.ecommerce.analytics.entities.Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
            return ResponseEntity.ok(convertToDto(product));
        }

        @GetMapping("/store/{storeId}")
        @PreAuthorize("hasRole('ADMIN') or hasRole('CORPORATE')")
        public ResponseEntity<List<ProductDto>> getProductsByStore(@PathVariable Long storeId) {
                List<ProductDto> products = productRepository.findByStoreId(storeId).stream()
                                .map(this::convertToDto)
                                .collect(Collectors.toList());
                return ResponseEntity.ok(products);
        }

        @PostMapping
        @PreAuthorize("hasRole('ADMIN') or hasRole('CORPORATE')")
        public ResponseEntity<ProductDto> createProduct(@RequestBody ProductDto dto) {
                com.ecommerce.analytics.entities.Product product = new com.ecommerce.analytics.entities.Product();
                updateProductFromDto(product, dto);
                product = productRepository.save(product);
                return ResponseEntity.ok(convertToDto(product));
        }

        @PutMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN') or hasRole('CORPORATE')")
        public ResponseEntity<ProductDto> updateProduct(@PathVariable Long id, @RequestBody ProductDto dto) {
                com.ecommerce.analytics.entities.Product product = productRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Product not found"));
                updateProductFromDto(product, dto);
                product = productRepository.save(product);
                return ResponseEntity.ok(convertToDto(product));
        }

        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN') or hasRole('CORPORATE')")
        public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
                productRepository.deleteById(id);
                return ResponseEntity.ok().build();
        }

        private ProductDto convertToDto(com.ecommerce.analytics.entities.Product p) {
                return ProductDto.builder()
                                .id(p.getId())
                                .name(p.getName())
                                .brand(p.getBrand())
                                .sku(p.getSku())
                                .unitPrice(p.getUnitPrice().doubleValue())
                                .categoryName(p.getCategory() != null ? p.getCategory().getName() : "Uncategorized")
                                .storeName(p.getStore().getName())
                                .description(p.getDescription())
                                .imageUrl(p.getImageUrl())
                                .stockQuantity(p.getStockQuantity())
                                .build();
        }

        private void updateProductFromDto(com.ecommerce.analytics.entities.Product p, ProductDto dto) {
                p.setName(dto.getName());
                p.setBrand(dto.getBrand());
                p.setSku(dto.getSku());
                p.setUnitPrice(java.math.BigDecimal.valueOf(dto.getUnitPrice()));
                p.setDescription(dto.getDescription());
                p.setImageUrl(dto.getImageUrl());
                p.setStockQuantity(dto.getStockQuantity() != null ? dto.getStockQuantity() : 0);
                
                if (dto.getCategoryName() != null) {
                        p.setCategory(categoryRepository.findByName(dto.getCategoryName()).orElse(null));
                }
                
                if (p.getStore() == null && dto.getStoreName() != null) {
                    p.setStore(storeRepository.findAll().stream()
                        .filter(s -> s.getName().equals(dto.getStoreName()))
                        .findFirst().orElse(null));
                }
        }
}
