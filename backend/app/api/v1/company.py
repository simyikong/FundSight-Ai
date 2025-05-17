from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
import logging
from datetime import datetime
from ...core.database import get_db
from ...models.company import Company

router = APIRouter()
logger = logging.getLogger(__name__)

class CompanyResponse:
    def __init__(self, company):
        self.company_name = company.company_name
        self.registration_number = company.registration_number
        self.company_type = company.company_type
        self.industry = company.industry
        self.location = company.location
        self.years_of_operation = company.years_of_operation
        self.employees = company.employees
        self.description = company.description
        self.updated_at = company.updated_at
    
    def dict(self):
        return {
            "companyName": self.company_name,
            "registrationNumber": self.registration_number,
            "companyType": self.company_type,
            "industry": self.industry,
            "location": self.location,
            "yearsOfOperation": self.years_of_operation,
            "employees": self.employees,
            "description": self.description,
            "updatedAt": self.updated_at
        }

@router.get("/company")
async def get_company_profile(db: Session = Depends(get_db)):
    """
    Get the company profile data
    """
    try:
        # Get the first company record (we only have one company)
        company = db.query(Company).first()
        
        # If no company exists yet, create a default one
        if not company:
            company = Company(
                company_name="",
                registration_number="",
                company_type="",
                industry="",
                location="",
                years_of_operation="",
                employees="",
                description=""
            )
            db.add(company)
            db.commit()
            db.refresh(company)
        
        return CompanyResponse(company).dict()
    except Exception as e:
        logger.error(f"Error fetching company profile: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching company profile: {str(e)}")

@router.get("/company/status")
async def check_company_profile_status(db: Session = Depends(get_db)):
    """
    Check if the company profile is complete
    """
    try:
        # Get the first company record
        company = db.query(Company).first()
        
        # If no company exists, return false
        if not company:
            return {"isComplete": False}
        
        # Check if required fields are filled
        required_fields = [
            company.company_name,
            company.registration_number,
            company.company_type,
            company.industry
        ]
        
        is_complete = all(field and field.strip() != "" for field in required_fields)
        
        return {
            "isComplete": is_complete,
            "missingFields": [] if is_complete else [
                field for field, value in {
                    "companyName": company.company_name,
                    "registrationNumber": company.registration_number,
                    "companyType": company.company_type,
                    "industry": company.industry
                }.items() if not value or value.strip() == ""
            ]
        }
    except Exception as e:
        logger.error(f"Error checking company profile status: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error checking company profile status: {str(e)}")

@router.post("/company/update")
async def update_company_profile(
    profile_data: dict = Body(...),
    db: Session = Depends(get_db)
):
    """
    Update the company profile data
    """
    try:
        # Get the first company record
        company = db.query(Company).first()
        
        # If no company exists yet, create a new one
        if not company:
            company = Company(
                company_name=profile_data.get("companyName", ""),
                registration_number=profile_data.get("registrationNumber", ""),
                company_type=profile_data.get("companyType", ""),
                industry=profile_data.get("industry", ""),
                location=profile_data.get("location", ""),
                years_of_operation=profile_data.get("yearsOfOperation", ""),
                employees=profile_data.get("employees", ""),
                description=profile_data.get("description", ""),
                updated_at=datetime.utcnow().isoformat()
            )
            db.add(company)
        else:
            # Update existing company
            company.company_name = profile_data.get("companyName", company.company_name)
            company.registration_number = profile_data.get("registrationNumber", company.registration_number)
            company.company_type = profile_data.get("companyType", company.company_type)
            company.industry = profile_data.get("industry", company.industry)
            company.location = profile_data.get("location", company.location)
            company.years_of_operation = profile_data.get("yearsOfOperation", company.years_of_operation)
            company.employees = profile_data.get("employees", company.employees)
            company.description = profile_data.get("description", company.description)
            company.updated_at = datetime.utcnow().isoformat()
        
        db.commit()
        db.refresh(company)
        
        return {
            "message": "Company profile updated successfully",
            "data": CompanyResponse(company).dict()
        }
    except Exception as e:
        logger.error(f"Error updating company profile: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error updating company profile: {str(e)}")
