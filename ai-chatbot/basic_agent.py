import os
import json
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from sqlalchemy import create_engine, text

# Hardcoded schema
SCHEMA_INFO = """
users (id, email, password_hash, role_type, gender)
stores (id, owner_id, name, status)
customer_profiles (id, user_id, age, city, membership_type)
orders (id, user_id, store_id, status, grand_total)
order_items (id, order_id, product_id, quantity, price)
shipments (id, order_id, warehouse, mode, status)
products (id, store_id, category_id, sku, name, unit_price)
reviews (id, user_id, product_id, star_rating, sentiment)
categories (id, name, parent_id)
"""

DB_USER = os.getenv("MYSQL_USER", "root")
DB_PASS = os.getenv("MYSQL_PASSWORD", "password")
DB_HOST = os.getenv("MYSQL_HOST", "mysql_db")
DB_NAME = os.getenv("MYSQL_DATABASE", "ecommerce_analytics")
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:3306/{DB_NAME}"
engine = create_engine(DATABASE_URL)

sql_prompt = PromptTemplate.from_template(
    """You are an SQL generator for an E-commerce DB.
Schema: {schema}
Rule: Role={role}, ID={user_id}. If role=CORPORATE, filter where store_id or owner_id={user_id}. If INDIVIDUAL, filter where user_id={user_id}.
Return ONLY the raw MySQL SELECT query. No explanations.
Question: {question}"""
)

analysis_prompt = PromptTemplate.from_template(
    """You are an E-commerce Analyst. 
Question: {question}
DB Result: {data}
Return ONLY a valid JSON object:
{{
  "answer": "A short 1-2 sentence human answer.",
  "plotly": null
}}
If the data contains multiple rows and could be visualized, put a valid Plotly JSON config in "plotly". Do not use markdown blocks.
"""
)

async def run_basic_agent(question: str, user_id: str, role: str):
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )
    
    # 1. Gen SQL (1 Request)
    sql_chain = sql_prompt | llm | StrOutputParser()
    try:
        sql = await sql_chain.ainvoke({"schema": SCHEMA_INFO, "role": role, "user_id": user_id, "question": question})
        sql = sql.replace("```sql", "").replace("```", "").strip()
        print(f"Generated SQL: {sql}")
        
        # Check if the AI returned a valid SQL (it might return empty for greetings)
        if not sql or not sql.upper().startswith("SELECT"):
            return {"answer": "Hello! I am your AI E-commerce Assistant. Ask me a question about your sales, products, or customers!", "visualization_code": None, "error": None}
            
        # 2. Run SQL
        with engine.connect() as conn:
            result = conn.execute(text(sql))
            data = [dict(row._mapping) for row in result.fetchall()]
            
        # 3. Analyze (1 Request)
        if not data:
            return {"answer": "I found no data matching your query.", "visualization_code": None, "error": None}
            
        analysis_chain = analysis_prompt | llm | JsonOutputParser()
        res = await analysis_chain.ainvoke({"question": question, "data": str(data[:20])})
        
        plotly_json = json.dumps(res["plotly"]) if res.get("plotly") else None
        
        return {"answer": res.get("answer", "Here is the data."), "visualization_code": plotly_json, "error": None}
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"answer": "An error occurred while analyzing the data.", "visualization_code": None, "error": str(e)}
