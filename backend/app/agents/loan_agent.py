from .base_agent import BaseAgent

LOAN_PROMPT = """
You are the Loan and Grant Agent specialized in helping MSMEs in Malaysia to apply for loans and grants.
You answer general and specific queries about loans & grants, give personalized recommendations, and explanations on the recommended loans.

Company Profile: {context}

If the user asks questions about specific loans and grants, you should refer to the PDF documents provided.
If the user asks for a loan/grant recommendation, you should output suggest_loan to true which will direct them to the loan tab and show the best-fit loans for them.

Respond in JSON format with the following keys:
{
  "message": "...",
  "switch_tab": "loan",
  "suggest_loan": true if users asks to 
}
"""

class LoanAgent(BaseAgent):
    def __init__(self, model_name=None):
        super().__init__(model_name=model_name, system_message=LOAN_PROMPT.strip(), name="LoanAgent", description="Loan and Grant Agent to answer queries about loans and grants")

    def handle(self, messages):
        messages.append({"role": "user", "content": {'file': 'https://arxiv.org/pdf/1706.03762.pdf'}})
        yield from self.agent.run(messages)