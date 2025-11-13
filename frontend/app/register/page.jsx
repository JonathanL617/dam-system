'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Input, VStack, Heading, Text, Container } from '@chakra-ui/react';
import { registerUser } from '@/lib/api_client';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser(username, email, password);
      
      setSuccess('Account created successfully! Redirecting to login...');
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
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
                Create Account
              </Heading>
              <Text color="gray.600">
                Sign up for DAM System
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

            <form onSubmit={handleRegister}>
              <VStack gap={4}>
                <Box width="full">
                  <Text fontWeight="medium" mb={2}>Username *</Text>
                  <Input 
                    type="text" 
                    placeholder="johndoe" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    disabled={loading}
                    required
                  />
                </Box>

                <Box width="full">
                  <Text fontWeight="medium" mb={2}>Email *</Text>
                  <Input 
                    type="email" 
                    placeholder="your@email.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
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
                    minLength={8}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Must be at least 8 characters
                  </Text>
                </Box>

                <Box width="full">
                  <Text fontWeight="medium" mb={2}>Confirm Password *</Text>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
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
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </VStack>
            </form>

            <Box textAlign="center" pt={2} borderTop="1px solid" borderColor="gray.200">
              <Text fontSize="sm" color="gray.600">
                Already have an account?{' '}
                <Text 
                  as="span" 
                  color="blue.600" 
                  fontWeight="medium" 
                  cursor="pointer"
                  _hover={{ textDecoration: 'underline' }}
                  onClick={() => router.push('/login')}
                >
                  Sign in here
                </Text>
              </Text>
            </Box>

            <Box bg="blue.50" p={3} borderRadius="md">
              <Text fontSize="xs" color="blue.800">
                <strong>Note:</strong> New accounts are created with "Viewer" role by default. 
                Contact an admin to upgrade your permissions.
              </Text>
            </Box>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}