'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Heading, Text, Image, Spinner, Center, Button, VStack, Badge } from '@chakra-ui/react';
import { Engine, Scene } from 'react-babylonjs';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { getAsset } from '../../../lib/api_client';

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params || {};

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return (
    <Center h="70vh"><Spinner size="xl"/></Center>
  );

  if (error) return (
    <Center h="70vh"><VStack>
      <Text color="red.500">{error}</Text>
      <Button onClick={() => router.push('/assets')}>Back to Gallery</Button>
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
        <Image src={asset.url} alt={asset.name} borderRadius="md" mb={4} width="100%" />
      )}

      {asset.type === 'video' && (
        <Box mb={4}>
          <video src={asset.url} controls style={{ width: '100%', borderRadius: 8 }} />
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

      <Box mb={4}>
        <Heading size="md" mb={2}>Details</Heading>
        <Text><strong>Name:</strong> {asset.name}</Text>
        <Text><strong>Description:</strong> {asset.description || '—'}</Text>
        <Text><strong>Uploaded:</strong> {new Date(asset.created_at || asset.created || '').toLocaleString()}</Text>
        <Text><strong>Tags:</strong> {asset.tags && asset.tags.length ? asset.tags.map(t => t.tag).join(', ') : '—'}</Text>
      </Box>

      <Button onClick={() => router.push('/assets')}>Back to Gallery</Button>
    </Box>
  );
}