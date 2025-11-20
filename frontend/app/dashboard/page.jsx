"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Spinner,
  Grid,
  GridItem,
  Image,
  Tag,
  Flex,
  Button,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody
} from "@chakra-ui/react";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function DashboardPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState("Viewer"); // Admin / Editor / Viewer
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [sortBy, setSortBy] = useState("created_at");

  // Fetch assets
  useEffect(() => {
    async function fetchAssets() {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/assets/`, {
          headers: { Authorization: `Bearer ${token}` },
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

  // Upload handler (Admin & Editor)
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
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const newAsset = await response.json();
      setAssets((prev) => [...prev, newAsset]);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  }

  // Modal handlers
  const openModal = (asset) => { setSelectedAsset(asset); setIsOpen(true); };
  const closeModal = () => { setSelectedAsset(null); setIsOpen(false); };

  // Pagination & Sorting
  const sortedAssets = [...assets].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "created_at") return new Date(b.created_at) - new Date(a.created_at);
    return 0;
  });
  const totalPages = Math.ceil(sortedAssets.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAssets = sortedAssets.slice(indexOfFirstItem, indexOfLastItem);
  const handlePageChange = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };

  if (loading) return (
    <Box minH="100vh" display="flex" justifyContent="center" alignItems="center" bgGradient="linear(to-r, #74ebd5, #acb6e5)">
      <Spinner size="xl" color="blue.500" />
    </Box>
  );

  if (error) return (
    <Box minH="100vh" display="flex" justifyContent="center" alignItems="center" bgGradient="linear(to-r, #74ebd5, #acb6e5)">
      <Text color="red.500" fontSize="lg">Error: {error}</Text>
    </Box>
  );

  return (
    <Box minH="100vh" p={8} bgGradient="linear(to-r, #74ebd5, #acb6e5)">
      <Heading mb={6} color="gray.800" fontFamily="Poppins">📁 Digital Asset Dashboard</Heading>

      {/* Role info */}
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

      {role === "Viewer" && (
        <Box mb={6} p={4} bg="whiteAlpha.800" borderRadius="xl" boxShadow="md">
          <Heading size="sm" mb={2}>Viewer Dashboard</Heading>
          <Text color="gray.600">You can view all assets but cannot upload or edit them.</Text>
        </Box>
      )}

      {/* Upload section for Admin & Editor */}
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

      {/* Search */}
      <Box mb={6}>
        <Input
          type="text"
          placeholder="Search by name or tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      {/* Sorting */}
      <Box mb={4} display="flex" justifyContent="flex-end" alignItems="center">
        <Text fontSize="sm" mr={2}>Sort by:</Text>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #ccc", cursor: "pointer" }}
        >
          <option value="created_at">Upload Date</option>
          <option value="name">Name</option>
        </select>
      </Box>

      {/* Asset Grid */}
      {currentAssets.length === 0 ? (
        <Text color="gray.600" fontSize="lg">No assets found.</Text>
      ) : (
        <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
          {currentAssets
            .filter(asset => {
              const query = searchQuery.toLowerCase();
              return asset.name.toLowerCase().includes(query) || (asset.tags && asset.tags.some(tag => tag.toLowerCase().includes(query)));
            })
            .map((asset) => (
              <GridItem
                key={asset.id}
                bg="white"
                borderRadius="2xl"
                boxShadow="md"
                p={4}
                cursor="pointer"
                transition="0.3s"
                _hover={{ boxShadow: "xl", transform: "translateY(-4px)" }}
                onClick={() => openModal(asset)}
              >
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
                  {asset.tags && asset.tags.map((tag, i) => <Tag key={i} size="sm" colorScheme="blue" mr={1}>{tag}</Tag>)}
                </Box>
              </GridItem>
            ))}
        </Grid>
      )}

      {/* Pagination */}
      <Box mt={6} display="flex" justifyContent="center" alignItems="center">
        <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} mr={2}>
          Prev
        </Button>
        <Text mx={2} fontSize="sm">Page {currentPage} of {totalPages}</Text>
        <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} ml={2}>
          Next
        </Button>
      </Box>

      {/* Asset Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} size="4xl" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl" p={4}>
          <ModalHeader>{selectedAsset?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" alignItems="center">
            {selectedAsset?.preview_url && (
              <>
                {selectedAsset.name.match(/\.(jpg|jpeg|png|gif)$/i) && <Image src={selectedAsset.preview_url} alt={selectedAsset.name} maxH="60vh" borderRadius="lg" mb={3} />}
                {selectedAsset.name.match(/\.(mp4|webm|ogg)$/i) && <video src={selectedAsset.preview_url} controls style={{ maxHeight: "60vh", borderRadius: "12px", marginBottom: "12px" }} />}
                {selectedAsset.name.match(/\.(pdf)$/i) && <iframe src={selectedAsset.preview_url} width="100%" height="500px" style={{ borderRadius: "12px" }}></iframe>}
              </>
            )}
            <Text fontSize="sm" color="gray.500" mt={2}>Uploaded on: {new Date(selectedAsset?.created_at).toLocaleDateString()}</Text>
            <Box mt={3}>
              {selectedAsset?.tags?.map((tag, i) => <Tag key={i} size="sm" colorScheme="blue" mr={1}>{tag}</Tag>)}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
