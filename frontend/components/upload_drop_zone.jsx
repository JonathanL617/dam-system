import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, Text, Input } from '@chakra-ui/react';

const UploadDropZone = ({ onFileDrop, assetType }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setError('');

    const file = e.dataTransfer.files[0];
    if (!file) return;

    validateFile(file);
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) validateFile(file);
  };

  const validateFile = (file) => {
    const allowedTypes = {
      image: ['.jpg', '.jpeg', '.png'],
      video: ['.mp4'],
      '3d': ['.glb'],
    };
    const maxSizes = {
      image: 50 * 1024 * 1024, // 50MB
      video: 500 * 1024 * 1024, // 500MB
      '3d': 100 * 1024 * 1024, // 100MB
    };

    const fileType = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const maxSize = maxSizes[assetType];

    if (!allowedTypes[assetType]?.includes(fileType)) {
      setError(`Invalid file type. Allowed types: ${allowedTypes[assetType].join(', ')}`);
      return;
    }

    if (file.size > maxSize) {
      setError(`File size exceeds the limit of ${(maxSize / (1024 * 1024)).toFixed(2)} MB.`);
      return;
    }

    onFileDrop(file);
  };

  return (
    <Box
      borderWidth="2px"
      borderRadius="md"
      borderColor={isDragging ? 'blue.500' : 'gray.300'}
      bg={isDragging ? 'blue.50' : 'gray.50'}
      p={8}
      textAlign="center"
      cursor="pointer"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      width="300px"
      height="300px"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Text>{isDragging ? 'Drop the file here...' : 'Drag and drop a file, or click to select'}</Text>
      {error && <Text color="red.500" mt={2}>{error}</Text>}
      <Input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </Box>
  );
};

UploadDropZone.propTypes = {
  onFileDrop: PropTypes.func.isRequired,
  assetType: PropTypes.oneOf(['image', 'video', '3d']).isRequired,
};

export default UploadDropZone;