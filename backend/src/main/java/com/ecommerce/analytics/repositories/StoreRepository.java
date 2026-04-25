package com.ecommerce.analytics.repositories;

import com.ecommerce.analytics.entities.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {
    List<Store> findAllByOwnerId(Long ownerId);

    @Query("SELECT s FROM Store s WHERE s.owner.id = :ownerId")
    Optional<Store> findByOwnerId(Long ownerId);
}
