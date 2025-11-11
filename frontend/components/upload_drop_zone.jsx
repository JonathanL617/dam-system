// components/upload_drop_zone.jsx
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Text, VStack, useToast } from '@chakra-ui/react';

export default function UploadDropZone({ onFileDrop }) {

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileDrop(acceptedFiles[0]);
      toast({
        title: "File ready",
        description: `${acceptedFiles[0].name} selected`,
        status: "success",
        duration: 3000,
      });
    }
  }, [onFileDrop, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Box
      {...getRootProps()}
      border="2px dashed"
      borderColor={isDragActive ? "blue.500" : "gray.300"}
      borderRadius="lg"
      p={10}
      textAlign="center"
      cursor="pointer"
      transition="all 0.2s"
      _hover={{ borderColor: "blue.400" }}
    >
      <input {...getInputProps()} />
      <VStack spacing={3}>
        <Text fontSize="xl" fontWeight="bold">
          {isDragActive ? "Drop file here" : "Drag & drop file here"}
        </Text>
        <Text color="gray.500">or click to select</Text>
      </VStack>
    </Box>
  );
}