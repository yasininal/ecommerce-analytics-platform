# 🗄️ Database Layer (MySQL)

This directory contains the complete database schema and initial data required for the platform.

## 📁 Contents
- **`schema/01_create_tables.sql`**: Core table definitions (Users, Stores, Products, etc.).
- **`schema/02_indexes.sql`**: Performance optimizations for frequent queries.
- **`schema/03_seed_data.sql`**: Initial data for testing (including Admin and Buyer accounts).

## 📊 Schema Highlights
- **RBAC Support:** `users` table with roles and `refresh_tokens` for security.
- **E-Commerce Flow:** `orders`, `order_items`, and `inventory` tracking.
- **User Engagement:** `addresses`, `coupons`, and `notifications` systems.
- **Feedback:** `reviews` with sentiment tracking capability.

## 🚀 Initialization
If not using the `docker-compose` setup, you can manually initialize:
```bash
mysql -u root -p ecommerce_analytics < schema/01_create_tables.sql
mysql -u root -p ecommerce_analytics < schema/02_indexes.sql
mysql -u root -p ecommerce_analytics < schema/03_seed_data.sql
```
