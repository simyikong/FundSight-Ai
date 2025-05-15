import os
import pytesseract
from PIL import Image
import pdf2image
import tempfile
import pandas as pd
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class OCRService:
    """
    Service for extracting text from various document formats (PDF, images, Excel, etc.)
    """
    
    @staticmethod
    def process_document(file_path):
        """
        Process a document based on its file type and return markdown text
        """
        file_ext = Path(file_path).suffix.lower()
        
        try:
            if file_ext in ['.pdf']:
                return OCRService.process_pdf(file_path)
            elif file_ext in ['.jpg', '.jpeg', '.png', '.tiff', '.bmp']:
                return OCRService.process_image(file_path)
            elif file_ext in ['.xlsx', '.xls']:
                return OCRService.process_excel(file_path)
            elif file_ext in ['.csv']:
                return OCRService.process_csv(file_path)
            else:
                return f"Unsupported file format: {file_ext}"
        except Exception as e:
            logger.error(f"Error processing file {file_path}: {str(e)}", exc_info=True)
            return f"Error processing document: {str(e)}"
    
    @staticmethod
    def process_pdf(pdf_path):
        """
        Convert PDF to images and extract text
        """
        try:
            # Convert PDF to images
            with tempfile.TemporaryDirectory() as temp_dir:
                images = pdf2image.convert_from_path(pdf_path)
                extracted_text = ""
                
                # Extract text from each page
                for i, img in enumerate(images):
                    page_text = pytesseract.image_to_string(img)
                    extracted_text += f"## Page {i+1}\n\n{page_text}\n\n"
                
                return extracted_text
        except Exception as e:
            logger.error(f"Error processing PDF: {str(e)}", exc_info=True)
            raise
    
    @staticmethod
    def process_image(image_path):
        """
        Extract text from an image
        """
        try:
            img = Image.open(image_path)
            text = pytesseract.image_to_string(img)
            return f"# Image Content\n\n{text}"
        except Exception as e:
            logger.error(f"Error processing image: {str(e)}", exc_info=True)
            raise
    
    @staticmethod
    def process_excel(excel_path):
        """
        Convert Excel file to markdown
        """
        try:
            # Read Excel file
            xl = pd.ExcelFile(excel_path)
            result = "# Excel Content\n\n"
            
            # Process each sheet
            for sheet_name in xl.sheet_names:
                df = xl.parse(sheet_name)
                result += f"## Sheet: {sheet_name}\n\n"
                
                # Convert to markdown table
                result += df.to_markdown(index=False) + "\n\n"
            
            return result
        except Exception as e:
            logger.error(f"Error processing Excel: {str(e)}", exc_info=True)
            raise
    
    @staticmethod
    def process_csv(csv_path):
        """
        Convert CSV file to markdown
        """
        try:
            df = pd.read_csv(csv_path)
            result = "# CSV Content\n\n"
            result += df.to_markdown(index=False)
            return result
        except Exception as e:
            logger.error(f"Error processing CSV: {str(e)}", exc_info=True)
            raise 