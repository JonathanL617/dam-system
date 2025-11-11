import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {Box, Heading, Text, VStack, Grid, Stat, StatLabel, StatNumber, StatHelpText, Badge, Button, Alert, AlertIcon} from "@chakra-ui/react";
import { getProfile, getUsers } from '../../lib/api_client';

export default function Dashboard(){
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({});
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if(!token) {
            router.push('/login');
            return;
        }

        getProfile().then(data => {
            setUser(data);

            if(data.role === 'admin'){
                getUsers().then(users => {
                    const total = users.length;
                    const active = users.filter(u => u.is_active).length;
                    const roles = users.reduce((acc, u) => {
                        acc[u.role] = (acc[u.role] || 0) + 1;
                        return acc;
                    }, {});
                    
                    // ADD THIS LINE:
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
        });
    }, [router]);

    if(!user) {
        return (
            <Box p={8}>
            <Text>Loading...</Text>
            </Box>
        );
    }

    return (
        <Box p={8}>
        <Heading mb={6}>Welcome, {user.email}</Heading>
        <Badge colorScheme={user.role === 'admin' ? 'purple' : user.role === 'editor' ? 'green' : 'blue'} mb={6}>
            {user.role.toUpperCase()}
        </Badge>

        {/* ADMIN PANEL */}
        {user.role === 'admin' && (
            <Box bg="purple.50" p={6} rounded="lg" mb={8}>
            <Heading size="md" mb={4}>Admin Stats</Heading>
            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                <Stat>
                    <StatLabel>Total Users</StatLabel>
                    <StatNumber>{stats.total || 0}</StatNumber>
                </Stat>
                <Stat>
                    <StatLabel>Active</StatLabel>
                    <StatNumber>{stats.active || 0}</StatNumber>
                </Stat>
                <Stat>
                    <StatLabel>Viewers</StatLabel>
                    <StatNumber>{stats.viewer || 0}</StatNumber>
                </Stat>
                <Stat>
                    <StatLabel>Editors</StatLabel>
                    <StatNumber>{stats.editor || 0}</StatNumber>
                </Stat>
                <Stat>
                    <StatLabel>Admins</StatLabel>
                    <StatNumber>{stats.admin || 0}</StatNumber>
                </Stat>
            </Grid>
            <Button mt={4} colorScheme="purple" onClick={() => router.push('/admin/users')}>
                Manage Users
            </Button>
            </Box>
        )}

        {/* EDITOR PANEL */}
        {user.role === 'editor' && (
            <Alert status="success" variant="subtle">
            <AlertIcon />
            <VStack align="start">
                <Text>You can upload, edit, and tag assets.</Text>
                <Button colorScheme="green" onClick={() => router.push('/assets/upload/page')}>
                Upload New Asset
                </Button>
            </VStack>
            </Alert>
        )}

        {/* VIEWER PANEL */}
        {user.role === 'viewer' && (
            <Alert status="info" variant="subtle">
            <AlertIcon />
            <Text>You can view and download assets.</Text>
            <Button mt={2} onClick={() => router.push('/assets/page')}>
                Browse Gallery
            </Button>
            </Alert>
        )}
        </Box>
    );
}