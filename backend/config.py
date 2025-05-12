import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # when using ollama
    LLM_MODEL_NAME = "qwen3:8b" 
    LLM_MODEL_SERVER = "http://127.0.0.1:11434/v1" 
    DASHSCOPE_API_KEY = "EMPTY" 
    
    # when using alibaba cloud
    # LLM_MODEL_NAME = "qwen-plus" 
    # LLM_MODEL_SERVER - "dashscope" 
    # DASHSCOPE_API_KEY = os.getenv("DASHSCOPE_API_KEY","") 
    
         