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
    sql_query: str | None = None
    error: str | None = None

# Initialize Graph Workflow
graph = build_workflow()

@app.get("/")
def home():
    return {"status": "AI Chatbot Backend is running."}

from super_agent import run_super_agent

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    print(f"Received message: {request.message} from {request.userId} ({request.role})")
    
    try:
        if not os.getenv("GOOGLE_API_KEY"):
            raise HTTPException(status_code=500, detail="GOOGLE_API_KEY environment variable not set")
            
        result = await run_super_agent(
            question=request.message,
            user_id=request.userId or "GUEST",
            role=request.role or "GUEST"
        )
        
        if result.get("error") and result["error"] != "Rate Limit":
            return ChatResponse(answer=result["answer"], error=result["error"])

        return ChatResponse(
            answer=result["answer"],
            visualization_data=result.get("visualization_code"),
            sql_query=result.get("sql")
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        error_msg = str(e)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            return ChatResponse(
                answer="⚠️ **API Quota Exceeded!** Please wait about 1 minute before asking the next question.",
                error="Rate limit exceeded"
            )
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
