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

-- ========== PRODUCTS (with stock_quantity) ==========
INSERT INTO products (store_id, category_id, sku, name, unit_price, stock_quantity) VALUES
(1, 2, 'PHN-001', 'SuperPhone X',         999.99,   5),
(1, 2, 'PHN-002', 'MiniPhone Pro',         599.99, 150),
(1, 3, 'LPT-001', 'ProBook 15',          1499.50,   8),
(1, 3, 'LPT-002', 'UltraSlim 13',        1199.00, 150),
(1, 4, 'ACC-001', 'Wireless Earbuds',      149.99,   5),
(1, 4, 'ACC-002', 'Smart Watch Series 3',  299.99, 150),
(1, 4, 'ACC-003', 'USB-C Hub 7-Port',       59.99, 150),
(1, 4, 'ACC-004', 'Phone Case Premium',     29.99, 150),
(2, 6, 'CLT-001', 'Classic Denim Jacket', 179.99, 150),
(2, 6, 'CLT-002', 'Printed T-Shirt',       39.99,   5),
(2, 6, 'CLT-003', 'Slim Fit Trousers',     89.99, 150),
(2, 7, 'SHO-001', 'Running Sneakers Pro', 129.99, 150),
(2, 7, 'SHO-002', 'Casual Loafers',        79.99,   8),
(2, 8, 'BAG-001', 'Leather Backpack',     199.99, 150),
(2, 8, 'BAG-002', 'Canvas Tote Bag',       49.99, 150);

-- ========== ORDERS (with created_at timestamps) ==========
INSERT INTO orders (user_id, store_id, status, grand_total, created_at) VALUES
-- January 2026
(4,  1, 'DELIVERED',   1299.98, '2026-01-10 09:00:00'),
(5,  1, 'DELIVERED',    599.99, '2026-01-15 14:00:00'),
(6,  2, 'DELIVERED',    269.98, '2026-01-20 11:00:00'),
(7,  1, 'DELIVERED',    449.98, '2026-01-25 16:00:00'),
-- February 2026
(8,  2, 'DELIVERED',    179.99, '2026-02-01 10:00:00'),
(4,  1, 'DELIVERED',    999.99, '2026-02-05 09:30:00'),
(5,  1, 'SHIPPED',     1499.50, '2026-02-12 14:15:00'),
(9,  1, 'DELIVERED',   1499.50, '2026-02-08 13:00:00'),
(10, 2, 'RETURNED',     129.99, '2026-02-14 15:00:00'),
(6,  1, 'DELIVERED',    449.98, '2026-02-20 11:00:00'),
(4,  2, 'DELIVERED',    319.98, '2026-02-22 09:30:00'),
-- March 2026
(7,  1, 'PENDING',      299.99, '2026-03-01 10:00:00'),
(5,  1, 'DELIVERED',    329.98, '2026-03-03 11:00:00'),
(8,  1, 'PROCESSING',   149.99, '2026-03-08 16:45:00'),
(9,  1, 'RETURNED',     599.99, '2026-03-15 08:30:00'),
(6,  1, 'CANCELLED',    999.99, '2026-03-10 14:00:00'),
(7,  2, 'DELIVERED',     89.99, '2026-03-18 10:00:00'),
(10, 1, 'DELIVERED',   1199.00, '2026-03-22 13:20:00'),
(8,  1, 'SHIPPED',      449.98, '2026-03-25 16:00:00'),
(4,  1, 'SHIPPED',      329.98, '2026-03-28 17:00:00'),
-- April 2026
(9,  2, 'DELIVERED',    249.98, '2026-04-01 09:00:00'),
(5,  2, 'DELIVERED',    179.99, '2026-04-02 09:00:00'),
(6,  2, 'PENDING',      219.98, '2026-04-05 11:30:00'),
(7,  2, 'DELIVERED',    129.99, '2026-04-08 14:00:00'),
(8,  2, 'SHIPPED',      249.98, '2026-04-10 10:15:00'),
(10, 1, 'DELIVERED',    149.99, '2026-04-07 12:00:00'),
(9,  2, 'DELIVERED',     89.99, '2026-04-12 16:30:00'),
(10, 2, 'PROCESSING',   199.99, '2026-04-15 09:45:00'),
(4,  1, 'PROCESSING',  2398.50, '2026-04-14 08:00:00'),
(4,  2, 'DELIVERED',     49.99, '2026-04-18 12:00:00'),
(5,  2, 'DELIVERED',    359.98, '2026-04-17 15:00:00'),
(5,  1, 'DELIVERED',    899.98, '2026-04-20 08:00:00'),
(6,  2, 'SHIPPED',      309.98, '2026-04-22 15:30:00'),
(6,  2, 'PENDING',      199.99, '2026-04-19 11:00:00'),
(7,  1, 'DELIVERED',    149.99, '2026-04-21 14:30:00'),
(8,  2, 'CANCELLED',     79.99, '2026-04-23 09:00:00'),
(8,  2, 'SHIPPED',      309.98, '2026-04-23 09:00:00'),
(9,  1, 'PENDING',     1199.00, '2026-04-24 14:45:00'),
(9,  1, 'RETURNED',     599.99, '2026-04-25 10:30:00'),
(10, 1, 'DELIVERED',     59.99, '2026-04-25 10:00:00');

-- ========== ORDER ITEMS ==========
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
-- Jan orders
(1, 1, 1, 999.99), (1, 6, 1, 299.99),
(2, 2, 1, 599.99),
(3, 9, 1, 179.99), (3, 11, 1, 89.99),
(4, 5, 2, 299.98), (4, 7, 1, 59.99),
-- Feb orders
(5, 9, 1, 179.99),
(6, 1, 1, 999.99),
(7, 3, 1, 1499.50),
(8, 3, 1, 1499.50),
(9, 12, 1, 129.99),
(10, 5, 1, 149.99), (10, 8, 10, 299.90),
(11, 9, 1, 179.99), (11, 14, 1, 199.99),
-- Mar orders
(12, 6, 1, 299.99),
(13, 5, 1, 149.99), (13, 8, 2, 59.98),
(14, 5, 1, 149.99),
(15, 2, 1, 599.99),
(16, 1, 1, 999.99),
(17, 11, 1, 89.99),
(18, 4, 1, 1199.00),
(19, 5, 1, 149.99), (19, 6, 1, 299.99),
(20, 5, 1, 149.99), (20, 7, 3, 179.97),
-- Apr orders
(21, 10, 2, 79.98), (21, 12, 1, 129.99), (21, 14, 1, 199.99),
(22, 9, 1, 179.99),
(23, 10, 2, 79.98), (23, 12, 1, 129.99),
(24, 12, 1, 129.99),
(25, 10, 3, 119.97), (25, 13, 1, 129.99),
(26, 5, 1, 149.99),
(27, 11, 1, 89.99),
(28, 14, 1, 199.99),
(29, 3, 1, 1499.50), (29, 1, 1, 999.99),
(30, 15, 1, 49.99),
(31, 9, 1, 179.99), (31, 10, 1, 39.99),
(32, 1, 1, 999.99), (32, 8, 3, 89.97),
(33, 9, 1, 179.99), (33, 12, 1, 129.99),
(34, 14, 1, 199.99),
(35, 5, 1, 149.99),
(36, 13, 1, 79.99),
(37, 9, 1, 179.99), (37, 12, 1, 129.99),
(38, 4, 1, 1199.00),
(39, 2, 1, 599.99),
(40, 7, 1, 59.99);

-- ========== SHIPMENTS (with shipped_at) ==========
INSERT INTO shipments (order_id, warehouse, mode, status, shipped_at) VALUES
(1,  'Istanbul Main Warehouse', 'EXPRESS',   'DELIVERED',       '2026-01-11 10:00:00'),
(2,  'Ankara Hub',              'STANDARD',  'DELIVERED',       '2026-01-17 09:00:00'),
(3,  'Izmir Warehouse',         'EXPRESS',   'DELIVERED',       '2026-01-22 11:30:00'),
(4,  'Istanbul Main Warehouse', 'STANDARD',  'DELIVERED',       '2026-01-27 08:00:00'),
(5,  'Antalya Warehouse',       'STANDARD',  'DELIVERED',       '2026-02-03 10:00:00'),
(6,  'Istanbul Main Warehouse', 'EXPRESS',   'DELIVERED',       '2026-02-06 10:00:00'),
(7,  'Ankara Hub',              'STANDARD',  'IN_TRANSIT',      '2026-02-13 09:00:00'),
(8,  'Istanbul Main Warehouse', 'OVERNIGHT', 'DELIVERED',       '2026-02-09 08:00:00'),
(10, 'Izmir Warehouse',         'EXPRESS',   'DELIVERED',       '2026-02-21 11:30:00'),
(11, 'Istanbul Main Warehouse', 'STANDARD',  'DELIVERED',       '2026-02-23 10:00:00'),
(13, 'Ankara Hub',              'EXPRESS',   'DELIVERED',       '2026-03-04 09:00:00'),
(17, 'Bursa Hub',               'STANDARD',  'DELIVERED',       '2026-03-20 10:00:00'),
(18, 'Ankara Hub',              'STANDARD',  'DELIVERED',       '2026-03-23 10:00:00'),
(19, 'Istanbul Main Warehouse', 'EXPRESS',   'IN_TRANSIT',      '2026-03-29 14:00:00'),
(20, 'Istanbul Main Warehouse', 'EXPRESS',   'IN_TRANSIT',      '2026-03-29 14:00:00'),
(21, 'Izmir Warehouse',         'STANDARD',  'DELIVERED',       '2026-04-02 12:00:00'),
(22, 'Istanbul Main Warehouse', 'EXPRESS',   'DELIVERED',       '2026-04-03 09:30:00'),
(24, 'Bursa Hub',               'EXPRESS',   'DELIVERED',       '2026-04-09 08:00:00'),
(25, 'Antalya Warehouse',       'STANDARD',  'IN_TRANSIT',      '2026-04-11 15:00:00'),
(26, 'Istanbul Main Warehouse', 'OVERNIGHT', 'DELIVERED',       '2026-04-08 10:00:00'),
(27, 'Istanbul Main Warehouse', 'EXPRESS',   'DELIVERED',       '2026-04-13 10:30:00'),
(30, 'Istanbul Main Warehouse', 'STANDARD',  'DELIVERED',       '2026-04-19 11:00:00'),
(31, 'Ankara Hub',              'EXPRESS',   'DELIVERED',       '2026-04-18 08:30:00'),
(32, 'Ankara Hub',              'EXPRESS',   'DELIVERED',       '2026-04-21 08:30:00'),
(35, 'Konya Hub',               'STANDARD',  'PREPARING',       '2026-04-22 09:00:00'),
(40, 'Istanbul Main Warehouse', 'STANDARD',  'PREPARING',       '2026-04-25 12:00:00');

-- ========== REVIEWS (with comment and created_at) ==========
INSERT INTO reviews (user_id, product_id, star_rating, sentiment, comment, created_at) VALUES
(4,  1,  5, 'POSITIVE', 'Harika bir ürün, kalitesi beklentimin çok üstünde çıktı. Kesinlikle tavsiye ederim!', '2026-01-12 10:00:00'),
(4,  2,  4, 'POSITIVE', 'Güzel ama paketlemesi daha iyi olabilirdi. Yine de memnun kaldım.', '2026-01-15 10:00:00'),
(5,  3,  4, 'POSITIVE', 'Fiyat performans ürünü. Kargo çok hızlıydı.', '2026-01-18 14:00:00'),
(5,  5,  5, 'POSITIVE', 'Mükemmel, tam aradığım şeydi!', '2026-01-20 14:00:00'),
(6,  5,  3, 'NEUTRAL',  'İdare eder, fiyatına göre fena değil ama daha iyisini bekliyordum.',  '2026-02-05 09:00:00'),
(6,  1,  3, 'NEUTRAL',  'Ortalama bir ürün, ne çok iyi ne çok kötü.',  '2026-02-10 12:00:00'),
(7,  6,  5, 'POSITIVE', 'Kumaşı ve duruşu efsane. Çok beğendim.', '2026-02-15 11:00:00'),
(7,  9,  4, 'POSITIVE', 'Rengi resimdekiyle aynı, severek kullanıyorum.', '2026-02-20 11:00:00'),
(8,  5,  4, 'POSITIVE', 'Ses kalitesi oldukça tatmin edici.', '2026-03-01 16:00:00'),
(8,  14, 5, 'POSITIVE', 'Çok şık ve rahat, ayağımı hiç vurmadı.', '2026-03-05 14:00:00'),
(9,  2,  2, 'NEGATIVE', 'Beklentimi karşılamadı, şarjı çok çabuk bitiyor.', '2026-03-10 10:00:00'),
(9,  3,  2, 'NEGATIVE', 'Ekranda hafif bir çizik vardı, iade etmekle uğraşmadım ama üzücü.', '2026-03-15 10:00:00'),
(10, 4,  5, 'POSITIVE', 'Performansı canavar gibi, oyunlar akıyor resmen.', '2026-03-20 14:00:00'),
(10, 11, 1, 'NEGATIVE', 'Sipariş ettiğim modelle alakası yok, yanlış ürün gönderilmiş!', '2026-03-25 09:00:00'),
(4,  5,  4, 'POSITIVE', 'Kardeşime hediye aldım, çok beğendi.', '2026-04-01 09:00:00'),
(4,  12, 5, 'POSITIVE', 'Kalitesi tartışılmaz, yıllarca kullanılır.', '2026-04-05 11:00:00'),
(5,  9,  5, 'POSITIVE', 'Tam kalıp, kendi bedeninizi alabilirsiniz.', '2026-04-10 13:00:00'),
(5,  6,  4, 'POSITIVE', 'Şık bir tasarım, ofis için ideal.', '2026-04-12 13:00:00'),
(6,  10, 3, 'NEUTRAL',  'Rengi bir tık daha soluk geldi ama kötü değil.',  '2026-04-15 11:00:00'),
(6,  12, 4, 'POSITIVE', 'Fermuar kısmı biraz sert ama genel olarak kaliteli.', '2026-04-15 16:00:00'),
(6,  7,  2, 'NEGATIVE', 'Beden tablosu hatalı, çok dar geldi iade ettim.', '2026-04-18 11:00:00'),
(7,  12, 5, 'POSITIVE', 'İç hacmi beklediğimden geniş, her şeyimi sığdırdım.', '2026-04-20 09:00:00'),
(7,  14, 5, 'POSITIVE', 'Çok hafif ve yürüyüş için çok uygun.', '2026-04-20 10:00:00'),
(8,  10, 2, 'NEGATIVE', 'Dikişleri çok özensiz, iki giymede söküldü.', '2026-04-22 15:00:00'),
(8,  12, 1, 'NEGATIVE', 'Kopçası ilk gün koptu, kesinlikle tavsiye etmiyorum.', '2026-04-22 15:00:00'),
(8,  1,  4, 'POSITIVE', 'Kamerası çok iyi, pili de 1 gün rahat çıkarıyor.', '2026-04-23 10:00:00'),
(9,  11, 4, 'POSITIVE', 'Günlük kullanım için ideal, fiyatı da uygun.', '2026-04-23 10:00:00'),
(9,  5,  3, 'NEUTRAL',  'Basları biraz zayıf geldi ama genel ses netliği iyi.',  '2026-04-24 12:00:00'),
(10, 14, 5, 'POSITIVE', 'Tabanı çok yumuşak, bütün gün ayakta çalışanlar için süper.', '2026-04-24 12:00:00'),
(10, 9,  5, 'POSITIVE', 'Kumaşı pamuklu, terletmiyor çok memnunum.', '2026-04-24 12:00:00'),
(4,  15, 3, 'NEUTRAL',  'Ekran koruyucu tam oturmadı ama iş görür.',  '2026-04-25 08:00:00'),
(5,  1,  5, 'POSITIVE', 'Kusursuz bir deneyim, paketleme çok özenliydi.', '2026-04-25 09:00:00'),
(6,  9,  4, 'POSITIVE', 'Yıkandıktan sonra çekme yapmadı, tavsiye ederim.', '2026-04-25 10:00:00'),
(7,  5,  3, 'NEUTRAL',  'Bağlantı bazen kopuyor ama genel olarak kullanışlı.',  '2026-04-25 11:00:00');
