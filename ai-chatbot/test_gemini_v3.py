import os
import asyncio
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

async def test_known_models():
    key = os.getenv("GOOGLE_API_KEY")
    # Try the most likely valid names
    models = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest",
        "gemini-pro"
    ]
    
    for model_name in models:
        print(f"Testing {model_name}...")
        try:
            llm = ChatGoogleGenerativeAI(model=model_name, google_api_key=key)
            res = await llm.ainvoke("Say 'Success'")
            print(f"!!! SUCCESS with {model_name} !!! -> {res.content}")
            return
        except Exception as e:
            print(f"Failed {model_name}: {e}")

if __name__ == "__main__":
    asyncio.run(test_known_models())
