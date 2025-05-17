from sqlalchemy.orm import Session
from app.models.funding import FundingRecommendation, FundingFeedback
from app.models.company import Company
from app.agents.funding_recommendation_agent import FundingRecommendationAgent
import logging

logger = logging.getLogger(__name__)

async def generate_funding_recommendations(
    db: Session,
    company_id: int,
    funding_purpose: str,
    requested_amount: float,
    additional_context: str = None
):
    """
    Generate and store funding recommendations for a company
    """
    try:
        # Fetch company data
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            logger.error(f"Company with ID {company_id} not found")
            return None
        
        # Prepare company data for the agent
        company_data = {
            "name": company.company_name,
            "industry": company.industry,
            "years_in_operation": company.years_of_operation,
            "num_employees": company.employees,
            "is_bumiputera": "Yes" if company.founder_ethnicity == "Bumiputera" else "No"
        }
        
        # Prepare user message for funding request
        user_message = {
            "role": "user",
            "content": f"I need funding recommendations for my company. Purpose: {funding_purpose}. Amount: RM{requested_amount}."
        }
        
        # Add additional context if provided
        if additional_context:
            user_message["content"] += f" Additional context: {additional_context}"
        
        # Initialize agent and generate recommendations
        agent = FundingRecommendationAgent()
        recommendations = agent.handle(
            messages=[user_message],
            company_data=company_data,
            financial_data=True  # We'll use the Monthly_Financial_Data_2025.csv
        )
        
        # Always create a new recommendation entry
        new_rec = FundingRecommendation(
            company_id=company_id,
            funding_purpose=funding_purpose,
            requested_amount=requested_amount,
            additional_context=additional_context,
            recommendations=recommendations
        )
        db.add(new_rec)
        db.commit()
        db.refresh(new_rec)
        return new_rec.to_dict()
            
    except Exception as e:
        logger.error(f"Error generating funding recommendations: {e}")
        db.rollback()
        raise

async def get_funding_recommendations(db: Session, company_id: int):
    """
    Retrieve latest funding recommendation for a company
    """
    try:
        recommendation = db.query(FundingRecommendation).filter(
            FundingRecommendation.company_id == company_id
        ).order_by(FundingRecommendation.created_at.desc()).first()
        
        if not recommendation:
            logger.info(f"No funding recommendations found for company ID {company_id}")
            return None
            
        return recommendation.to_dict()
        
    except Exception as e:
        logger.error(f"Error retrieving funding recommendations: {e}")
        raise

async def get_recommendation_history(db: Session, company_id: int):
    """
    Retrieve all funding recommendations for a company
    """
    try:
        recommendations = db.query(FundingRecommendation).filter(
            FundingRecommendation.company_id == company_id
        ).order_by(FundingRecommendation.created_at.desc()).all()
        
        if not recommendations:
            logger.info(f"No funding recommendations found for company ID {company_id}")
            return []
            
        return [rec.to_dict() for rec in recommendations]
        
    except Exception as e:
        logger.error(f"Error retrieving funding recommendation history: {e}")
        raise

async def save_funding_feedback(
    db: Session,
    company_id: int,
    recommendation_id: int,
    recommendation_name: str,
    provider: str,
    is_success: bool = True,
    feedback_type: str = "application_success",
    feedback_notes: str = None
):
    """
    Save feedback on funding recommendations
    
    This is used for reinforcement learning to improve future recommendations
    based on which recommendations actually led to successful funding.
    """
    try:
        # Check if recommendation exists
        recommendation = db.query(FundingRecommendation).filter(
            FundingRecommendation.id == recommendation_id
        ).first()
        
        if not recommendation:
            logger.warning(f"Recommendation with ID {recommendation_id} not found")
            # We'll still save the feedback even if the recommendation is not found
            
        # Create new feedback entry
        feedback = FundingFeedback(
            company_id=company_id,
            recommendation_id=recommendation_id,
            recommendation_name=recommendation_name,
            provider=provider,
            is_success=is_success,
            feedback_type=feedback_type,
            feedback_notes=feedback_notes
        )
        
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        
        logger.info(f"Saved funding feedback for recommendation {recommendation_id} for company {company_id}")
        return feedback.to_dict()
        
    except Exception as e:
        logger.error(f"Error saving funding feedback: {e}")
        db.rollback()
        raise
