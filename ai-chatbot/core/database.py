import requests
from typing import Any, Dict, List
import os

def execute_sql(query: str) -> List[Dict[str, Any]]:
    """Executes a SQL query safely by sending it to the Java backend."""
    backend_url = os.getenv("BACKEND_URL", "http://backend:8080")
    endpoint = f"{backend_url}/api/internal/execute-sql"
    
    try:
        response = requests.post(
            endpoint,
            json={"query": query},
            timeout=10
        )
        
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 400:
            error_data = response.json()
            raise Exception(f"Database Error: {error_data.get('error', 'Unknown SQL error')}")
        else:
            raise Exception(f"Backend Error HTTP {response.status_code}: {response.text}")
            
    except requests.exceptions.RequestException as e:
        raise Exception(f"Communication Error with Backend: {e}")
