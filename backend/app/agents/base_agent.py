# agents/base_agent.py
from abc import ABC, abstractmethod
from qwen_agent.agents import Assistant
from config import Config

class BaseAgent(ABC):
    def __init__(self, model_name=None, system_message=None, name=None, description=None, tools=None):
        """
        :param model_name: 'qwen3' (local via Ollama), 'qwen-plus' (cloud), etc.
        :param system_message: System prompt for agent
        """
        # if model_name is None:
        #     model_name = Config.LLM_MODEL_NAME
            
        # llm_cfg = {
        #     'model': model_name,
        #     'model_server': Config.LLM_MODEL_SERVER,
        #     'api_key': Config.DASHSCOPE_API_KEY
        # }
        
        llm_cfg = {
            'model': "qwen3:8b",
            'model_server': "http://127.0.0.1:11434/v1",
            'api_key': "EMPTY"
        }
    
        self.system_message = system_message
        self.agent = Assistant(
            llm=llm_cfg, 
            function_list=tools,
            system_message=system_message, 
            name=name, 
            description=description)

    @abstractmethod
    def handle(self, messages):
        """
        Abstract method to process user input and generate response.
        :param messages: List of message dicts (role/content)
        :return: Generator of response chunks
        """
        pass