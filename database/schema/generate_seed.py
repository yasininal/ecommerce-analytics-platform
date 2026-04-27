import random
from datetime import datetime, timedelta

def generate_sql():
    users_raw = []
    pass_hash = '$2a$10$wY1twJw3Wt0ZbW.Q.sB0f.90P6xO.e5fX.uBzvfBqz461zT3lFhK6'
    
    users_raw.append(f"'admin@platform.com', '{pass_hash}', 'ADMIN', 'OTHER'")
    for i in range(1, 5):
        users_raw.append(f"'seller{i}@store.com', '{pass_hash}', 'CORPORATE', '{random.choice(['MALE', 'FEMALE'])}'")
    for i in range(1, 21):
        users_raw.append(f"'buyer{i}@random.com', '{pass_hash}', 'INDIVIDUAL', '{random.choice(['MALE', 'FEMALE'])}'")
        
    stores = [
        "(1, 2, 'TrendAnalytix Tech', 'ACTIVE')",
        "(2, 3, 'Fashion Elite', 'ACTIVE')",
        "(3, 4, 'Home Design Studio', 'ACTIVE')",
        "(4, 5, 'Ultimate Gaming Hub', 'ACTIVE')"
    ]
    
    profiles = []
    cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Konya', 'Adana', 'Eskişehir', 'Trabzon', 'Samsun']
    memberships = ['BASIC', 'PREMIUM', 'VIP']
    for i in range(6, 26):
        profiles.append(f"({i-5}, {i}, {random.randint(20, 60)}, '{random.choice(cities)}', '{random.choice(memberships)}')")
        
    categories = [
        "(1, 'Electronics', NULL)",
        "(2, 'Smartphones', 1)",
        "(3, 'Laptops', 1)",
        "(4, 'Accessories', 1)",
        "(5, 'Fashion', NULL)",
        "(6, 'Clothing', 5)",
        "(7, 'Shoes', 5)",
        "(8, 'Bags', 5)",
        "(9, 'Home', NULL)",
        "(10, 'Furniture', 9)",
        "(11, 'Kitchen', 9)",
        "(12, 'Gaming', 1)"
    ]
    
    names_pool = {
        2: ["iPhone 15 Pro", "Samsung Galaxy S24", "Google Pixel 8", "Xiaomi 14 Ultra", "OnePlus 12", "Nothing Phone 2"],
        3: ["MacBook Air M3", "Dell XPS 13", "HP Spectre x360", "Lenovo ThinkPad X1", "Asus ROG Zephyrus", "Razer Blade 14"],
        4: ["AirPods Pro", "Sony WH-1000XM5", "Logitech MX Master 3S", "Samsung T9 SSD", "Anker PowerCore", "Keychron K2"],
        6: ["Oversized Hoodie", "Slim Fit Jeans", "Leather Biker Jacket", "Cotton T-Shirt", "Chino Trousers", "Denim Shirt"],
        7: ["Nike Air Jordan", "Adidas Ultraboost", "New Balance 550", "Dr. Martens Boots", "Chelsea Boots", "Vans Old Skool"],
        8: ["Leather Tote Bag", "Canvas Backpack", "Crossbody Bag", "Duffle Travel Bag", "Clutch Purse", "Messenger Bag"],
        10: ["Ergonomic Desk Chair", "Minimalist Coffee Table", "Modular Sofa", "Bookshelf Unit", "King Size Bed Frame", "Sideboard Cabinet"],
        11: ["Air Fryer Deluxe", "Nespresso Machine", "Cast Iron Skillet", "Electric Kettle", "Blender Pro", "Toaster 4-Slice"],
        12: ["PS5 Console", "Xbox Series X", "Nintendo Switch OLED", "Gaming Headset 7.1", "Steam Deck 512GB", "Arcade Stick"]
    }

    products = []
    for i in range(1, 61):
        c_id = random.choice([2,3,4,6,7,8,10,11,12])
        base_name = random.choice(names_pool[c_id])
        suffix = random.choice(["Pro", "Elite", "Max", "Ultra", "Prime", "Series X"])
        name = f"{base_name} {suffix}"
        if c_id in [2,3,4]: s_id = 1
        elif c_id in [6,7,8]: s_id = 2
        elif c_id in [10,11]: s_id = 3
        else: s_id = 4
        sku = f"SKU-{c_id:02}-{i:03}"
        price = round(random.uniform(50, 3000), 2)
        products.append(f"({i}, {s_id}, {c_id}, '{sku}', '{name}', '{base_name.split()[0]}', 'Yüksek kaliteli {base_name}', {price}, {random.randint(10, 200)}, NULL)")

    orders = []
    order_items = []
    statuses = ['DELIVERED', 'SHIPPED', 'PROCESSING', 'PENDING', 'CANCELLED', 'RETURNED']
    start_date = datetime(2026, 1, 1)
    oi_id = 1
    for i in range(1, 151):
        user_id = random.randint(6, 25)
        store_id = random.randint(1, 4)
        status = random.choices(statuses, weights=[70, 10, 5, 5, 5, 5])[0]
        days_offset = random.randint(0, 180)
        created_at = start_date + timedelta(days=days_offset, hours=random.randint(0,23))
        order_total = 0
        num_items = random.randint(1, 3)
        for _ in range(num_items):
            p_idx = random.randint(1, 60)
            qty = random.randint(1, 2)
            price = round(random.uniform(50, 1000), 2)
            order_items.append(f"({oi_id}, {i}, {p_idx}, {qty}, {price})")
            order_total += qty * price
            oi_id += 1
        orders.append(f"({i}, {user_id}, {store_id}, '{status}', {round(order_total, 2)}, 'Örnek Adres No:{i} {random.choice(cities)}', '{created_at.strftime('%Y-%m-%d %H:%M:%S')}')")

    # Mapped Comments pool
    comments_pool = {
        'POSITIVE': [
            "Harika bir ürün, kalitesi muazzam!", "Beklediğimden daha iyi çıktı, tavsiye ederim.",
            "Çok kullanışlı ve şık bir tasarım.", "Hızlı teslimat için teşekkürler.",
            "Ürün görseldeki gibi geldi, çok beğendim.", "Tam istediğim gibi, teşekkür ederim.",
            "Biraz pahalı ama kalitesi fark ediliyor.", "Mükemmel bir alışveriş deneyimiydi.",
            "Renkleri çok canlı ve güzel.", "Fiyat performans açısından 1 numara."
        ],
        'NEUTRAL': [
            "Kargo biraz yavaştı ama ürünün kalitesi telafi ediyor.",
            "Ürün fena değil, iş görür.",
            "Beklentimin altında kaldı ama iade etmeyeceğim.",
            "Normal bir ürün, ne eksik ne fazla.",
            "Kullanımı biraz zor ama alışılır."
        ],
        'NEGATIVE': [
            "Kalitesi çok düşük, hayal kırıklığına uğradım.",
            "Maalesef paketleme kötüydü, ürün hasar görmüş.",
            "Kesinlikle almayın, paranıza yazık.",
            "Görseldeki ürünle alakası yok, yanlış geldi.",
            "Ürün bozuk çıktı, servis süreci çok yavaş."
        ]
    }

    reviews = []
    for i in range(1, 121):
        u_id = random.randint(6, 25)
        p_id = random.randint(1, 60)
        sentiment = random.choices(['POSITIVE', 'NEUTRAL', 'NEGATIVE'], weights=[70, 20, 10])[0]
        if sentiment == 'POSITIVE': rating = random.randint(4, 5)
        elif sentiment == 'NEUTRAL': rating = 3
        else: rating = random.randint(1, 2)
        
        comment = random.choice(comments_pool[sentiment])
        reviews.append(f"({i}, {u_id}, {p_id}, {rating}, '{sentiment}', '{comment}', '2026-{random.randint(1,6):02}-{random.randint(1,28):02} 10:00:00')")

    shipments = []
    for i in range(1, 101):
        warehouses = ['İstanbul Merkez', 'Ankara Lojistik', 'İzmir Dağıtım', 'Bursa Depo']
        modes = ['STANDARD', 'EXPRESS', 'OVERNIGHT']
        ship_statuses = ['PREPARING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED']
        shipments.append(f"({i}, {i}, '{random.choice(warehouses)}', '{random.choice(modes)}', '{random.choice(ship_statuses)}', '2026-{random.randint(1,6):02}-{random.randint(1,28):02} 09:00:00')")

    sql = "SET NAMES utf8mb4;\nUSE ecommerce_analytics;\n\n"
    sql += "SET FOREIGN_KEY_CHECKS = 0;\n"
    sql += "TRUNCATE TABLE reviews;\nTRUNCATE TABLE shipments;\nTRUNCATE TABLE order_items;\nTRUNCATE TABLE orders;\nTRUNCATE TABLE products;\nTRUNCATE TABLE categories;\nTRUNCATE TABLE customer_profiles;\nTRUNCATE TABLE stores;\nTRUNCATE TABLE users;\n"
    sql += "SET FOREIGN_KEY_CHECKS = 1;\n\n"
    
    sql += "-- ========== USERS ==========\nINSERT INTO users (id, email, password_hash, role_type, gender) VALUES\n"
    users_with_id = []
    for i, u_raw in enumerate(users_raw, 1):
        users_with_id.append(f"({i}, {u_raw})")
    sql += ",\n".join(users_with_id) + ";\n\n"
    
    sql += "-- ========== STORES ==========\nINSERT INTO stores (id, owner_id, name, status) VALUES\n" + ",\n".join(stores) + ";\n\n"
    sql += "-- ========== CUSTOMER PROFILES ==========\nINSERT INTO customer_profiles (id, user_id, age, city, membership_type) VALUES\n" + ",\n".join(profiles) + ";\n\n"
    sql += "-- ========== CATEGORIES ==========\nINSERT INTO categories (id, name, parent_id) VALUES\n" + ",\n".join(categories) + ";\n\n"
    sql += "-- ========== PRODUCTS ==========\nINSERT INTO products (id, store_id, category_id, sku, name, brand, description, unit_price, stock_quantity, image_url) VALUES\n" + ",\n".join(products) + ";\n\n"
    sql += "-- ========== ORDERS ==========\nINSERT INTO orders (id, user_id, store_id, status, grand_total, shipping_address, created_at) VALUES\n" + ",\n".join(orders) + ";\n\n"
    sql += "-- ========== ORDER ITEMS ==========\nINSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES\n" + ",\n".join(order_items) + ";\n\n"
    sql += "-- ========== SHIPMENTS ==========\nINSERT INTO shipments (id, order_id, warehouse, mode, status, shipped_at) VALUES\n" + ",\n".join(shipments) + ";\n\n"
    sql += "-- ========== REVIEWS ==========\nINSERT INTO reviews (id, user_id, product_id, star_rating, sentiment, comment, created_at) VALUES\n" + ",\n".join(reviews) + ";\n\n"
    
    return sql

with open('expanded_seed_data.sql', 'w', encoding='utf-8') as f:
    f.write(generate_sql())
