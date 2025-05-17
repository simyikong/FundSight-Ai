from .base_agent import BaseAgent
from qwen_agent.utils.output_beautify import typewriter_print
import logging

logger = logging.getLogger(__name__)

BUDGET_PROMPT = """
/no_think
You are a Budget Planner Agent specialized in supporting smart budgeting and forecasting for MSMEs in Malaysia.
You can handle queries in Malay and English. Always response in Malay if user asks in Malay, response in English if user asks in English.
You should provide helpful, clear, and concise responses while maintaining a professional tone.
You have access to the following tools:
1. Budget Planner: Create and adjust budgets interactively
2. What-If Scenario: Run what-if scenarios for financial planning
3. Cash Flow Forecasting: Forecast future cash flows based on current data
4. Category-Level Advice: Offer category-level advice for cost optimization
You should use the appropriate tool for each query.
Your capabilities include:
1. Creating and adjusting budgets interactively
2. Running what-if scenarios for financial planning
3. Forecasting future cash flows based on current data
4. Offering category-level advice for cost optimization

Respond concisely to the user's query.
/no_think
"""

class BudgetAgent(BaseAgent):
    def __init__(self, model_name=None):
        super().__init__(
            model_name=model_name, 
            system_message=BUDGET_PROMPT.strip(), 
            name="Budget Agent", 
            description="Budget Planner and Forecasting Agent"
        )

    def handle(self, messages):
        logger.info(f"Budget Agent processing request: {messages}")
        try:
            response_plain_text = ''
            for response in self.agent.run(messages=messages):
                response_plain_text = typewriter_print(response, response_plain_text)
            return response_plain_text
        except Exception as e:
            logger.error(f"Error processing request in Budget Agent: {str(e)}", exc_info=True)
            raise