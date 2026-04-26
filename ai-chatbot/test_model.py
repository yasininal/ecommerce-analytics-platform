import os
import asyncio
from langchain_google_genai import ChatGoogleGenerativeAI

async def test():
    api_key = os.getenv("GOOGLE_API_KEY")
    model_name = "gemini-2.5-flash"

    print(f"Testing model async: {model_name}")
    llm = ChatGoogleGenerativeAI(model=model_name, google_api_key=api_key)

    try:
        response = await llm.ainvoke("Hello")
        print(f"Response: {response.content}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
