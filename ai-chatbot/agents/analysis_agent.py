import json
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import JsonOutputParser
from agents.state import State
import os

prompt = PromptTemplate.from_template(
    """You are a Data Analyst for an E-commerce store. 
    User question: {question}
    Raw data: {data}
    
    Return a JSON object with:
    1. "answer": A professional and concise human-readable answer.
    2. "needs_chart": Boolean, true if the data has multiple points and would benefit from a bar/line/pie chart.
    
    Response format: {{"answer": "...", "needs_chart": true/false}}
    """
)

def build_analysis_chain():
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        temperature=0.1,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )
    return prompt | llm | JsonOutputParser()

async def analysis_node(state: State) -> State:
    data = state.get("query_result", [])
    
    if not data:
        state["analysis_text"] = "No data found for your request."
        state["final_output"] = state["analysis_text"]
        state["visualization_code"] = None
        return state
        
    capped_data = data[:50]
    data_str = str(capped_data)
        
    chain = build_analysis_chain()
    try:
        res = await chain.ainvoke({
            "question": state["input_question"],
            "data": data_str
        })
        state["analysis_text"] = res.get("answer", "I analyzed the data.")
        state["final_output"] = state["analysis_text"]
        
        # Set graph routing flag
        if res.get("needs_chart") and len(data) > 1:
            state["needs_graph"] = True
        else:
            state["needs_graph"] = False
    except Exception as e:
        state["analysis_text"] = "I analyzed the data but could not format it correctly."
        state["final_output"] = state["analysis_text"]
        state["visualization_code"] = None
        
    return state
