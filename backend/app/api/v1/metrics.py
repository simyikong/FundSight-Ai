from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime
from ...core.database import get_db
from ...models.document import Document, ParsedContent, DocumentTag, FinancialMetric
from ...services.ai_service import AIService

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize services
ai_service = AIService()

@router.post("/metrics/analyze/{year}/{month}")
async def analyze_financial_metrics(
    year: int,
    month: int,
    document_ids: List[int] = None,
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    """
    Analyze financial metrics for a specific year/month
    
    If document_ids is provided, analyze only those documents
    Otherwise, find all documents for the specified period
    """
    try:
        # Validate year/month
        if not (1 <= month <= 12):
            raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
        
        if year < 1900 or year > 2100:
            raise HTTPException(status_code=400, detail="Year must be between 1900 and 2100")
        
        # Find documents for this period if not provided
        if not document_ids:
            # Query documents with tags matching this year/month
            period_docs = db.query(Document).join(DocumentTag).filter(
                DocumentTag.tag == "period",
                DocumentTag.year == year,
                DocumentTag.month == month
            ).all()
            
            document_ids = [doc.id for doc in period_docs]
        
        if not document_ids:
            return {
                "year": year,
                "month": month,
                "message": "No documents found for this period",
                "revenue": 0,
                "expenses": 0,
                "profit": 0,
                "cash_flow": 0
            }
        
        # Get parsed content for all documents
        document_contents = []
        for doc_id in document_ids:
            parsed_content = db.query(ParsedContent).filter(
                ParsedContent.document_id == doc_id
            ).first()
            
            if parsed_content and parsed_content.markdown_text:
                document_contents.append((doc_id, parsed_content.markdown_text))
        
        # Run AI analysis
        metrics = ai_service.analyze_financial_metrics(document_contents, year, month)
        
        # Save to database
        existing_metric = db.query(FinancialMetric).filter(
            FinancialMetric.year == year,
            FinancialMetric.month == month
        ).first()
        
        if existing_metric:
            # Update existing metric
            existing_metric.revenue = metrics.get("revenue", 0)
            existing_metric.expenses = metrics.get("expenses", 0)
            existing_metric.profit = metrics.get("profit", 0)
            existing_metric.cash_flow = metrics.get("cash_flow", 0)
            existing_metric.document_ids = metrics.get("document_ids", "")
            existing_metric.last_analysis_date = datetime.utcnow()
        else:
            # Create new metric
            new_metric = FinancialMetric(
                year=year,
                month=month,
                revenue=metrics.get("revenue", 0),
                expenses=metrics.get("expenses", 0),
                profit=metrics.get("profit", 0),
                cash_flow=metrics.get("cash_flow", 0),
                document_ids=metrics.get("document_ids", ""),
                last_analysis_date=datetime.utcnow()
            )
            db.add(new_metric)
        
        db.commit()
        
        # Return response
        return {
            "year": year,
            "month": month,
            "revenue": metrics.get("revenue", 0),
            "expenses": metrics.get("expenses", 0),
            "profit": metrics.get("profit", 0),
            "cash_flow": metrics.get("cash_flow", 0),
            "analysis_notes": metrics.get("analysis_notes", ""),
            "document_count": len(document_contents)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing metrics for {month}/{year}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error analyzing metrics: {str(e)}")


@router.get("/metrics/{year}/{month}")
async def get_financial_metrics(
    year: int,
    month: int,
    db: Session = Depends(get_db)
):
    """
    Get financial metrics for a specific year/month
    """
    try:
        # Validate year/month
        if not (1 <= month <= 12):
            raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
        
        metric = db.query(FinancialMetric).filter(
            FinancialMetric.year == year,
            FinancialMetric.month == month
        ).first()
        
        if not metric:
            return {
                "year": year,
                "month": month,
                "exists": False,
                "revenue": 0,
                "expenses": 0,
                "profit": 0,
                "cash_flow": 0,
                "document_ids": [],
                "last_analysis_date": None
            }
        
        # Get associated document info
        document_ids = metric.document_ids.split(",") if metric.document_ids else []
        documents = []
        
        if document_ids:
            for doc_id in document_ids:
                try:
                    doc_id_int = int(doc_id)
                    doc = db.query(Document).filter(Document.id == doc_id_int).first()
                    if doc:
                        documents.append({
                            "id": doc.id,
                            "filename": doc.filename
                        })
                except (ValueError, TypeError):
                    pass
        
        return {
            "year": year,
            "month": month,
            "exists": True,
            "revenue": metric.revenue,
            "expenses": metric.expenses,
            "profit": metric.profit,
            "cash_flow": metric.cash_flow,
            "documents": documents,
            "last_analysis_date": metric.last_analysis_date.isoformat() if metric.last_analysis_date else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting metrics for {month}/{year}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error getting metrics: {str(e)}")


@router.get("/metrics/table/{year}")
async def get_yearly_metrics_table(
    year: int,
    db: Session = Depends(get_db)
):
    """
    Get a full table of metrics for all months in a year
    """
    try:
        # Get all metrics for this year
        metrics = db.query(FinancialMetric).filter(
            FinancialMetric.year == year
        ).all()
        
        # Build month-by-month table
        months = {}
        for i in range(1, 13):
            # Find metric for this month
            month_metric = next((m for m in metrics if m.month == i), None)
            
            # Get documents for this month/year
            docs = []
            if month_metric and month_metric.document_ids:
                doc_ids = month_metric.document_ids.split(",")
                for doc_id in doc_ids:
                    try:
                        doc_id_int = int(doc_id)
                        doc = db.query(Document).filter(Document.id == doc_id_int).first()
                        if doc:
                            docs.append({
                                "id": doc.id,
                                "filename": doc.filename
                            })
                    except (ValueError, TypeError):
                        pass
            
            # Build month data
            month_data = {
                "hasData": bool(month_metric),
                "documents": docs,
                "metrics": {
                    "revenue": month_metric.revenue if month_metric else 0,
                    "expenses": month_metric.expenses if month_metric else 0,
                    "profit": month_metric.profit if month_metric else 0,
                    "cashFlow": month_metric.cash_flow if month_metric else 0
                },
                "lastAnalysisDate": month_metric.last_analysis_date.isoformat() if month_metric and month_metric.last_analysis_date else None
            }
            
            # Convert month number to name
            month_names = ["January", "February", "March", "April", "May", "June", 
                           "July", "August", "September", "October", "November", "December"]
            months[month_names[i-1]] = month_data
        
        return {
            "year": year,
            "months": months
        }
        
    except Exception as e:
        logger.error(f"Error getting yearly metrics table for {year}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error getting yearly metrics: {str(e)}") 