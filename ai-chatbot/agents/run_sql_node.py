from agents.state import State
from core.database import execute_sql

def run_sql_node(state: State) -> State:
    query = state.get("sql_query")
    if not query:
        state["error"] = "No SQL query provided."
        return state
        
    try:
        results = execute_sql(query)
        state["query_result"] = results
        state["error"] = None
    except Exception as e:
        state["error"] = str(e)
        state["retry_count"] = state.get("retry_count", 0) + 1
        
    return state
