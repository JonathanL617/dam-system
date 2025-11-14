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
  useColorModeValue
} from '@chakra-ui/react';

import { Engine, Scene } from 'react-babylonjs';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';

export default function AssetPreview({ asset, onClose }) {
  if (!asset) return null;

  // Color mode adaptive styles
  const modalBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const renderPreview = () => {
    switch (asset.type) {
      case 'image':
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

      case 'video':
        return (
          <AspectRatio ratio={16 / 9} width="100%">
            <video
              src={asset.url}
              controls
              style={{
                borderRadius: '8px',
                border: `1px solid ${borderColor}`
              }}
            />
          </AspectRatio>
        );

      case '3d':
        return (
          <Box
            width="100%"
            height="400px"
            borderRadius="md"
            border="1px solid"
            borderColor={borderColor}
            overflow="hidden"
            bg={useColorModeValue('gray.100', 'gray.700')}
          >
            <Engine antialias adaptToDeviceRatio canvasId="babylonJS">
              <Scene>
                <arcRotateCamera
                  name="camera1"
                  target={Vector3.Zero()}
                  alpha={Math.PI / 2}
                  beta={Math.PI / 4}
                  radius={5}
                />
                <hemisphericLight
                  name="light1"
                  intensity={0.7}
                  direction={Vector3.Up()}
                />
              </Scene>
            </Engine>
          </Box>
        );

      default:
        return (
          <Text color={textColor} textAlign="center">
            Preview not available for this file type.
          </Text>
        );
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg={modalBg} color={textColor}>
        <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
          {asset.name || 'Asset Preview'}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody padding={4}>
          {renderPreview()}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
