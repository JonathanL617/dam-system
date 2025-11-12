'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Input, VStack, Heading, Text, Container, Stack } from '@chakra-ui/react';
import { loginUser } from '@/lib/api_client';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await loginUser(identifier, password);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        localStorage.setItem('username', response.username);
        localStorage.setItem('user', JSON.stringify({
          username: response.username,
          email: response.email,
          role: response.role
        }));
      }
      
      setSuccess(`Welcome back, ${response.username}!`);
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
      
    } catch (err) {
      setError('Invalid email or password. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="md">
        <Box 
          bg="white" 
          p={8} 
          borderRadius="lg" 
          boxShadow="md"
        >
          <VStack gap={6} align="stretch">
            <Box textAlign="center">
              <Heading size="lg" mb={2}>
                DAM System Login
              </Heading>
              <Text color="gray.600">
                Sign in to manage your digital assets
              </Text>
            </Box>

            {success && (
              <Box p={3} bg="green.100" borderRadius="md" color="green.800">
                <Text fontWeight="medium">{success}</Text>
              </Box>
            )}

            {error && (
              <Box p={3} bg="red.100" borderRadius="md" color="red.800">
                <Text fontWeight="medium">{error}</Text>
              </Box>
            )}

            <form onSubmit={handleLogin}>
              <VStack gap={4}>
                <Box width="full">
                  <Text fontWeight="medium" mb={2}>Username or Email *</Text>
                  <Input 
                    type="text" 
                    placeholder="your@email.com / username" 
                    value={identifier} 
                    onChange={(e) => setIdentifier(e.target.value)} 
                    disabled={loading}
                    required
                  />
                </Box>

                <Box width="full">
                  <Text fontWeight="medium" mb={2}>Password *</Text>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    disabled={loading}
                    required
                  />
                </Box>

                <Button 
                  type="submit" 
                  colorPalette="blue" 
                  width="full" 
                  size="lg" 
                  loading={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </VStack>
            </form>

            <Text fontSize="sm" color="gray.600" textAlign="center">
              Demo credentials:<br />
              <strong>Admin:</strong> admin or admin@example.com / admin123<br />
              <strong>Editor:</strong> editor@example.com / editor123<br />
              <strong>Viewer:</strong> viewer@example.com / viewer123
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}