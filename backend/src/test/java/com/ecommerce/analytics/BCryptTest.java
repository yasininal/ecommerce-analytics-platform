package com.ecommerce.analytics;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import static org.assertj.core.api.Assertions.assertThat;

public class BCryptTest {
    @Test
    public void testPasswordMatches() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String originalPw = "password123";
        String seedHash = "$2a$10$wY1twJw3Wt0ZbW.Q.sB0f.90P6xO.e5fX.uBzvfBqz461zT3lFhK6";
        String sqlHash = "$2a$10$C1z02K98/qFk1W51p8ZkLeJ/VjWJ0b38RzQW77259fS2Lh58/01Hq";
        String tmpHash = "$2b$12$O0j8NPQmHYgl0DaXIcnGKuF3sq9rXxhtO4R/ljkvAbOLAQjnEv7Sa";

        System.out.println("SEED MATCHES password123: " + encoder.matches(originalPw, seedHash));
        System.out.println("SQL SCRIPT MATCHES password123: " + encoder.matches(originalPw, sqlHash));
        System.out.println("TMP SCRIPT MATCHES password123: " + encoder.matches(originalPw, tmpHash));

        System.out.println("NEW HASH FOR password123: " + encoder.encode(originalPw));
    }
}
