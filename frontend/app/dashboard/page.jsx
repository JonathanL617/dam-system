'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Heading, Text, VStack, SimpleGrid, Badge, Button } from "@chakra-ui/react";
import { getProfile, getUsers } from '../../lib/api_client';

// Simple Stat component replacement for v3
function Stat({ label, value }) {
  return (
    <Box p={4} bg="white" borderRadius="md" boxShadow="sm">
      <Text fontSize="sm" color="gray.600" mb={1}>{label}</Text>
      <Text fontSize="3xl" fontWeight="bold">{value}</Text>
    </Box>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    getProfile().then(data => {
      setUser(data);

      if (data.role === 'admin') {
        getUsers().then(users => {
          const total = users.length;
          const active = users.filter(u => u.is_active).length;
          const roles = users.reduce((acc, u) => {
            acc[u.role] = (acc[u.role] || 0) + 1;
            return acc;
          }, {});
          
          setStats({
            total,
            active,
            viewer: roles.viewer || 0,
            editor: roles.editor || 0,
            admin: roles.admin || 0
          });
        }).catch(err => {
          console.error('Error fetching users:', err);
        });
      }
    }).catch(err => {
      console.error('Error fetching profile:', err);
      router.push('/login');
    });
  }, [router]);

  if (!user) {
    return (
      <Box p={8}>
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <Heading mb={6}>Welcome, {user.email}</Heading>
      <Badge 
        colorScheme={user.role === 'admin' ? 'purple' : user.role === 'editor' ? 'green' : 'blue'} 
        mb={6}
        size="lg"
      >
        {user.role.toUpperCase()}
      </Badge>

      
      {user.role === 'admin' && (
        <Box bg="purple.50" p={6} rounded="lg" mb={8}>
          <Heading size="md" mb={4}>Admin Stats</Heading>
          <SimpleGrid columns={{ base: 1, md: 3, lg: 5 }} spacing={6}>
            <Stat label="Total Users" value={stats.total || 0} />
            <Stat label="Active" value={stats.active || 0} />
            <Stat label="Viewers" value={stats.viewer || 0} />
            <Stat label="Editors" value={stats.editor || 0} />
            <Stat label="Admins" value={stats.admin || 0} />
          </SimpleGrid>
          <Button mt={4} colorScheme="purple" onClick={() => router.push('/admin/users')}>
            Manage Users
          </Button>
        </Box>
      )}

    
      {user.role === 'editor' && (
        <Box bg="green.50" p={4} rounded="md" mb={4}>
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">Editor Access</Text>
            <Text>You can upload, edit, and tag assets.</Text>
            <Button colorScheme="green" onClick={() => router.push('/assets/upload')}>
              Upload New Asset
            </Button>
          </VStack>
        </Box>
      )}

      
      {user.role === 'viewer' && (
        <Box bg="blue.50" p={4} rounded="md" mb={4}>
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">Viewer Access</Text>
            <Text>You can view and download assets.</Text>
            <Button onClick={() => router.push('/assets')}>
              Browse Gallery
            </Button>
          </VStack>
        </Box>
      )}
    </Box>
  );
}