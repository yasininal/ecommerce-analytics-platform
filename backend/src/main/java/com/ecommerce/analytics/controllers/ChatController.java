package com.ecommerce.analytics.controllers;

import com.ecommerce.analytics.controllers.dto.ChatRequestDto;
import com.ecommerce.analytics.controllers.dto.PythonChatRequestDto;
import com.ecommerce.analytics.controllers.dto.SqlRequestDto;
import com.ecommerce.analytics.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChatController {

    private final JdbcTemplate jdbcTemplate;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${chatbot.url:http://chatbot:8000}")
    private String chatbotUrl;

    @PostMapping("/chat/ask")
    public ResponseEntity<?> askChatbot(@RequestBody ChatRequestDto request) {
        // Extract User Context from JWT (SecurityContext)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User must be authenticated");
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        Long userId = userDetails.getId();
        
        // Extract Role (e.g. ROLE_ADMIN -> ADMIN)
        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .map(r -> r.replace("ROLE_", ""))
                .orElse("INDIVIDUAL");

        // Forward to Python AI
        PythonChatRequestDto pythonRequest = new PythonChatRequestDto(
                request.getMessage(),
                userId,
                role,
                request.getSessionId()
        );

        try {
            String url = chatbotUrl + "/api/chat";
            ResponseEntity<String> response = restTemplate.postForEntity(url, pythonRequest, String.class);
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Error communicating with AI Chatbot: " + e.getMessage().replace("\"", "\\\"") + "\"}");
        }
    }

    @PostMapping("/internal/execute-sql")
    public ResponseEntity<?> executeSql(@RequestBody SqlRequestDto request) {
        try {
            List<Map<String, Object>> result = jdbcTemplate.queryForList(request.getQuery());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            // Return 400 so Python error_agent can catch the SQL syntax error
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage().replace("\"", "\\\"").replace("\n", " ") + "\"}");
        }
    }
}
