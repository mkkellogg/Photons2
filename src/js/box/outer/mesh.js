import * as THREE from 'three';
import { geometry } from './geometry';
import { material } from './material';

export const mesh = async () => {
    const mesh = new THREE.Mesh(await geometry(), material());
    return mesh;
};
