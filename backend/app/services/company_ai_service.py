import os
from openai import OpenAI
import logging
from config import Config
import re
import json
from datetime import datetime
from .ocr_service import OCRService

logger = logging.getLogger(__name__)

class CompanyAIService:
    """
    Service for AI-based company document analysis and information extraction
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
        self.ocr_service = OCRService()
    
    def process_company_document(self, file_path):
        """
        Process a company document using OCR and return extracted text
        
        Args:
            file_path: Path to the document file
            
        Returns:
            Extracted text from document
        """
        try:
            # Extract text using OCR service
            extracted_text = self.ocr_service.process_document(file_path)
            return extracted_text
        except Exception as e:
            logger.error(f"Error processing company document: {str(e)}", exc_info=True)
            return f"Error: {str(e)}"
    
    def extract_company_information(self, document_text):
        """
        Extract company information from document text using AI
        
        Args:
            document_text: Text extracted from company document
            
        Returns:
            Dictionary with extracted company information
        """
        try:
            prompt = f"""
            You are an AI specialized in extracting company information from documents.
            Analyze the following document content and extract relevant company information.
            
            Document content:
            {document_text[:10000]}  # Limit content to avoid token limits
            
            Extract the following information in JSON format:
            - Company name
            - Website URL
            - Registration number
            - Company type (e.g., Sdn Bhd, Bhd, etc.)
            - Industry
            - Business location
            - Years of operation
            - Registration year
            - Number of employees
            - Founder gender (if mentioned)
            - Founder ethnicity (if mentioned)
            - Special category (e.g., Woman-owned, Youth Entrepreneur, etc.)
            - Mission statement
            - Business description
            - Previous grants received
            
            Return your analysis as a JSON object with the following format:
            {{
                "companyName": "<extracted company name>",
                "website": "<extracted website>",
                "registrationNumber": "<extracted registration number>",
                "companyType": "<extracted company type>",
                "industry": "<extracted industry>",
                "location": "<extracted location>",
                "yearsOfOperation": "<extracted years of operation>",
                "registrationYear": "<extracted registration year>",
                "employees": "<extracted number of employees>",
                "founderGender": "<extracted founder gender>",
                "founderEthnicity": "<extracted founder ethnicity>",
                "specialCategory": "<extracted special category>",
                "missionStatement": "<extracted mission statement>",
                "description": "<extracted business description>",
                "previousGrantsReceived": "<extracted previous grants>"
            }}
            
            If you cannot detect specific information, use an empty string for that field.
            Be precise and extract only factual information from the document.
            """
            
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a company document analyzer."},
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
                
                # Ensure all required fields exist
                result = {
                    "companyName": data.get("companyName", ""),
                    "website": data.get("website", ""),
                    "registrationNumber": data.get("registrationNumber", ""),
                    "companyType": data.get("companyType", ""),
                    "industry": data.get("industry", ""),
                    "location": data.get("location", ""),
                    "yearsOfOperation": data.get("yearsOfOperation", ""),
                    "registrationYear": data.get("registrationYear", ""),
                    "employees": data.get("employees", ""),
                    "founderGender": data.get("founderGender", ""),
                    "founderEthnicity": data.get("founderEthnicity", ""),
                    "specialCategory": data.get("specialCategory", ""),
                    "missionStatement": data.get("missionStatement", ""),
                    "description": data.get("description", ""),
                    "previousGrantsReceived": data.get("previousGrantsReceived", "")
                }
                
                return result
            else:
                logger.error(f"No valid JSON found in response: {response_text}")
                return {}
                
        except Exception as e:
            logger.error(f"Error extracting company information: {str(e)}", exc_info=True)
            return {}
