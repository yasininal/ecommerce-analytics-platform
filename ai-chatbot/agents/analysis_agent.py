from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser
from agents.state import State
import os

prompt = PromptTemplate.from_template(
    """You are a Data Analyst for an E-commerce store. 
    A user asked: {question}
    
    You queried the database and got this raw data:
    {data}
    
    Analyze and formulate a clear, human-readable answer. Keep it professional and concise.
    """
)

def build_analysis_chain():
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.3, google_api_key=os.getenv("GOOGLE_API_KEY"))
    return prompt | llm | StrOutputParser()

async def analysis_node(state: State) -> State:

    data = state.get("query_result", [])
    
    # Provide simple string if empty
    if not data:
        state["analysis_text"] = "No data found for your request."
        state["final_output"] = state["analysis_text"]
        return state
        
    # Cap size to prevent massive token usage by limiting array items
    capped_data = data[:100] if len(data) > 100 else data
    data_str = str(capped_data)
        
    chain = build_analysis_chain()
    analysis = await chain.ainvoke({
        "question": state["input_question"],
        "data": data_str
    })
    
    state["analysis_text"] = analysis
    state["final_output"] = analysis
    return state
