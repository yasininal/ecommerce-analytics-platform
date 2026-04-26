package com.ecommerce.analytics.controllers;

import com.ecommerce.analytics.controllers.dto.ReviewDto;
import com.ecommerce.analytics.controllers.dto.ReviewRequestDto;
import com.ecommerce.analytics.entities.Review;
import com.ecommerce.analytics.repositories.ProductRepository;
import com.ecommerce.analytics.repositories.ReviewRepository;
import com.ecommerce.analytics.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

        private final ReviewRepository reviewRepository;
        private final UserRepository userRepository;
        private final ProductRepository productRepository;

        @GetMapping
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<List<ReviewDto>> getAllReviews() {
                List<ReviewDto> reviews = reviewRepository.findAll().stream()
                                .map(this::convertToDto)
                                .collect(Collectors.toList());
                return ResponseEntity.ok(reviews);
        }

        @GetMapping("/store/{storeId}")
        @PreAuthorize("hasRole('ADMIN') or hasRole('CORPORATE')")
        public ResponseEntity<List<ReviewDto>> getReviewsByStore(@PathVariable Long storeId) {
                List<ReviewDto> reviews = reviewRepository.findByProductStoreId(storeId).stream()
                                .map(this::convertToDto)
                                .collect(Collectors.toList());
                return ResponseEntity.ok(reviews);
        }

        @GetMapping("/product/{productId}")
        public ResponseEntity<List<ReviewDto>> getReviewsByProduct(@PathVariable Long productId) {
                List<ReviewDto> reviews = reviewRepository.findByProductId(productId).stream()
                                .map(this::convertToDto)
                                .collect(Collectors.toList());
                return ResponseEntity.ok(reviews);
        }

        @GetMapping("/my-reviews")
        @PreAuthorize("hasAnyRole('INDIVIDUAL', 'CORPORATE', 'ADMIN')")
        public ResponseEntity<List<ReviewDto>> getMyReviews() {
            com.ecommerce.analytics.security.UserDetailsImpl userDetails = 
                (com.ecommerce.analytics.security.UserDetailsImpl) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            
            List<ReviewDto> reviews = reviewRepository.findByUserId(userDetails.getId()).stream()
                            .map(this::convertToDto)
                            .collect(Collectors.toList());
            return ResponseEntity.ok(reviews);
        }

        @PostMapping
        @PreAuthorize("hasAnyRole('INDIVIDUAL', 'CORPORATE', 'ADMIN')")
        @Transactional
        public ResponseEntity<ReviewDto> createReview(@RequestBody ReviewRequestDto request) {
            Review review = new Review();
            review.setUser(userRepository.findById(request.getUserId()).orElseThrow());
            review.setProduct(productRepository.findById(request.getProductId()).orElseThrow());
            review.setStarRating(request.getStarRating());
            review.setComment(request.getComment());
            
            // Auto sentiment
            if (request.getStarRating() >= 4) {
                review.setSentiment(Review.Sentiment.POSITIVE);
            } else if (request.getStarRating() == 3) {
                review.setSentiment(Review.Sentiment.NEUTRAL);
            } else {
                review.setSentiment(Review.Sentiment.NEGATIVE);
            }
            
            review = reviewRepository.save(review);
            return ResponseEntity.ok(convertToDto(review));
        }

        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
                reviewRepository.deleteById(id);
                return ResponseEntity.noContent().build();
        }
        
        private ReviewDto convertToDto(Review r) {
            return new ReviewDto(
                r.getId(),
                r.getUser().getEmail(),
                r.getProduct().getName(),
                r.getStarRating(),
                r.getSentiment() != null ? r.getSentiment().name() : null,
                r.getComment()
            );
        }
}
