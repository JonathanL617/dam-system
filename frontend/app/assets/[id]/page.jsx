'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Heading, Text, Image, Spinner, Center, Button, VStack, Badge, HStack, Table, Input,
  DialogRoot, DialogBackdrop, DialogContent, DialogHeader, DialogTitle, DialogCloseTrigger, DialogBody, DialogFooter,
  Tag
} from '@chakra-ui/react';
import { Engine, Scene } from 'react-babylonjs';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { getAsset, deleteAsset, updateAsset, uploadAssetVersion, addTags, removeTags } from '../../../lib/api_client';

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params || {};

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newVersionFile, setNewVersionFile] = useState(null);
  const [newVersionNotes, setNewVersionNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    const userRole = localStorage.getItem('role');
    setRole(userRole);
  }, []);

  const fetchAsset = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await getAsset(id);
      setAsset(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load asset:', err);
      setError(err.message || 'Failed to load asset');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsset();
  }, [id]);

  const handleEdit = async () => {
    try {
      const newName = prompt('Enter new name for asset:', asset.name);
      if (newName && newName !== asset.name) {
        await updateAsset(asset.id, { name: newName });
        await fetchAsset();
      }
    } catch (error) {
      console.error('Edit failed:', error);
      alert('Failed to update asset: ' + (error.message || error));
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${asset.name}"?`)) return;

    try {
      await deleteAsset(asset.id);
      router.push('/dashboard');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete asset: ' + (error.message || error));
    }
  };

  const handleUploadVersion = async () => {
    if (!newVersionFile || !id) return;

    setUploading(true);
    try {
      await uploadAssetVersion(asset.group_id, newVersionFile, newVersionNotes);
      setIsUploadModalOpen(false);
      setNewVersionFile(null);
      setNewVersionNotes('');
      alert('Version uploaded successfully!');
      await fetchAsset();
    } catch (e) {
      alert('Failed to upload new version: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    try {
      await addTags(asset.id, [newTag]);
      setNewTag('');
      await fetchAsset();
    } catch (e) {
      alert('Failed to add tag: ' + e.message);
    }
  };

  const handleRemoveTag = async (tagToRemove) => {
    if (!confirm(`Remove tag "${tagToRemove}"?`)) return;
    try {
      await removeTags(asset.id, [tagToRemove]);
      await fetchAsset();
    } catch (e) {
      alert('Failed to remove tag: ' + e.message);
    }
  };

  if (loading) return (
    <Center h="70vh"><Spinner size="xl" /></Center>
  );

  if (error) return (
    <Center h="70vh"><VStack>
      <Text color="red.500">{error}</Text>
      <Button onClick={() => router.push('/dashboard')}>Back to Gallery</Button>
    </VStack></Center>
  );

  if (!asset) return (
    <Center h="70vh"><Text>No asset found.</Text></Center>
  );

  return (
    <Box p={8} maxW="900px" mx="auto">
      <Heading mb={4}>{asset.name}</Heading>
      <Badge mb={2} colorPalette="gray">{asset.type}</Badge>

      {asset.type === 'image' && (
        <Image src={`http://localhost:8000${asset.url}`} alt={asset.name} borderRadius="md" mb={4} width="100%" />
      )}

      {asset.type === 'video' && (
        <Box mb={4}>
          <video src={`http://localhost:8000${asset.url}`} controls style={{ width: '100%', borderRadius: 8 }} />
        </Box>
      )}

      {asset.type === '3d' && (
        <Box mb={4} height="400px" borderRadius="md" overflow="hidden">
          <Engine antialias adaptToDeviceRatio canvasId="babylonJS">
            <Scene>
              <arcRotateCamera
                name="camera1"
                target={Vector3.Zero()}
                alpha={Math.PI / 2}
                beta={Math.PI / 4}
                radius={5}
              />
              <hemisphericLight name="light1" intensity={0.7} direction={Vector3.Up()} />
            </Scene>
          </Engine>
        </Box>
      )}

      <HStack spacing={3} mb={6}>
        <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>

        {/* Show Edit and Delete buttons ONLY for editors */}
        {role === 'editor' && (
          <>
            <Button colorPalette="blue" onClick={handleEdit}>
              Edit Asset
            </Button>
            <Button
              colorPalette="red"
              variant="outline"
              onClick={handleDelete}
            >
              Delete Asset
            </Button>
            <Button
              colorPalette="green"
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload New Version
            </Button>
          </>
        )}
      </HStack>

      <Box mb={8} p={5} borderWidth="1px" borderRadius="lg">
        <Heading size="md" mb={4}>Details</Heading>
        <Table.Root variant="simple" size="sm">
          <Table.Body>
            <Table.Row><Table.Cell fontWeight="bold" width="150px">Name</Table.Cell><Table.Cell>{asset.name}</Table.Cell></Table.Row>
            <Table.Row><Table.Cell fontWeight="bold">File Size</Table.Cell><Table.Cell>{asset.file_size || '—'}</Table.Cell></Table.Row>
            <Table.Row><Table.Cell fontWeight="bold">Dimensions</Table.Cell><Table.Cell>{asset.width && asset.height ? `${asset.width} x ${asset.height}` : '—'}</Table.Cell></Table.Row>
            {asset.duration && (
              <Table.Row><Table.Cell fontWeight="bold">Duration</Table.Cell><Table.Cell>{asset.duration.toFixed(2)}s</Table.Cell></Table.Row>
            )}
            {asset.metadata && asset.metadata.format && (
              <Table.Row><Table.Cell fontWeight="bold">Format</Table.Cell><Table.Cell>{asset.metadata.format}</Table.Cell></Table.Row>
            )}
            {asset.metadata && asset.metadata.fps && (
              <Table.Row><Table.Cell fontWeight="bold">FPS</Table.Cell><Table.Cell>{asset.metadata.fps.toFixed(2)}</Table.Cell></Table.Row>
            )}
            <Table.Row><Table.Cell fontWeight="bold">Uploaded</Table.Cell><Table.Cell>{new Date(asset.created_at || asset.created || '').toLocaleString()}</Table.Cell></Table.Row>
            <Table.Row><Table.Cell fontWeight="bold">Uploaded By</Table.Cell><Table.Cell>{asset.uploaded_by || '—'}</Table.Cell></Table.Row>
            <Table.Row>
              <Table.Cell fontWeight="bold">Tags</Table.Cell>
              <Table.Cell>
                <HStack wrap="wrap" spacing={2} mb={2}>
                  {asset.tags && asset.tags.map((t, i) => (
                    <Tag.Root key={i} size="sm" variant="subtle" colorPalette="blue">
                      <Tag.Label>{t.tag}</Tag.Label>
                      {role === 'editor' && (
                        <Tag.CloseTrigger onClick={() => handleRemoveTag(t.tag)} />
                      )}
                    </Tag.Root>
                  ))}
                </HStack>
                {role === 'editor' && (
                  <HStack>
                    <Input
                      size="xs"
                      placeholder="Add tag..."
                      width="100px"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button size="xs" onClick={handleAddTag}>Add</Button>
                  </HStack>
                )}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Box>

      {asset.versions && asset.versions.length > 0 && (
        <Box mb={8} p={5} borderWidth="1px" borderRadius="lg">
          <Heading size="md" mb={4}>Version History</Heading>
          <Table.Root variant="simple" size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Version</Table.ColumnHeader>
                <Table.ColumnHeader>Date</Table.ColumnHeader>
                <Table.ColumnHeader>Uploaded By</Table.ColumnHeader>
                <Table.ColumnHeader>Size</Table.ColumnHeader>
                <Table.ColumnHeader>Notes</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {asset.versions.map(v => (
                <Table.Row key={v.id} bg={v.version_number === asset.version_number ? "blue.50" : "transparent"}>
                  <Table.Cell>v{v.version_number}</Table.Cell>
                  <Table.Cell>{new Date(v.created_at).toLocaleString()}</Table.Cell>
                  <Table.Cell>{v.uploaded_by}</Table.Cell>
                  <Table.Cell>{v.file_size}</Table.Cell>
                  <Table.Cell>{v.change_notes}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}

      {/* Upload Version Modal */}
      <DialogRoot open={isUploadModalOpen} onOpenChange={(e) => setIsUploadModalOpen(e.open)}>
        <DialogBackdrop />
        <DialogContent maxW="md" position="fixed" top="50%" left="50%" transform="translate(-50%, -50%)" mx="auto" my="auto">
          <DialogHeader>
            <DialogTitle>Upload New Version</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            <VStack spacing={4}>
              <Box width="full">
                <Text mb={1} fontSize="sm" fontWeight="medium">File</Text>
                <Input type="file" onChange={(e) => setNewVersionFile(e.target.files[0])} />
              </Box>
              <Box width="full">
                <Text mb={1} fontSize="sm" fontWeight="medium">Change Notes</Text>
                <Input
                  placeholder="What changed?"
                  value={newVersionNotes}
                  onChange={(e) => setNewVersionNotes(e.target.value)}
                />
              </Box>
            </VStack>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
            <Button
              colorPalette="blue"
              onClick={handleUploadVersion}
              loading={uploading}
              disabled={!newVersionFile}
            >
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
}