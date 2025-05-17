from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Company(Base):
    __tablename__ = 'company'

    id = Column(Integer, primary_key=True)
    company_name = Column(String, nullable=False)
    registration_number = Column(String, nullable=False)
    company_type = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    location = Column(String, nullable=True)
    years_of_operation = Column(String, nullable=True)
    employees = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    updated_at = Column(String, default=datetime.utcnow().isoformat)

    def __repr__(self):
        return f"<Company(id={self.id}, name='{self.company_name}')>"
    
    def to_dict(self):
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

# Initialize or update the database schema
def init_company_db(engine):
    Base.metadata.create_all(engine)
