package com.ecommerce.analytics.controllers;

import com.ecommerce.analytics.controllers.dto.WishlistDto;
import com.ecommerce.analytics.entities.Product;
import com.ecommerce.analytics.entities.User;
import com.ecommerce.analytics.entities.Wishlist;
import com.ecommerce.analytics.repositories.ProductRepository;
import com.ecommerce.analytics.repositories.UserRepository;
import com.ecommerce.analytics.repositories.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wishlists")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('INDIVIDUAL', 'CORPORATE', 'ADMIN')")
    public ResponseEntity<List<WishlistDto>> getUserWishlist(@PathVariable Long userId) {
        List<WishlistDto> wishlist = wishlistRepository.findByUserId(userId).stream()
                .map(w -> WishlistDto.builder()
                        .id(w.getId())
                        .productId(w.getProduct().getId())
                        .productName(w.getProduct().getName())
                        .productPrice(w.getProduct().getUnitPrice().doubleValue())
                        .productImageUrl(w.getProduct().getImageUrl())
                        .storeName(w.getProduct().getStore().getName())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(wishlist);
    }

    @PostMapping("/user/{userId}/product/{productId}")
    @PreAuthorize("hasAnyRole('INDIVIDUAL', 'CORPORATE', 'ADMIN')")
    @Transactional
    public ResponseEntity<Void> toggleWishlist(@PathVariable Long userId, @PathVariable Long productId) {
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            wishlistRepository.deleteByUserIdAndProductId(userId, productId);
        } else {
            User user = userRepository.findById(userId).orElseThrow();
            Product product = productRepository.findById(productId).orElseThrow();
            
            Wishlist wishlist = Wishlist.builder()
                    .user(user)
                    .product(product)
                    .build();
            wishlistRepository.save(wishlist);
        }
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/user/{userId}/product/{productId}/check")
    @PreAuthorize("hasAnyRole('INDIVIDUAL', 'CORPORATE', 'ADMIN')")
    public ResponseEntity<Boolean> checkWishlist(@PathVariable Long userId, @PathVariable Long productId) {
        boolean exists = wishlistRepository.existsByUserIdAndProductId(userId, productId);
        return ResponseEntity.ok(exists);
    }
}
