from pydantic import BaseModel
from typing import List, Optional, Union, Dict, Any

class Message(BaseModel):
    role: str
    content: Union[str, List[Dict[str, Any]]]

class ChatRequest(BaseModel):
    query: str
    image: Optional[str] = None
    file: Optional[str] = None
    message_history: Optional[List[Message]] = None

class ChatResponse(BaseModel):
    response: Union[str, dict]
    message_history: List[Message]