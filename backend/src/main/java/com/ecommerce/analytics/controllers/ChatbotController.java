package com.ecommerce.analytics.controllers;

import com.ecommerce.analytics.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ChatbotController {

    @Value("${chatbot.url:http://chatbot:8000}")
    private String chatbotUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/chat")
    @PreAuthorize("hasRole('USER') or hasRole('CORPORATE') or hasRole('ADMIN')")
    public ResponseEntity<?> proxyChat(@RequestBody Map<String, Object> request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        // FORCED SECURITY INJECTION: Override whatever user sent with actual JWT data
        String role = userDetails.getAuthorities().iterator().next().getAuthority()
                .replace("ROLE_", "");
        
        Map<String, Object> secureRequest = new HashMap<>();
        secureRequest.put("message", request.get("message"));
        secureRequest.put("user_id", userDetails.getId());
        secureRequest.put("role", role);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(secureRequest, headers);

        try {
            return restTemplate.postForEntity(chatbotUrl + "/api/chat", entity, Map.class);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "AI Analysis Engine is currently unavailable.");
            return ResponseEntity.status(503).body(error);
        }
    }
}
