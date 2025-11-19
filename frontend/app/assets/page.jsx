// frontend/app/assets/page.js

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SimpleGrid, Box, Button, HStack, Heading, Spinner, Center, Text } from '@chakra-ui/react';
import SearchBar from '../../components/search_bar';
import AssetCard from '../../components/asset_card';
import { getAssets } from '../../lib/api_client';

export default function AssetGalleryPage() {
  const [assets, setAssets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('viewer');
  const router = useRouter();

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Get user role
    const userRole = localStorage.getItem('role') || 'viewer';
    setRole(userRole);

    // Fetch assets
    getAssets()
      .then(data => {
        setAssets(data.results || data);
        setFiltered(data.results || data);
      })
      .catch(err => {
        console.error('Error fetching assets:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFiltered(assets);
      return;
    }

    const lower = query.toLowerCase();
    setFiltered(
      assets.filter(a =>
        a.name.toLowerCase().includes(lower) ||
        (a.tags && a.tags.some(t => t.tag?.toLowerCase().includes(lower)))
      )
    );
  };

  if (loading) {
    return (
      <Center h="80vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box p={8}>
      <Heading mb={6}>Asset Gallery</Heading>

      <HStack mb={6} justify="space-between">
        <SearchBar onSearch={handleSearch} />

        {(role === 'editor' || role === 'admin') && (
          <Button colorScheme="green" onClick={() => router.push('/assets/upload/page')}>
            + Upload Asset
          </Button>
        )}
      </HStack>

      {filtered.length === 0 ? (
        <Center h="50vh">
          <Text color="gray.500" fontSize="lg">
            No assets found. {(role === 'editor' || role === 'admin') && 'Upload your first asset!'}
          </Text>
        </Center>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filtered.map(asset => (
            <AssetCard key={asset.id} asset={asset} canEdit={role === 'editor' || role === 'admin'} />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}