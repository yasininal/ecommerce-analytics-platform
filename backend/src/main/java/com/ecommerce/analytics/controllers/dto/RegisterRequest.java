package com.ecommerce.analytics.controllers.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String role; // INDIVIDUAL, CORPORATE, ADMIN
    private String gender; // MALE, FEMALE, OTHER
}
