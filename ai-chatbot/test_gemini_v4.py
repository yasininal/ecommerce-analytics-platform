import os
import asyncio
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

async def test_prefix():
    key = os.getenv("GOOGLE_API_KEY")
    models = ["models/gemini-1.5-flash", "models/gemini-pro"]
    for m in models:
        print(f"Testing {m}...")
        try:
            llm = ChatGoogleGenerativeAI(model=m, google_api_key=key)
            res = await llm.ainvoke("Hi")
            print(f"Success with {m}!")
            return
        except Exception as e:
            print(f"Failed {m}: {e}")

if __name__ == "__main__":
    asyncio.run(test_prefix())
