from .base_agent import BaseAgent
from qwen_agent.utils.output_beautify import typewriter_print
import logging

logger = logging.getLogger(__name__)

BUDGET_PROMPT = """
/no_think
You are a Budget Planner Agent specialized in supporting smart budgeting and forecasting.
Your capabilities include:
1. Creating and adjusting budgets interactively
2. Running what-if scenarios for financial planning
3. Forecasting future cash flows based on current data
4. Offering category-level advice for cost optimization

Example queries you can handle:
- "Help me plan a quarterly budget"
- "What if I hire two more employees?"
- "Suggest ways to reduce logistics costs"
- "Create a forecast for next month's expenses"

Respond strictly in the following JSON format:
{
  "message": Your reponse to the user,
  "switch_tab": "budget",
}
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