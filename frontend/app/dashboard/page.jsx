'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
<<<<<<< HEAD
import { Box, Heading, Text, VStack, Grid, Badge, Button, Flex, Table, Select, HStack, RotateCcw, Edit3, Trash2, Input, Portal, createListCollection,
  DialogRoot, DialogBackdrop, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogTitle, DialogCloseTrigger, SimpleGrid, Center, Spinner } from "@chakra-ui/react";
=======
import { Box, Heading, Text, VStack, Grid, Badge, Button, Flex, Table, HStack, RotateCcw, Edit3, Trash2, Input,
  DialogRoot, DialogBackdrop, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogTitle, DialogCloseTrigger } from "@chakra-ui/react";
import { Select } from "@chakra-ui/react";
>>>>>>> dc96fef05fb22b7f598690161c886b085fb31fed

import { getProfile, getUsers, deleteUser, updateUserRole, registerUser, resetPassword, getAssets } from '../../lib/api_client';
import SearchBar from '../../components/search_bar';
import AssetCard from '../../components/asset_card';

// Simple Stat component replacement for v3
function Stat({ label, value }) {
  return (
    <Box p={5} bg="white" rounded="lg" shadow="md" textAlign="center">
      <Text fontSize="md" color="gray.600">{label}</Text>
      <Text fontSize="4xl" fontWeight="bold" color="gray.800">{value}</Text>
    </Box>
  );
}

const roles = [
  { label: "Editor", value: "editor" },
  { label: "Viewer", value: "viewer" },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const usersList = await getUsers();
      setUsers(usersList);
      
      const total = usersList.length;
      const active = usersList.filter(u => u.is_active).length;
      const roles = usersList.reduce((acc, u) => {
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
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

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
        fetchUsers();
      }
    }).catch(err => {
      console.error('Error fetching profile:', err);
      router.push('/login');
    });
  }, [router]);

  // Fetch assets for viewers (and others who browse)
  const fetchAssets = async () => {
    setAssetsLoading(true);
    try {
      const res = await getAssets();
      const list = res.results || res;
      setAssets(list);
      setFilteredAssets(list);
    } catch (err) {
      console.error('Error fetching assets:', err);
    } finally {
      setAssetsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    // Fetch assets for any role that can view the gallery
    fetchAssets();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleCreateUser = async () => {
    setLoading(true);
    try {
      await registerUser(newUser.username, newUser.email, newUser.password);
      setIsModalOpen(false);
      setNewUser({ username: '', email: '', password: '' });
      fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      alert('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await deleteUser(userId);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  // Update user role and active status
  const handleUpdateUser = async (userId, updates) => {
    try {
      await updateUserRole(userId, updates.role, updates.is_active);
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Failed to update user');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      alert('Please enter a new password');
      return;
    }
    try {
      await resetPassword(resetPasswordUser.id, newPassword);
      setResetPasswordUser(null);
      setNewPassword('');
      alert('Password reset successfully');
      fetchUsers();
    } catch (err) {
      console.error('Error resetting password:', err);
      alert('Failed to reset password');
    }
  };

  if (!user) {
    return (
      <Box p={8}>
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading mb={2}>Welcome, {user.email}</Heading>
          <Badge 
            colorPalette={user.role === 'admin' ? 'purple' : user.role === 'editor' ? 'green' : 'blue'}
            size="lg"
          >
            {user.role.toUpperCase()}
          </Badge>
        </Box>
        <Button colorPalette="red" onClick={handleLogout}>
          Logout
        </Button>
      </Flex>

      
      {user.role === 'admin' && (
        <Box bg="purple.50" p={6} rounded="lg" mb={8}>
          <Heading size="xl" mb={4}>Dashboard Stats</Heading>
          <Grid templateColumns={{base: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)'}} gap={6} mb={8}>
            <Stat label="Total Users" value={stats.total || 0} />
            <Stat label="Active" value={stats.active || 0} />
            <Stat label="Viewers" value={stats.viewer || 0} />
            <Stat label="Editors" value={stats.editor || 0} />
            <Stat label="Admins" value={stats.admin || 0} />
          </Grid>
          <Box bg="white" p={4} rounded="md" overflowX="auto">
            <Flex justify="space-between" align="center" mb={6}>
              <Heading size="xl" mb={4}>User Management</Heading>
              <Button mt={4} colorPalette="purple" onClick={() => setIsModalOpen(true)}>
                Create Users
              </Button>
            </Flex>
            <Table.Root size="md" variant="simple">
              <Table.Header>
                <Table.Row bg="gray.50">
                  <Table.ColumnHeader fontSize="md">Username</Table.ColumnHeader>
                  <Table.ColumnHeader fontSize="md">Email</Table.ColumnHeader>
                  <Table.ColumnHeader fontSize="md" textAlign="center">Role</Table.ColumnHeader>
                  <Table.ColumnHeader fontSize="md" textAlign="center">Status</Table.ColumnHeader>
                  <Table.ColumnHeader fontSize="md" textAlign="center">Actions</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {users.map(u => (
                  <Table.Row key={u.id} _hover={{ bg: "gray.50" }}>
                    <Table.Cell fontSize="md" fontWeight="medium">{u.username}</Table.Cell>
                    <Table.Cell fontSize="md">{u.email}</Table.Cell>
                    <Table.Cell fontSize="md" textAlign={"center"}>
                      <Badge 
                        px={3} py={1.5} rounded="full" fontSize="sm" fontWeight="simple" textTransform="capitalize" letterSpacing="wide"
                        colorPalette={
                          u.role === "admin" ? "purple" :
                          u.role === "editor" ? "green" :
                          u.role === "viewer" ? "blue" :
                          "gray"
                        }
                      >
                        {u.role}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell textAlign={"center"}>
                      <Badge px={3} py={1.5} rounded="full" fontSize="sm" fontWeight="simple" letterSpacing="wide" colorPalette={u.is_active ? "green" : "red"}>
                        {u.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </Table.Cell> 
                    <Table.Cell>
                      <HStack spacing={3} justify="center">
                        <Button leftIcon={<RotateCcw size={16} />} size="sm" variant="solid" colorPalette="gray" onClick={() => setResetPasswordUser(u)}>
                          Reset Password
                        </Button>

                        <Button leftIcon={<Edit3 size={16} />} size="sm" variant="solid" colorPalette="blue" onClick={() => setEditingUser(u)}>
                          Edit
                        </Button>

                        <Button leftIcon={<Trash2 size={16} />} size="sm" colorPalette="red" variant="solid" onClick={() => handleDeleteUser(u.id)} disabled={u.id === user.id}>
                          Delete
                        </Button>
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Box>
        
      )}

    
      {user.role === 'editor' && (
        <Box bg="green.50" p={4} rounded="md" mb={4}>
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">Editor Access</Text>
            <Text>You can upload, edit, and tag assets.</Text>
            <Button colorPalette="green" onClick={() => router.push('/assets/upload')}>
              Upload New Asset
            </Button>
          </VStack>
        </Box>
      )}

      
      {user.role === 'viewer' && (
        <Box mb={6}>
          <Box bg="blue.50" p={4} rounded="md" mb={4}>
            <VStack align="start" spacing={2}>
              <Text fontWeight="bold">Viewer Access</Text>
              <Text>You can view and download assets.</Text>
              <Button onClick={() => router.push('/assets')}>Browse Gallery</Button>
            </VStack>
          </Box>

          <Box mb={4}>
            <SearchBar onSearch={(q) => {
              if (!q || !q.trim()) return setFilteredAssets(assets);
              const lower = q.toLowerCase();
              setFilteredAssets(
                assets.filter(a =>
                  (a.name || '').toLowerCase().includes(lower) ||
                  (a.tags && a.tags.some(t => (t.tag || '').toLowerCase().includes(lower)))
                )
              );
            }} />
          </Box>

          {assetsLoading ? (
            <Center py={12}><Spinner size="lg" /></Center>
          ) : filteredAssets.length === 0 ? (
            <Center py={12}><Text color="gray.500">No assets found.</Text></Center>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {filteredAssets.map(asset => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </SimpleGrid>
          )}
        </Box>
      )}

      <DialogRoot open={isModalOpen} onOpenChange={(e) => setIsModalOpen(e.open)}>
        <DialogBackdrop/>
        <DialogContent maxW="md" position="fixed" top="50%" left="50%" transform="translate(-50%, -50%)" mx="auto" my="auto">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogCloseTrigger/>
          </DialogHeader>
          <DialogBody>
            <VStack spacing={4}>
              <Box width="full">
                <Text mb={1} fontSize="sm" fontWeight="medium">Username</Text>
                <Input
                  placeholder="Username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                />
              </Box>
              
              <Box width="full">
                <Text mb={1} fontSize="sm" fontWeight="medium">Email</Text>
                <Input
                  type="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </Box>
              
              <Box width="full">
                <Text mb={1} fontSize="sm" fontWeight="medium">Password</Text>
                <Input
                  type="password"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                />
              </Box>
              
              {/* Role selection is not needed for register, backend always sets 'viewer' */}
            </VStack>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button colorPalette="purple" onClick={handleCreateUser} loading={loading}>
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Reset Password Modal */}
      <DialogRoot open={!!resetPasswordUser} onOpenChange={(e) => setResetPasswordUser(e.open ? resetPasswordUser : null)}>
        <DialogBackdrop/>
        <DialogContent maxW="md" position="fixed" top="50%" left="50%" transform="translate(-50%, -50%)" mx="auto" my="auto">
          <DialogHeader>
            <DialogTitle>Reset Password for {resetPasswordUser?.username}</DialogTitle>
            <DialogCloseTrigger/>
          </DialogHeader>
          <DialogBody>
            <VStack spacing={4}>
              <Box width="full">
                <Text mb={1} fontSize="sm" fontWeight="medium">New Password</Text>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Box>
            </VStack>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => {setResetPasswordUser(null); setNewPassword('');}}>
              Cancel
            </Button>
            <Button colorPalette="orange" onClick={handleResetPassword}>
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Edit User Modal */}
      <DialogRoot open={!!editingUser} onOpenChange={(e) => setEditingUser(e.open ? editingUser : null)}>
        <DialogBackdrop/>
        <DialogContent maxW="md" position="fixed" top="50%" left="50%" transform="translate(-50%, -50%)" mx="auto" my="auto">
          <DialogHeader>
            <DialogTitle>Edit User - {editingUser?.username}</DialogTitle>
            <DialogCloseTrigger/>
          </DialogHeader>
          <DialogBody>
            <VStack spacing={4}>
              <Box width="full">
                <Text mb={1} fontSize="sm" fontWeight="medium">Username</Text>
                <Input
                  value={editingUser?.username ?? ''}
                  bg="gray.100"
                  onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                />
              </Box>
              <Box width="full">
                <Text mb={1} fontSize="sm" fontWeight="medium">Email</Text>
                <Input
                  value={editingUser?.email ?? ''}
                  bg="gray.100"
                  onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </Box>
              <Box width="full">
                <Text mb={1} fontSize="sm" fontWeight="medium">Role</Text>
                <HStack spacing={4} mt={2}>
                  <label>
                    <input
                      type="radio"
                      name="role"
                      value="editor"
                      checked={editingUser?.role === "editor"}
                      onChange={() => setEditingUser({ ...editingUser, role: "editor" })}
                    />
                    Editor
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="role"
                      value="viewer"
                      checked={editingUser?.role === "viewer"}
                      onChange={() => setEditingUser({ ...editingUser, role: "viewer" })}
                    />
                    Viewer
                  </label>
                </HStack>
              </Box>
              <Box width="full">
                <Text mb={1} fontSize="sm" fontWeight="medium">Active Status</Text>
                <HStack spacing={4} mt={2}>
                  <label>
                    <input
                      type="radio"
                      name="active"
                      value="active"
                      checked={editingUser?.is_active === true}
                      onChange={() => setEditingUser({ ...editingUser, is_active: true })}
                    />
                    Active
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="active"
                      value="inactive"
                      checked={editingUser?.is_active === false}
                      onChange={() => setEditingUser({ ...editingUser, is_active: false })}
                    />
                    Inactive
                  </label>
                </HStack>
              </Box>
            </VStack>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button colorPalette="blue" onClick={async () => {
              if (editingUser?.role !== undefined && editingUser?.is_active !== undefined) {
                await handleUpdateUser(editingUser.id, { role: editingUser.role, is_active: editingUser.is_active });
                setEditingUser(null);
              }
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
}