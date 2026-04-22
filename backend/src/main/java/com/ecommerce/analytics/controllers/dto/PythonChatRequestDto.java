package com.ecommerce.analytics.controllers.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PythonChatRequestDto {
    private String message;
    private Long userId;
    private String role;
    private String sessionId;
}
