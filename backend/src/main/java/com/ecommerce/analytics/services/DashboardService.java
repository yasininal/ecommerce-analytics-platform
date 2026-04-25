package com.ecommerce.analytics.services;

import com.ecommerce.analytics.controllers.dto.DashboardSummaryDto;
import com.ecommerce.analytics.controllers.dto.CorporateSummaryDto;
import com.ecommerce.analytics.controllers.dto.IndividualSummaryDto;
import com.ecommerce.analytics.entities.Store;
import com.ecommerce.analytics.entities.User;
import com.ecommerce.analytics.repositories.OrderRepository;
import com.ecommerce.analytics.repositories.ProductRepository;
import com.ecommerce.analytics.repositories.StoreRepository;
import com.ecommerce.analytics.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public DashboardSummaryDto getAdminDashboardSummary() {
        long totalUsers = userRepository.count();
        long totalStores = storeRepository.count();
        long totalOrders = orderRepository.count();
        Double revenue = orderRepository.sumGrandTotal();

        return DashboardSummaryDto.builder()
                .totalUsers(totalUsers)
                .totalStores(totalStores)
                .totalOrders(totalOrders)
                .totalRevenue(revenue != null ? revenue : 0.0)
                .build();
    }

    public CorporateSummaryDto getCorporateDashboardSummary(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        List<Store> stores = storeRepository.findAllByOwnerId(user.getId());

        if (stores.isEmpty()) {
            return CorporateSummaryDto.builder().build(); // No store for corporate role
        }

        Store mainStore = stores.get(0);
        long productCount = productRepository.countByStoreId(mainStore.getId());
        long orderCount = orderRepository.findByStoreId(mainStore.getId()).size();
        Double revenue = orderRepository.sumGrandTotalByStoreId(mainStore.getId());

        return CorporateSummaryDto.builder()
                .storeId(mainStore.getId())
                .storeName(mainStore.getName())
                .totalProducts(productCount)
                .totalOrders(orderCount)
                .totalRevenue(revenue != null ? revenue : 0.0)
                .build();
    }

    public IndividualSummaryDto getIndividualDashboardSummary(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        long totalOrders = orderRepository.findByUserId(user.getId()).size();
        Double revenue = orderRepository.sumGrandTotalByUserId(user.getId());

        // Extract username from email
        String name = email.substring(0, email.indexOf("@"));

        return IndividualSummaryDto.builder()
                .name(name)
                .totalOrders(totalOrders)
                .totalSpent(revenue != null ? revenue : 0.0)
                .build();
    }
}
