import os
import json #convert dictionaries into json
from pathlib import Path
from typing import Optional, Dict
from PIL import Image
from io import BytesIO

class MetadataExtractor:
    def __init__(self, thumbnail_size=(200, 200)):
        self.thumbnail_size = thumbnail_size
    
    def extract_image_metadata(self, file_path: str) -> Dict:
        try:
            with Image.open(file_path) as img:
                #extract basic info
                metadata = {
                    'width': img.width,
                    'hieght': img.height,
                    'format': img.format,
                    'mode': img.mode,
                    'file_size': os.path.getsize(file_path),
                    'aspect_ratio': round(img.width / img.height, 2),
                }

                exif_data = img.getexif()

                if exif_data:
                    metadata['has_exif'] = True
                    metadata['exif'] = {}

                    #camera_info if available
                    if 271 in exif_data:
                        metadata['exif']['camera_make'] = exif_data[271]
                    
                    if 272 in exif_data:
                        metadata['exif']['camera_model'] = exif_data[272]
                    
                    if 306 in exif_data:
                        metadata['exif']['datetime'] = exif_data[306]
                
                else:
                    metadata['has_exif'] = False
                
                return metadata
            
        except Exception as e:
            return {'error': f'Error extracting image metadata: {str(e)}'}
    
    def extract_video_metadata(self, file_path: str) -> Dict:
        try:
            import cv2

            capture = cv2.VideoCapture(file_path)

            if not capture.isOpened():
                return {'error': 'Could not open video file'}
            
            metadata = {
                'width': int(capture.get(cv2.CAP_PROP_FRAME_WIDTH)),
                'height': int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT)),
                'fps': round(capture.get(cv2.CAP_PROP_FPS), 2),
                'frame_count': int(capture.get(cv2.CAP_PROP_FRAME_COUNT)),
                'file_size': os.path.getsize(file_path),
            }

            #calculate duration
            if metadata['fps'] > 0:
                metadata['duration_seconds'] = round(metadata['frame_count'] / metadata['fps'], 2)
                metadata['duration_formatted'] = self._format_duration(metadata['duration_seconds'])
            
            if metadata.get('duration_second', 0) > 0:
                bitrate = (metadata['file_size'] * 8) / metadata['duration_seconds']
                metadata['bitrate_kbps'] = round(bitrate / 1000, 2)
            
            metadata['aspect_ratio'] = round(metadata['width'] / metadata['height'], 2)

            capture.release()

            return metadata
        
        except ImportError:
            return {'error': 'opencv-python not installed. Run: pip install opencv-python'}
        except Exception as e:
            return {'error': f'Error extracting video metadata: {str(e)}'}

    
    def extract_3d_metadata(self, file_path: str) -> Dict:
        try:
            from pygltflib import GLTF2

            gltf = GLTF2().load(file_path)

            metadata = {
                'file_size': os.path.getsize(file_path),
                'meshes_count': len(gltf.meshes) if gltf.meshes else 0,
                'materials_count': len(gltf.materials) if gltf.meshes else 0,
                'textures_count': len(gltf.textures) if gltf.textures else 0,
                'animations_count': len(gltf.animations) if gltf.animations else 0,
                'nodes_count': len(gltf.nodes) if gltf.nodes else 0,
            }

            #get total vertex count
            total_vertices = 0

            if gltf.meshes:
                for mesh in gltf.meshes:
                    for primitive in mesh.primitives:
                        if hasattr(primitive.attributes, 'POSITION'):
                            accessor_index = primitive.attributes.POSITION
                            if accessor_index < len(gltf.accessors):
                                total_vertices += gltf.accessors[accessor_index].count
            
            metadata['total_vertices'] = total_vertices

            #asset info
            if gltf.asset:
                metadata['generator'] = getattr(gltf.asset, 'generator', 'Unknown')
                metadata['version'] = getattr(gltf.asset, 'version', 'Unknown')
            
            return metadata
        
        except ImportError:
            return {'error': f'pygltflib not installed. Run: pip install pygltflib'}
        except Exception as e:
            return {'error': f'Error extracting 3d metadata: {str(e)}'}
    
    def generate_image_thumbnail(self, file_path: str, output_path: str) -> bool:
        try:
            with Image.open(file_path) as img:
                #convert RGBA to RGB if necessary
                if img.mode == 'RGBA':
                    rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                    rgb_img.paste(img, mask=img.split()[3])
                    img = rgb_img
                
                #generate thumbnail
                img.thumbnail(self.thumbnail_size, Image.Resampling.LANCZOS)

                #ensure output directory exist
                os.makedirs(os.path.dirname(output_path), exist_ok=True)

                #save thumbnail
                img.save(output_path, 'JPEG', quality=85)

                return True
            
        except Exception as e:
            print(f'Error generating thumbnail: {e}')
            return False

    def generate_video_thumbnail(self, fille_path: str, output_path: str, frame_time=1.0) -> bool:
        try:
            import cv2

            capture = cv2.VideoCapture(fille_path)

            if not capture.isOpened():
                return False
            
            #set position to desired time
            fps = capture.get(cv2.CAP_PROP_FPS)
            frame_number = int(frame_time * fps)
            capture.set(cv2.CAP_PROP_POS_FRAMES, frame_number)

            #read frame
            ret, frame = capture.read()
            capture.release()

            if not ret:
                return False
            
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            img = Image.fromarray(frame_rgb)
            img.thumbnail(self.thumbnail_size, Image.Resampling.LANCZOS)
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            img.save(output_path, 'JPEG', quality=85)

            return True
        
        except ImportError:
            print("opencv-python not installed")
            return False
        except Exception as e:
            print(f"Error generating video thumbnail: {e}")
            return False

    def extract_metadata(self, file_path: str, asset_type: str) -> Dict:
        if asset_type == 'image':
            return self.extract_image_metadata(file_path)
        elif asset_type == 'video':
            return self.extract_video_metadata(file_path)
        elif asset_type == '3d':
            return self.extract_3d_metadata(file_path)
        else:
            return {'error': f'Unknown asset type: {asset_type}'}

    def generate_thumbnail(self, file_path: str, output_path: str, asset_type: str) -> bool:
        if asset_type == 'image':
            return self.generate_image_thumbnail(file_path, output_path)
        elif asset_type == 'video':
            return self.generate_video_thumbnail(file_path, output_path)
        elif asset_type == '3d':
            print("3d thumbnail not implemented yet")
            return False
        else:
            return False

    def format_duration(self, seconds: float) -> str:
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        sec = int(seconds % 60)

        if hours > 0:
            return f'{hours:02d}:{minutes:02d}:{sec:02d}'
        else:
            return f'{minutes:02d}:{sec:02d}'
