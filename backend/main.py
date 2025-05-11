from fastapi import FastAPI 
from app.api.v1 import chat

app = FastAPI() 
 
# Include all routers
app.include_router(chat.router, prefix="/api/v1", tags=["chat"])

@app.get("/") 
def read_root(): 
    return {"message": "Hello from FundSight AI FastAPI backend!"} 
