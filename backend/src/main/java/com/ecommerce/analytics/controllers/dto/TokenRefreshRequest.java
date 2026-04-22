package com.ecommerce.analytics.controllers.dto;

import lombok.Data;

@Data
public class TokenRefreshRequest {
    private String refreshToken;
}
