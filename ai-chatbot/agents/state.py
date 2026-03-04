from typing import TypedDict, Optional, List, Any

class State(TypedDict):
    input_question: str
    is_valid_query: Optional[bool]
    sql_query: Optional[str]
    query_result: Optional[List[dict]]
    error: Optional[str]
    retry_count: int
    analysis_text: Optional[str]
    visualization_code: Optional[str] # To hold Plotly JSON or render data
    final_output: Optional[str]
