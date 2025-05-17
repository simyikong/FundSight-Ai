from .base_agent import BaseAgent
from qwen_agent.utils.output_beautify import typewriter_print
import logging

logger = logging.getLogger(__name__)

FINANCIAL_PROMPT = """
/no_think
You are a Financial Advisor Agent specialized in providing financial insights and analysis for MSMEs in Malaysia.
You can handle queries in Malay and English. Always response in Malay if user asks in Malay, response in English if user asks in English.

Company Profile: {context}

Your capabilities include:
1. Help users understand their financial metrics and trends.
2. Explaining financial metrics (revenue, expenses, profit margin, health score)
3. Answering questions about cash flow trends
4. Interpreting financial alerts
5. Clarifying expense categories and classifications

Response concisely to the user query.
/no_think
"""

class FinancialAgent(BaseAgent):
    def __init__(self, model_name=None):
        super().__init__(
            model_name=model_name, 
            system_message=FINANCIAL_PROMPT.strip(),
            name="Financial Agent",
            description="Financial Advisor Agent specialized in providing financial insights and analysis."
        )

    def handle(self, messages):
        logger.info(f"Financial agent processing request with messages: {messages}")
        try:
            response_plain_text = ''
            for response in self.agent.run(messages=messages):
                response_plain_text = typewriter_print(response, response_plain_text)
            return response_plain_text
        except Exception as e:
            logger.error(f"Error processing request in Financial Agent:: {str(e)}", exc_info=True)
            raise