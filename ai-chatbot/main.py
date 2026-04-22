import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from workflow.graph import build_workflow
from dotenv import load_dotenv

load_dotenv()

import nest_asyncio
nest_asyncio.apply()

app = FastAPI(title="E-Commerce AI Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    userId: int | None = None
    role: str | None = None
    sessionId: str | None = None

class ChatResponse(BaseModel):
    answer: str
    visualization_data: str | None = None
    error: str | None = None

# Initialize Graph Workflow
graph = build_workflow()

@app.get("/")
def home():
    return {"status": "AI Chatbot Backend is running."}

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    print(f"Received message: {request.message}")
    initial_state = {
        "input_question": request.message,
        "user_id": request.userId,
        "user_role": request.role,
        "session_id": request.sessionId,
        "is_valid_query": None,
        "sql_query": None,
        "query_result": None,
        "error": None,
        "retry_count": 0,
        "analysis_text": None,
        "visualization_code": None,
        "final_output": None
    }
    
    try:
        print("Invoking graph...")
        if not os.getenv("GOOGLE_API_KEY"):
            raise HTTPException(status_code=500, detail="GOOGLE_API_KEY environment variable not set")
            
        config = {"configurable": {"thread_id": request.sessionId or "default_session"}}
        final_state = await graph.ainvoke(initial_state, config=config)
        print("Graph execution completed.")

        # Check if rejected by guardrails or max retries SQL error
        if final_state.get("is_valid_query") is False:
            return ChatResponse(answer=final_state["error"], error=final_state["error"])
            
        if final_state.get("error"):
            return ChatResponse(answer="Sorry, I could not fetch this data from the database at the moment.", error=final_state["error"])

        return ChatResponse(
            answer=final_state["final_output"],
            visualization_data=final_state["visualization_code"]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
