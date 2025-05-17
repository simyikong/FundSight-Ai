from .base_agent import BaseAgent
from qwen_agent.utils.output_beautify import typewriter_print
import logging

logger = logging.getLogger(__name__)

DOCUMENT_PROMPT = """
/no_think
You are a Document Analyzer Agent specialized in analyzing business documents
You help users analyze uploaded documents like PDFs, images, CSVs.
You can handle queries in Malay and English. Respond in English if user sends message in English, responsd in Malay if user sends message in Malay.

Your capabilities include:
1. Extracting key information from business documents
2. Answer to user questions about the documents conciselyu using RAG.
2. Validating document authenticity and completeness
3. Linking extracted data to relevant business sections
4. Flagging missing or incorrect documentation
/no_think
"""

class DocumentAgent(BaseAgent):
    def __init__(self, model_name=None):
        super().__init__(
            model_name=model_name,  #qwen-plus-latest
            system_message=DOCUMENT_PROMPT.strip(),
            name="Document Agent",
            description="Analyze uploaded documents"
        )

    def handle(self, messages):
        logger.info(f"Document agent processing request with messages: {messages}")
        # messages.append({"role": "user", "content": [{'text':'what is page 9 about in the document?'},{'file': 'https://www.smecorp.gov.my/images/pdf/SMEFINANCING.pdf'}]})
        try:
            response_plain_text = ''
            for response in self.agent.run(messages=messages):
                response_plain_text = typewriter_print(response, response_plain_text)
            return response_plain_text
        except Exception as e:
            logger.error(f"Error processing request in Document Agent:: {str(e)}", exc_info=True)
            raise