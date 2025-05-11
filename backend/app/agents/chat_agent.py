from .base_agent import BaseAgent

CHAT_PROMPT = """
You are a general-purpose business assistant that can help with various queries.
You can handle general questions and route specific queries to specialized agents.
You should provide helpful, clear, and concise responses while maintaining a professional tone.
"""

class ChatAgent(BaseAgent):
    def __init__(self, model_name=None):
        super().__init__(model_name=model_name, system_message=CHAT_PROMPT.strip())

    def handle(self, messages):
        # Return the generator directly for streaming capability
        yield from self.agent.run(messages)