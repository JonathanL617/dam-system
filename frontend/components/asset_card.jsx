import { Box, Text, Image, Button, HStack } from '@chakra-ui/react';
import { useState } from 'react';
import AssetPreview from '../AssetPreview';
import { useRouter } from 'next/navigation';

export default function AssetCard({ asset, onOpen }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();



  return (
    <>
      <Box
        bg="gray.100"
        borderWidth="1px"
        borderColor="gray.300"
        borderRadius="md"
        p={3}
        mb={3}
        cursor="pointer"
        color="gray.800"
        _dark={{
          bg: "gray.700",
          borderColor: "gray.600",
          color: "gray.100"
        }}
        _hover={{
          bg: "gray.200",
          _dark: { bg: "gray.600" }
        }}
        onClick={() => {
          if (onOpen) return onOpen(asset);
          return setOpen(true);
        }}
      >
        <Text fontWeight="bold" mb={2}>
          {asset.name}
        </Text>

        {asset.type === 'image' && (
          <Image
            src={`http://localhost:8000${asset.url}`}
            alt={asset.name}
            borderRadius="md"
            maxH="150px"
            objectFit="cover"
          />
        )}


        {asset.type === 'video' && <Text>🎥 Video File</Text>}
        {asset.type === '3d' && <Text>🧊 3D Model</Text>}

        <HStack spacing={3} mt={3}>
          <Button size="sm" onClick={(e) => { e.stopPropagation(); if (onOpen) return onOpen(asset); setOpen(true); }}>
            Preview
          </Button>

          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); router.push(`/assets/${asset.id}`); }}>
            Details
          </Button>
        </HStack>
      </Box>

      {/* Render internal preview only when no external onOpen handler provided */}
      {!onOpen && open && <AssetPreview asset={asset} onClose={() => setOpen(false)} />}
    </>
  );
}
