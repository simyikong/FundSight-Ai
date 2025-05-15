from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import os
from typing import List, Optional

Base = declarative_base()

class Document(Base):
    __tablename__ = 'documents'

    id = Column(Integer, primary_key=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    original_format = Column(String, nullable=False)  # pdf, xlsx, csv, jpg, etc.
    status = Column(String, default="uploading")  # uploading, analyzing, complete, error
    ai_confidence = Column(Integer, nullable=True)
    
    # Relationships
    parsed_content = relationship("ParsedContent", back_populates="document", uselist=False, cascade="all, delete-orphan")
    tags = relationship("DocumentTag", back_populates="document", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Document(id={self.id}, filename='{self.filename}', status='{self.status}')>"


class ParsedContent(Base):
    __tablename__ = 'parsed_content'

    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    markdown_text = Column(Text)
    parse_status = Column(String, default="pending")  # pending, success, failed
    parse_date = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    document = relationship("Document", back_populates="parsed_content")
    
    def __repr__(self):
        return f"<ParsedContent(id={self.id}, document_id={self.document_id}, status='{self.parse_status}')>"


class DocumentTag(Base):
    __tablename__ = 'document_tags'

    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    tag = Column(String)  # period, type, category, etc.
    value = Column(String)  # e.g., "July 2023"
    ai_detected = Column(Boolean, default=True)
    confidence = Column(Integer, nullable=True)
    year = Column(Integer, nullable=True)
    month = Column(Integer, nullable=True)
    
    # Relationship
    document = relationship("Document", back_populates="tags")
    
    def __repr__(self):
        return f"<DocumentTag(id={self.id}, document_id={self.document_id}, tag='{self.tag}', value='{self.value}')>"


class FinancialMetric(Base):
    __tablename__ = 'financial_metrics'

    id = Column(Integer, primary_key=True)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    document_ids = Column(String)  # Comma-separated list of document IDs
    revenue = Column(Float, default=0.0)
    expenses = Column(Float, default=0.0)
    profit = Column(Float, default=0.0)
    cash_flow = Column(Float, default=0.0)
    last_analysis_date = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<FinancialMetric(id={self.id}, year={self.year}, month={self.month})>"


# Initialize database
def init_db(db_path="sqlite:///./financial_docs.db"):
    engine = create_engine(db_path)
    Base.metadata.create_all(engine)
    return engine 