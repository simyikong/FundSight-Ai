from sqlalchemy import Column, Integer, String, Text, ARRAY
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Company(Base):
    __tablename__ = 'company'

    id = Column(Integer, primary_key=True)
    company_name = Column(String, nullable=False)
    website = Column(String, nullable=True)
    registration_number = Column(String, nullable=False)
    company_type = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    location = Column(String, nullable=True)
    years_of_operation = Column(String, nullable=True)
    registration_year = Column(String, nullable=True)
    employees = Column(String, nullable=True)
    founder_gender = Column(String, nullable=True)
    founder_ethnicity = Column(String, nullable=True)
    special_category = Column(String, nullable=True)
    mission_statement = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    previous_grants_received = Column(Text, nullable=True)
    interested_grant_types = Column(String, nullable=True)  # Store as JSON string
    updated_at = Column(String, default=datetime.utcnow().isoformat)

    def __repr__(self):
        return f"<Company(id={self.id}, name='{self.company_name}')>"
    
    def to_dict(self):
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
            "interestedGrantTypes": self.interested_grant_types,
            "updatedAt": self.updated_at
        }

# Initialize or update the database schema
def init_company_db(engine):
    Base.metadata.create_all(engine)
