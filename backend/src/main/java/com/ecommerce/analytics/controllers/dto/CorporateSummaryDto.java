package com.ecommerce.analytics.controllers.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CorporateSummaryDto {
    private String storeName;
    private long totalProducts;
    private long totalOrders;
    private double totalRevenue;
}
