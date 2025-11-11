// assets/upload/asset_upload_page.jsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {Box, Button, Input, VStack, Heading, Text, Spinner, Alert, AlertIcon} from '@chakra-ui/react';
import UploadDropZone from '../../components/upload_drop_zone';

export default function AssetUploadPage() {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleUpload = async () => {
    if (!file || !name) return;

    setLoading(true);
    const token = localStorage.getItem('token');

    // Step 1: Create group
    const groupRes = await fetch('http://localhost:8000/api/assets/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({ name, asset_type: 'image' })
    });
    const group = await groupRes.json();

    // Step 2: Upload file
    const form = new FormData();
    form.append('file', file);
    form.append('change_notes', 'Uploaded from frontend');

    const uploadRes = await fetch(`http://localhost:8000/api/assets/${group.id}/upload_version/`, {
      method: 'POST',
      headers: { 'Authorization': `Token ${token}` },
      body: form
    });

    if (uploadRes.ok) {
      router.push('/assets');
    } else {
      setError('Upload failed');
    }
    setLoading(false);
  };

  return (
    <Box maxW="2xl" mx="auto" p={8}>
        <Heading mb={6}>Upload New Asset</Heading>

        <VStack spacing={6}>
            <Input
            placeholder="Asset Name (e.g. Hero Banner)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            />

            <UploadDropZone onFileDrop={setFile} />

            {file && <Text>Selected: <strong>{file.name}</strong></Text>}

            <Button
            colorScheme="blue"
            size="lg"
            onClick={handleUpload}
            isLoading={loading}
            isDisabled={!file || !name}
            >
            Upload Asset
            </Button>

            {error && <Alert status="error"><AlertIcon />{error}</Alert>}
        </VStack>
    </Box>
  );
}