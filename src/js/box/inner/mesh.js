import * as THREE from 'three';
import { geometry } from './geometry';
import { material } from './material';

export const mesh = () => {
    const mesh = new THREE.Mesh(geometry(), material());
    return mesh;
};
