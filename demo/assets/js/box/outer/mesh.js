import * as THREE from 'three';
import { geometry } from './geometry.js';
import { material } from './material.js';

export const mesh = async () => {
    const mesh = new THREE.Mesh(await geometry(), material());
    return mesh;
};
