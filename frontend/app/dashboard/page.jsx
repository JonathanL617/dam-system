"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Heading, Text, Button, Flex, SimpleGrid, Center, Spinner, VStack } from '@chakra-ui/react';
import SearchBar from '../../components/search_bar';
import AssetCard from '../../components/asset_card';
import AssetPreview from '../../AssetPreview';
import { getAssets } from '../../lib/api_client';

export default function Dashboard() {
  const [assets, setAssets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Simple demo fallback data so dashboard always shows something
  const demoAssets = [
    { id: 'demo-1', name: 'Sample Image', type: 'image', url: '/vercel.svg', tags: [{ tag: 'sample' }] },
    { id: 'demo-2', name: 'Sample Video', type: 'video', url: '', tags: [{ tag: 'video' }] },
    { id: 'demo-3', name: '3D Model Demo', type: '3d', url: '', tags: [{ tag: '3d' }] },
  ];

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      // allow dev-auto-login helper or redirect to login
      // if user intentionally uses demo, they can stay on dashboard
      // router.push('/login');
    }

    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAssets();
      const list = res && (res.results || res) || [];
      if (!Array.isArray(list)) {
        setAssets(demoAssets);
        setFiltered(demoAssets);
      } else if (list.length === 0) {
        // if API responded but empty, use demo data to show UI
        setAssets(demoAssets);
        setFiltered(demoAssets);
      } else {
        setAssets(list);
        setFiltered(list);
      }
    } catch (err) {
      console.error('Failed to load assets, falling back to demo data', err);
      setAssets(demoAssets);
      setFiltered(demoAssets);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (q) => {
    try {
      if (!q || !q.trim()) return setFiltered(assets);
      const low = q.toLowerCase();
      setFiltered(
        assets.filter(a => (a.name || '').toLowerCase().includes(low) || (a.tags || []).some(t => (t.tag || '').toLowerCase().includes(low)))
      );
    } catch (e) {
      console.error('Search error', e);
      setFiltered(assets);
    }
  };

  // Viewer state: open a central preview modal from the dashboard
  const [selectedAsset, setSelectedAsset] = useState(null);
  const openViewer = (asset) => setSelectedAsset(asset);
  const closeViewer = () => setSelectedAsset(null);

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Viewer Dashboard</Heading>
        <Button variant="ghost" onClick={() => { localStorage.removeItem('token'); router.push('/login'); }}>Logout</Button>
      </Flex>

      <Box mb={4}>
        <SearchBar onSearch={handleSearch} />
      </Box>

      {loading ? (
        <Center py={12}><Spinner size="lg" /></Center>
      ) : (
        <VStack align="stretch" spacing={4}>
          {error && <Text color="red.500">Failed to load assets: {error}</Text>}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filtered.map(a => <AssetCard key={a.id} asset={a} onOpen={openViewer} />)}
          </SimpleGrid>
          {selectedAsset && (
            <AssetPreview asset={selectedAsset} onClose={closeViewer} />
          )}
        </VStack>
      )}
    </Box>
  );
}