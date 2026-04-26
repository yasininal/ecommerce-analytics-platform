package com.ecommerce.analytics.repositories;

import com.ecommerce.analytics.entities.Notification;
import com.ecommerce.analytics.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    long countByUserAndIsReadFalse(User user);
}
