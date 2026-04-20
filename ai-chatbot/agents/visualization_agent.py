import json
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import JsonOutputParser
from agents.state import State
import os

prompt = PromptTemplate.from_template(
    """You are a Data Visualization Specialist for an E-commerce platform.
    Your task is to create a Plotly JSON configuration (data and layout) based on the database results.
    
    User Question: {question}
    Database Result: {data}
    
    Return ONLY a valid JSON object representing Plotly configuration. It MUST have "data" (array) and "layout" (object) keys.
    Make sure the chart type is appropriate (bar, pie, line) based on the question.
    
    Format:
    {{
      "data": [{{ "x": [...], "y": [...], "type": "bar" }}],
      "layout": {{ "title": "Chart Title" }}
    }}
    """
)

def build_viz_chain():
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0, google_api_key=os.getenv("GOOGLE_API_KEY"))
    return prompt | llm | JsonOutputParser()

async def visualization_node(state: State) -> State:
    data = state.get("query_result", [])
    
    if not data or not state.get("needs_graph"):
        return state
        
    chain = build_viz_chain()
    try:
        res = await chain.ainvoke({
            "question": state["input_question"],
            "data": str(data[:50])
        })
        state["visualization_code"] = json.dumps(res)
    except Exception as e:
        state["visualization_code"] = None
        
    return state
