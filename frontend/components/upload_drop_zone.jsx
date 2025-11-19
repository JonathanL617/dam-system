import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, Text, Input } from '@chakra-ui/react';

const UploadDropZone = ({ onFileDrop }) => {
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
    // Simple validation: check if it has an extension
    if (!file.name.includes('.')) {
      setError('Invalid file.');
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
      <Text>{isDragging ? 'Drop the file here...' : 'Drag and drop a file (Image, Video, 3D), or click to select'}</Text>
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
};

export default UploadDropZone;