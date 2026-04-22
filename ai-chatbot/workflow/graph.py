from langgraph.graph import StateGraph, END
from agents.state import State
from agents.guardrails_agent import guardrails_node
from agents.sql_agent import sql_node
from agents.run_sql_node import run_sql_node
from agents.analysis_agent import analysis_node
from agents.visualization_agent import visualization_node
from agents.error_agent import error_node

def guardrails_router(state: State):
    """Router to check if the question passed guardrails."""
    if state.get("is_valid_query") is False:
        return "end_process"
    return "sql_agent"

def sql_execution_router(state: State):
    """Router to route to error loop or to analysis."""
    if state.get("error") and state.get("retry_count", 0) < 3:
        return "error_agent"
    elif state.get("error"):
        return "end_process"
        
    return "analysis_agent"

def analysis_router(state: State):
    """Router to check if visualization is needed."""
    if state.get("needs_graph"):
        return "visualization_agent"
    return "end_process"

from langgraph.checkpoint.memory import MemorySaver

def build_workflow():
    workflow = StateGraph(State)

    # Add all nodes
    workflow.add_node("guardrails_agent", guardrails_node)
    workflow.add_node("sql_agent", sql_node)
    workflow.add_node("run_sql", run_sql_node)
    workflow.add_node("error_agent", error_node)
    workflow.add_node("analysis_agent", analysis_node)
    workflow.add_node("visualization_agent", visualization_node)

    # Flow starts at guardrails
    workflow.set_entry_point("guardrails_agent")

    # Guardrails checks
    workflow.add_conditional_edges(
        "guardrails_agent",
        guardrails_router,
        {
            "sql_agent": "sql_agent",
            "end_process": END
        }
    )

    # SQL generation to execution
    workflow.add_edge("sql_agent", "run_sql")

    # Run SQL to Error check or Analysis
    workflow.add_conditional_edges(
        "run_sql",
        sql_execution_router,
        {
            "error_agent": "error_agent",
            "analysis_agent": "analysis_agent",
            "end_process": END
        }
    )

    # Error recovery loops back to run_sql
    workflow.add_edge("error_agent", "run_sql")

    # Analysis to Visualization check
    workflow.add_conditional_edges(
        "analysis_agent",
        analysis_router,
        {
            "visualization_agent": "visualization_agent",
            "end_process": END
        }
    )

    # Visualization ends
    workflow.add_edge("visualization_agent", END)

    memory = MemorySaver()
    return workflow.compile(checkpointer=memory)
