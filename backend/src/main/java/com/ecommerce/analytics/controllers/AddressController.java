package com.ecommerce.analytics.controllers;

import com.ecommerce.analytics.entities.Address;
import com.ecommerce.analytics.entities.User;
import com.ecommerce.analytics.repositories.AddressRepository;
import com.ecommerce.analytics.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Address> getMyAddresses() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return addressRepository.findByUser(userRepository.findByEmail(email).orElseThrow());
    }

    @PostMapping
    public Address addAddress(@RequestBody Address address) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        address.setUser(user);
        
        if (address.isDefault()) {
            List<Address> existing = addressRepository.findByUser(user);
            existing.forEach(a -> {
                a.setDefault(false);
                addressRepository.save(a);
            });
        }
        
        return addressRepository.save(address);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long id) {
        addressRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
