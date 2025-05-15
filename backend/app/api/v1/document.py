from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
import os
from ...core.database import get_db
from ...models.document import Document, ParsedContent, DocumentTag
from ...services.ocr_service import OCRService
from ...services.storage_service import StorageService
from ...services.ai_service import AIService
from datetime import datetime
import json

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize services
storage_service = StorageService()
ai_service = AIService()

# Document schemas for responses
class DocumentResponse:
    def __init__(self, db_document):
        self.id = db_document.id
        self.filename = db_document.filename
        self.upload_date = db_document.upload_date
        self.status = db_document.status
        self.ai_confidence = db_document.ai_confidence
        self.tags = [{"tag": tag.tag, "value": tag.value, "year": tag.year, "month": tag.month} 
                     for tag in db_document.tags]
    
    def dict(self):
        return {
            "id": self.id,
            "filename": self.filename,
            "upload_date": self.upload_date.isoformat() if self.upload_date else None,
            "status": self.status,
            "ai_confidence": self.ai_confidence,
            "tags": self.tags
        }

# Background task to process document
async def process_document(document_id: int, file_path: str, db: Session):
    try:
        # 1. Get document from DB
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            logger.error(f"Document {document_id} not found")
            return
        
        # 2. Update status to analyzing
        document.status = "analyzing"
        db.commit()
        
        # 3. Perform OCR
        markdown_text = OCRService.process_document(file_path)
        
        # 4. Save parsed content
        parsed_content = ParsedContent(
            document_id=document_id,
            markdown_text=markdown_text,
            parse_status="success"
        )
        db.add(parsed_content)
        db.commit()
        
        # 5. Detect time period with AI
        ai_result = ai_service.detect_document_period(markdown_text, document.filename)
        
        # 6. Update document with AI analysis
        document.status = "complete"
        document.ai_confidence = ai_result.get("confidence", 50)
        db.commit()
        
        # 7. Save detected tags
        year = ai_result.get("year")
        month = ai_result.get("month")
        
        # Add period tag if year/month detected
        if year:
            db.add(DocumentTag(
                document_id=document_id,
                tag="period",
                value=f"{month}/{year}" if month else f"{year}",
                ai_detected=True,
                confidence=ai_result.get("confidence", 50),
                year=year,
                month=month
            ))
        
        # Add other detected tags
        for tag in ai_result.get("detected_tags", []):
            db.add(DocumentTag(
                document_id=document_id,
                tag="type",
                value=tag,
                ai_detected=True,
                confidence=ai_result.get("confidence", 50)
            ))
        
        db.commit()
        logger.info(f"Document {document_id} processed successfully")
        
    except Exception as e:
        # Update document status to error
        try:
            document = db.query(Document).filter(Document.id == document_id).first()
            if document:
                document.status = "error"
                db.commit()
        except Exception:
            pass
        
        logger.error(f"Error processing document {document_id}: {str(e)}", exc_info=True)


@router.post("/documents/upload", status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a document for processing
    """
    try:
        # 1. Save file to storage
        file_path, unique_filename = storage_service.save_file(file.file, file.filename)
        
        # 2. Create document record
        file_extension = os.path.splitext(file.filename)[1].lower()
        document = Document(
            filename=file.filename,
            file_path=file_path,
            original_format=file_extension.replace(".", ""),
            status="uploading"
        )
        
        db.add(document)
        db.commit()
        db.refresh(document)
        
        # 3. Queue background processing task
        background_tasks.add_task(process_document, document.id, file_path, db)
        
        # 4. Return response
        return {
            "id": document.id,
            "filename": document.filename,
            "status": document.status,
            "message": "Document upload initiated. Processing in background."
        }
        
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error uploading document: {str(e)}")


@router.get("/documents/recent")
async def get_recent_documents(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Get recent documents
    """
    try:
        documents = db.query(Document).order_by(Document.upload_date.desc()).limit(limit).all()
        return [DocumentResponse(doc).dict() for doc in documents]
    except Exception as e:
        logger.error(f"Error fetching recent documents: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching recent documents: {str(e)}")


@router.get("/documents/{document_id}")
async def get_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific document by ID
    """
    try:
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return DocumentResponse(document).dict()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching document {document_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching document: {str(e)}")


@router.post("/documents/{document_id}/analyze-period")
async def analyze_document_period(
    document_id: int,
    db: Session = Depends(get_db)
):
    """
    Analyze or re-analyze the period for a document
    """
    try:
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Get parsed content
        parsed_content = db.query(ParsedContent).filter(ParsedContent.document_id == document_id).first()
        if not parsed_content or not parsed_content.markdown_text:
            raise HTTPException(status_code=400, detail="Document has not been processed yet")
        
        # Detect period with AI
        ai_result = ai_service.detect_document_period(parsed_content.markdown_text, document.filename)
        
        # Update document
        document.ai_confidence = ai_result.get("confidence", 50)
        
        # Clear existing period tags
        db.query(DocumentTag).filter(
            DocumentTag.document_id == document_id,
            DocumentTag.tag == "period"
        ).delete()
        
        # Save new tags
        year = ai_result.get("year")
        month = ai_result.get("month")
        
        # Add period tag if year/month detected
        if year:
            db.add(DocumentTag(
                document_id=document_id,
                tag="period",
                value=f"{month}/{year}" if month else f"{year}",
                ai_detected=True,
                confidence=ai_result.get("confidence", 50),
                year=year,
                month=month
            ))
        
        # Update other tags
        db.query(DocumentTag).filter(
            DocumentTag.document_id == document_id,
            DocumentTag.tag == "type"
        ).delete()
        
        for tag in ai_result.get("detected_tags", []):
            db.add(DocumentTag(
                document_id=document_id,
                tag="type",
                value=tag,
                ai_detected=True,
                confidence=ai_result.get("confidence", 50)
            ))
        
        db.commit()
        
        return {
            "id": document_id,
            "year": year,
            "month": month,
            "confidence": ai_result.get("confidence", 50),
            "tags": ai_result.get("detected_tags", [])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing period for document {document_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error analyzing document period: {str(e)}")


@router.post("/documents/{document_id}/add-to-records")
async def add_document_to_records(
    document_id: int,
    db: Session = Depends(get_db)
):
    """
    Mark a document as added to records
    """
    try:
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Update tag to indicate it's been added to records
        db.add(DocumentTag(
            document_id=document_id,
            tag="status",
            value="added_to_records",
            ai_detected=False
        ))
        
        db.commit()
        
        return {"id": document_id, "status": "added_to_records"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding document {document_id} to records: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error adding to records: {str(e)}")


@router.post("/documents/{document_id}/update-tags")
async def update_document_tags(
    document_id: int,
    tags: dict = None,
    db: Session = Depends(get_db)
):
    """
    Update tags for a document
    """
    try:
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        if not tags:
            raise HTTPException(status_code=400, detail="No tags provided")
        
        # Update year/month if provided
        if "year" in tags and "month" in tags:
            year = tags.get("year")
            month = tags.get("month")
            
            # Update existing period tag or create new one
            period_tag = db.query(DocumentTag).filter(
                DocumentTag.document_id == document_id,
                DocumentTag.tag == "period"
            ).first()
            
            if period_tag:
                period_tag.value = f"{month}/{year}" if month else f"{year}"
                period_tag.year = year
                period_tag.month = month
                period_tag.ai_detected = False
            else:
                db.add(DocumentTag(
                    document_id=document_id,
                    tag="period",
                    value=f"{month}/{year}" if month else f"{year}",
                    ai_detected=False,
                    year=year,
                    month=month
                ))
        
        # Update custom tags if provided
        if "custom_tags" in tags:
            for tag in tags["custom_tags"]:
                db.add(DocumentTag(
                    document_id=document_id,
                    tag="custom",
                    value=tag,
                    ai_detected=False
                ))
        
        db.commit()
        
        return {"id": document_id, "message": "Tags updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating tags for document {document_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error updating tags: {str(e)}") 