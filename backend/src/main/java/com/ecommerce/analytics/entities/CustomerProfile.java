package com.ecommerce.analytics.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "customer_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private Integer age;

    @Column(length = 100)
    private String city;

    @Enumerated(EnumType.STRING)
    @Column(name = "membership_type", columnDefinition = "ENUM('BASIC', 'PREMIUM', 'VIP') DEFAULT 'BASIC'")
    private MembershipType membershipType;

    public enum MembershipType {
        BASIC, PREMIUM, VIP
    }
}
