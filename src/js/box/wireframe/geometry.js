import { STLLoader } from '../../../../node_modules/three/examples/jsm/loaders/STLLoader.js';
import WebpackCubeWireframe from '../../../models/webpack-cube-wireframe.stl';

export const geometry = () => {
    return new Promise((resolve) => {
        const loader = new STLLoader();
        loader.load(WebpackCubeWireframe, (geometry) => {
            resolve(geometry);
        });
    });
};
