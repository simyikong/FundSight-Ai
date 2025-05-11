from pydantic import BaseModel
from typing import List, Optional, Union

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    response: Union[str, dict]