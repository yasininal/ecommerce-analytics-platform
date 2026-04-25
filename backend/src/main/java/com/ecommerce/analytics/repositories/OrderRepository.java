package com.ecommerce.analytics.repositories;

import com.ecommerce.analytics.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);

    List<Order> findByStoreId(Long storeId);

    List<Order> findByStoreIdOrderByIdDesc(Long storeId);

    @Query("SELECT SUM(o.grandTotal) FROM Order o")
    Double sumGrandTotal();

    @Query("SELECT SUM(o.grandTotal) FROM Order o WHERE o.store.id = :storeId")
    Double sumGrandTotalByStoreId(@org.springframework.data.repository.query.Param("storeId") Long storeId);

    @Query("SELECT SUM(o.grandTotal) FROM Order o WHERE o.user.id = :userId")
    Double sumGrandTotalByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);
}
