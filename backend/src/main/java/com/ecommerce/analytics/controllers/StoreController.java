package com.ecommerce.analytics.controllers;

import com.ecommerce.analytics.controllers.dto.StoreDto;
import com.ecommerce.analytics.entities.Store;
import com.ecommerce.analytics.repositories.StoreRepository;
import com.ecommerce.analytics.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreRepository storeRepository;
    private final com.ecommerce.analytics.repositories.UserRepository userRepository;

    @GetMapping("/my-store")
    @PreAuthorize("hasRole('CORPORATE')")
    public ResponseEntity<List<StoreDto>> getMyStores(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Store> stores = storeRepository.findAllByOwnerId(userDetails.getId());
        List<StoreDto> dtos = stores.stream().map(store -> StoreDto.builder()
                .id(store.getId())
                .name(store.getName())
                .status(store.getStatus().name())
                .ownerEmail(userDetails.getUsername())
                .build()).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StoreDto>> getAllStores() {
        List<Store> stores = storeRepository.findAll();
        List<StoreDto> dtos = stores.stream().map(store -> StoreDto.builder()
                .id(store.getId())
                .name(store.getName())
                .status(store.getStatus().name())
                .ownerEmail(store.getOwner().getEmail())
                .build()).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StoreDto> createStore(@RequestBody StoreDto dto) {
        com.ecommerce.analytics.entities.User owner = userRepository.findByEmail(dto.getOwnerEmail())
                .orElseThrow(() -> new RuntimeException("Owner user not found with email: " + dto.getOwnerEmail()));
        
        if (owner.getRoleType() != com.ecommerce.analytics.entities.RoleType.CORPORATE && owner.getRoleType() != com.ecommerce.analytics.entities.RoleType.ADMIN) {
            throw new RuntimeException("Only Corporate or Admin users can own a store");
        }

        Store store = Store.builder()
                .name(dto.getName())
                .owner(owner)
                .status(Store.StoreStatus.ACTIVE)
                .build();
        
        store = storeRepository.save(store);
        
        return ResponseEntity.ok(StoreDto.builder()
                .id(store.getId())
                .name(store.getName())
                .status(store.getStatus().name())
                .ownerEmail(owner.getEmail())
                .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CORPORATE') or hasRole('ADMIN')")
    public ResponseEntity<StoreDto> updateStore(@PathVariable Long id, @RequestBody StoreDto dto, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Store store = storeRepository.findById(id).orElseThrow(() -> new RuntimeException("Store not found"));
        
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                
        if (!store.getOwner().getId().equals(userDetails.getId()) && !isAdmin) {
            throw new RuntimeException("Unauthorized to update this store");
        }

        if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
            store.setName(dto.getName());
        }
        if (dto.getStatus() != null) {
            store.setStatus(Store.StoreStatus.valueOf(dto.getStatus()));
        }
        store = storeRepository.save(store);

        return ResponseEntity.ok(StoreDto.builder()
                .id(store.getId())
                .name(store.getName())
                .status(store.getStatus().name())
                .ownerEmail(store.getOwner().getEmail())
                .build());
    }
}
