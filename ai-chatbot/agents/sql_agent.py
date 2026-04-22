from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser
from agents.state import State
import os

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

prompt = PromptTemplate.from_template(
    """You are a MySQL expert for an E-Commerce Analytics Platform.
    Available database schema:
    {schema}
    
    IMPORTANT DATA SECURITY (RBAC) RULES:
    - The current user has ROLE: {user_role} and ID: {user_id}.
    - If the user is INDIVIDUAL or CORPORATE, you MUST restrict the query to only show data belonging to their user_id (e.g. WHERE user_id = {user_id} or owner_id = {user_id}).
    - If the user is ADMIN, they can see all data. Do not restrict.
    
    Write ONLY a valid MySQL query to answer the user's question. Do not include any explanations.
    Return ONLY the SQL string. No markdown formatting.
    
    Question: {question}
    """
)

def build_sql_chain():
    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0, google_api_key=os.getenv("GOOGLE_API_KEY"))
    return prompt | llm | JsonOutputParser()

async def sql_node(state: State) -> State:
    chain = build_sql_chain()
    query = (await chain.ainvoke({
        "schema": SCHEMA_INFO,
        "user_role": state.get("user_role", "UNKNOWN"),
        "user_id": state.get("user_id", -1),
        "question": state["input_question"]
    })).strip()
    
    # Clean possible markdown
    if query.startswith("```sql"):
        query = query.replace("```sql", "").strip()
    if query.endswith("```"):
        query = query[:-3].strip()
        
    state["sql_query"] = query
    state["error"] = None
    return state
