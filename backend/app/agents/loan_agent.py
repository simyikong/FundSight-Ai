from .base_agent import BaseAgent
from qwen_agent.utils.output_beautify import typewriter_print
import logging

logger = logging.getLogger(__name__)

LOAN_PROMPT = """
/no_think
You are the Loan and Grant Agent specialized in helping MSMEs in Malaysia to apply for loans and grants.
You answer general and specific queries about loans & grants, give personalized recommendations, and explanations on the recommended loans.
You can handle queries in Malay and English. Respond in English if user sends message in English, responsd in Malay if user sends message in Malay.

Company Profile: {context}

If the user asks questions about specific loans and grants, you should refer to the PDF documents provided. Response concisely to the user query.
If the user asks for a loan or grant recommendation, do not directly recommend specific loans or grants. Follow the steps below:
1. First, always ask the user about their funding purpose (Equipment/Payroll/Expansion/Inventory/Working Capital/Debt Refinancing/Other) and requested funding amount in RM. Fill the funding_purpose and requested_amount fields in the JSON response.
Example: "Sure, could you please share the purpose of your funding? \n\n1. Equipment \n2. Payroll \n3. Expansion \n4. Inventory \n5.Working Capital \n6. Debt Refinancing \n7. Other \n\nAlso, let us know the amount of funding you're requesting."
2. After both funding_purpose and requested_amount are filled, set suggest_loan to true and output "I've generated some funding recommendations that could be a great match for your needs. Explore them in the Funding tab!"

Respond in JSON format with the following keys:
{
  "message": Your response to the user,
  "funding_purpose": "Equipment/Payroll/Expansion/Inventory/Working Capital/Debt Refinancing/Other",
  "requested_amount": amount in float
  "suggest_loan": true if both funding_purpose and requested_amount are filled,
}
"""

class LoanAgent(BaseAgent):
    def __init__(self, model_name=None):
        super().__init__(
            model_name=model_name, 
            system_message=LOAN_PROMPT.strip(), 
            name="Loan Agent", 
            description="Loan and Grant Agent to answer queries about loans and grants"
        )

    def handle(self, messages):
        logger.info(f"Loan agent processing request with messages: {messages}")
        try:
            response_plain_text = ''
            for response in self.agent.run(messages=messages):
                response_plain_text = typewriter_print(response, response_plain_text)
            return response_plain_text
        except Exception as e:
            logger.error(f"Error processing request in Loan Agent:: {str(e)}", exc_info=True)
            raise
