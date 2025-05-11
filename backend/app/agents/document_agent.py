from .base_agent import BaseAgent
from qwen_agent.utils.output_beautify import typewriter_print
import logging

logger = logging.getLogger(__name__)

DOCUMENT_PROMPT = """
/no_think
You are a Document Analyzer Agent specialized in analyzing business documents.
You help users analyze uploaded documents like PDFs, images, CSVs.

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
        super().__init__(
            model_name=model_name, 
            system_message=DOCUMENT_PROMPT.strip(),
            name="Document Agent",
            description="Analyze uploaded documents"
        )

    def handle(self, messages):
        logger.info(f"Document agent processing request with messages: {messages}")
        try:
            response_plain_text = ''
            for response in self.agent.run(messages=messages):
                response_plain_text = typewriter_print(response, response_plain_text)
            return response_plain_text
        except Exception as e:
            logger.error(f"Error processing request in Document Agent:: {str(e)}", exc_info=True)
            raise