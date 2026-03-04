USE ecommerce_analytics;

-- Insert Users
INSERT INTO users (email, password_hash, role_type, gender) VALUES
('admin@platform.com', 'hashed_pass_1', 'ADMIN', 'OTHER'),
('seller1@store.com', 'hashed_pass_2', 'CORPORATE', 'FEMALE'),
('buyer1@random.com', 'hashed_pass_3', 'INDIVIDUAL', 'MALE'),
('buyer2@random.com', 'hashed_pass_4', 'INDIVIDUAL', 'FEMALE');

-- Insert Stores
INSERT INTO stores (owner_id, name, status) VALUES
(2, 'Tech Gadgets Store', 'ACTIVE');

-- Insert Customer Profiles
INSERT INTO customer_profiles (user_id, age, city, membership_type) VALUES
(3, 28, 'Istanbul', 'PREMIUM'),
(4, 34, 'Ankara', 'BASIC');

-- Insert Categories
INSERT INTO categories (id, name, parent_id) VALUES
(1, 'Electronics', NULL),
(2, 'Smartphones', 1),
(3, 'Laptops', 1);

-- Insert Products
INSERT INTO products (store_id, category_id, sku, name, unit_price) VALUES
(1, 2, 'PHONE-001', 'SuperPhone X', 999.99),
(1, 3, 'LAPTOP-001', 'ProBook 15', 1499.50);

-- Insert Orders
INSERT INTO orders (user_id, store_id, status, grand_total) VALUES
(3, 1, 'DELIVERED', 999.99),
(4, 1, 'SHIPPED', 1499.50);

-- Insert Order Items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 999.99),
(2, 2, 1, 1499.50);

-- Insert Shipments
INSERT INTO shipments (order_id, warehouse, mode, status) VALUES
(1, 'Istanbul Main Warehouse', 'EXPRESS', 'DELIVERED'),
(2, 'Ankara Hub', 'STANDARD', 'IN_TRANSIT');

-- Insert Reviews
INSERT INTO reviews (user_id, product_id, star_rating, sentiment) VALUES
(3, 1, 5, 'POSITIVE');
