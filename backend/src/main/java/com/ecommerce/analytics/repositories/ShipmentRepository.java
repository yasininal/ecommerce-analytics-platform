package com.ecommerce.analytics.repositories;

import com.ecommerce.analytics.entities.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    @Query("SELECT s FROM Shipment s JOIN s.order o WHERE o.store.id = :storeId")
    List<Shipment> findByOrderStoreId(Long storeId);

    @Query("SELECT s FROM Shipment s JOIN s.order o WHERE o.user.id = :userId")
    List<Shipment> findByOrderUserId(Long userId);
}
