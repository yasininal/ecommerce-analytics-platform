package com.ecommerce.analytics.controllers;

import com.ecommerce.analytics.controllers.dto.CorporateSummaryDto;
import com.ecommerce.analytics.controllers.dto.DashboardSummaryDto;
import com.ecommerce.analytics.controllers.dto.IndividualSummaryDto;
import com.ecommerce.analytics.services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/admin/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardSummaryDto> getAdminSummary() {
        return ResponseEntity.ok(dashboardService.getAdminDashboardSummary());
    }

    @GetMapping("/corporate/summary")
    @PreAuthorize("hasRole('CORPORATE')")
    public ResponseEntity<CorporateSummaryDto> getCorporateSummary(Principal principal) {
        return ResponseEntity.ok(dashboardService.getCorporateDashboardSummary(principal.getName()));
    }

    @GetMapping("/individual/summary")
    @PreAuthorize("hasRole('INDIVIDUAL')")
    public ResponseEntity<IndividualSummaryDto> getIndividualSummary(Principal principal) {
        return ResponseEntity.ok(dashboardService.getIndividualDashboardSummary(principal.getName()));
    }
}
