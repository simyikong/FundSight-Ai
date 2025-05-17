from sqlalchemy import Column, Integer, String, Text, JSON, Float, ForeignKey, DateTime, Boolean, func
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

class FundingFeedback(Base):
    __tablename__ = "funding_feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, index=True)
    recommendation_id = Column(Integer, ForeignKey("funding_recommendations.id"))
    recommendation_name = Column(String(255)) # Name of the funding scheme
    provider = Column(String(255))  # Name of the institution providing the grant
    is_success = Column(Boolean, default=False)  # Whether the funding was successfully secured
    feedback_type = Column(String(50))  # Type of feedback (e.g., "application_success", "application_rejected")
    feedback_notes = Column(Text, nullable=True)  # Any additional notes from the user
    created_at = Column(DateTime, server_default=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "company_id": self.company_id,
            "recommendation_id": self.recommendation_id,
            "recommendation_name": self.recommendation_name,
            "provider": self.provider,
            "is_success": self.is_success,
            "feedback_type": self.feedback_type,
            "feedback_notes": self.feedback_notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
