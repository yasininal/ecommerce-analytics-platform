from langgraph.graph import StateGraph, END
from agents.state import State
from agents.guardrails_agent import guardrails_node
from agents.sql_agent import sql_node
from agents.run_sql_node import run_sql_node
from agents.analysis_agent import analysis_node
from agents.visualization_agent import visualization_node

def valid_query_router(state: State):
    """Router to check if the guardrails passed."""
    if state.get("is_valid_query") is False:
        return "end_process"
    return "sql_agent"

def sql_execution_router(state: State):
    """Router to route to error loop or to analysis."""
    # If error and retry count < 3, go back to sql_agent
    if state.get("error") and state.get("retry_count", 0) < 3:
        return "sql_agent"
    elif state.get("error"):
        return "end_process"  # Max retries reached, fail gracefully
        
    return "analysis_agent"

def build_workflow():
    workflow = StateGraph(State)

    workflow.add_node("guardrails_agent", guardrails_node)
    workflow.add_node("sql_agent", sql_node)
    workflow.add_node("run_sql", run_sql_node)
    workflow.add_node("analysis_agent", analysis_node)
    workflow.add_node("visualization_agent", visualization_node)

    # Set as Entry Point
    workflow.set_entry_point("guardrails_agent")

    # Conditional Router after guardrails
    workflow.add_conditional_edges(
        "guardrails_agent",
        valid_query_router,
        {
            "sql_agent": "sql_agent",
            "end_process": END
        }
    )

    # SQL Agent to Run SQL
    workflow.add_edge("sql_agent", "run_sql")

    # Run SQL Router (Error handle loop or proceed to analysis)
    workflow.add_conditional_edges(
        "run_sql",
        sql_execution_router,
        {
            "sql_agent": "sql_agent",
            "analysis_agent": "analysis_agent",
            "end_process": END
        }
    )

    # Analysis to Visualization
    workflow.add_edge("analysis_agent", "visualization_agent")
    
    # Visualization to End
    workflow.add_edge("visualization_agent", END)

    return workflow.compile()
