USE ecommerce_analytics;

-- ========== USERS ==========
INSERT INTO users (email, password_hash, role_type, gender) VALUES
('admin@platform.com',   '$2a$10$wY1twJw3Wt0ZbW.Q.sB0f.90P6xO.e5fX.uBzvfBqz461zT3lFhK6', 'ADMIN',      'OTHER'),
('seller1@store.com',    '$2a$10$wY1twJw3Wt0ZbW.Q.sB0f.90P6xO.e5fX.uBzvfBqz461zT3lFhK6', 'CORPORATE',  'FEMALE'),
('seller2@store.com',    '$2a$10$wY1twJw3Wt0ZbW.Q.sB0f.90P6xO.e5fX.uBzvfBqz461zT3lFhK6', 'CORPORATE',  'MALE'),
('buyer1@random.com',    '$2a$10$wY1twJw3Wt0ZbW.Q.sB0f.90P6xO.e5fX.uBzvfBqz461zT3lFhK6', 'INDIVIDUAL', 'MALE'),
('buyer2@random.com',    '$2a$10$wY1twJw3Wt0ZbW.Q.sB0f.90P6xO.e5fX.uBzvfBqz461zT3lFhK6', 'INDIVIDUAL', 'FEMALE'),
('buyer3@random.com',    '$2a$10$wY1twJw3Wt0ZbW.Q.sB0f.90P6xO.e5fX.uBzvfBqz461zT3lFhK6', 'INDIVIDUAL', 'MALE'),
('buyer4@random.com',    '$2a$10$wY1twJw3Wt0ZbW.Q.sB0f.90P6xO.e5fX.uBzvfBqz461zT3lFhK6', 'INDIVIDUAL', 'FEMALE'),
('buyer5@random.com',    '$2a$10$wY1twJw3Wt0ZbW.Q.sB0f.90P6xO.e5fX.uBzvfBqz461zT3lFhK6', 'INDIVIDUAL', 'MALE'),
('buyer6@random.com',    '$2a$10$wY1twJw3Wt0ZbW.Q.sB0f.90P6xO.e5fX.uBzvfBqz461zT3lFhK6', 'INDIVIDUAL', 'FEMALE'),
('buyer7@random.com',    '$2a$10$wY1twJw3Wt0ZbW.Q.sB0f.90P6xO.e5fX.uBzvfBqz461zT3lFhK6', 'INDIVIDUAL', 'MALE');

-- ========== STORES ==========
INSERT INTO stores (owner_id, name, status) VALUES
(2, 'Tech Gadgets Store', 'ACTIVE'),
(3, 'Fashion Hub',        'ACTIVE');

-- ========== CUSTOMER PROFILES ==========
INSERT INTO customer_profiles (user_id, age, city, membership_type) VALUES
(4,  28, 'Istanbul', 'PREMIUM'),
(5,  34, 'Ankara',   'BASIC'),
(6,  22, 'Izmir',    'VIP'),
(7,  45, 'Bursa',    'BASIC'),
(8,  31, 'Antalya',  'PREMIUM'),
(9,  27, 'Istanbul', 'VIP'),
(10, 38, 'Konya',    'BASIC');

-- ========== CATEGORIES ==========
INSERT INTO categories (id, name, parent_id) VALUES
(1, 'Electronics',  NULL),
(2, 'Smartphones',  1),
(3, 'Laptops',      1),
(4, 'Accessories',  1),
(5, 'Fashion',      NULL),
(6, 'Clothing',     5),
(7, 'Shoes',        5),
(8, 'Bags',         5);

-- ========== PRODUCTS ==========
INSERT INTO products (store_id, category_id, sku, name, unit_price) VALUES
(1, 2, 'PHN-001', 'SuperPhone X',         999.99),
(1, 2, 'PHN-002', 'MiniPhone Pro',         599.99),
(1, 3, 'LPT-001', 'ProBook 15',          1499.50),
(1, 3, 'LPT-002', 'UltraSlim 13',        1199.00),
(1, 4, 'ACC-001', 'Wireless Earbuds',      149.99),
(1, 4, 'ACC-002', 'Smart Watch Series 3',  299.99),
(1, 4, 'ACC-003', 'USB-C Hub 7-Port',       59.99),
(1, 4, 'ACC-004', 'Phone Case Premium',     29.99),
(2, 6, 'CLT-001', 'Classic Denim Jacket', 179.99),
(2, 6, 'CLT-002', 'Printed T-Shirt',       39.99),
(2, 6, 'CLT-003', 'Slim Fit Trousers',     89.99),
(2, 7, 'SHO-001', 'Running Sneakers Pro', 129.99),
(2, 7, 'SHO-002', 'Casual Loafers',        79.99),
(2, 8, 'BAG-001', 'Leather Backpack',     199.99),
(2, 8, 'BAG-002', 'Canvas Tote Bag',       49.99);

-- ========== ORDERS ==========
INSERT INTO orders (user_id, store_id, status, grand_total) VALUES
(4,  1, 'DELIVERED',   999.99),
(5,  1, 'SHIPPED',    1499.50),
(6,  1, 'DELIVERED',   449.98),
(7,  1, 'PENDING',     299.99),
(8,  1, 'PROCESSING',  149.99),
(9,  1, 'CANCELLED',   599.99),
(10, 1, 'DELIVERED',  1199.00),
(4,  1, 'SHIPPED',     329.98),
(5,  2, 'DELIVERED',   179.99),
(6,  2, 'PENDING',     219.98),
(7,  2, 'DELIVERED',   129.99),
(8,  2, 'SHIPPED',     249.98),
(9,  2, 'DELIVERED',    89.99),
(10, 2, 'PROCESSING',  199.99),
(4,  2, 'DELIVERED',    49.99),
(5,  1, 'DELIVERED',   899.98),
(6,  2, 'SHIPPED',     309.98),
(7,  1, 'DELIVERED',   149.99),
(8,  2, 'CANCELLED',    79.99),
(9,  1, 'PENDING',    1199.00);

-- ========== ORDER ITEMS ==========
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1,  1,  1,  999.99),
(2,  3,  1, 1499.50),
(3,  5,  1,  149.99),
(3,  8,  10, 299.90),
(4,  6,  1,  299.99),
(5,  5,  1,  149.99),
(6,  2,  1,  599.99),
(7,  4,  1, 1199.00),
(8,  5,  1,  149.99),
(8,  7,  3,  179.97),
(9,  9,  1,  179.99),
(10, 10, 2,   79.98),
(10, 12, 1,  129.99),
(11, 12, 1,  129.99),
(12, 10, 3,  119.97),
(12, 13, 1,  129.99),
(13, 11, 1,   89.99),
(14, 14, 1,  199.99),
(15, 15, 1,   49.99),
(16, 1,  1,  999.99),
(16, 8,  3,   89.97),
(17, 9,  1,  179.99),
(17, 12, 1,  129.99),
(18, 5,  1,  149.99),
(19, 13, 1,   79.99),
(20, 4,  1, 1199.00);

-- ========== SHIPMENTS ==========
INSERT INTO shipments (order_id, warehouse, mode, status) VALUES
(1,  'Istanbul Main Warehouse', 'EXPRESS',   'DELIVERED'),
(2,  'Ankara Hub',              'STANDARD',  'IN_TRANSIT'),
(3,  'Izmir Warehouse',         'EXPRESS',   'DELIVERED'),
(5,  'Istanbul Main Warehouse', 'OVERNIGHT', 'IN_TRANSIT'),
(7,  'Ankara Hub',              'STANDARD',  'DELIVERED'),
(8,  'Istanbul Main Warehouse', 'EXPRESS',   'IN_TRANSIT'),
(9,  'Istanbul Main Warehouse', 'STANDARD',  'DELIVERED'),
(10, 'Izmir Warehouse',         'STANDARD',  'PREPARING'),
(11, 'Bursa Hub',               'EXPRESS',   'DELIVERED'),
(12, 'Antalya Warehouse',       'STANDARD',  'IN_TRANSIT'),
(13, 'Istanbul Main Warehouse', 'EXPRESS',   'DELIVERED'),
(14, 'Konya Hub',               'OVERNIGHT', 'PREPARING'),
(15, 'Istanbul Main Warehouse', 'STANDARD',  'DELIVERED'),
(16, 'Ankara Hub',              'EXPRESS',   'DELIVERED'),
(17, 'Izmir Warehouse',         'STANDARD',  'IN_TRANSIT'),
(18, 'Istanbul Main Warehouse', 'STANDARD',  'DELIVERED');

-- ========== REVIEWS ==========
INSERT INTO reviews (user_id, product_id, star_rating, sentiment) VALUES
(4,  1,  5, 'POSITIVE'),
(5,  3,  4, 'POSITIVE'),
(6,  5,  3, 'NEUTRAL'),
(7,  6,  5, 'POSITIVE'),
(8,  5,  4, 'POSITIVE'),
(9,  2,  2, 'NEGATIVE'),
(10, 4,  5, 'POSITIVE'),
(4,  5,  4, 'POSITIVE'),
(5,  9,  5, 'POSITIVE'),
(6,  10, 3, 'NEUTRAL'),
(6,  12, 4, 'POSITIVE'),
(7,  12, 5, 'POSITIVE'),
(8,  10, 2, 'NEGATIVE'),
(8,  12, 1, 'NEGATIVE'),
(9,  11, 4, 'POSITIVE'),
(10, 14, 5, 'POSITIVE'),
(4,  15, 3, 'NEUTRAL'),
(5,  1,  5, 'POSITIVE'),
(6,  9,  4, 'POSITIVE'),
(7,  5,  3, 'NEUTRAL');
