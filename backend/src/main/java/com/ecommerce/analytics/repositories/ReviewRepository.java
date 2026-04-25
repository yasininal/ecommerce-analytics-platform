package com.ecommerce.analytics.repositories;

import com.ecommerce.analytics.entities.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query("SELECT r FROM Review r WHERE r.product.store.id = :storeId")
    List<Review> findByProductStoreId(Long storeId);

    @Query("SELECT r FROM Review r WHERE r.user.id = :userId")
    List<Review> findByUserId(Long userId);

    @Query("SELECT r FROM Review r WHERE r.product.id = :productId")
    List<Review> findByProductId(Long productId);
}
