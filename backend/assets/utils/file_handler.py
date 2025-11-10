"""
File upload and Storage handler
handles file uploads, validation and storage organization
"""

import os #file system operations
import hashlib
import mimetypes #detect file types
from datetime import datetime #get current timestamps
from pathlib import Path #working with file paths
from typing import Tuple, Optional


class FileUploadHandler:
    #set the allowed file types
    ALLOWED_TYPES = {
        'image': ['.jpg', '.jpeg', '.png'],
        'video': ['.mp4'],
        '3d': ['.glb']
    }

    #set the max file sizes in bytes
    MAX_FILE_SIZE = {
        'image': 50 * 1024 * 1024,  #50mb
        'video': 500 * 1024 * 1024, #500mb
        '3d': 100 * 1024 * 1024     #100mb
    }

    def __init__(self, media_path='media'):
        self.media_path = Path(media_path)
        self._ensure_directories_exist()
    
    def _ensure_directories_exist(self):
        #create directories if they dont exist
        directories = [
            self.media_path / 'originals',
            self.media_path / 'web',
            self.media_path / 'thumbnails',
            self.media_path / 'images',
            self.media_path / 'videos',
            self.media_path / 'models'
        ]

        #to ensure created once only
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
    
    #file validation
    def validate_file(self, file_path: str, file_size: int) -> Tuple[bool, str, str]:
        #validate file type and size
        file_type = os.path.splitext(file_path)[1].lower()

        #check if extension allowed
        asset_type = None

        for type_name, types in self.ALLOWED_TYPES.items():
            if file_type in types:
                asset_type = type_name
                break
        
        if not asset_type:
            return False, '', f'File type {file_type} is not allowed. Allowed types: {self.ALLOWED_TYPES}'
        
        #check file size
        max_size = self.MAX_FILE_SIZE[asset_type]

        if file_size > max_size:
            max_size_mb = max_size / (1024 * 1024)
            actual_size_mb = file_size / (1024 * 1024)

            return False, asset_type, f'File too large ({actual_size_mb:.2f} MB). Maximum allowed: {max_size_mb:.2f} MB)'
        
        return True, asset_type, ''
    
    #generate filename
    def generate_unique_filename(self, original_filename: str, asset_type: str) -> str:
        #get file type
        name, type = os.path.splitext(original_filename)

        #create timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')

        #create hash from original filename
        hash_obj = hashlib.md5(original_filename.encode())
        short_hash = hash_obj.hexdigest()[:8]

        #generate unique filename
        unique_filename = f'{name}_{timestamp}_{short_hash}{type}'

        return unique_filename


    #get storage path
    def get_storage_path(self, asset_type: str, filename: str, storage_type='originals') -> Path:
        #organize by d/m/Y
        today = datetime.now()

        date_path = today.strftime('%Y/%m/%d')

        #create full path
        storage_path = self.media_path / storage_type / asset_type / date_path / filename

        #check directory
        storage_path.parent.mkdir(parents=True, exist_ok=True)

        return storage_path

    #save file
    def save_file(self, file_data, original_filename: str, asset_type: str) -> Tuple[bool, dict, str]:
        try:
            #generate unique filename
            unique_filename = self.generate_unique_filename(original_filename, asset_type)

            #get storage path
            file_path = self.get_storage_path(asset_type, unique_filename, 'originals')

            #write file
            if hasattr(file_data, 'read'):
                #file object
                with open(file_path, 'wb') as f:
                    for chunk in file_data.chunks():
                        f.write(chunk)

                file_size = file_data.size
            
            else:
                #bytes
                with open(file_path, 'wb') as f:
                    f.write(file_data)
                
                file_size = len(file_data)

            file_info = {
                'original_filename': original_filename,
                'stored_filename': unique_filename,
                'file_path': str(file_path),
                'relative_path': str(file_path.relative_to(self.media_path)),
                'file_size': file_size,
                'asset_type': asset_type,
                'upload_at': datetime.now().isoformat(),
                'mime_type': mimetypes.guess_type(original_filename)[0]
            }

            return True, file_info, ''
        
        except Exception as e:
            return False, {}, f'Error saving file: {str(e)}'

    #delete file
    def delete_file(self, file_path: str) -> Tuple[bool, str]:
        try:
            path = Path(file_path)

            if path.exists():
                path.unlink()

                return True, ''
            
            else:
                return False, 'File not found'
        
        except Exception as e:
            return False, f'Error deleting file: {str(e)}'

    #get file information
    def get_file_information(self, file_path: str) -> Optional[dict]:
        try:
            path = Path(file_path)

            if not path.exists():
                return None

            stat = path.stat()

            return {
                'filename': path.name,
                'file_path': str(path),
                'file_size': stat.st_size,
                'created_at': datetime.fromtimestamp(stat.st_ctime).isoformat(),
                'modified_at': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                'mime_type': mimetypes.guess_type(str(path))[0]
            }
        
        except Exception as e:
            print(f'Error getting file info: {e}')
            return None
    

if __name__ == "__main__":
    # Initialize handler
    handler = FileUploadHandler(media_path='media')

    # Example 1: Validate file
    is_valid, asset_type, error = handler.validate_file('photo.jpg', 5 * 1024 * 1024)
    print(f"Validation: {is_valid}, Type: {asset_type}, Error: {error}")

    # Example 2: Generate unique filename
    unique_name = handler.generate_unique_filename('my_photo.jpg', 'image')
    print(f"Unique filename: {unique_name}")

    # Example 3: Get storage path
    storage_path = handler.get_storage_path('image', 'test.jpg', 'originals')
    print(f"Storage path: {storage_path}")

    # Example 4: Save file (simulated with bytes)
    test_data = b"Test image data"
    success, file_info, error = handler.save_file(test_data, 'test_image.jpg', 'image')
    if success:
        print(f"File saved successfully!")
        print(f"File info: {file_info}")
    else:
        print(f"Error: {error}")

    # Example 5: Get file info
    if success:
        info = handler.get_file_information(file_info['file_path'])
        print(f"File info: {info}")

    # Example 6: Delete file
    if success:
        deleted, error = handler.delete_file(file_info['file_path'])
        print(f"Deleted: {deleted}, Error: {error}")