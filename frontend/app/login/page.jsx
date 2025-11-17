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
      <Container maxW="xl">
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
                  <Text fontWeight="medium" mb={2}>Username *</Text>
                  <Input 
                    type="text" 
                    placeholder="username" 
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
              <strong>Admin:</strong> admin / Admin123<br />
              <strong>Editor:</strong> editor / editor123<br />
              <strong>Viewer:</strong> viewer / viewer123
            </Text>

            <Box textAlign="center" pt={2} borderTop="1px solid" borderColor="gray.200">
              <Text fontSize="sm" color="gray.600">
                Don't have an account?{' '}
                <Text 
                  as="span" 
                  color="blue.600" 
                  fontWeight="medium" 
                  cursor="pointer"
                  _hover={{ textDecoration: 'underline' }}
                  onClick={() => router.push('/register')}
                >
                  Create one here
                </Text>
              </Text>
            </Box>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}