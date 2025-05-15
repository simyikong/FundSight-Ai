import os
from openai import OpenAI
import logging
from config import Config
import re
import json
from datetime import datetime

logger = logging.getLogger(__name__)

class AIService:
    """
    Service for AI-based document analysis and financial data extraction
    """
    
    def __init__(self):
        """
        Initialize OpenAI client with DashScope compatible API
        """
        self.client = OpenAI(
            api_key=Config.DASHSCOPE_API_KEY,
            base_url=Config.LLM_MODEL_SERVER
        )
        self.model = Config.LLM_MODEL_NAME
    
    def detect_document_period(self, markdown_content, filename):
        """
        Detect the time period (month and year) a document refers to
        """
        try:
            prompt = f"""
            You are an AI specialized in detecting time periods in financial documents.
            Analyze the following document content and filename to determine which month and year it refers to.
            
            Document filename: {filename}
            Document content snippet (first part):
            {markdown_content}
            
            Return your analysis as a JSON object with the following format:
            {{
                "year": <detected year as integer>,
                "month": <detected month as integer 1-12>,
                "confidence": <confidence level 0-100>,
                "detected_tags": [<list of relevant tags like "income statement", "invoice", "receipt", etc.>]
            }}
            
            If you cannot detect a specific year or month, use null for that field.
            Focus on finding dates that represent the reporting period, not the creation date of the document.
            """
            
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a financial document analyzer."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            # Extract and parse JSON response
            response_text = completion.choices[0].message.content
            json_pattern = r'({[\s\S]*})'
            json_match = re.search(json_pattern, response_text)
            
            if json_match:
                json_str = json_match.group(1)
                data = json.loads(json_str)
                return data
            else:
                logger.error(f"No valid JSON found in response: {response_text}")
                # Return default data
                return {
                    "year": datetime.now().year,
                    "month": datetime.now().month,
                    "confidence": 50,
                    "detected_tags": ["unknown"]
                }
                
        except Exception as e:
            logger.error(f"Error detecting document period: {str(e)}", exc_info=True)
            # Return default values on error
            return {
                "year": datetime.now().year,
                "month": datetime.now().month,
                "confidence": 50,
                "detected_tags": ["error"]
            }
    
    def analyze_financial_metrics(self, document_contents, year, month):
        """
        Analyze document contents to extract financial metrics
        
        Args:
            document_contents: List of tuples containing (document_id, markdown_content)
            year: Year to analyze
            month: Month to analyze
            
        Returns:
            Dictionary with financial metrics
        """
        try:
            # Combine all document contents (limiting length to avoid token limits)
            combined_content = ""
            doc_ids = []
            
            for doc_id, content in document_contents:
                doc_ids.append(doc_id)
                
                combined_content += f"\n--- Document {doc_id} ---\n{content}\n"
            
            prompt = f"""
            You are a financial analyst AI. Analyze the following financial documents for {month}/{year} 
            and extract these key metrics:
            
            1. Revenue: Total income or revenue figure
            2. Expenses: Total expenses or costs
            3. Profit: Net profit or income (Revenue - Expenses)
            4. Cash Flow: Net cash flow or change in cash position
            
            Documents:
            {combined_content}
            
            Return ONLY a JSON object with these exact keys:
            {{
                "revenue": <float>,
                "expenses": <float>,
                "profit": <float>,
                "cash_flow": <float>,
                "analysis_notes": "<brief explanation of your findings>"
            }}
            
            If you cannot determine a specific value, use 0 for that field.
            """
            
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a financial document analyzer."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            # Extract and parse response
            response_text = completion.choices[0].message.content
            json_pattern = r'({[\s\S]*})'
            json_match = re.search(json_pattern, response_text)
            
            if json_match:
                json_str = json_match.group(1)
                data = json.loads(json_str)
                
                # Ensure all required fields exist and are numeric
                result = {
                    "revenue": float(data.get("revenue", 0)),
                    "expenses": float(data.get("expenses", 0)),
                    "profit": float(data.get("profit", 0)),
                    "cash_flow": float(data.get("cash_flow", 0)),
                    "analysis_notes": data.get("analysis_notes", "No additional notes"),
                    "document_ids": ",".join(str(x) for x in doc_ids)
                }
                
                return result
            else:
                logger.error(f"No valid JSON found in response: {response_text}")
                return {
                    "revenue": 0,
                    "expenses": 0,
                    "profit": 0,
                    "cash_flow": 0,
                    "analysis_notes": "Error processing response",
                    "document_ids": ",".join(str(x) for x in doc_ids)
                }
                
        except Exception as e:
            logger.error(f"Error analyzing financial metrics: {str(e)}", exc_info=True)
            return {
                "revenue": 0,
                "expenses": 0,
                "profit": 0,
                "cash_flow": 0,
                "analysis_notes": f"Error: {str(e)}",
                "document_ids": ",".join(str(x) for x in doc_ids) if doc_ids else ""
            } 