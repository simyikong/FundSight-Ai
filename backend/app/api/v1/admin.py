from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import logging
from ...core.database import get_db
from ...models.document import Document, ParsedContent, DocumentTag, FinancialMetric
from sqlalchemy import desc, func, text
import os

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/admin/tables")
async def get_database_tables(
    db: Session = Depends(get_db)
):
    """
    Get a list of all tables in the database
    """
    try:
        # Get list of tables using SQLAlchemy metadata
        tables = []
        for table_name in db.execute(text("SELECT name FROM sqlite_master WHERE type='table'")).scalars():
            # Skip internal SQLite tables
            if not table_name.startswith('sqlite_'):
                # Get count of rows
                row_count = db.execute(text(f"SELECT COUNT(*) FROM {table_name}")).scalar()
                tables.append({
                    "name": table_name,
                    "row_count": row_count
                })
        
        return {
            "tables": tables,
            "database_path": os.path.abspath("financial_docs.db")
        }
    except Exception as e:
        logger.error(f"Error getting database tables: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error getting database info: {str(e)}")

@router.get("/admin/table/{table_name}")
async def get_table_data(
    table_name: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get data from a specific table with pagination
    """
    try:
        # Verify table exists
        tables = [row[0] for row in db.execute(text("SELECT name FROM sqlite_master WHERE type='table'")).all()]
        if table_name not in tables:
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
        
        # Get column names
        columns = [row[1] for row in db.execute(text(f"PRAGMA table_info({table_name})")).all()]
        
        # Calculate offset
        offset = (page - 1) * page_size
        
        # Get total count
        total_count = db.execute(text(f"SELECT COUNT(*) FROM {table_name}")).scalar()
        
        # Get data with pagination
        rows = db.execute(text(f"SELECT * FROM {table_name} LIMIT {page_size} OFFSET {offset}")).all()
        
        # Convert rows to dictionaries
        data = []
        for row in rows:
            row_dict = {}
            for i, col in enumerate(columns):
                # Handle different data types appropriately
                row_dict[col] = row[i]
            data.append(row_dict)
        
        return {
            "table_name": table_name,
            "columns": columns,
            "data": data,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_count": total_count,
                "total_pages": (total_count + page_size - 1) // page_size
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting data from table {table_name}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error getting table data: {str(e)}")

@router.delete("/admin/table/{table_name}/row/{row_id}")
async def delete_row(
    table_name: str,
    row_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a specific row from a table
    """
    try:
        # Verify table exists
        tables = [row[0] for row in db.execute(text("SELECT name FROM sqlite_master WHERE type='table'")).all()]
        if table_name not in tables:
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
        
        # Get primary key column
        pk_column = None
        for row in db.execute(text(f"PRAGMA table_info({table_name})")).all():
            if row[5] == 1:  # pk flag is 1 for primary key columns
                pk_column = row[1]
                break
        
        if not pk_column:
            raise HTTPException(status_code=400, detail=f"Could not determine primary key for table '{table_name}'")
        
        # Delete the row
        result = db.execute(text(f"DELETE FROM {table_name} WHERE {pk_column} = :row_id"), {"row_id": row_id})
        db.commit()
        
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail=f"Row with ID {row_id} not found in table '{table_name}'")
        
        return {"message": f"Row with ID {row_id} deleted from table '{table_name}'"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting row {row_id} from table {table_name}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error deleting row: {str(e)}")

@router.post("/admin/execute-query")
async def execute_query(
    query: str,
    db: Session = Depends(get_db)
):
    """
    Execute a custom SQL query (read-only)
    """
    try:
        # Check if query is read-only (starts with SELECT)
        if not query.strip().upper().startswith('SELECT'):
            raise HTTPException(status_code=400, detail="Only SELECT queries are allowed for security reasons")
        
        # Execute the query
        result = db.execute(text(query)).all()
        
        # Get column names
        if result:
            # For SQLAlchemy 2.0 compatibility
            columns = result[0]._fields
            
            # Convert rows to dictionaries
            data = []
            for row in result:
                row_dict = {}
                for i, col in enumerate(columns):
                    row_dict[col] = row[i]
                data.append(row_dict)
            
            return {
                "columns": columns,
                "data": data,
                "row_count": len(data)
            }
        else:
            return {
                "columns": [],
                "data": [],
                "row_count": 0
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing query: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error executing query: {str(e)}")

@router.post("/admin/force-analyze/{year}/{month}")
async def force_analyze(
    year: int,
    month: int,
    document_ids: List[int] = None,
    db: Session = Depends(get_db)
):
    """
    Force analysis of financial metrics for a specific month
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
                "status": "error",
                "message": f"No documents found for period {month}/{year}"
            }
        
        # Format document IDs as comma-separated string
        doc_ids_str = ",".join(str(doc_id) for doc_id in document_ids)
        
        # Get an existing metrics record or create a new one
        metric = db.query(FinancialMetric).filter(
            FinancialMetric.year == year,
            FinancialMetric.month == month
        ).first()
        
        if not metric:
            metric = FinancialMetric(
                year=year,
                month=month,
                document_ids=doc_ids_str
            )
            db.add(metric)
        else:
            metric.document_ids = doc_ids_str
        
        db.commit()
        
        return {
            "status": "success",
            "message": f"Documents associated with period {month}/{year}",
            "year": year,
            "month": month,
            "document_ids": document_ids
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error force-analyzing period {month}/{year}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error force-analyzing: {str(e)}") 