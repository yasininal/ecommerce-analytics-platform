# 🛒 E-Commerce Analytics Platform — CSE 214 Final Project

> **Unified AI Super-Agent** destekli kapsamlı e-ticaret analitik platformu.  
> Spring Boot · Angular · MySQL · LangChain · Gemini 2.0

---

## 👥 Grup Bilgisi

| İsim | Rol |
|------|-----|
| [İsim 1] | Backend + AI Chatbot |
| [İsim 2] | Frontend + Database |

---

## 📁 Proje Yapısı

```
ecommerce-analytics-platform/
├── backend/                    # Spring Boot API
│   ├── src/main/java/com/ecommerce/
│   │   ├── config/             # Security, JWT, Stripe config
│   │   ├── controllers/        # REST API (Auth, Order, Product, Address, etc.)
│   │   ├── entities/           # JPA Entities
│   │   ├── repositories/       # JPA Repositories
│   │   └── services/           # Business Logic
│   └── README.md
│
├── frontend/                   # Angular 17 App
│   ├── src/app/
│   │   ├── core/               # Auth, Interceptors, Services
│   │   ├── features/           # Marketplace, Cart, Orders, Admin, Corporate
│   │   └── shared/             # Modern UI Components
│   └── README.md
│
├── ai-chatbot/                 # Python AI Service
│   ├── agents/                 # Individual Agent definitions (Architectural reference)
│   ├── super_agent.py          # Unified High-Performance Agent
│   ├── main.py                 # FastAPI Entrypoint
│   └── README.md
│
├── database/                   # Database Layer
│   ├── schema/                 # Tables, Indexes, Seed Data
│   └── README.md
│
└── docker-compose.yml          # Full-stack deployment
```

---

## 🗄️ Veritabanı Şeması

```sql
USERS (id, email, password_hash, role_type, gender)
  ├── STORES (id, owner_id, name, status)
  ├── CUSTOMER_PROFILES (id, user_id, age, city, membership_type)
  ├── ADDRESSES (id, user_id, title, city, full_address)
  └── ORDERS (id, user_id, store_id, status, grand_total, shipping_address)
        └── ORDER_ITEMS (id, order_id, product_id, quantity, price)

PRODUCTS (id, store_id, category_id, sku, name, unit_price, stock_quantity, brand)
  ├── REVIEWS (id, user_id, product_id, star_rating, sentiment)
  └── CATEGORIES (id, name, parent_id)

COUPONS (id, code, discount_percentage, expiry_date, is_active)
NOTIFICATIONS (id, user_id, message, is_read)
```

---

## 🤖 AI Chatbot Mimarisi (Unified Super-Agent)

Projemiz, performansı artırmak ve API kota sınırlarını (Rate Limits) optimize etmek için **"Unified Super-Agent"** mimarisini kullanır. Bu yapı, klasik multi-agent akışını tek bir akıllı karar mekanizmasında birleştirir.

```
Kullanıcı Sorusu (Doğal Dil)
      │
      ▼
┌─────────────────────────────────────────────────────────┐
│              UNIFIED AI SUPER-AGENT (Gemini)            │
├─────────────────────────────────────────────────────────┤
│ 1. Guardrails: Kapsam ve Güvenlik Kontrolü              │
│ 2. RBAC: Kullanıcı Rolüne Göre Veri Filtreleme          │
│ 3. Text2SQL: MySQL Query Üretimi                        │
│ 4. Execution: Veritabanı Sorgulama                      │
│ 5. Analysis: Sonuçların Doğal Dilde Yorumlanması        │
│ 6. Visualization: Grafik Gereksinimi Kararı             │
└────────────────────────────┬────────────────────────────┘
                             │
      ┌──────────────────────┴──────────────────────┐
      ▼                                             ▼
Doğal Dil Yanıt                       Dinamik Grafikler (Plotly)
```

### Güvenlik & RBAC (Rol Bazlı Erişim)
Chatbot, sorgu üretirken kullanıcının rolünü otomatik olarak algılar:
- **Admin:** Tüm platform verilerine erişim.
- **Corporate:** Sadece kendi mağazasına ait satış ve müşteri verileri.
- **Individual:** Sadece kendi sipariş geçmişi ve genel pazar (market) verileri.

---

## 🛠️ Kurulum

### Gereksinimler
- Docker & Docker Compose
- Google Gemini API Key

### Hızlı Başlat (Docker)
1. `.env` dosyasını oluşturun ve `GOOGLE_API_KEY`, `STRIPE_SECRET_KEY` bilgilerini ekleyin.
2. Tüm sistemi ayağa kaldırın:
   ```bash
   docker-compose up --build -d
   ```
3. Uygulama portları:
   - Frontend: `http://localhost:80`
   - Backend: `http://localhost:8080`
   - Chatbot: `http://localhost:8000`

---

## 📡 Öne Çıkan Özellikler

- **Modern Marketplace:** Premium tasarım, gelişmiş arama ve marka filtreleme.
- **Güvenli Ödeme:** Stripe entegrasyonu ile gerçekçi ödeme akışı.
- **Akıllı Sepet:** Dinamik kupon sistemi ve adres yönetimi.
- **Gelişmiş Analitik:** AI destekli satış analizi ve görselleştirme.
- **Bildirim Sistemi:** Sipariş durum değişiklikleri için gerçek zamanlı bildirimler.

---

## 📄 Teslim Edilecekler
- [x] GitHub repo (Final state)
- [x] Teknik rapor
- [x] Canlı demo
- [x] ER Diyagramı
