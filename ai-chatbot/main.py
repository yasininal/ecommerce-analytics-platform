import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from workflow.graph import build_workflow
from dotenv import load_dotenv

load_dotenv()

import nest_asyncio
nest_asyncio.apply()

app = FastAPI(title="TrendAnalytix AI Chatbot API")

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
    visualization_code: str | None = None
    chart_type: str | None = None
    sql_query: str | None = None
    error: str | None = None

class SentimentRequest(BaseModel):
    text: str

class SentimentResponse(BaseModel):
    sentiment: str # POSITIVE, NEUTRAL, NEGATIVE

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

        # Hide SQL for buyers (INDIVIDUAL)
        final_sql = result.get("sql")
        if request.role == "ROLE_INDIVIDUAL":
            final_sql = None

        return ChatResponse(
            answer=result["answer"],
            visualization_code=result.get("visualization_code"),
            chart_type=result.get("chart_type"),
            sql_query=final_sql
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

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

@app.post("/api/sentiment", response_model=SentimentResponse)
async def sentiment_endpoint(request: SentimentRequest):
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0,
            max_retries=0,
            timeout=2,
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )
        
        system_prompt = "You are a sentiment analysis expert. Analyze the following e-commerce product review and return ONLY one of these words: POSITIVE, NEUTRAL, NEGATIVE. Do not provide any explanation."
        
        response = await llm.ainvoke([
            HumanMessage(content=f"{system_prompt}\n\nReview: {request.text}")
        ])
        
        sentiment = response.content.strip().upper()
        if sentiment not in ["POSITIVE", "NEUTRAL", "NEGATIVE"]:
            sentiment = "NEUTRAL"
            
        return SentimentResponse(sentiment=sentiment)
    except Exception as e:
        print(f"Sentiment Analysis Error: {e}")
        return SentimentResponse(sentiment="ERROR")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
