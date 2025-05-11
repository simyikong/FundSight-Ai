import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    LLM_MODEL_NAME = "Qwen3-8B" # when using ollama
    LLM_MODEL_SERVER = "http://localhost:11434/" # when using ollama
    # LLM_MODEL_NAME = "qwen-plus" # when using alibaba cloud
    # LLM_MODEL_SERVER - "dashscope" # when using alibaba cloud
    DASHSCOPE_API_KEY = "EMPTY"
    
         