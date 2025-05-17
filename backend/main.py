from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import chat, document, metrics, admin, dashboard, company, funding
from app.models.document import init_db
from app.core.database import engine
from app.models.document import Base as DocumentBase
from app.models.company import Base as CompanyBase, init_company_db
from app.models.funding import Base as FundingBase

app = FastAPI() 

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app's address
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
DocumentBase.metadata.create_all(bind=engine)
CompanyBase.metadata.create_all(bind=engine)
FundingBase.metadata.create_all(bind=engine)

# Include all routers
app.include_router(chat.router, prefix="/api/v1", tags=["chat"])
app.include_router(document.router, prefix="/api/v1", tags=["document"])
app.include_router(metrics.router, prefix="/api/v1", tags=["metrics"])
app.include_router(admin.router, prefix="/api/v1", tags=["admin"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(company.router, prefix="/api/v1", tags=["company"])
app.include_router(funding.router, prefix="/api/v1", tags=["funding"])

@app.get("/") 
def read_root(): 
    return {"message": "Hello from FundSight AI FastAPI backend!"} 
