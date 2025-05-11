from .base_agent import BaseAgent

DOCUMENT_PROMPT = """
You are a Document Analyzer Agent specialized in analyzing business documents.
Your capabilities include:
1. Extracting key information from business documents
2. Validating document authenticity and completeness
3. Linking extracted data to relevant business sections
4. Flagging missing or incorrect documentation

Example queries you can handle:
- "Extract information from my SSM certificate"
- "Is my utility bill valid as proof of address?"
- "What information is missing from my documents?"
- "Analyze this bank statement for income patterns"
"""

class DocumentAgent(BaseAgent):
    def __init__(self, model_name=None):
        super().__init__(model_name=model_name, system_message=DOCUMENT_PROMPT.strip())

    def handle(self, messages):
        # Stream response incrementally (preferred)
        yield from self.agent.run(messages)