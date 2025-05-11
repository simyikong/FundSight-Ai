from fastapi import FastAPI 
 
app = FastAPI() 
 
@app.get("/") 
def read_root(): 
    return {"message": "Hello from FundSight Ai FastAPI backend!"} 
