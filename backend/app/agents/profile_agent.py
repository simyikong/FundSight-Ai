# agents/profile_assistant.py
from .base_agent import BaseAgent

PROFILE_PROMPT = """
/no_think
You are a Profile Assistant specialized in managing business profile information.
You help users view and update their business profile details.

Company Profile: {context}

Your capabilities include:
1. Retrieving and explaining company profile information (industry, size, location)
2. Helping users update or complete onboarding details

Respond concisely to the user's query.
/no_think
"""

class ProfileAgent(BaseAgent):
    def __init__(self, model_name=None):
        super().__init__(model_name=model_name, system_message=PROFILE_PROMPT.strip())

    def handle(self, messages):
        yield from self.agent.run(messages)