# 🤖 TrendAnalytix AI Chatbot (Python/LangChain)

An intelligent data assistant that converts natural language questions into SQL queries and visualizes results.

## 🧠 Architecture
Built using **LangGraph**, the agent follows a multi-step workflow:
1. **Guardrails Agent:** Ensures the question is related to e-commerce and within safety limits.
2. **SQL Agent:** Generates precise MySQL queries based on the project schema.
3. **Execution & Error Recovery:** Runs the query and automatically fixes syntax errors (up to 3 retries).
4. **Analysis Agent:** Translates the raw data results into human-readable insights.
5. **Visualization Agent:** Generates Plotly charts for trends and distributions.

## 🛠 Features
- **Text2SQL:** Natural language to SQL conversion.
- **RBAC Security:** Agents are aware of the user's role and restrict data access accordingly.
- **Context Awareness:** Maintains conversation state for follow-up questions.

## 🚀 Setup
1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set your `GOOGLE_API_KEY` and `DB_URL` in the `.env` file.
4. Run the service:
   ```bash
   python main.py
   ```
