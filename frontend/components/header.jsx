'use client';

import { Box, Flex, Text, Button, Badge } from '@chakra-ui/react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const username = localStorage.getItem('username');
      
      if (token && role) {
        setUser({ role, username, email: username });
      }
      // REMOVED: Don't redirect here - let pages handle their own auth
    }
  }, []); // Empty dependencies - only run once

  // Hide on login page
  if (pathname.startsWith('/login')) return null;
  
  // Don't render until mounted
  if (!mounted || !user) {
    return null; // Just hide header if no user, don't redirect
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <Box bg="blue.600" color="white" px={6} py={4} boxShadow="sm">
      <Flex justify="space-between" align="center" maxW="7xl" mx="auto">
        <Text
          fontSize="xl"
          fontWeight="bold"
          cursor="pointer"
          onClick={() => router.push('/dashboard')}
        >
          DAM System
        </Text>

        <Flex gap={4} align="center">
          <Button
            variant="ghost"
            color="white"
            _hover={{ bg: 'blue.700' }}
            onClick={() => router.push('/dashboard')}
          >
            Dashboard
          </Button>

          <Button
            variant="ghost"
            color="white"
            _hover={{ bg: 'blue.700' }}
            onClick={() => router.push('/assets')}
          >
            Assets
          </Button>

          <Badge
            colorScheme={
              user.role === 'admin' ? 'purple' :
              user.role === 'editor' ? 'green' : 'blue'
            }
            px={3}
            py={1}
            borderRadius="full"
          >
            {user.role.toUpperCase()}
          </Badge>

          <Button
            variant="outline"
            color="white"
            borderColor="whiteAlpha.400"
            _hover={{ bg: 'whiteAlpha.200' }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}