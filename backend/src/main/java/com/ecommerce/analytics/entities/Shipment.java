package com.ecommerce.analytics.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "shipments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(length = 150)
    private String warehouse;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('STANDARD', 'EXPRESS', 'OVERNIGHT') DEFAULT 'STANDARD'")
    private ShipmentMode mode;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('PREPARING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED') DEFAULT 'PREPARING'")
    private ShipmentStatus status;

    public enum ShipmentMode {
        STANDARD, EXPRESS, OVERNIGHT
    }

    public enum ShipmentStatus {
        PREPARING, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED
    }
}
