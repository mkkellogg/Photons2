import * as THREE from '../../three.module.min.js';
import { geometry } from './geometry.js';
import { material } from './material.js';

export const mesh = async (scale = 1) => {
    const mesh = new THREE.Mesh(await geometry(), material());
    mesh.scale.set(scale, scale, scale);
    return mesh;
};
