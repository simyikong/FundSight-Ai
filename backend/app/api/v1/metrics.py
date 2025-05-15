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

@router.get("/metrics/table/{year}")
async def get_yearly_metrics_table(
    year: int,
    db: Session = Depends(get_db)
):
    """
    Get metrics for all months in a year and build a month-by-month table
    """
    # Define the month names
    month_names = ["January", "February", "March", "April", "May", "June", 
                   "July", "August", "September", "October", "November", "December"]
    
    # Initialize the result structure
    result = {
        "year": year,
        "months": {}
    }
    
    # For each month, get the metrics
    for month_idx, month_name in enumerate(month_names, 1):
        # First check if we have metrics for this month
        metrics_entry = db.query(FinancialMetric).filter(
            FinancialMetric.year == year,
            FinancialMetric.month == month_idx
        ).first()
        
        documents = []
        has_data = False
        
        # If we have metrics, get the associated documents
        if metrics_entry:
            has_data = True
            document_ids = metrics_entry.document_ids.split(",") if metrics_entry.document_ids else []
            
            if document_ids:
                # Get the documents associated with these metrics
                doc_ids = [int(doc_id) for doc_id in document_ids if doc_id.strip()]
                if doc_ids:
                    docs = db.query(Document).filter(Document.id.in_(doc_ids)).all()
                    for doc in docs:
                        documents.append({
                            "id": doc.id,
                            "filename": doc.filename,
                            "status": doc.status,
                            "upload_date": doc.upload_date.isoformat() if doc.upload_date else None
                        })
        
        # If no metrics found, also check for documents with period tags for this month/year
        if not has_data or not documents:
            # Look for documents with a period tag for this month and year
            period_tag_docs = db.query(Document).join(
                DocumentTag, 
                Document.id == DocumentTag.document_id
            ).filter(
                DocumentTag.tag == "period",
                DocumentTag.year == year,
                DocumentTag.month == month_idx
            ).all()
            
            if period_tag_docs:
                has_data = True
                for doc in period_tag_docs:
                    # Check if this document is already in our list
                    if not any(d['id'] == doc.id for d in documents):
                        documents.append({
                            "id": doc.id,
                            "filename": doc.filename,
                            "status": doc.status,
                            "upload_date": doc.upload_date.isoformat() if doc.upload_date else None
                        })
        
        # Get the current time for lastAnalysisDate
        last_analysis_date = metrics_entry.last_analysis_date.isoformat() if metrics_entry and metrics_entry.last_analysis_date else None
        
        # Add the month data to the result with metrics in a nested object for backward compatibility
        result["months"][month_name] = {
            "monthIndex": month_idx,
            "hasData": has_data,
            "documents": documents,
            "metrics": {
                "revenue": metrics_entry.revenue if metrics_entry else 0.0,
                "expenses": metrics_entry.expenses if metrics_entry else 0.0,
                "profit": metrics_entry.profit if metrics_entry else 0.0,
                "cashFlow": metrics_entry.cash_flow if metrics_entry else 0.0
            },
            "lastAnalysisDate": last_analysis_date
        }
    
    return result

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