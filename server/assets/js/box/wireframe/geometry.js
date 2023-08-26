import { STLLoader } from '../../STLLoader.js';

export const geometry = () => {
    return new Promise((resolve) => {
        const loader = new STLLoader();
        loader.load('assets/models/webpack-cube-wireframe.stl', (geometry) => {
            resolve(geometry);
        });
    });
};
