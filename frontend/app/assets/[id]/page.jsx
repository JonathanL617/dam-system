'use client';

import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody } from '@chakra-ui/react';
import { Engine, Scene } from 'react-babylonjs';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';

export default function AssetPreview({ asset, onClose }) {
  return (
    <Modal isOpen={true} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{asset.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {asset.type === 'image' && (
            <img src={asset.url} alt={asset.name} style={{ width: '100%', borderRadius: '5px' }} />
          )}

          {asset.type === 'video' && (
            <video src={asset.url} controls style={{ width: '100%', borderRadius: '5px' }} />
          )}

          {asset.type === '3d' && (
            <div style={{ width: '100%', height: '400px' }}>
              <Engine antialias adaptToDeviceRatio canvasId="babylonJS">
                <Scene>
                  <arcRotateCamera
                    name="camera1"
                    target={Vector3.Zero()}
                    alpha={Math.PI / 2}
                    beta={Math.PI / 4}
                    radius={5}
                  />
                  <hemisphericLight
                    name="light1"
                    intensity={0.7}
                    direction={Vector3.Up()}
                  />
                  {/* 3D model loader placeholder */}
                </Scene>
              </Engine>
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}