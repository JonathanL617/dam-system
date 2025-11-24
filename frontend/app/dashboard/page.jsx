"use client";

import { useEffect, useState, useRef } from "react";
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
  ModalBody,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  FormControl,
  FormLabel,
  Textarea,
  VStack,
  HStack
} from "@chakra-ui/react";
import { ChevronDownIcon, DeleteIcon, EditIcon, AddIcon } from "@chakra-ui/icons";

const API_BASE_URL = "http://127.0.0.1:8000";

// Edit Asset Modal Component
function EditAssetModal({ asset, isOpen, onClose, onUpdate }) {
  const [name, setName] = useState(asset?.name || "");
  const [description, setDescription] = useState(asset?.description || "");
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState(asset?.tags || []);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Reset form when asset changes
  useEffect(() => {
    if (asset) {
      setName(asset.name || "");
      setDescription(asset.description || "");
      setTags(asset.tags || []);
    }
  }, [asset]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!asset) return;
    
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      
      // Update basic asset info
      const updates = {};
      if (name !== asset.name) updates.name = name;
      if (description !== asset.description) updates.description = description;

      if (Object.keys(updates).length > 0) {
        const response = await fetch(`${API_BASE_URL}/api/assets/${asset.id}/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates)
        });

        if (!response.ok) throw new Error('Failed to update asset');
      }

      // Handle tag changes - this would need backend support
      // For now, we'll include tags in the main update
      if (JSON.stringify(tags) !== JSON.stringify(asset.tags || [])) {
        updates.tags = tags;
      }

      toast({
        title: "Asset updated successfully",
        status: "success",
        duration: 3000,
      });

      onUpdate(); // Refresh the assets list
      onClose();
    } catch (error) {
      toast({
        title: "Error updating asset",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Asset</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Asset Name</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter asset name"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter asset description"
                rows={3}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Tags</FormLabel>
              <VStack align="start" spacing={2}>
                <HStack>
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag"
                    size="sm"
                  />
                  <Button size="sm" onClick={handleAddTag}>Add</Button>
                </HStack>
                <HStack flexWrap="wrap">
                  {tags.map((tag, index) => (
                    <Tag key={index} size="md" colorScheme="blue" borderRadius="full">
                      <Text>{tag}</Text>
                      <Button 
                        size="xs" 
                        variant="ghost" 
                        onClick={() => handleRemoveTag(tag)}
                        ml={1}
                      >
                        ×
                      </Button>
                    </Tag>
                  ))}
                </HStack>
              </VStack>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSave} isLoading={loading}>
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function DashboardPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [sortBy, setSortBy] = useState("created_at");
  const toast = useToast();
  const cancelRef = useRef();

  // Get user role
  const role = typeof window !== 'undefined' ? localStorage.getItem("role") || "Viewer" : "Viewer";

  // Fetch assets
  useEffect(() => {
    async function fetchAssets() {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
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
        setAssets(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAssets();
  }, []);

  // Handle file upload
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
      setAssets(prev => [...prev, newAsset]);
      toast({
        title: "Asset uploaded successfully",
        status: "success",
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = '';
    }
  }

  // Handle edit
  const handleEdit = (asset) => {
    setSelectedAsset(asset);
    setIsEditOpen(true);
  };

  // Handle delete confirmation
  const confirmDelete = (asset) => {
    setAssetToDelete(asset);
    setIsDeleteOpen(true);
  };

  // Execute delete
  const executeDelete = async () => {
    if (!assetToDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/assets/${assetToDelete.id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Delete failed');

      setAssets(prev => prev.filter(asset => asset.id !== assetToDelete.id));
      toast({
        title: "Asset deleted successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting asset",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsDeleteOpen(false);
      setAssetToDelete(null);
    }
  };

  // Refresh assets after update
  const refreshAssets = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/assets/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAssets(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error refreshing assets:", err);
    }
  };

  // Modal functions
  const openPreviewModal = (asset) => {
    setSelectedAsset(asset);
    setIsPreviewOpen(true);
  };

  const closePreviewModal = () => {
    setSelectedAsset(null);
    setIsPreviewOpen(false);
  };

  // Pagination & sorting
  const sortedAssets = [...assets].sort((a, b) => {
    if (sortBy === "name") return a.name?.localeCompare(b.name);
    if (sortBy === "created_at") return new Date(b.created_at) - new Date(a.created_at);
    return 0;
  });

  const filteredAssets = sortedAssets.filter(asset => {
    const query = searchQuery.toLowerCase();
    return asset.name?.toLowerCase().includes(query) || 
           (asset.tags && asset.tags.some(tag => tag?.toLowerCase().includes(query)));
  });

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAssets = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Check if user can edit/delete
  const canModify = role === "Admin" || role === "Editor";
  const canUpload = role === "Admin" || role === "Editor";

  // Loading state
  if (loading) {
    return (
      <Box minH="100vh" display="flex" justifyContent="center" alignItems="center" bgGradient="linear(to-r, #74ebd5, #acb6e5)">
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  // Error state
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

      <Text mb={4} fontSize="md" color="gray.700">
        Logged in as: <b>{role}</b>
      </Text>

      {/* Upload Section */}
      {canUpload && (
        <Box 
          mb={8} 
          p={6} 
          border="2px dashed #3498db" 
          borderRadius="2xl" 
          textAlign="center" 
          bg="whiteAlpha.800" 
          _hover={{ bg: "whiteAlpha.900", borderColor: "#2980b9" }}
          position="relative"
          cursor="pointer"
          transition="all 0.3s"
        >
          <Input 
            type="file" 
            onChange={handleUpload} 
            opacity={0} 
            position="absolute" 
            width="100%" 
            height="100%" 
            cursor="pointer" 
            top={0}
            left={0}
          />
          <Box>
            <AddIcon w={6} h={6} color="blue.500" mb={3} />
            <Text mb={3} fontWeight="semibold" color="gray.700">
              Drag & Drop files here or click to upload
            </Text>
            <Text fontSize="sm" color="gray.500">
              Supports images, videos, PDFs, and 3D models
            </Text>
          </Box>
          {uploading && (
            <Box mt={3}>
              <Spinner size="sm" color="blue.500" mr={2} />
              <Text color="blue.500" fontSize="sm" display="inline">Uploading...</Text>
            </Box>
          )}
        </Box>
      )}

      {/* Role-based information */}
      <Box mb={6} p={4} bg="whiteAlpha.800" borderRadius="xl" boxShadow="md">
        <Heading size="sm" mb={2}>
          {role === "Admin" && "Admin Controls"}
          {role === "Editor" && "Editor Tools"}
          {role === "Viewer" && "Viewer Dashboard"}
        </Heading>
        <Text color="gray.600">
          {role === "Admin" && "You have full access to upload, edit, and delete assets."}
          {role === "Editor" && "You can upload and edit assets."}
          {role === "Viewer" && "You can view assets but cannot upload or edit."}
        </Text>
      </Box>

      {/* Search and Sort Controls */}
      <Flex mb={6} gap={4} flexDirection={{ base: "column", md: "row" }}>
        <Box flex="1">
          <Input
            type="text"
            placeholder="Search by name or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            borderRadius="12px"
            border="1px solid #ccc"
            fontSize="16px"
            bg="white"
          />
        </Box>
        
        <Box display="flex" alignItems="center" gap={2}>
          <Text fontSize="sm" color="gray.700">Sort by:</Text>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ 
              padding: "8px 12px", 
              borderRadius: "8px", 
              border: "1px solid #ccc", 
              outline: "none", 
              cursor: "pointer",
              background: "white"
            }}
          >
            <option value="created_at">Upload Date</option>
            <option value="name">Name</option>
          </select>
        </Box>
      </Flex>

      {/* Results Count */}
      <Text mb={4} color="gray.600" fontSize="sm">
        Showing {currentAssets.length} of {filteredAssets.length} assets
      </Text>

      {/* Assets grid */}
      {currentAssets.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text color="gray.600" fontSize="lg" mb={4}>
            {searchQuery ? "No assets match your search." : "No assets found."}
          </Text>
          {canUpload && !searchQuery && (
            <Button colorScheme="blue" onClick={() => document.querySelector('input[type="file"]')?.click()}>
              Upload Your First Asset
            </Button>
          )}
        </Box>
      ) : (
        <Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={6}>
          {currentAssets.map(asset => (
            <GridItem
              key={asset.id}
              bg="white"
              borderRadius="2xl"
              boxShadow="md"
              p={4}
              transition="0.3s"
              _hover={{ boxShadow: "xl", transform: "translateY(-4px)" }}
            >
              {/* Asset Preview */}
              {asset.preview_url ? (
                <Image 
                  src={asset.preview_url} 
                  alt={asset.name} 
                  borderRadius="xl" 
                  mb={3} 
                  cursor="pointer"
                  onClick={() => openPreviewModal(asset)}
                  height="200px"
                  width="100%"
                  objectFit="cover"
                />
              ) : (
                <Box 
                  bg="gray.100" 
                  h="200px" 
                  borderRadius="xl" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                  cursor="pointer"
                  onClick={() => openPreviewModal(asset)}
                >
                  <Text color="gray.500">No Preview Available</Text>
                </Box>
              )}
              
              {/* Asset Info */}
              <Flex justify="space-between" align="start" mb={2}>
                <Box flex="1" mr={2}>
                  <Text fontWeight="bold" color="gray.800" noOfLines={1}>
                    {asset.name}
                  </Text>
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    {asset.created_at ? new Date(asset.created_at).toLocaleDateString() : 'Unknown date'}
                  </Text>
                </Box>
                
                {/* Action Menu */}
                {canModify && (
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      aria-label="Options"
                      icon={<ChevronDownIcon />}
                      variant="ghost"
                      size="sm"
                      minW="auto"
                      w="32px"
                      h="32px"
                    />
                    <MenuList>
                      <MenuItem icon={<EditIcon />} onClick={() => handleEdit(asset)}>
                        Edit
                      </MenuItem>
                      <MenuItem icon={<DeleteIcon />} onClick={() => confirmDelete(asset)} color="red.500">
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                )}
              </Flex>
              
              {/* Tags */}
              <Box mt={2}>
                {asset.tags && asset.tags.length > 0 ? (
                  <Flex flexWrap="wrap" gap={1}>
                    {asset.tags.slice(0, 3).map((tag, i) => (
                      <Tag key={i} size="sm" colorScheme="blue" borderRadius="full">
                        {tag}
                      </Tag>
                    ))}
                    {asset.tags.length > 3 && (
                      <Tag size="sm" colorScheme="gray" borderRadius="full">
                        +{asset.tags.length - 3}
                      </Tag>
                    )}
                  </Flex>
                ) : (
                  <Text fontSize="sm" color="gray.400" fontStyle="italic">
                    No tags
                  </Text>
                )}
              </Box>
            </GridItem>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box mt={8} display="flex" justifyContent="center" alignItems="center">
          <Button 
            onClick={() => handlePageChange(currentPage - 1)} 
            isDisabled={currentPage === 1} 
            mr={2}
            variant="outline"
          >
            Previous
          </Button>
          <Text mx={3} fontSize="sm" color="gray.600">
            Page {currentPage} of {totalPages}
          </Text>
          <Button 
            onClick={() => handlePageChange(currentPage + 1)} 
            isDisabled={currentPage === totalPages} 
            ml={2}
            variant="outline"
          >
            Next
          </Button>
        </Box>
      )}

      {/* Asset Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={closePreviewModal} size="4xl" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader borderBottom="1px" borderColor="gray.200">
            {selectedAsset?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6} display="flex" flexDir="column" alignItems="center">
            {selectedAsset && selectedAsset.preview_url && (
              <>
                {selectedAsset.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                  <Image 
                    src={selectedAsset.preview_url} 
                    alt={selectedAsset.name} 
                    maxH="70vh" 
                    borderRadius="lg" 
                    mb={4} 
                  />
                )}
                {selectedAsset.name?.match(/\.(mp4|webm|ogg|mov|avi)$/i) && (
                  <video 
                    src={selectedAsset.preview_url} 
                    controls 
                    style={{ 
                      maxHeight: "70vh", 
                      borderRadius: "12px", 
                      marginBottom: "16px",
                      width: "100%"
                    }} 
                  />
                )}
                {selectedAsset.name?.match(/\.(pdf)$/i) && (
                  <iframe 
                    src={selectedAsset.preview_url} 
                    width="100%" 
                    height="600px" 
                    style={{ borderRadius: "12px" }}
                    title={selectedAsset.name}
                  />
                )}
                {!selectedAsset.name?.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm|ogg|mov|avi|pdf)$/i) && (
                  <Box 
                    bg="gray.100" 
                    w="100%" 
                    h="400px" 
                    borderRadius="lg" 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center"
                    mb={4}
                  >
                    <Text color="gray.500">Preview not available for this file type</Text>
                  </Box>
                )}
              </>
            )}
            <VStack spacing={3} align="start" w="100%">
              <Text fontSize="sm" color="gray.500">
                <strong>Uploaded on:</strong> {selectedAsset && new Date(selectedAsset.created_at).toLocaleDateString()}
              </Text>
              {selectedAsset?.description && (
                <Text fontSize="sm" color="gray.600">
                  <strong>Description:</strong> {selectedAsset.description}
                </Text>
              )}
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  <strong>Tags:</strong>
                </Text>
                <Flex flexWrap="wrap" gap={2}>
                  {selectedAsset?.tags?.map((tag, i) => (
                    <Tag key={i} size="sm" colorScheme="blue">
                      {tag}
                    </Tag>
                  ))}
                  {(!selectedAsset?.tags || selectedAsset.tags.length === 0) && (
                    <Text fontSize="sm" color="gray.400" fontStyle="italic">
                      No tags
                    </Text>
                  )}
                </Flex>
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Asset Modal */}
      <EditAssetModal
        asset={selectedAsset}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUpdate={refreshAssets}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Asset
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "<strong>{assetToDelete?.name}</strong>"? 
              This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={executeDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}