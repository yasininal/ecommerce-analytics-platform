from typing import TypedDict, Optional, List, Any

class State(TypedDict):
    input_question: str
    user_id: Optional[int]
    user_role: Optional[str]
    session_id: Optional[str]
    is_valid_query: Optional[bool]
    sql_query: Optional[str]
    query_result: Optional[List[dict]]
    error: Optional[str]
    retry_count: int
    analysis_text: Optional[str]
    needs_graph: Optional[bool]
    visualization_code: Optional[str] # To hold Plotly JSON or render data
    final_output: Optional[str]

