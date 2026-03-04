from agents.state import State
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
import os
import json

visualization_decision_prompt = PromptTemplate.from_template(
    """You are a strict data visualization assistant.
    Review the answer to the user's question to decide if a chart (bar, line, pie) is required or helpful.
    
    Question: {question}
    Analysis Output: {analysis_text}
    Data: {data}
    
    If the data contains multiple points (e.g. sales over time, group by items) or if the user explicitly asked for a chart, respond exactly "YES".
    Otherwise, respond exactly "NO".
    """
)

def visualization_node(state: State) -> State:
    decision_chain = visualization_decision_prompt | ChatOpenAI(model="gpt-4o-mini", temperature=0) | StrOutputParser()
    data = state.get("query_result", [])
    
    # Needs actual data for visualization
    if len(data) <= 1:
        state["visualization_code"] = None
        return state
        
    analysis_text = state.get("analysis_text", "")
    data_str = str(data)[:1000]
    
    decision = decision_chain.invoke({
        "question": state["input_question"],
        "analysis_text": analysis_text,
        "data": data_str
    }).strip().upper()
    
    if "YES" in decision:
        # Here we could generate Plotly JSON payload for the frontend
        # For this prototype, we will return the clean raw data so the frontend can draw the chart
        state["visualization_code"] = json.dumps(data)
    else:
        state["visualization_code"] = None
        
    return state
