from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from agents.state import State
import os

SCHEMA_INFO = """
USERS (id, email, password_hash, role_type, gender)
STORES (id, owner_id, name, status)
CUSTOMER_PROFILES (id, user_id, age, city, membership_type)
ORDERS (id, user_id, store_id, status, grand_total)
ORDER_ITEMS (id, order_id, product_id, quantity, price)
SHIPMENTS (id, order_id, warehouse, mode, status)
PRODUCTS (id, store_id, category_id, sku, name, unit_price)
REVIEWS (id, user_id, product_id, star_rating, sentiment)
CATEGORIES (id, name, parent_id)
"""

prompt = PromptTemplate.from_template(
    """You are a MySQL expert for an E-Commerce Analytics Platform.
    Write ONLY a valid MySQL query to answer the given question based on this schema:
    {schema}
    
    If there is an error from a previous attempt, here it is (Empty if no error): {error}
    
    Remember: Return ONLY the SQL string, nothing else. No markdown formatting like ```sql.
    
    Question: {question}
    """
)

def build_sql_chain():
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, api_key=os.getenv("OPENAI_API_KEY"))
    return prompt | llm | StrOutputParser()

def sql_node(state: State) -> State:
    chain = build_sql_chain()
    query = chain.invoke({
        "schema": SCHEMA_INFO,
        "question": state["input_question"],
        "error": state.get("error", "")
    }).strip()
    
    # Clean possible markdown
    if query.startswith("```sql"):
        query = query.replace("```sql", "").strip()
    if query.endswith("```"):
        query = query[:-3].strip()
        
    state["sql_query"] = query
    state["error"] = None # Reset error if we are generating new SQL
    return state
