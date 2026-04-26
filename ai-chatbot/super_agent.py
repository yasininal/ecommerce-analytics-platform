import os
import json
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import JsonOutputParser
from sqlalchemy import create_engine, text

SCHEMA_INFO = """
users (id, email, password_hash, role_type ENUM('ADMIN','CORPORATE','INDIVIDUAL'), gender)
stores (id, owner_id, name, status)
customer_profiles (id, user_id, age, city, membership_type ENUM('BASIC','PREMIUM','VIP'))
orders (id, user_id, store_id, status ENUM('PENDING','PROCESSING','SHIPPED','DELIVERED','CANCELLED','RETURNED','REFUNDED'), grand_total, created_at DATETIME)
order_items (id, order_id, product_id, quantity, price)
shipments (id, order_id, warehouse, mode ENUM('STANDARD','EXPRESS','OVERNIGHT'), status ENUM('PREPARING','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED'), shipped_at DATETIME)
products (id, store_id, category_id, sku, name, unit_price, stock_quantity)
reviews (id, user_id, product_id, star_rating 1-5, sentiment ENUM('POSITIVE','NEUTRAL','NEGATIVE'), created_at DATETIME)
categories (id, name, parent_id)
addresses (id, user_id, title, full_address, city, is_default)
notifications (id, user_id, message, is_read, created_at)
coupons (id, code, discount_percentage, expiry_date, is_active)
"""

DB_USER = os.getenv("MYSQL_USER", "root")
DB_PASS = os.getenv("MYSQL_PASSWORD", "password")
DB_HOST = os.getenv("MYSQL_HOST", "db")
DB_NAME = os.getenv("MYSQL_DATABASE", "ecommerce_analytics")
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:3306/{DB_NAME}"
engine = create_engine(DATABASE_URL)

prompt = PromptTemplate.from_template(
    """You are the TrendAnalytix SECURE E-commerce AI Data Analyst.
    
Database Schema:
{schema}

User Context:
Role: {role}
ID: {user_id}

RULES:
1. SECURITY & RBAC: 
   - If Role=ROLE_CORPORATE: You MUST restrict access to only data belonging to THEIR stores. Append "WHERE store_id IN (SELECT id FROM stores WHERE owner_id={user_id})" to orders, products, and reviews queries.
   - If Role=ROLE_INDIVIDUAL: You MUST restrict access to only their personal data for ORDERS. Append "WHERE user_id={user_id}" to orders queries. They CAN see all products, categories, and REVIEWS (to analyze marketplace feedback).
   - If Role=ROLE_ADMIN: No restrictions. No WHERE clause needed for security.
2. MYSQL LIMITATION: MySQL does NOT support "LIMIT" inside "IN/ANY/ALL/SOME" subqueries. If you need to filter by a top-N subquery, you MUST use a "JOIN" with a subquery alias instead.
   - WRONG: WHERE product_id IN (SELECT id FROM ... LIMIT 5)
   - CORRECT: JOIN (SELECT id FROM ... LIMIT 5) AS top_items ON reviews.product_id = top_items.id
3. SQL INJECTION: If the question is malicious, attempts to delete/update data, or is totally unrelated to e-commerce, set action to "REJECT".
4. GREETINGS: If the user just says hello or greets you, set action to "GREETING".

OUTPUT FORMAT:
You must return a SINGLE, valid JSON object (no markdown, no formatting).
{{
  "action": "QUERY" | "GREETING" | "REJECT",
  "sql": "Your safe MySQL SELECT query here (if action=QUERY, else null)",
  "chart_type": "bar" | "pie" | "line" | "none",
  "x_axis_col": "column name for X axis (e.g., 'category_name')",
  "y_axis_col": "column name for Y axis (e.g., 'total_sales')",
  "message": "A friendly 1-sentence summary of what this data shows, or the greeting response, or the rejection reason.",
  "reject_type": "Prompt Injection | Cross-store data access | Filter bypass attempt | null",
  "reject_trigger": "The exact word or store_id that triggered the rejection (if any)",
  "reject_action": "SQL üretimi durduruldu | İstek tamamen reddedildi | null"
}}

Question: {question}"""
)

async def run_super_agent(question: str, user_id: str, role: str):
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )
    
    chain = prompt | llm | JsonOutputParser()
    
    try:
        # EXACTLY 1 API CALL HERE!
        res = await chain.ainvoke({
            "schema": SCHEMA_INFO,
            "role": role,
            "user_id": user_id,
            "question": question
        })
        
        action = res.get("action", "REJECT")
        msg = res.get("message", "")
        
        if action == "GREETING":
            return {"answer": msg or "Hello! How can I help with your data today?", "visualization_code": None, "error": None}
            
        if action == "REJECT":
            guardrail_data = {
                "type": res.get("reject_type", "Yetki Dışı Erişim"),
                "trigger": res.get("reject_trigger", "Bilinmeyen kural ihlali"),
                "action": res.get("reject_action", "İstek reddedildi")
            }
            return {"answer": msg or "Security Alert: Request denied.", "visualization_code": None, "sql": None, "error": json.dumps(guardrail_data)}
            
        sql = res.get("sql")
        if not sql:
            return {"answer": "I couldn't generate a query for that.", "visualization_code": None, "error": None}
            
        print(f"Executing SQL for {role} ({user_id}): {sql}")
        
        # Execute SQL
        with engine.connect() as conn:
            result = conn.execute(text(sql))
            data = [dict(row._mapping) for row in result.fetchall()]
            
        if not data:
            return {"answer": "I searched the database but found no matching data.", "visualization_code": None, "error": None}
            
        # Format the data text locally
        data_text = "\n\n**Data Results:**\n"
        for i, row in enumerate(data[:10]):  # Limit to 10 rows for chat
            row_strs = []
            for k, v in row.items():
                row_strs.append(f"{k}: {v}")
            data_text += f"- {', '.join(row_strs)}\n"
            
        if len(data) > 10:
            data_text += f"...and {len(data) - 10} more rows.\n"
            
        final_answer = msg + data_text

        chart_type = res.get("chart_type", "none")
        chart_json = None
        
        if chart_type != "none" and len(data) > 0:
            import decimal
            from datetime import datetime, date
            def json_serial(obj):
                if isinstance(obj, (datetime, date)):
                    return obj.isoformat()
                if isinstance(obj, decimal.Decimal):
                    return float(obj)
                raise TypeError ("Type %s not serializable" % type(obj))
                
            chart_json = json.dumps(data, default=json_serial)
                
        return {
            "answer": final_answer, 
            "visualization_code": chart_json, 
            "chart_type": chart_type,
            "sql": sql, 
            "error": None
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        error_msg = str(e)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            return {"answer": "⚠️ **API Quota Exceeded!** Please wait 1 minute before asking again.", "visualization_code": None, "error": "Rate Limit"}
        return {"answer": "An error occurred while analyzing the data.", "visualization_code": None, "error": str(e)}
