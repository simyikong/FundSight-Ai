# agents/router_agent.py
from .base_agent import BaseAgent

ROUTER_PROMPT = """
You are a smart assistant that routes queries to the right agent.
Understand the user's intent and decide which agent should respond.

Available Agents:
- ProfileAgent: For business details, documents, eligibility
- FinancialAgent: For cash flow, expenses, health score
- BudgetAgent: For budgeting and forecasting
- LoanAgent: For financing options and applications
- DocumentAgent: For document analysis and validation
- ChatAgent: For general conversation and queries

Only return the name of the agent without any extra text.
"""

class RouterAgent(BaseAgent):
    def __init__(self, model_name=None):
        super().__init__(model_name=model_name, system_message=ROUTER_PROMPT.strip())

    def route(self, messages):
        response = list(self.agent.run(messages))
        return ''.join([r.get('content', '') for r in response]).strip()
    
    def handle(self, messages):
        yield from self.agent.run(messages)