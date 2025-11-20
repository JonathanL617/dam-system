"use client";

import { useState, useEffect } from 'react';
import { Input, InputGroup, InputLeftElement, Icon } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

export default function SearchBar({ onSearch, placeholder = 'Search assets...' }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      if (onSearch) onSearch(query);
    }, 300);

    return () => clearTimeout(t);
  }, [query, onSearch]);

  return (
    <InputGroup maxW="640px">
      <InputLeftElement pointerEvents="none">
        <Icon as={SearchIcon} color="gray.400" />
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
