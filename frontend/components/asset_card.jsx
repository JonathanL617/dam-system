import { Box, Text, Image, Button, HStack } from '@chakra-ui/react';
import { useState } from 'react';
import AssetPreview from './AssetPreview';
import { useRouter } from 'next/navigation';

export default function AssetCard({ asset, onOpen }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Box
        bg="blue.50"
        borderRadius="lg"
        overflow="hidden"
        cursor="pointer"
        transition="all 0.2s"
        boxShadow="sm"
        _hover={{
          boxShadow: "md",
          transform: "translateY(-2px)",
        }}
        _dark={{
          bg: "gray.800",
          _hover: {
            boxShadow: "lg"
          }
        }}
        onClick={() => {
          if (onOpen) return onOpen(asset);
          return setOpen(true);
        }}
      >
        <Box p={4}>
          <Text fontWeight="bold" mb={3} fontSize="lg" color="gray.800" _dark={{ color: "gray.100" }}>
            {asset.name}
          </Text>

          {asset.type === 'image' && (
            <Image
              src={`http://localhost:8000${asset.url}`}
              alt={asset.name}
              borderRadius="md"
              w="full"
              h="200px"
              objectFit="cover"
              mb={3}
            />
          )}

          {asset.type === 'video' && (
            asset.thumbnail ? (
              <Image
                src={`http://localhost:8000${asset.thumbnail}`}
                alt={asset.name}
                borderRadius="md"
                w="full"
                h="200px"
                objectFit="cover"
                mb={3}
              />
            ) : (
              <Box 
                h="200px" 
                bg="gray.200" 
                borderRadius="md" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                mb={3}
              >
                <Text fontSize="4xl">🎥</Text>
              </Box>
            )
          )}
          
          {asset.type === '3d' && (
            asset.thumbnail ? (
              <Image
                src={`http://localhost:8000${asset.thumbnail}`}
                alt={asset.name}
                borderRadius="md"
                w="full"
                h="200px"
                objectFit="cover"
                mb={3}
              />
            ) : (
              <Box 
                h="200px" 
                bg="gray.200" 
                borderRadius="md" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                mb={3}
              >
                <Text fontSize="4xl">🧊</Text>
              </Box>
            )
          )}

          <HStack spacing={2} mt={3}>
            <Button
              size="sm"
              colorPalette="black"
              flex={1}
              onClick={(e) => { e.stopPropagation(); if (onOpen) return onOpen(asset); setOpen(true); }}
            >
              Preview
            </Button>

            <Button
              size="sm"
              
              colorPalette="black"
              flex={1}
              onClick={(e) => { e.stopPropagation(); router.push(`/assets/${asset.id}`); }}
            >
              Details
            </Button>
          </HStack>
        </Box>
      </Box>

      {/* Render internal preview only when no external onOpen handler provided */}
      {!onOpen && open && <AssetPreview asset={asset} onClose={() => setOpen(false)} />}
    </>
  );
}