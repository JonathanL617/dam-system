"use client";

import { useState, useEffect } from 'react';
import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { Search } from 'react-feather';

export default function SearchBar({ onSearch, placeholder = 'Search assets...' }) {
  const [query, setQuery] = useState('');

  // simple debounce
  useEffect(() => {
    const t = setTimeout(() => {
      if (onSearch) onSearch(query);
    }, 300);

    return () => clearTimeout(t);
  }, [query, onSearch]);

  return (
    <Box position="relative" maxW="480px">
      <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" zIndex="2" pointerEvents="none">
        <Search size={16} color="gray" />
      </Box>
      <Input
        pl={10}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        bg="white"
      />
    </Box>
  );
}
