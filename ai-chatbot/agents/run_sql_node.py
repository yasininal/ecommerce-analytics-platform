from agents.state import State
from core.database import execute_sql

async def run_sql_node(state: State) -> State:
    query = state.get("sql_query")
    if not query:
        state["error"] = "No SQL query provided."
        return state
        
    # SECURITY: Strictly Read-Only check and Anti-Tautology
    forbidden_keywords = ["DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "CREATE", "TRUNCATE", "GRANT", "REVOKE", "1=1", "1 = 1", "--", "/*"]
    query_upper = query.upper().strip()
    
    if not query_upper.startswith("SELECT"):
        state["error"] = "SECURITY_VIOLATION: Only SELECT queries are permitted."
        state["is_valid_query"] = False
        return state
        
    for kw in forbidden_keywords:
        if kw in query_upper:
            state["error"] = f"SECURITY_VIOLATION: Forbidden keyword '{kw}' detected."
            state["is_valid_query"] = False
            return state

    print(f"Executing SQL: {query}", flush=True)
        
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
