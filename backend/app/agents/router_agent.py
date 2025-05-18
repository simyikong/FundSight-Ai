from .base_agent import BaseAgent
from qwen_agent.utils.output_beautify import typewriter_print
import logging

logger = logging.getLogger(__name__)

ROUTER_PROMPT = """
/no_think
You are a smart assistant that routes queries to the right agent.
Understand the user's intent and decide which agent should respond.

Available Agents:
- ProfileAgent: For business details, documents, eligibility
- FinancialAgent: For cash flow, expenses, financial health score, financial insights, forecasting trends
- BudgetAgent: For budgeting and forecasting
- LoanAgent: For financing options and applications
- DocumentAgent: For document analysis and validation
- ChatAgent: For general conversation and queries
- MCPAgent: For MCP related queries (user want to manipulate database)
- InsightAgent: Only use this when user wants to generate charts or graphs

Only return the name of the agent without any extra text.
"""

class RouterAgent(BaseAgent):
    def __init__(self, model_name=None):
        super().__init__(model_name=model_name, system_message=ROUTER_PROMPT.strip())

    def handle(self, messages):
        logger.info(f"Routing query based on user messages: {messages}")
        try:
            response = list(self.agent.run(messages))
            if response and isinstance(response[-1], list) and response[-1]:
                last_message = response[-1][-1]  
                result = last_message.get('content', '').strip()
            logger.info(f"Router result: {result}")
            return result
        except Exception as e:
            logger.error(f"Error during routing: {str(e)}", exc_info=True)
            raise
    