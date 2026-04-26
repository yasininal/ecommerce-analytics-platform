package com.ecommerce.analytics.repositories;

import com.ecommerce.analytics.entities.Address;
import com.ecommerce.analytics.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUser(User user);
    List<Address> findByUserId(Long userId);
}
