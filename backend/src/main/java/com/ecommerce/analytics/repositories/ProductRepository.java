package com.ecommerce.analytics.repositories;

import com.ecommerce.analytics.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStoreId(Long storeId);

    long countByStoreId(Long storeId);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Product p WHERE " +
            "(:categoryId IS NULL OR p.category.id = :categoryId OR p.category.parent.id = :categoryId) AND " +
            "(:minPrice IS NULL OR p.unitPrice >= :minPrice) AND " +
            "(:maxPrice IS NULL OR p.unitPrice <= :maxPrice) AND " +
            "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Product> searchProducts(
            @org.springframework.data.repository.query.Param("categoryId") Long categoryId,
            @org.springframework.data.repository.query.Param("minPrice") java.math.BigDecimal minPrice,
            @org.springframework.data.repository.query.Param("maxPrice") java.math.BigDecimal maxPrice,
            @org.springframework.data.repository.query.Param("search") String search
    );
}
