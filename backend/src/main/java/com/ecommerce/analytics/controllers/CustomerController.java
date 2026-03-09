package com.ecommerce.analytics.controllers;

import com.ecommerce.analytics.controllers.dto.CustomerDto;
import com.ecommerce.analytics.entities.RoleType;
import com.ecommerce.analytics.repositories.CustomerProfileRepository;
import com.ecommerce.analytics.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final UserRepository userRepository;
    private final CustomerProfileRepository customerProfileRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CustomerDto>> getAllCustomers() {
        List<CustomerDto> customers = userRepository.findAll().stream()
                .filter(u -> u.getRoleType() == RoleType.INDIVIDUAL)
                .map(u -> {
                    var profile = customerProfileRepository.findByUserId(u.getId()).orElse(null);
                    return new CustomerDto(
                            u.getId(),
                            u.getEmail(),
                            u.getGender() != null ? u.getGender().name() : "OTHER",
                            profile != null ? profile.getAge() : null,
                            profile != null ? profile.getCity() : null,
                            (profile != null && profile.getMembershipType() != null)
                                    ? profile.getMembershipType().name()
                                    : "BASIC");
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(customers);
    }
}
