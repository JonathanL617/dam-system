# backend/assets/tests.py

from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth.models import User
from pathlib import Path
import tempfile
import shutil
from PIL import Image
import io

from .models import AssetGroup, Asset, AssetTag
from .utils.file_handler import FileUploadHandler
from .utils.metadata_extractor import MetadataExtractor
from .utils.asset_operations import AssetManager
from .utils.asset_retrieval import AssetRetriever
from .utils.search_filter_engine import SearchEngine


class FileHandlerTestCase(TestCase):
    """Test FileUploadHandler functionality"""
    
    def setUp(self):
        """Set up test environment"""
        # Create temporary media directory for testing
        self.test_media_dir = tempfile.mkdtemp()
        self.handler = FileUploadHandler(media_path=self.test_media_dir)
    
    def tearDown(self):
        """Clean up after tests"""
        # Remove test media directory
        shutil.rmtree(self.test_media_dir, ignore_errors=True)
    
    def test_validate_image_file(self):
        """Test image file validation"""
        is_valid, asset_type, error = self.handler.validate_file('test.jpg', 5 * 1024 * 1024)
        self.assertTrue(is_valid)
        self.assertEqual(asset_type, 'image')
        self.assertEqual(error, '')
    
    def test_validate_invalid_extension(self):
        """Test invalid file extension"""
        is_valid, asset_type, error = self.handler.validate_file('test.pdf', 1024)
        self.assertFalse(is_valid)
        self.assertIn('not allowed', error)
    
    def test_validate_file_too_large(self):
        """Test file size validation"""
        # 100 MB image (exceeds 50 MB limit)
        is_valid, asset_type, error = self.handler.validate_file('test.jpg', 100 * 1024 * 1024)
        self.assertFalse(is_valid)
        self.assertIn('too large', error)
    
    def test_generate_unique_filename(self):
        """Test unique filename generation"""
        filename1 = self.handler.generate_unique_filename('photo.jpg', 'image')
        filename2 = self.handler.generate_unique_filename('photo.jpg', 'image')
        
        # Should be different
        self.assertNotEqual(filename1, filename2)
        # Should contain original name
        self.assertIn('photo', filename1)
        # Should have extension
        self.assertTrue(filename1.endswith('.jpg'))
    
    def test_save_file_bytes(self):
        """Test saving file from bytes"""
        test_data = b"Test image data content"
        success, file_info, error = self.handler.save_file(
            test_data, 
            'test_image.jpg', 
            'image'
        )
        
        self.assertTrue(success)
        self.assertEqual(error, '')
        self.assertIn('stored_filename', file_info)
        self.assertEqual(file_info['file_size'], len(test_data))
        
        # Verify file exists
        file_path = Path(file_info['file_path'])
        self.assertTrue(file_path.exists())
    
    def test_delete_file(self):
        """Test file deletion"""
        # Create a test file first
        test_data = b"Test data"
        success, file_info, _ = self.handler.save_file(test_data, 'test.jpg', 'image')
        
        # Delete it
        deleted, error = self.handler.delete_file(file_info['file_path'])
        
        self.assertTrue(deleted)
        self.assertEqual(error, '')
        # Verify file no longer exists
        self.assertFalse(Path(file_info['file_path']).exists())


class MetadataExtractorTestCase(TestCase):
    """Test MetadataExtractor functionality"""
    
    def setUp(self):
        """Set up test environment"""
        self.test_media_dir = tempfile.mkdtemp()
        self.extractor = MetadataExtractor()
    
    def tearDown(self):
        """Clean up"""
        shutil.rmtree(self.test_media_dir, ignore_errors=True)
    
    def create_test_image(self, filename='test.jpg', size=(800, 600)):
        """Helper: Create a test image file"""
        # Create image in memory
        img = Image.new('RGB', size, color='red')
        
        # Save to temp directory
        filepath = Path(self.test_media_dir) / filename
        img.save(filepath, 'JPEG')
        
        return str(filepath)
    
    def test_extract_image_metadata(self):
        """Test image metadata extraction"""
        image_path = self.create_test_image(size=(1920, 1080))
        
        metadata = self.extractor.extract_image_metadata(image_path)
        
        self.assertNotIn('error', metadata)
        self.assertEqual(metadata['width'], 1920)
        self.assertEqual(metadata['height'], 1080)
        self.assertEqual(metadata['format'], 'JPEG')
        self.assertIn('file_size', metadata)
        self.assertIn('aspect_ratio', metadata)
    
    def test_extract_metadata_generic(self):
        """Test generic extract_metadata method"""
        image_path = self.create_test_image()
        
        metadata = self.extractor.extract_metadata(image_path, 'image')
        
        self.assertNotIn('error', metadata)
        self.assertIn('width', metadata)
        self.assertIn('height', metadata)
    
    def test_generate_image_thumbnail(self):
        """Test thumbnail generation"""
        image_path = self.create_test_image(size=(1920, 1080))
        thumbnail_path = str(Path(self.test_media_dir) / 'thumb.jpg')
        
        success = self.extractor.generate_image_thumbnail(image_path, thumbnail_path)
        
        self.assertTrue(success)
        self.assertTrue(Path(thumbnail_path).exists())
        
        # Verify thumbnail size
        with Image.open(thumbnail_path) as thumb:
            self.assertLessEqual(thumb.width, 200)
            self.assertLessEqual(thumb.height, 200)


class AssetModelTestCase(TestCase):
    """Test Django models"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_create_asset_group(self):
        """Test creating AssetGroup"""
        group = AssetGroup.objects.create(
            name='TestAsset',
            asset_type='image',
            created_by='testuser'
        )
        
        self.assertEqual(group.name, 'TestAsset')
        self.assertEqual(group.asset_type, 'image')
        self.assertIsNotNone(group.created_at)
    
    def test_create_asset_version(self):
        """Test creating Asset version"""
        group = AssetGroup.objects.create(
            name='TestAsset',
            asset_type='image',
            created_by='testuser'
        )
        
        asset = Asset.objects.create(
            asset_group=group,
            version_number=1,
            filename='test.jpg',
            file_path='/media/test.jpg',
            file_size=1024000,
            file_type='image',
            uploaded_by='testuser'
        )
        
        self.assertEqual(asset.version_number, 1)
        self.assertEqual(asset.asset_group, group)
        self.assertIsNotNone(asset.uploaded_at)
    
    def test_asset_tags(self):
        """Test AssetTag creation"""
        group = AssetGroup.objects.create(
            name='TestAsset',
            asset_type='image',
            created_by='testuser'
        )
        
        tag1 = AssetTag.objects.create(asset_group=group, tag='featured')
        tag2 = AssetTag.objects.create(asset_group=group, tag='product')
        
        tags = AssetTag.objects.filter(asset_group=group)
        self.assertEqual(tags.count(), 2)


class AssetManagerTestCase(TestCase):
    """Test AssetManager CRUD operations"""
    
    def setUp(self):
        """Set up test environment"""
        self.test_media_dir = tempfile.mkdtemp()
        self.manager = AssetManager()
        self.handler = FileUploadHandler(media_path=self.test_media_dir)
    
    def tearDown(self):
        """Clean up"""
        shutil.rmtree(self.test_media_dir, ignore_errors=True)
    
    def get_test_file_info(self):
        """Helper: Get test file info"""
        test_data = b"Test image data"
        success, file_info, _ = self.handler.save_file(
            test_data, 
            'test.jpg', 
            'image'
        )
        return file_info
    
    def test_create_asset(self):
        """Test creating new asset"""
        file_info = self.get_test_file_info()
        metadata = {'width': 1920, 'height': 1080}
        
        asset_id = self.manager.create_asset(
            name='TestAsset',
            asset_type='image',
            file_info=file_info,
            metadata=metadata,
            user='testuser'
        )
        
        self.assertIsNotNone(asset_id)
        
        # Verify asset was created
        group = AssetGroup.objects.get(id=asset_id)
        self.assertEqual(group.name, 'TestAsset')
        self.assertEqual(group.asset_type, 'image')
        
        # Verify version was created
        versions = Asset.objects.filter(asset_group=group)
        self.assertEqual(versions.count(), 1)
        self.assertEqual(versions.first().version_number, 1)
    
    def test_create_new_version(self):
        """Test creating new version of existing asset"""
        # Create initial asset
        file_info1 = self.get_test_file_info()
        asset_id = self.manager.create_asset(
            name='TestAsset',
            asset_type='image',
            file_info=file_info1,
            metadata={'width': 1920, 'height': 1080},
            user='testuser'
        )
        
        # Create new version
        file_info2 = self.get_test_file_info()
        version_id = self.manager.create_new_version(
            asset_group_id=asset_id,
            file_info=file_info2,
            metadata={'width': 3840, 'height': 2160},
            user='testuser',
            change_notes='Upgraded to 4K'
        )
        
        self.assertIsNotNone(version_id)
        
        # Verify we have 2 versions
        versions = Asset.objects.filter(asset_group_id=asset_id)
        self.assertEqual(versions.count(), 2)
        
        # Verify latest version
        latest = versions.order_by('-version_number').first()
        self.assertEqual(latest.version_number, 2)
        self.assertEqual(latest.change_notes, 'Upgraded to 4K')
    
    def test_add_tags(self):
        """Test adding tags to asset"""
        file_info = self.get_test_file_info()
        asset_id = self.manager.create_asset(
            name='TestAsset',
            asset_type='image',
            file_info=file_info,
            metadata={},
            user='testuser'
        )
        
        # Add tags
        success = self.manager.add_tags(asset_id, ['featured', 'product', 'homepage'])
        self.assertTrue(success)
        
        # Verify tags
        tags = AssetTag.objects.filter(asset_group_id=asset_id)
        self.assertEqual(tags.count(), 3)
    
    def test_remove_tags(self):
        """Test removing tags"""
        file_info = self.get_test_file_info()
        asset_id = self.manager.create_asset(
            name='TestAsset',
            asset_type='image',
            file_info=file_info,
            metadata={},
            user='testuser'
        )
        
        # Add tags
        self.manager.add_tags(asset_id, ['featured', 'product', 'homepage'])
        
        # Remove one tag
        success = self.manager.remove_tags(asset_id, ['product'])
        self.assertTrue(success)
        
        # Verify
        tags = AssetTag.objects.filter(asset_group_id=asset_id)
        self.assertEqual(tags.count(), 2)
        self.assertFalse(tags.filter(tag='product').exists())
    
    def test_delete_asset(self):
        """Test deleting entire asset"""
        file_info = self.get_test_file_info()
        asset_id = self.manager.create_asset(
            name='TestAsset',
            asset_type='image',
            file_info=file_info,
            metadata={},
            user='testuser'
        )
        
        # Delete asset
        success = self.manager.delete_asset(asset_id)
        self.assertTrue(success)
        
        # Verify deleted
        self.assertFalse(AssetGroup.objects.filter(id=asset_id).exists())
        self.assertFalse(Asset.objects.filter(asset_group_id=asset_id).exists())


class AssetRetrieverTestCase(TestCase):
    """Test AssetRetriever functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.test_media_dir = tempfile.mkdtemp()
        self.manager = AssetManager()
        self.retriever = AssetRetriever()
        self.handler = FileUploadHandler(media_path=self.test_media_dir)
        
        # Create test assets
        self.asset_ids = []
        for i in range(5):
            test_data = f"Test data {i}".encode()
            success, file_info, _ = self.handler.save_file(
                test_data, 
                f'test{i}.jpg', 
                'image'
            )
            
            asset_id = self.manager.create_asset(
                name=f'TestAsset{i}',
                asset_type='image',
                file_info=file_info,
                metadata={'width': 1920, 'height': 1080},
                user='testuser'
            )
            self.asset_ids.append(asset_id)
    
    def tearDown(self):
        """Clean up"""
        shutil.rmtree(self.test_media_dir, ignore_errors=True)
    
    def test_get_asset_by_id(self):
        """Test retrieving asset by ID"""
        asset = self.retriever.get_asset_by_id(self.asset_ids[0])
        
        self.assertIsNotNone(asset)
        self.assertEqual(asset['name'], 'TestAsset0')
        self.assertIn('filename', asset)
        self.assertIn('file_path', asset)
    
    def test_get_all_assets(self):
        """Test retrieving all assets with pagination"""
        assets, total = self.retriever.get_all_assets(limit=10, offset=0)
        
        self.assertEqual(total, 5)
        self.assertEqual(len(assets), 5)
    
    def test_get_all_versions(self):
        """Test retrieving all versions of an asset"""
        # Create additional version
        test_data = b"New version"
        success, file_info, _ = self.handler.save_file(test_data, 'test_v2.jpg', 'image')
        
        self.manager.create_new_version(
            asset_group_id=self.asset_ids[0],
            file_info=file_info,
            metadata={'width': 3840, 'height': 2160},
            user='testuser',
            change_notes='Version 2'
        )
        
        versions = self.retriever.get_all_versions(self.asset_ids[0])
        
        self.assertEqual(len(versions), 2)
        self.assertEqual(versions[0]['version_number'], 2)  # Latest first


class SearchEngineTestCase(TestCase):
    """Test SearchEngine functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.test_media_dir = tempfile.mkdtemp()
        self.manager = AssetManager()
        self.search = SearchEngine()
        self.handler = FileUploadHandler(media_path=self.test_media_dir)
        
        # Create test assets
        test_data = b"Test data"
        
        # Image asset
        success, file_info, _ = self.handler.save_file(test_data, 'photo.jpg', 'image')
        self.image_id = self.manager.create_asset(
            name='ProductPhoto',
            asset_type='image',
            file_info=file_info,
            metadata={},
            user='testuser'
        )
        self.manager.add_tags(self.image_id, ['product', 'featured'])
        
        # Video asset
        success, file_info, _ = self.handler.save_file(test_data, 'demo.mp4', 'video')
        self.video_id = self.manager.create_asset(
            name='DemoVideo',
            asset_type='video',
            file_info=file_info,
            metadata={},
            user='testuser'
        )
    
    def tearDown(self):
        """Clean up"""
        shutil.rmtree(self.test_media_dir, ignore_errors=True)
    
    def test_search_by_filename(self):
        """Test search by filename"""
        results = self.search.search_by_filename('Product')
        
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['name'], 'ProductPhoto')
    
    def test_filter_by_type(self):
        """Test filter by asset type"""
        results = self.search.filter_by_type('image')
        
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['asset_type'], 'image')
    
    def test_search_by_tags(self):
        """Test search by tags"""
        results = self.search.search_by_tags(['featured'])
        
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['name'], 'ProductPhoto')


# ============================================
# INTEGRATION TEST
# ============================================

class IntegrationTestCase(TestCase):
    """End-to-end integration test"""
    
    def setUp(self):
        """Set up complete test environment"""
        self.test_media_dir = tempfile.mkdtemp()
        self.handler = FileUploadHandler(media_path=self.test_media_dir)
        self.extractor = MetadataExtractor()
        self.manager = AssetManager()
        self.retriever = AssetRetriever()
        self.search = SearchEngine()
    
    def tearDown(self):
        """Clean up"""
        shutil.rmtree(self.test_media_dir, ignore_errors=True)
    
    def test_complete_workflow(self):
        """Test complete asset upload and retrieval workflow"""
        
        # Step 1: Create test image
        img = Image.new('RGB', (1920, 1080), color='blue')
        img_buffer = io.BytesIO()
        img.save(img_buffer, 'JPEG')
        img_buffer.seek(0)
        
        # Step 2: Validate and save file
        is_valid, asset_type, error = self.handler.validate_file('photo.jpg', len(img_buffer.getvalue()))
        self.assertTrue(is_valid)
        
        success, file_info, error = self.handler.save_file(
            img_buffer.getvalue(),
            'test_photo.jpg',
            'image'
        )
        self.assertTrue(success)
        
        # Step 3: Extract metadata
        metadata = self.extractor.extract_image_metadata(file_info['file_path'])
        self.assertEqual(metadata['width'], 1920)
        self.assertEqual(metadata['height'], 1080)
        
        # Step 4: Create asset in database
        asset_id = self.manager.create_asset(
            name='IntegrationTestAsset',
            asset_type='image',
            file_info=file_info,
            metadata=metadata,
            user='testuser'
        )
        self.assertIsNotNone(asset_id)
        
        # Step 5: Add tags
        self.manager.add_tags(asset_id, ['test', 'integration'])
        
        # Step 6: Retrieve asset
        asset = self.retriever.get_asset_by_id(asset_id)
        self.assertEqual(asset['name'], 'IntegrationTestAsset')
        
        # Step 7: Search for asset
        results = self.search.search_by_filename('Integration')
        self.assertEqual(len(results), 1)
        
        # Step 8: Search by tags
        tag_results = self.search.search_by_tags(['integration'])
        self.assertEqual(len(tag_results), 1)
        
        print("\n✅ Complete workflow test passed!")
        print(f"   Created asset: {asset['name']}")
        print(f"   File: {asset['filename']}")
        print(f"   Size: {metadata['width']}x{metadata['height']}")
        print(f"   Tags: test, integration")