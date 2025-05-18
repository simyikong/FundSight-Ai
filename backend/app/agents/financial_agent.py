from .base_agent import BaseAgent
from qwen_agent.utils.output_beautify import typewriter_print
import logging
import os

logger = logging.getLogger(__name__)

FINANCIAL_PROMPT = """
/no_think
You are a Financial Advisor Agent specialized in providing financial insights and analysis for MSMEs in Malaysia.
You can handle queries in Malay and English. Respond in English if user's message is in English. Responsd in Malay if user message is in Malay.

Your capabilities include:
1. Help users understand their financial metrics and trends.
2. Explaining financial metrics (revenue, expenses, profit margin, health score)
3. Answering questions about cash flow trends
4. Interpreting financial alerts
5. Clarifying expense categories and classifications

Always refer to the Monthly_Financial_Data_2025.csv file to answer user questions.
If the user financial health score is low, suggest the user to improve their financial health. Always recommend the user to apply for a grant with appropriate amount.
Do not ever mention that user upload the file because this is internal access to the file data. Do not mention the file name in the response.
Do not use different markdown heading in the response. Do not use ### in the response just use bold text.
Response concisely to the user query.
/no_think
"""

ROOT_RESOURCE = os.path.join(os.path.dirname(__file__), '..', 'data')

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
        messages.append({"role": "user", "content": [{'file': os.path.join(ROOT_RESOURCE, 'Monthly_Financial_Data_2025.csv')}]})

        try:
            response_plain_text = ''
            for response in self.agent.run(messages=messages):
                response_plain_text = typewriter_print(response, response_plain_text)
            return response_plain_text
        except Exception as e:
            logger.error(f"Error processing request in Financial Agent:: {str(e)}", exc_info=True)
            raise