package com.ecommerce.analytics.services;

import com.ecommerce.analytics.entities.Review;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class AiService {

    @Value("${chatbot.url:http://chatbot:8000}")
    private String chatbotUrl;

    private final RestTemplate restTemplate;

    public AiService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(2000); // 2 saniye bağlantı
        factory.setReadTimeout(3000);    // 3 saniye okuma (AI cevabı için max süre)
        this.restTemplate = new RestTemplate(factory);
    }

    public Review.Sentiment analyzeSentiment(String text) {
        try {
            Map<String, String> request = new HashMap<>();
            request.put("text", text);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(request, headers);

            // Timeout sayesinde 3 saniye içinde cevap gelmezse exception fırlatır ve fallback'e geçer
            Map<String, String> response = restTemplate.postForObject(chatbotUrl + "/api/sentiment", entity, Map.class);
            
            if (response != null && response.containsKey("sentiment")) {
                String sentimentStr = response.get("sentiment").toUpperCase();
                for (Review.Sentiment s : Review.Sentiment.values()) {
                    if (s.name().equals(sentimentStr)) {
                        return s;
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("AI Sentiment Analysis timed out or failed: " + e.getMessage());
        }
        return null; // Fallback to star-based logic
    }
}
