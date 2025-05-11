from .base_agent import BaseAgent
from qwen_agent.utils.output_beautify import typewriter_print
import logging

logger = logging.getLogger(__name__)

CHAT_PROMPT = """
/no_think
You are the Chat Agent to assist MSMEs in Malaysia in given advice and answer financial queries.
You handle general-purpose financial queries, financial terms, news, etc.
You should provide helpful, clear, and concise responses while maintaining a professional tone.
"""

class ChatAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            system_message=CHAT_PROMPT.strip(), 
            name="ChatAgent", 
            description="General Purpose Chat Agent"
        )

    def handle(self, messages):
        logger.info(f"Processing chat request with messages: {messages}")
        try:
            response_plain_text = ''
            for response in self.agent.run(messages=messages):
                response_plain_text = typewriter_print(response, response_plain_text)
            return response_plain_text
        except Exception as e:
            logger.error(f"Error processing chat request: {str(e)}", exc_info=True)
            raise