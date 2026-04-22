package com.ecommerce.analytics.services;

import com.ecommerce.analytics.entities.RefreshToken;
import com.ecommerce.analytics.repositories.RefreshTokenRepository;
import com.ecommerce.analytics.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    @Value("${jwt.refreshExpirationMs:86400000}")
    private Long refreshTokenDurationMs;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        com.ecommerce.analytics.entities.User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user already has a token
        return refreshTokenRepository.findByUser(user)
                .map(token -> {
                    // Update existing token
                    token.setToken(UUID.randomUUID().toString());
                    token.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
                    return refreshTokenRepository.save(token);
                })
                .orElseGet(() -> {
                    // Create new token
                    RefreshToken refreshToken = new RefreshToken();
                    refreshToken.setUser(user);
                    refreshToken.setToken(UUID.randomUUID().toString());
                    refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
                    return refreshTokenRepository.save(refreshToken);
                });
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token was expired. Please make a new signin request");
        }
        return token;
    }

    @Transactional
    public int deleteByUserId(Long userId) {
        return refreshTokenRepository.deleteByUser(userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found")));
    }
}
