from fastapi import APIRouter, Depends, HTTPException, Body, UploadFile, File, Form
from sqlalchemy.orm import Session
import logging
from datetime import datetime
import json
import os
from ...core.database import get_db
from ...models.company import Company
from ...services.storage_service import StorageService
from ...services.company_ai_service import CompanyAIService

router = APIRouter()
logger = logging.getLogger(__name__)
storage_service = StorageService()
company_ai_service = CompanyAIService()

class CompanyResponse:
    def __init__(self, company):
        self.company_name = company.company_name
        self.website = company.website
        self.registration_number = company.registration_number
        self.company_type = company.company_type
        self.industry = company.industry
        self.location = company.location
        self.years_of_operation = company.years_of_operation
        self.registration_year = company.registration_year
        self.employees = company.employees
        self.founder_gender = company.founder_gender
        self.founder_ethnicity = company.founder_ethnicity
        self.special_category = company.special_category
        self.mission_statement = company.mission_statement
        self.description = company.description
        self.previous_grants_received = company.previous_grants_received
        self.interested_grant_types = company.interested_grant_types
        self.updated_at = company.updated_at
    
    def dict(self):
        # Handle the interested_grant_types as JSON string
        interested_grants = []
        if self.interested_grant_types:
            try:
                interested_grants = json.loads(self.interested_grant_types)
            except:
                interested_grants = []
        
        return {
            "companyName": self.company_name,
            "website": self.website,
            "registrationNumber": self.registration_number,
            "companyType": self.company_type,
            "industry": self.industry,
            "location": self.location,
            "yearsOfOperation": self.years_of_operation,
            "registrationYear": self.registration_year,
            "employees": self.employees,
            "founderGender": self.founder_gender,
            "founderEthnicity": self.founder_ethnicity,
            "specialCategory": self.special_category,
            "missionStatement": self.mission_statement,
            "description": self.description,
            "previousGrantsReceived": self.previous_grants_received,
            "interestedGrantTypes": interested_grants,
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
                website="",
                registration_number="",
                company_type="",
                industry="",
                location="",
                years_of_operation="",
                registration_year="",
                employees="",
                founder_gender="",
                founder_ethnicity="",
                special_category="",
                mission_statement="",
                description="",
                previous_grants_received="",
                interested_grant_types="[]"
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
        
        # Process interested_grant_types to store as JSON string
        interested_grant_types = profile_data.get("interestedGrantTypes", [])
        if isinstance(interested_grant_types, list):
            interested_grant_types_json = json.dumps(interested_grant_types)
        else:
            interested_grant_types_json = "[]"
        
        # If no company exists yet, create a new one
        if not company:
            company = Company(
                company_name=profile_data.get("companyName", ""),
                website=profile_data.get("website", ""),
                registration_number=profile_data.get("registrationNumber", ""),
                company_type=profile_data.get("companyType", ""),
                industry=profile_data.get("industry", ""),
                location=profile_data.get("location", ""),
                years_of_operation=profile_data.get("yearsOfOperation", ""),
                registration_year=profile_data.get("registrationYear", ""),
                employees=profile_data.get("employees", ""),
                founder_gender=profile_data.get("founderGender", ""),
                founder_ethnicity=profile_data.get("founderEthnicity", ""),
                special_category=profile_data.get("specialCategory", ""),
                mission_statement=profile_data.get("missionStatement", ""),
                description=profile_data.get("description", ""),
                previous_grants_received=profile_data.get("previousGrantsReceived", ""),
                interested_grant_types=interested_grant_types_json,
                updated_at=datetime.utcnow().isoformat()
            )
            db.add(company)
        else:
            # Update existing company
            company.company_name = profile_data.get("companyName", company.company_name)
            company.website = profile_data.get("website", company.website)
            company.registration_number = profile_data.get("registrationNumber", company.registration_number)
            company.company_type = profile_data.get("companyType", company.company_type)
            company.industry = profile_data.get("industry", company.industry)
            company.location = profile_data.get("location", company.location)
            company.years_of_operation = profile_data.get("yearsOfOperation", company.years_of_operation)
            company.registration_year = profile_data.get("registrationYear", company.registration_year)
            company.employees = profile_data.get("employees", company.employees)
            company.founder_gender = profile_data.get("founderGender", company.founder_gender)
            company.founder_ethnicity = profile_data.get("founderEthnicity", company.founder_ethnicity)
            company.special_category = profile_data.get("specialCategory", company.special_category)
            company.mission_statement = profile_data.get("missionStatement", company.mission_statement)
            company.description = profile_data.get("description", company.description)
            company.previous_grants_received = profile_data.get("previousGrantsReceived", company.previous_grants_received)
            company.interested_grant_types = interested_grant_types_json
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

@router.post("/company/upload-document")
async def upload_company_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a company document, extract information using OCR and AI,
    and return the extracted information
    """
    try:
        # Save the uploaded file
        file_path, unique_filename = storage_service.save_file(
            file.file, 
            file.filename, 
            custom_path="company_docs"
        )
        
        # Process the document with OCR
        document_text = company_ai_service.process_company_document(file_path)
        
        # Extract company information using AI
        company_info = company_ai_service.extract_company_information(document_text)
        
        # Delete the temporary file after processing
        storage_service.delete_file(file_path)
        
        return {
            "message": "Document processed successfully",
            "data": company_info
        }
    except Exception as e:
        logger.error(f"Error processing company document: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing company document: {str(e)}")
