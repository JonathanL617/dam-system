'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Image,
  Box,
  AspectRatio,
  Text,
  useColorModeValue,
  Button,
  VStack
} from '@chakra-ui/react';

export default function AssetPreview({ asset, onClose }) {
  if (!asset) return null;

  const modalBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const renderPreview = () => {
    if (asset.type === 'image') {
      return (
        <Image
          src={asset.url}
          alt={asset.name}
          width="100%"
          borderRadius="md"
          border="1px solid"
          borderColor={borderColor}
          objectFit="cover"
        />
      );
    }

    if (asset.type === 'video') {
      return (
        <AspectRatio ratio={16 / 9} width="100%">
          <video src={asset.url} controls style={{ borderRadius: 8 }} />
        </AspectRatio>
      );
    }

    // Keep 3D support simple: show placeholder (avoid heavy 3D deps)
    if (asset.type === '3d') {
      return (
        <VStack spacing={4} align="center" justify="center" height="320px">
          <Text>3D preview is not available in this dev build.</Text>
          <Text color="gray.500">Download the file to view in a dedicated viewer.</Text>
          {asset.url ? <Button as="a" href={asset.url} target="_blank">Open File</Button> : null}
        </VStack>
      );
    }

    return (
      <Text color={textColor} textAlign="center">Preview not available for this file type.</Text>
    );
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg={modalBg} color={textColor}>
        <ModalHeader borderBottom="1px solid" borderColor={borderColor}>{asset.name || 'Asset Preview'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody padding={4}>{renderPreview()}</ModalBody>
      </ModalContent>
    </Modal>
  );
}
