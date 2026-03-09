package com.ecommerce.analytics.controllers.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentDto {
    private Long id;
    private Long orderId;
    private String customerEmail;
    private String warehouse;
    private String mode;
    private String status;
}
