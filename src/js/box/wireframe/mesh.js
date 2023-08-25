import * as THREE from 'three';
import { geometry } from './geometry';
import { material } from './material';

export const mesh = async (scale = 1) => {
    const mesh = new THREE.Mesh(await geometry(), material());
    mesh.scale.set(scale, scale, scale);
    return mesh;
};
