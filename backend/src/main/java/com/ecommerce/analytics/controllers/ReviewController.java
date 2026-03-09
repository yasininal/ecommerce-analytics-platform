package com.ecommerce.analytics.controllers;

import com.ecommerce.analytics.controllers.dto.ReviewDto;
import com.ecommerce.analytics.entities.Review;
import com.ecommerce.analytics.repositories.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

        private final ReviewRepository reviewRepository;

        @GetMapping
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<List<ReviewDto>> getAllReviews() {
                List<ReviewDto> reviews = reviewRepository.findAll().stream()
                                .map(r -> new ReviewDto(
                                                r.getId(),
                                                r.getUser().getEmail(),
                                                r.getProduct().getName(),
                                                r.getStarRating(),
                                                r.getSentiment().name()))
                                .collect(Collectors.toList());
                return ResponseEntity.ok(reviews);
        }

        @GetMapping("/store/{storeId}")
        @PreAuthorize("hasRole('ADMIN') or hasRole('CORPORATE')")
        public ResponseEntity<List<ReviewDto>> getReviewsByStore(@PathVariable Long storeId) {
                List<ReviewDto> reviews = reviewRepository.findByProductStoreId(storeId).stream()
                                .map(r -> new ReviewDto(
                                                r.getId(),
                                                r.getUser().getEmail(),
                                                r.getProduct().getName(),
                                                r.getStarRating(),
                                                r.getSentiment().name()))
                                .collect(Collectors.toList());
                return ResponseEntity.ok(reviews);
        }
}
