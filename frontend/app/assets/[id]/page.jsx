'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Heading, Text, Image, Spinner, Center, Button, VStack, Badge, HStack, Table, Tbody, Tr, Td } from '@chakra-ui/react';
import { Engine, Scene } from 'react-babylonjs';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { getAsset, updateAsset, deleteAsset } from '../../../lib/api_client';

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params || {};

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
      const userRole = localStorage.getItem('role');
      setRole(userRole);
    }, []);

  useEffect(() => {
    if (!id) return;

    let mounted = true;
    setLoading(true);
    getAsset(id)
      .then(data => {
        if (!mounted) return;
        setAsset(data);
      })
      .catch(err => {
        console.error('Failed to load asset:', err);
        setError(err.message || 'Failed to load asset');
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [id]);

  const handleEdit = async () => {
    try {
      const newName = prompt('Enter new name for asset:', asset.name);
      if (newName && newName !== asset.name) {
        await updateAsset(asset.id, { name: newName });
        // Refresh the page to show changes
        window.location.reload();
      }
    } catch (error) {
      console.error('Edit failed:', error);
      alert('Failed to update asset');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${asset.name}"?`)) return;
    
    try {
      await deleteAsset(asset.id);
      // Redirect back to dashboard after deletion
      router.push('/dashboard');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete asset');
    }
  };

  if (loading) return (
    <Center h="70vh"><Spinner size="xl" /></Center>
  );

  if (error) return (
    <Center h="70vh"><VStack>
      <Text color="red.500">{error}</Text>
      <Button onClick={() => router.push('/dashboard')}>Back to Gallery</Button>
    </VStack></Center>
  );

  if (!asset) return (
    <Center h="70vh"><Text>No asset found.</Text></Center>
  );

  return (
    <Box p={8} maxW="900px" mx="auto">
      <Heading mb={4}>{asset.name}</Heading>
      <Badge mb={2} colorScheme="gray">{asset.type}</Badge>

      {asset.type === 'image' && (
        <Image src={`http://localhost:8000${asset.url}`} alt={asset.name} borderRadius="md" mb={4} width="100%" />
      )}

      {asset.type === 'video' && (
        <Box mb={4}>
          <video src={`http://localhost:8000${asset.url}`} controls style={{ width: '100%', borderRadius: 8 }} />
        </Box>
      )}

      {asset.type === '3d' && (
        <Box mb={4} height="400px" borderRadius="md" overflow="hidden">
          <Engine antialias adaptToDeviceRatio canvasId="babylonJS">
            <Scene>
              <arcRotateCamera
                name="camera1"
                target={Vector3.Zero()}
                alpha={Math.PI / 2}
                beta={Math.PI / 4}
                radius={5}
              />
              <hemisphericLight name="light1" intensity={0.7} direction={Vector3.Up()} />
            </Scene>
          </Engine>
        </Box>
      )}

      <HStack spacing={3} mb={4}>
        <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        
        {/* Show Edit and Delete buttons ONLY for editors */}
        {role === 'editor' && (
          <>
            <Button colorPalette="blue" onClick={handleEdit}>
              Edit Asset
            </Button>
            <Button colorPalette="red" variant="outline" onClick={handleDelete}>
              Delete Asset
            </Button>
          </>
        )}
      </HStack>

      <Box mb={8} p={5} borderWidth="1px" borderRadius="lg">
        <Heading size="md" mb={4}>Details</Heading>
        <Table variant="simple" size="sm">
          <Tbody>
            <Tr><Td fontWeight="bold" width="150px">Name</Td><Td>{asset.name}</Td></Tr>
            <Tr><Td fontWeight="bold">File Size</Td><Td>{asset.file_size || '—'}</Td></Tr>
            <Tr><Td fontWeight="bold">Dimensions</Td><Td>{asset.width && asset.height ? `${asset.width} x ${asset.height}` : '—'}</Td></Tr>
            {asset.duration && (
              <Tr><Td fontWeight="bold">Duration</Td><Td>{asset.duration.toFixed(2)}s</Td></Tr>
            )}
            {asset.metadata && asset.metadata.format && (
              <Tr><Td fontWeight="bold">Format</Td><Td>{asset.metadata.format}</Td></Tr>
            )}
            {asset.metadata && asset.metadata.fps && (
              <Tr><Td fontWeight="bold">FPS</Td><Td>{asset.metadata.fps.toFixed(2)}</Td></Tr>
            )}
            <Tr><Td fontWeight="bold">Uploaded</Td><Td>{new Date(asset.created_at || asset.created || '').toLocaleString()}</Td></Tr>
            <Tr><Td fontWeight="bold">Uploaded By</Td><Td>{asset.uploaded_by || '—'}</Td></Tr>
            <Tr><Td fontWeight="bold">Tags</Td><Td>{asset.tags && asset.tags.length ? asset.tags.map(t => t.tag).join(', ') : '—'}</Td></Tr>
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}