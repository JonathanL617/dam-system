// assets/upload/asset_upload_page.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Input, VStack, Heading, Text } from '@chakra-ui/react';
import { ArrowLeft } from 'react-feather';

import UploadDropZone from '@/components/upload_drop_zone';

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
    const form = new FormData();
    form.append('name', name);
    form.append('file', file);
    form.append('change_notes', 'Initial upload from frontend');

    const res = await fetch('http://localhost:8000/api/assets/upload/', {
      method: 'POST',
      headers: { 'Authorization': `Token ${token}` },
      body: form
    });

    if (res.ok) {
      router.push('/assets');
    } else {
      const data = await res.json();
      setError(data.error || 'Upload failed');
    }
    setLoading(false);
  };

  return (
    <Box maxW="2xl" mx="auto" p={8}>
      <Button
        leftIcon={<ArrowLeft size={16} />}
        colorPalette={"black"}
        mb={4}
        onClick={() => router.back()}
      >
        Back
      </Button>

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

        {error && (
          <Box p={4} bg="red.100" color="red.700" borderRadius="md" width="100%">
            {error}
          </Box>
        )}
      </VStack>
    </Box>
  );
}