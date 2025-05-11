from pydantic import BaseModel
from typing import List, Optional, Union

class ContentItem(BaseModel):
    text: str
    file: Optional[str] = None  # for file URLs

class Message(BaseModel):
    role: str
    content: List[ContentItem]

class ChatRequest(BaseModel):
    message: List[Message]
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: List[dict]