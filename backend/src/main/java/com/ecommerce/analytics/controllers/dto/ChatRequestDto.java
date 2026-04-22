package com.ecommerce.analytics.controllers.dto;

import lombok.Data;

@Data
public class ChatRequestDto {
    private String message;
    private String sessionId;
}
