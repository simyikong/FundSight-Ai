import os
import shutil
import uuid
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class StorageService:
    """
    Service for handling document storage and retrieval
    """
    
    def __init__(self, storage_path="workspace/documents"):
        """
        Initialize with storage path
        """
        self.storage_path = storage_path
        os.makedirs(self.storage_path, exist_ok=True)
    
    def save_file(self, file, original_filename, custom_path=None):
        """
        Save an uploaded file to storage with a unique name
        
        Args:
            file: File-like object to save
            original_filename: Original filename
            custom_path: Optional custom subdirectory path
            
        Returns:
            Tuple of (file_path, unique_filename)
        """
        try:
            # Create unique filename
            file_ext = os.path.splitext(original_filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            
            # Determine save path
            save_path = self.storage_path
            if custom_path:
                save_path = os.path.join(save_path, custom_path)
                os.makedirs(save_path, exist_ok=True)
            
            file_path = os.path.join(save_path, unique_filename)
            
            # Write file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file, buffer)
            
            logger.info(f"Saved file {original_filename} to {file_path}")
            return file_path, unique_filename
            
        except Exception as e:
            logger.error(f"Error saving file {original_filename}: {str(e)}", exc_info=True)
            raise
    
    def delete_file(self, file_path):
        """
        Delete a file from storage
        
        Args:
            file_path: Path to file to delete
            
        Returns:
            Boolean indicating success
        """
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Deleted file {file_path}")
                return True
            else:
                logger.warning(f"File not found: {file_path}")
                return False
        except Exception as e:
            logger.error(f"Error deleting file {file_path}: {str(e)}", exc_info=True)
            return False
    
    def get_file_path(self, filename, custom_path=None):
        """
        Get the full path for a file
        
        Args:
            filename: Filename to locate
            custom_path: Optional custom subdirectory
            
        Returns:
            Full path to file
        """
        if custom_path:
            return os.path.join(self.storage_path, custom_path, filename)
        return os.path.join(self.storage_path, filename) 