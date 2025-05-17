from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
from app.core.database import get_db
from app.services.funding import (
    generate_funding_recommendations, 
    get_funding_recommendations, 
    get_recommendation_history,
    save_funding_feedback
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class FundingRecommendationRequest(BaseModel):
    company_id: int
    funding_purpose: str
    requested_amount: float
    additional_context: Optional[str] = None

class RecommendationHistoryResponse(BaseModel):
    id: int
    funding_purpose: str
    requested_amount: float
    additional_context: Optional[str] = None
    created_at: str
    recommendations: Optional[list] = None

class FundingFeedbackRequest(BaseModel):
    company_id: int
    recommendation_id: int
    recommendation_name: str
    provider: str
    is_success: bool = True
    feedback_type: str = "application_success"
    feedback_notes: Optional[str] = None

@router.post("/funding/recommendations", status_code=status.HTTP_201_CREATED)
async def create_funding_recommendations(
    request: FundingRecommendationRequest,
    db: Session = Depends(get_db)
):
    """
    Generate and store funding recommendations for a company
    """
    try:
        recommendations = await generate_funding_recommendations(
            db=db,
            company_id=request.company_id,
            funding_purpose=request.funding_purpose,
            requested_amount=request.requested_amount,
            additional_context=request.additional_context
        )
        
        if not recommendations:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Company with ID {request.company_id} not found"
            )
        
        return recommendations
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating funding recommendations: {str(e)}"
        )

@router.get("/funding/recommendations/{company_id}")
async def get_company_funding_recommendations(
    company_id: int,
    db: Session = Depends(get_db)
):
    """
    Get existing funding recommendations for a company
    """
    try:
        recommendations = await get_funding_recommendations(db=db, company_id=company_id)
        
        if not recommendations:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No funding recommendations found for company ID {company_id}"
            )
        
        return recommendations
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving funding recommendations: {str(e)}"
        )

@router.get("/funding/history/{company_id}", response_model=List[RecommendationHistoryResponse])
async def get_company_recommendation_history(
    company_id: int,
    db: Session = Depends(get_db)
):
    """
    Get funding recommendation history for a company
    """
    try:
        history = await get_recommendation_history(db=db, company_id=company_id)
        return history
        
    except Exception as e:
        logger.error(f"Error retrieving recommendation history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving recommendation history: {str(e)}"
        )

@router.post("/funding/feedback", status_code=status.HTTP_201_CREATED)
async def submit_funding_feedback(
    request: FundingFeedbackRequest,
    db: Session = Depends(get_db)
):
    """
    Submit feedback on funding recommendations for reinforcement learning
    
    This endpoint allows users to indicate when they've successfully 
    secured funding through a recommended grant/loan
    """
    try:
        feedback = await save_funding_feedback(
            db=db,
            company_id=request.company_id,
            recommendation_id=request.recommendation_id,
            recommendation_name=request.recommendation_name,
            provider=request.provider,
            is_success=request.is_success,
            feedback_type=request.feedback_type,
            feedback_notes=request.feedback_notes
        )
        
        return {
            "message": "Feedback submitted successfully",
            "feedback": feedback
        }
        
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error submitting funding feedback: {str(e)}"
        )
