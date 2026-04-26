package com.ecommerce.analytics.controllers.dto;

import lombok.Data;

@Data
public class ReviewRequestDto {
    private Long productId;
    private Long userId;
    private Integer starRating;
    private String comment;
}
