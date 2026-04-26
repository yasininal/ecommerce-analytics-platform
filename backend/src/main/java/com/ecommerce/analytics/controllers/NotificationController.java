package com.ecommerce.analytics.controllers;

import com.ecommerce.analytics.entities.Notification;
import com.ecommerce.analytics.repositories.NotificationRepository;
import com.ecommerce.analytics.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Notification> getMyNotifications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return notificationRepository.findByUserOrderByCreatedAtDesc(userRepository.findByEmail(email).orElseThrow());
    }

    @GetMapping("/unread-count")
    public long getUnreadCount() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return notificationRepository.countByUserAndIsReadFalse(userRepository.findByEmail(email).orElseThrow());
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Notification n = notificationRepository.findById(id).orElseThrow();
        n.setRead(true);
        notificationRepository.save(n);
        return ResponseEntity.ok().build();
    }
}
