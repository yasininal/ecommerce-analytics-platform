package com.ecommerce.analytics.controllers.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardSummaryDto {
    private long totalUsers;
    private long totalStores;
    private long totalOrders;
    private double totalRevenue;
}
