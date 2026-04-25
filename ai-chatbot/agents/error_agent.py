from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser
from agents.state import State
from agents.sql_agent import SCHEMA_INFO
import os

prompt = PromptTemplate.from_template(
    """You are a MySQL Error Recovery Specialist.
    The previous SQL query generated an error when executed against the database.
    
    Available database schema:
    {schema}
    
    Original Question: {question}
    Faulty SQL Query: {sql_query}
    Database Error: {error}
    
    Diagnose the error and provide a corrected MySQL query. 
    Return ONLY the corrected SQL string. No explanations, no markdown formatting.
    """
)

def build_error_chain():
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )
    return prompt | llm | StrOutputParser()

async def error_node(state: State) -> State:
    chain = build_error_chain()
    query = (await chain.ainvoke({
        "schema": SCHEMA_INFO,
        "question": state["input_question"],
        "sql_query": state.get("sql_query", ""),
        "error": state.get("error", "")
    })).strip()
    
    # Clean possible markdown
    if query.startswith("```sql"):
        query = query.replace("```sql", "").strip()
    if query.startswith("```"):
        query = query.replace("```", "").strip()
    if query.endswith("```"):
        query = query[:-3].strip()
        
    state["sql_query"] = query
    state["error"] = None
    
    # Increment retry count
    current_retries = state.get("retry_count", 0)
    state["retry_count"] = current_retries + 1
    
    return state
