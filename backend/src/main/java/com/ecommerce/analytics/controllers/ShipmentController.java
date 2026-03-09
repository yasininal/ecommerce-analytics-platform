package com.ecommerce.analytics.controllers;

import com.ecommerce.analytics.controllers.dto.ShipmentDto;
import com.ecommerce.analytics.repositories.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/shipments")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentRepository shipmentRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ShipmentDto>> getAllShipments() {
        List<ShipmentDto> shipments = shipmentRepository.findAll().stream()
                .map(s -> new ShipmentDto(
                        s.getId(),
                        s.getOrder().getId(),
                        s.getOrder().getUser().getEmail(),
                        s.getWarehouse(),
                        s.getMode().name(),
                        s.getStatus().name()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(shipments);
    }

    @GetMapping("/store/{storeId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CORPORATE')")
    public ResponseEntity<List<ShipmentDto>> getShipmentsByStore(@PathVariable Long storeId) {
        List<ShipmentDto> shipments = shipmentRepository.findByOrderStoreId(storeId).stream()
                .map(s -> new ShipmentDto(
                        s.getId(),
                        s.getOrder().getId(),
                        s.getOrder().getUser().getEmail(),
                        s.getWarehouse(),
                        s.getMode().name(),
                        s.getStatus().name()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(shipments);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INDIVIDUAL')")
    public ResponseEntity<List<ShipmentDto>> getShipmentsByUser(@PathVariable Long userId) {
        List<ShipmentDto> shipments = shipmentRepository.findByOrderUserId(userId).stream()
                .map(s -> new ShipmentDto(
                        s.getId(),
                        s.getOrder().getId(),
                        s.getOrder().getUser().getEmail(),
                        s.getWarehouse(),
                        s.getMode().name(),
                        s.getStatus().name()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(shipments);
    }
}
