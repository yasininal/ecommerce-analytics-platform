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
    
    If the user's question is NOT related to e-commerce, sales, database metrics, or the schema above, respond exactly with "IRRELEVANT".
    Otherwise, write ONLY a valid MySQL query to answer the question.
    
    Return ONLY the SQL string or "IRRELEVANT". No markdown formatting.
    
    Question: {question}
    """
)

def build_sql_chain():
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0, google_api_key=os.getenv("GOOGLE_API_KEY"))
    return prompt | llm | StrOutputParser()

async def sql_node(state: State) -> State:
    chain = build_sql_chain()
    query = (await chain.ainvoke({
        "schema": SCHEMA_INFO,
        "question": state["input_question"]
    })).strip()
    
    if "IRRELEVANT" in query.upper():
        state["is_valid_query"] = False
        state["error"] = "I can only answer questions related to our E-Commerce Analytics Platform."
        state["sql_query"] = None
        return state

    # Clean possible markdown
    if query.startswith("```sql"):
        query = query.replace("```sql", "").strip()
    if query.endswith("```"):
        query = query[:-3].strip()
        
    state["sql_query"] = query
    state["is_valid_query"] = True
    state["error"] = None
    return state
