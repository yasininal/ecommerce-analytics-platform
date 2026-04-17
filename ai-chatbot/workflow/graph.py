from langgraph.graph import StateGraph, END
from agents.state import State
from agents.guardrails_agent import guardrails_node
from agents.sql_agent import sql_node
from agents.run_sql_node import run_sql_node
from agents.analysis_agent import analysis_node
from agents.visualization_agent import visualization_node

def sql_check_router(state: State):
    """Router to check if the question was relevant according to SQL Agent."""
    if state.get("is_valid_query") is False:
        return "end_process"
    return "run_sql"

def sql_execution_router(state: State):
    """Router to route to error loop or to analysis."""
    if state.get("error") and state.get("retry_count", 0) < 3:
        return "sql_agent"
    elif state.get("error"):
        return "end_process"
        
    return "analysis_agent"

def build_workflow():
    workflow = StateGraph(State)

    workflow.add_node("sql_agent", sql_node)
    workflow.add_node("run_sql", run_sql_node)
    workflow.add_node("analysis_agent", analysis_node)

    # Entry point is now SQL Agent directly (Saves 1 request)
    workflow.set_entry_point("sql_agent")

    # Check if SQL agent found the question relevant
    workflow.add_conditional_edges(
        "sql_agent",
        sql_check_router,
        {
            "run_sql": "run_sql",
            "end_process": END
        }
    )

    # Run SQL Router
    workflow.add_conditional_edges(
        "run_sql",
        sql_execution_router,
        {
            "sql_agent": "sql_agent",
            "analysis_agent": "analysis_agent",
            "end_process": END
        }
    )

    # Analysis now directly leads to END (Saves 1 more request)
    workflow.add_edge("analysis_agent", END)

    return workflow.compile()
