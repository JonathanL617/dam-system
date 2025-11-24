"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  useToast
} from "@chakra-ui/react";
import { useState } from "react";
import { updateAssetPartial, addTags, removeTags } from "../lib/api_client";

export default function EditAssetModal({ asset, isOpen, onClose, onUpdate }) {
  const [name, setName] = useState(asset?.name || "");
  const [description, setDescription] = useState(asset?.description || "");
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState(asset?.tags || []);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

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
      // Update basic asset info
      const updates = {};
      if (name !== asset.name) updates.name = name;
      if (description !== asset.description) updates.description = description;

      if (Object.keys(updates).length > 0) {
        await updateAssetPartial(asset.id, updates);
      }

      // Handle tag changes
      const currentTags = new Set(asset.tags || []);
      const newTags = new Set(tags);
      
      // Add new tags
      const tagsToAdd = tags.filter(tag => !currentTags.has(tag));
      if (tagsToAdd.length > 0) {
        await addTags(asset.id, tagsToAdd);
      }

      // Remove deleted tags
      const tagsToRemove = Array.from(currentTags).filter(tag => !newTags.has(tag));
      if (tagsToRemove.length > 0) {
        await removeTags(asset.id, tagsToRemove);
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
                      <TagLabel>{tag}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveTag(tag)} />
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