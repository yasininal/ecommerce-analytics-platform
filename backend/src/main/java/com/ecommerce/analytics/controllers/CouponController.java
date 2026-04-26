package com.ecommerce.analytics.controllers;

import com.ecommerce.analytics.entities.Coupon;
import com.ecommerce.analytics.repositories.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    @Autowired
    private CouponRepository couponRepository;

    @GetMapping("/validate/{code}")
    public ResponseEntity<?> validateCoupon(@PathVariable String code) {
        return couponRepository.findByCodeAndIsActiveTrue(code)
                .map(c -> {
                    if (c.getExpiryDate().isBefore(LocalDateTime.now())) {
                        return ResponseEntity.badRequest().body("Coupon expired");
                    }
                    return ResponseEntity.ok(c);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Coupon createCoupon(@RequestBody Coupon coupon) {
        return couponRepository.save(coupon);
    }
}
