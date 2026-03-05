package com.ecommerce.analytics.controllers.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class IndividualSummaryDto {
    private String name;
    private long totalOrders;
    private double totalSpent;
}
