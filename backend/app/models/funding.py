from sqlalchemy import Column, Integer, String, Text, JSON, Float, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class FundingRecommendation(Base):
    __tablename__ = "funding_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, index=True)  # Allow multiple recommendations per company
    funding_purpose = Column(String(255))
    requested_amount = Column(Float)
    additional_context = Column(Text, nullable=True)
    recommendations = Column(JSON)  # Store recommendations as JSON
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "company_id": self.company_id,
            "funding_purpose": self.funding_purpose,
            "requested_amount": self.requested_amount,
            "additional_context": self.additional_context,
            "recommendations": self.recommendations,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
