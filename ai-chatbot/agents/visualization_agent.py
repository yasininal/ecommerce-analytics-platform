from agents.state import State
from langchain_google_genai import ChatGoogleGenerativeAI
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

async def visualization_node(state: State) -> State:

    def build_viz_chain():
        llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0, google_api_key=os.getenv("GOOGLE_API_KEY"))
        return visualization_decision_prompt | llm | StrOutputParser()
    
    decision_chain = build_viz_chain()
    data = state.get("query_result", [])
    
    # Needs actual data for visualization
    if len(data) <= 1:
        state["visualization_code"] = None
        return state
        
    analysis_text = state.get("analysis_text", "")
    capped_data = data[:100] if len(data) > 100 else data
    data_str = str(capped_data)
    
    decision = (await decision_chain.ainvoke({
        "question": state["input_question"],
        "analysis_text": analysis_text,
        "data": data_str
    })).strip().upper()
    
    if "YES" in decision:
        # Here we could generate Plotly JSON payload for the frontend
        # For this prototype, we will return the clean raw data so the frontend can draw the chart
        state["visualization_code"] = json.dumps(data)
    else:
        state["visualization_code"] = None
        
    return state
