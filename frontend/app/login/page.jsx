'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {Box, Button, FormControl, FormLabel, Input, VStack, Heading, Text, Alert, AlertIcon, Container} from '@chakra-ui/react';
import { loginUser } from '@/lib/api_client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
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
      const response = await loginUser(email, password);
      
      // Store token and user info
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', response.role);
      localStorage.setItem('username', response.username);

      localStorage.setItem('user', JSON.stringify({
        username: response.username,
        email: response.email || response.username,
        role: response.role
      }));
      
      // Show success message
      setSuccess(`Welcome back, ${response.username}!`);
      
      // Redirect to dashboard after a short delay
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
          <VStack spacing={6} align="stretch">
            <Box textAlign="center">
              <Heading size="lg" mb={2}>
                DAM System Login
              </Heading>
              <Text color="gray.600">
                Sign in to manage your digital assets
              </Text>
            </Box>

            {success && (
              <Alert status="success">
                <AlertIcon />
                {success}
              </Alert>
            )}

            {error && (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading}/>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading}/>
                </FormControl>

                <Button type="submit" colorScheme="blue" width="full" size="lg" isLoading={loading} loadingText="Signing in...">
                  Sign In
                </Button>
              </VStack>
            </form>

            <Text fontSize="sm" color="gray.600" textAlign="center">
              Demo credentials:<br />
              <strong>Admin:</strong> admin@example.com / admin123<br />
              <strong>Editor:</strong> editor@example.com / editor123<br />
              <strong>Viewer:</strong> viewer@example.com / viewer123
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}