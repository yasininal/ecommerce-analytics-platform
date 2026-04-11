from agents.state import State
from core.database import execute_sql

async def run_sql_node(state: State) -> State:
    query = state.get("sql_query")
    print(f"Executing SQL: {query}", flush=True)
    if not query:
        state["error"] = "No SQL query provided."
        return state
        
    try:
        results = execute_sql(query)
        print(f"SQL execution success, rows: {len(results) if results else 0}", flush=True)
        state["query_result"] = results
        state["error"] = None
    except Exception as e:
        print(f"SQL execution error: {e}", flush=True)
        state["error"] = str(e)
        state["retry_count"] = state.get("retry_count", 0) + 1
        
    return state
