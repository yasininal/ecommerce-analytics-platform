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

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/membership")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateMembership(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        String typeStr = body.get("membershipType");
        if (typeStr == null) return ResponseEntity.badRequest().body("Membership type is required");

        var profile = customerProfileRepository.findByUserId(id).orElse(null);
        if (profile == null) return ResponseEntity.notFound().build();

        try {
            profile.setMembershipType(com.ecommerce.analytics.entities.CustomerProfile.MembershipType.valueOf(typeStr));
            customerProfileRepository.save(profile);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid membership type: " + typeStr);
        }
    }
}
