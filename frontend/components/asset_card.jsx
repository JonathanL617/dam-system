import { Box, Text, Image } from '@chakra-ui/react';
import { useState } from 'react';
import AssetPreview from './AssetPreview';

export default function AssetCard({ asset }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Box
        borderWidth="1px"
        borderRadius="md"
        p={3}
        mb={3}
        cursor="pointer"
        onClick={() => setOpen(true)}
      >
        <Text fontWeight="bold">{asset.name}</Text>
        {asset.type === 'image' && <Image src={asset.url} alt={asset.name} />}
        {asset.type === 'video' && <Text>Video File</Text>}
        {asset.type === '3d' && <Text>3D Model</Text>}
      </Box>

      {open && <AssetPreview asset={asset} onClose={() => setOpen(false)} />}
    </>
  );
}
