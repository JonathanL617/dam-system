import { Portal, Box, Image, Text, Button, DialogRoot, DialogBackdrop, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogTitle, DialogCloseTrigger } from '@chakra-ui/react';

export default function AssetPreview({ asset, onClose }) {
    if (!asset) return null;

    return (
        <Portal>
            <DialogRoot open={true} onOpenChange={(e) => !e.open && onClose()} size="xl">
                <DialogBackdrop bg="blackAlpha.600" />
                <DialogContent
                    maxW="4xl"
                    position="fixed"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    zIndex={1400}
                >
                    <DialogHeader>
                        <DialogTitle>{asset.name}</DialogTitle>
                        <DialogCloseTrigger />
                    </DialogHeader>

                    <DialogBody>
                        {asset.type === 'image' && (
                            <Image
                                src={`http://localhost:8000${asset.url}`}
                                alt={asset.name}
                                w="full"
                                maxH="70vh"
                                objectFit="contain"
                            />
                        )}

                        {asset.type === 'video' && (
                            <video
                                controls
                                style={{ width: '100%', maxHeight: '70vh' }}
                                src={`http://localhost:8000${asset.url}`}
                            >
                                Your browser does not support the video tag.
                            </video>
                        )}

                        {asset.type === '3d' && (
                            <Box textAlign="center" py={12}>
                                <Text fontSize="4xl" mb={4}>🧊</Text>
                                <Text>3D Model Preview</Text>
                                <Text fontSize="sm" color="gray.500" mt={2}>
                                    3D model viewing not yet implemented
                                </Text>
                            </Box>
                        )}
                    </DialogBody>

                    <DialogFooter>
                        <Button onClick={onClose}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </DialogRoot>
        </Portal>
    );
}