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

  useEffect(() => {
    async function fetchAssets() {
      const token = localStorage.getItem("token");

      if (!token) {
        // Redirect to login if not logged in
        window.location.href = "/login";
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/assets/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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

        <Text mb={4} fontSize="md" color="gray.700">
        Logged in as: <b>{role || "Unknown"}</b>
      </Text>

      {role === "Admin" && (
        <Box mb={6} p={4} bg="whiteAlpha.800" borderRadius="xl" boxShadow="md">
          <Heading size="sm" mb={2}>Admin Controls</Heading>
          <Text color="gray.600">You have full access to upload, delete, and manage assets.</Text>
        </Box>
      )}

      {role === "Editor" && (
        <Box mb={6} p={4} bg="whiteAlpha.800" borderRadius="xl" boxShadow="md">
          <Heading size="sm" mb={2}>Editor Tools</Heading>
          <Text color="gray.600">You can upload and edit assets.</Text>
        </Box>
      )}

        const [uploading, setUploading] = useState(false);

          async function handleUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      // Optionally fetch new assets after upload
      const newAsset = await response.json();
      setAssets((prev) => [...prev, newAsset]);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  }

        {(role === "Admin" || role === "Editor") && (
        <Box
          mb={8}
          p={6}
          border="2px dashed #3498db"
          borderRadius="2xl"
          textAlign="center"
          bg="whiteAlpha.800"
          _hover={{ bg: "whiteAlpha.900" }}
        >
          <Text mb={3} fontWeight="semibold" color="gray.700">
            Drag & Drop files here or click to upload
          </Text>
          <input
            type="file"
            onChange={handleUpload}
            style={{ opacity: 0, position: "absolute", width: "100%", height: "100%", cursor: "pointer" }}
          />
          {uploading && (
            <Text mt={2} color="blue.500" fontSize="sm">
              Uploading...
            </Text>
          )}
        </Box>
      )}





