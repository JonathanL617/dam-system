import { Box, Text, Image, useColorModeValue, Button, HStack } from '@chakra-ui/react';
import { useState } from 'react';
import AssetPreview from '../AssetPreview';
import { useRouter } from 'next/navigation';

export default function AssetCard({ asset }) {
  const [open, setOpen] = useState(false);

  // Colors that switch automatically between light & dark mode
  const bg = useColorModeValue('gray.100', 'gray.700');
  const border = useColorModeValue('gray.300', 'gray.600');
  const hoverBg = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  return (
    <>
      <Box
        bg={bg}
        borderWidth="1px"
        borderColor={border}
        borderRadius="md"
        p={3}
        mb={3}
        cursor="pointer"
        _hover={{ backgroundColor: hoverBg }}
        onClick={() => setOpen(true)}
        color={textColor}
      >
        <Text fontWeight="bold" mb={2}>
          {asset.name}
        </Text>

        {asset.type === 'image' && (
          <Image
            src={asset.url}
            alt={asset.name}
            borderRadius="md"
            maxH="150px"
            objectFit="cover"
          />
        )}

        {asset.type === 'video' && <Text>🎥 Video File</Text>}
        {asset.type === '3d' && <Text>🧊 3D Model</Text>}
      </Box>

      <HStack spacing={3} mt={2}>
        <Button size="sm" onClick={() => setOpen(true)}>
          Preview
        </Button>

        <Button size="sm" variant="outline" onClick={() => router.push(`/assets/${asset.id}`)}>
          Details
        </Button>
      </HStack>

      {open && <AssetPreview asset={asset} onClose={() => setOpen(false)} />}
    </>
  );
}
