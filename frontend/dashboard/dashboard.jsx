"use client"; 

import { useEEfect, useState } from "react";
import { Box, Heading, Text, Spinner, Grid, GridItem, Image, Tag} from "@chakra-ui/react";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function DashboardPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAssets() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/assets/`);
        if (!response.ok) throw new Error("Failed to fetch assets");
        const data = await response.json();
        setAssets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAssets();
  }, []);

    if (loading) {
    return (
      <Box minH="100vh" display="flex" justifyContent="center" alignItems="center" bgGradient="linear(to-r, #74ebd5, #acb6e5)">
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" display="flex" justifyContent="center" alignItems="center" bgGradient="linear(to-r, #74ebd5, #acb6e5)">
        <Text color="red.500" fontSize="lg">Error: {error}</Text>
      </Box>
    );
  }

  return (
    <Box minH="100vh" p={8} bgGradient="linear(to-r, #74ebd5, #acb6e5)">
      <Heading mb={6} color="gray.800" fontFamily="Poppins">📁 Digital Asset Dashboard</Heading>

      {assets.length === 0 ? (
        <Text color="gray.600" fontSize="lg">No assets found. Upload some to get started!</Text>
      ) : (
        <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
          {assets.map((asset) => (
            <GridItem key={asset.id} bg="white" borderRadius="2xl" boxShadow="md" p={4} transition="0.3s" _hover={{ boxShadow: "xl" }}>
              {asset.preview_url ? (
                <Image src={asset.preview_url} alt={asset.name} borderRadius="xl" mb={3} />
              ) : (
                <Box bg="gray.100" h="150px" borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
                  <Text color="gray.500">No Preview</Text>
                </Box>
              )}
              <Text fontWeight="bold" color="gray.800">{asset.name}</Text>
              <Text fontSize="sm" color="gray.500">{new Date(asset.created_at).toLocaleDateString()}</Text>
              <Box mt={2}>
                {asset.tags && asset.tags.map((tag, i) => (
                  <Tag key={i} size="sm" colorScheme="blue" mr={1}>{tag}</Tag>
                ))}
              </Box>
            </GridItem>
          ))}
        </Grid>
      )}
    </Box>
  );
}

