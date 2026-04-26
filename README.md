# 🛒 E-Commerce Analytics Platform — CSE 214 Final Project

> **Multi-Agent Text2SQL AI Chatbot** destekli kapsamlı e-ticaret analitik platformu.  
> Spring Boot · Angular · MySQL/PostgreSQL · LangGraph · OpenAI

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
│   ├── src/
│   │   ├── main/java/com/ecommerce/
│   │   │   ├── config/         # Security, JWT, Swagger config
│   │   │   ├── controller/     # REST API controllers
│   │   │   ├── service/        # Business logic
│   │   │   ├── repository/     # JPA repositories
│   │   │   ├── model/          # JPA entities
│   │   │   ├── dto/            # Data transfer objects
│   │   │   └── exception/      # Global exception handling
│   │   └── resources/
│   │       └── application.properties
│   └── pom.xml
│
├── frontend/                   # Angular App
│   ├── src/app/
│   │   ├── core/               # Auth guards, interceptors, services
│   │   ├── shared/             # Shared components, pipes, directives
│   │   ├── features/
│   │   │   ├── admin/          # Admin dashboard & management
│   │   │   ├── corporate/      # Store management & analytics
│   │   │   ├── individual/     # Shopping & order tracking
│   │   │   └── chatbot/        # AI Assistant UI
│   │   └── app-routing.module.ts
│   └── package.json
│
├── ai-chatbot/                 # Python LangGraph Service
│   ├── agents/
│   │   ├── guardrails_agent.py
│   │   ├── sql_agent.py
│   │   ├── analysis_agent.py
│   │   ├── visualization_agent.py
│   │   └── error_agent.py
│   ├── graph/
│   │   └── workflow.py         # LangGraph state machine
│   ├── database/
│   │   └── db_connector.py
│   ├── main.py                 # FastAPI/Chainlit entrypoint
│   ├── requirements.txt
│   └── .env.example
│
├── database/
│   ├── schema/
│   │   ├── 01_create_tables.sql
│   │   ├── 02_indexes.sql
│   │   └── 03_seed_data.sql
│
├── docs/
│   ├── architecture.md
│   ├── api-documentation.md
│   ├── er-diagram.png
│   └── technical-report.pdf
│
└── README.md
```

---

## 🗄️ Veritabanı Şeması

```sql
USERS (id, email, password_hash, role_type, gender)
  ├── STORES (id, owner_id, name, status)
  ├── CUSTOMER_PROFILES (id, user_id, age, city, membership_type)
  ├── ADDRESSES (id, user_id, title, city, full_address, is_default)
  └── ORDERS (id, user_id, store_id, status, grand_total, shipping_address)
        ├── ORDER_ITEMS (id, order_id, product_id, quantity, price)
        └── SHIPMENTS (id, order_id, warehouse, mode, status)

PRODUCTS (id, store_id, category_id, sku, name, unit_price, brand, description)
  ├── REVIEWS (id, user_id, product_id, star_rating, sentiment)
  └── INVENTORY (id, product_id, stock_quantity)

COUPONS (id, code, discount_percentage, expiration_date, active)
NOTIFICATIONS (id, user_id, message, is_read, created_at)
```

---

## 🤖 Multi-Agent AI Chatbot Mimarisi

```
Kullanıcı Sorusu
      │
      ▼
┌─────────────────┐
│ Guardrails Agent│ ──► Selamlama → Friendly Reply
│ (Kapsam Filtresi)│ ──► Kapsam Dışı → Rejection Mesajı
└────────┬────────┘
         │ (Kapsam İçi)
         ▼
┌─────────────────┐
│   SQL Agent     │ ──► Doğal dilden SQL üretir
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  SQL Execution  │─────│   Error Agent   │ (hata varsa max 3 retry)
└────────┬────────┘     └─────────────────┘
         │ (başarılı)
         ▼
┌─────────────────┐
│ Analysis Agent  │ ──► Sonucu doğal dilde açıklar
└────────┬────────┘
         │
         ▼
┌─────────────────────┐     ┌──────────────────────┐
│ Decide Graph Agent  │─────│ Visualization Agent  │ (grafik gerekiyorsa)
└─────────────────────┘     └──────────────────────┘
         │
         ▼
    Final Cevap
```

### Agent Konfigürasyonları

```python
AGENT_CONFIGS = {
    "guardrails_agent": {
        "role": "Security and Scope Manager",
        "system_prompt": "You are a strict guardrails system that filters questions "
                         "to ensure they are relevant to e-commerce data analysis."
    },
    "sql_agent": {
        "role": "SQL Expert",
        "system_prompt": "You are a senior SQL developer specializing in e-commerce "
                         "databases. Generate only valid SQL queries without any "
                         "formatting or explanation."
    },
    "analysis_agent": {
        "role": "Data Analyst",
        "system_prompt": "You are a helpful data analyst that explains database "
                         "query results in natural language with clear insights."
    },
    "viz_agent": {
        "role": "Visualization Specialist",
        "system_prompt": "You are a data visualization expert. Generate clean, "
                         "executable Plotly code without markdown formatting."
    },
    "error_agent": {
        "role": "Error Recovery Specialist",
        "system_prompt": "You diagnose and fix SQL errors with expert knowledge "
                         "of database schemas and query optimization."
    }
}
```

### LangGraph State

```python
from typing import TypedDict, Optional

class AgentState(TypedDict):
    question: str
    sql_query: Optional[str]
    query_result: Optional[list]
    error: Optional[str]
    final_answer: Optional[str]
    visualization_code: Optional[str]
    is_in_scope: Optional[bool]
    iteration_count: int
```

---

## 🔐 Rol Bazlı Erişim (RBAC)

| Rol | Chatbot Erişimi | Platform Erişimi |
|-----|----------------|-----------------|
| **Admin** | Tüm platforma ait sorgular | Kullanıcı & mağaza yönetimi, global analitik |
| **Corporate** | Kendi mağazasının verileri | Envanter, satış analizi, müşteri segmentasyonu |
| **Individual** | Sadece kendi siparişleri | Alışveriş, sipariş takip, yorumlar |

---

## 🛠️ Kurulum

### Gereksinimler

- Java 17+
- Node.js 18+
- Python 3.10+
- MySQL 8.0+ veya PostgreSQL 14+
- Maven 3.8+

### 1. Veritabanını Hazırla

```bash
# MySQL için
mysql -u root -p < database/schema/01_create_tables.sql
mysql -u root -p < database/schema/02_indexes.sql
mysql -u root -p < database/schema/03_seed_data.sql
```

### 2. Backend (Spring Boot)

```bash
cd backend

# application.properties dosyasını düzenle
cp src/main/resources/application.properties.example \
   src/main/resources/application.properties

# Çalıştır
./mvnw spring-boot:run
# API: http://localhost:8080
# Swagger: http://localhost:8080/swagger-ui.html
```

### 3. AI Chatbot (Python/LangGraph)

```bash
cd ai-chatbot

python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
# .env içine OPENAI_API_KEY, DB_URL vb. ekle

python main.py
# Chatbot API: http://localhost:8000
```

### 4. Frontend (Angular)

```bash
cd frontend

npm install
ng serve
# UI: http://localhost:4200
```

---

## 📡 API Endpoints (Özet)

### Auth
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh
```

### Chatbot
```
POST   /api/chat/ask          # { "question": "...", "userId": "..." }
GET    /api/chat/history/{id}
```

### Ürünler & Siparişler
```
GET    /api/products
POST   /api/products
GET    /api/orders/{userId}
POST   /api/orders
```

### Analitik (Corporate/Admin)
```
GET    /api/analytics/revenue?from=&to=
GET    /api/analytics/top-products
GET    /api/analytics/customer-segments
```

---

## 📊 Notlandırma Kriterleri

| Kriter | Ağırlık |
|--------|---------|
| Database Tasarımı & Veri Entegrasyonu | %20 |
| Backend (Spring Boot) | %25 |
| Frontend (Angular) | %20 |
| AI Chatbot & Multi-Agent | %20 |
| Dokümantasyon & Sunum | %10 |
| Kod Kalitesi & Git Kullanımı | %5 |

### Bonus (%10'a kadar)
- Docker/Kubernetes deployment
- WebSocket ile real-time bildirimler
- CI/CD pipeline

---

## 📅 Geliştirme Planı (Önerilen)

```
Hafta 1: Database şeması + ETL pipeline
Hafta 2: Spring Boot backend (Auth + temel CRUD)
Hafta 3: Angular frontend (temel sayfalar + routing)
Hafta 4: AI Chatbot (LangGraph agents)
Hafta 5: Entegrasyon + test
Hafta 6: Dokümantasyon + sunum hazırlığı
```

---

## 🌿 Git Branch Stratejisi

```
main          ← stabil, sadece merge
develop       ← aktif geliştirme
feature/backend-auth
feature/frontend-dashboard
feature/ai-chatbot
feature/database-etl
```

---

## 📄 Teslim Edilecekler

- [ ] GitHub repo (branch geçmişiyle)
- [ ] Teknik rapor (10-15 sayfa)
- [ ] Canlı demo (10 dakika)
- [ ] ER Diyagramı
- [ ] ETL field mapping dokümantasyonu

---

## 📚 Kaynaklar

- [LangGraph Docs](https://langchain-ai.github.io/langgraph/)
- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [Angular Docs](https://angular.io/docs)
- [Plotly Python](https://plotly.com/python/)
- [Kaggle - UCI Online Retail](https://www.kaggle.com/datasets/vijayuv/onlineretail)
- [Kaggle - Brazilian E-Commerce (Olist)](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce)
