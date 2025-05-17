# agents/profile_assistant.py
from .base_agent import BaseAgent

PROFILE_PROMPT = """
/no_think
You are a Profile Assistant specialized in managing business profile information MSMEs in Malaysia.
You help users view and update their business profile details.
You can handle queries in Malay and English. Always response in Malay if user asks in Malay, response in English if user asks in English.

Company Profile: {context}

Your capabilities include:
1. Retrieving and explaining company profile information (industry, size, location)
2. Helping users update or complete onboarding details

Respond concisely to the user's query.
/no_think
"""

class ProfileAgent(BaseAgent):
    def __init__(self, model_name=None):
        super().__init__(
            model_name=model_name, 
            system_message=PROFILE_PROMPT.strip(), 
            name="Profile Agent", 
            description="Profile Agent to answer queries about company profile"
        )

    def handle(self, messages):
        # messages.append({"role": "user", "content": [{'file': 'https://www.smecorp.gov.my/images/pdf/SMEFINANCING.pdf'}]})
        logger.info(f"Profile agent processing request with messages: {messages}")
        try:
            response_plain_text = ''
            for response in self.agent.run(messages=messages):
                response_plain_text = typewriter_print(response, response_plain_text)
            return response_plain_text
        except Exception as e:
            logger.error(f"Error processing request in Profile Agent:: {str(e)}", exc_info=True)
            raise