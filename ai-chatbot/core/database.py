import mysql.connector
from typing import Any, Dict, List
import os
from dotenv import load_dotenv

load_dotenv()

def execute_sql(query: str) -> List[Dict[str, Any]]:
    """Executes a SQL query safely and returns results as dicts."""
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=int(os.getenv("DB_PORT", 3306)),
            database=os.getenv("DB_NAME", "ecommerce_analytics"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", "password")
        )

        cursor = connection.cursor(dictionary=True)
        cursor.execute(query)
        result = cursor.fetchall()

        cursor.close()
        connection.close()
        
        return result
    except mysql.connector.Error as err:
        raise Exception(f"Database Error: {err}")
    except Exception as e:
        raise Exception(f"Error: {e}")
