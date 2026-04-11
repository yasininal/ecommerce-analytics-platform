from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser
from agents.state import State
import os

prompt = PromptTemplate.from_template(
    """You are a guardrails agent for an e-commerce analytics platform.
    Your job is to determine if the user's question is related to our platform, database metrics, e-commerce, or sales analytics.
    
    User Question: {question}
    
    If it is relevant, answer exactly "YES".
    If it is NOT relevant (e.g. asking about weather, sports, unrelated topics), answer exactly "NO".
    """
)

def build_guardrails_chain():
    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0, google_api_key=os.getenv("GOOGLE_API_KEY"))
    return prompt | llm | StrOutputParser()

async def guardrails_node(state: State) -> State:
    print("Guardrails node started")
    chain = build_guardrails_chain()
    print("Invoking guardrails chain...")
    result = (await chain.ainvoke({"question": state["input_question"]})).strip().upper()
    print(f"Guardrails result: {result}")
    
    if "YES" in result:
        state["is_valid_query"] = True
    else:
        state["is_valid_query"] = False
        state["error"] = "I can only answer questions related to our E-Commerce Analytics Platform."
        
    return state
