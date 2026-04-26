package com.ecommerce.analytics.controllers.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistDto {
    private Long id;
    private Long productId;
    private String productName;
    private Double productPrice;
    private String productImageUrl;
    private String storeName;
}
