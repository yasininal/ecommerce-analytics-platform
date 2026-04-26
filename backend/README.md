# 🚀 TrendAnalytix Backend (Spring Boot)

This is the core REST API for the E-Commerce Analytics Platform, built with Spring Boot 3, Spring Security (JWT), and Spring Data JPA.

## 🛠 Features
- **Auth System:** JWT-based secure authentication with Role-Based Access Control (Admin, Corporate, Individual).
- **Product Management:** Full CRUD for products, categories, and inventory.
- **Order Processing:** Advanced checkout flow with Stripe integration and discount coupons.
- **Address Management:** User-specific shipping address CRUD.
- **Notifications:** Real-time triggered notifications for order status changes.
- **Security:** CSRF protection, CORS configuration, and BOLA/IDOR prevention.

## 📡 Key Endpoints
- `POST /api/auth/**`: Login, Register, Refresh Token.
- `GET /api/products`: Public catalog and search.
- `GET /api/orders/my-orders`: Personal order history for Buyers.
- `GET /api/orders/my-store-orders`: Store management for Sellers.
- `POST /api/payments/create-checkout-session`: Stripe payment initiation.
- `POST /api/addresses`: Personal address management.

## 🏗 Setup & Run
1. Ensure MySQL is running (see root Docker config).
2. Configure `src/main/resources/application.yml` with your credentials.
3. Run with Maven:
   ```bash
   ./mvnw spring-boot:run
   ```

## 🧪 Tech Stack
- **Framework:** Spring Boot 3.2+
- **Security:** Spring Security + JWT (jjwt)
- **Database:** MySQL 8.0
- **Build Tool:** Maven
