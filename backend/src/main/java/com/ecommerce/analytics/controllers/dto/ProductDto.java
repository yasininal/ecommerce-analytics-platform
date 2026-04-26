package com.ecommerce.analytics.controllers.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@lombok.Builder
public class ProductDto {
    private Long id;
    private String name;
    private String brand;
    private String sku;
    private Double unitPrice;
    private String categoryName;
    private String storeName;
    private String description;
    private String imageUrl;
    private Integer stockQuantity;
}
