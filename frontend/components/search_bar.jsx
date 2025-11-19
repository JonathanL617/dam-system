"use client";

import { useState, useEffect } from 'react';
import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

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
    <InputGroup maxW="480px">
      <InputLeftElement pointerEvents="none">
        <SearchIcon boxSize={4} color="gray.500" />
      </InputLeftElement>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        bg="white"
      />
    </InputGroup>
  );
}
