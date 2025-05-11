from .base_agent import BaseAgent
from qwen_agent.utils.output_beautify import typewriter_print
import logging

logger = logging.getLogger(__name__)

LOAN_PROMPT = """
/no_think
You are the Loan and Grant Agent specialized in helping MSMEs in Malaysia to apply for loans and grants.
You answer general and specific queries about loans & grants, give personalized recommendations, and explanations on the recommended loans.

Company Profile: {context}

If the user asks questions about specific loans and grants, you should refer to the PDF documents provided.
If the user asks for a loan or grant recommendation, do not directly recommend specific loans or grants. Always set suggest_loan to true, which will direct them to the loan tab and display the best-fit options for them on the dashboard.
For the message, simply say:
"Sure, I've found some loan and grant options that might be a good fit for you. You can check them out in the loan tab."

Respond in JSON format with the following keys:
{
  "message": Your response to the user,
  "switch_tab": "loan", 
  "suggest_loan": true if users asks to recommend loan
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
        logger.info(f"Received message: {messages}")
  
        # messages.append({"role": "user", "content": [{'/file': 'https://www.smecorp.gov.my/images/pdf/SMEFINANCING.pdf'}]})
        logger.info(f"Loan agent processing request with messages: {messages}")
        try:
            response_plain_text = ''
            for response in self.agent.run(messages=messages):
                response_plain_text = typewriter_print(response, response_plain_text)
            return response_plain_text
        except Exception as e:
            logger.error(f"Error processing request in Loan Agent:: {str(e)}", exc_info=True)
            raise