import asyncio
import os
from workflow.graph import build_workflow
from dotenv import load_dotenv

load_dotenv()

async def main():
    graph = build_workflow()
    
    # Test Greeting
    print("TEST 1: Greeting")
    res1 = await graph.ainvoke({"input_question": "hello there!", "retry_count": 0})
    print(res1.get("final_output"))
    print("-" * 50)
    
    # Test Out of Scope
    print("TEST 2: Out of Scope")
    res2 = await graph.ainvoke({"input_question": "can you tell me a joke?", "retry_count": 0})
    print(res2.get("final_output"))
    print("-" * 50)
    
    # Test In Scope (Will fail DB connection, triggering Error Agent)
    print("TEST 3: Valid Query (No DB)")
    res3 = await graph.ainvoke({"input_question": "show me total revenue by month", "retry_count": 0})
    print("SQL Generated:", res3.get("sql_query"))
    print("Final State:", res3.get("error"))
    print("Retries:", res3.get("retry_count"))
    
if __name__ == "__main__":
    asyncio.run(main())
