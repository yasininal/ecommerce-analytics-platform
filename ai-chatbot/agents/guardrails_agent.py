from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser
from agents.state import State
import os

prompt = PromptTemplate.from_template(
    """You are the Guardrails Agent for an E-Commerce Analytics Platform chatbot.
    Your job is to classify the user's input into one of three categories:
    
    1. "GREETING": If the user is just saying hello, asking how you are, etc.
    2. "IN_SCOPE": If the user is asking a question related to e-commerce, sales, database metrics, stores, products, orders, customers, or shipments.
    3. "OUT_OF_SCOPE": If the user is asking about anything else (e.g., writing a poem, telling a joke, general knowledge not related to e-commerce).
    
    Return ONLY one of the three category words: GREETING, IN_SCOPE, or OUT_OF_SCOPE. No other text.
    
    User Input: {question}
    """
)

def build_guardrails_chain():
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0, google_api_key=os.getenv("GOOGLE_API_KEY"))
    return prompt | llm | StrOutputParser()

async def guardrails_node(state: State) -> State:
    chain = build_guardrails_chain()
    classification = (await chain.ainvoke({
        "question": state["input_question"]
    })).strip().upper()
    
    if "GREETING" in classification:
        state["is_valid_query"] = False
        state["error"] = "Hello! I am your AI data assistant. I can analyze your e-commerce data and create charts instantly. How can I help you today?"
        state["final_output"] = state["error"]
        
    elif "OUT_OF_SCOPE" in classification:
        state["is_valid_query"] = False
        state["error"] = "I can only answer questions related to our E-Commerce Analytics Platform data."
        state["final_output"] = state["error"]
        
    else: # IN_SCOPE
        state["is_valid_query"] = True
        state["error"] = None
        
    return state
