package com.ecommerce.analytics.config;

import com.ecommerce.analytics.entities.User;
import com.ecommerce.analytics.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        List<User> users = userRepository.findAll();
        if (users.isEmpty()) {
            return;
        }

        // Re-encode all seed passwords with Java BCrypt so login works
        String defaultPassword = "password123";
        for (User user : users) {
            if (!passwordEncoder.matches(defaultPassword, user.getPasswordHash())) {
                user.setPasswordHash(passwordEncoder.encode(defaultPassword));
                userRepository.save(user);
                log.info("Re-encoded password for user: {}", user.getEmail());
            }
        }
    }
}
