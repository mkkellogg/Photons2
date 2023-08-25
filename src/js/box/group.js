import * as THREE from 'three';
import * as InnerBox from './inner/mesh';
import * as InnerBoxWireframe from './wireframe/mesh';
import * as OuterBox from './outer/mesh';
import * as OuterBoxWireframe from './wireframe/mesh';
import * as Utils from '../utils/utils';

export const group = async () => {
    let innerBox;
    let innerBoxWireframe;
    let outerBox;
    let outerBoxWireframe;
    let reactCube;

    /* Define group */
    reactCube = new THREE.Object3D();

    /* Define inner box */
    innerBox = InnerBox.mesh();

    /* Configure inner box */
    innerBox.position.setY(1);

    /* Add inner box to scene */
    reactCube.add(innerBox);

    /* Define inner box wireframe */
    innerBoxWireframe = await InnerBoxWireframe.mesh(0.65);

    /* Configure outer box wireframe */
    innerBoxWireframe.position.setY(1);

    /* Add inner box wireframe to scene */
    reactCube.add(innerBoxWireframe);

    /* Define outer box */
    outerBox = await OuterBox.mesh();

    /* Configure outer box */
    outerBox.position.setY(1);
    outerBox.material.side = 1;

    /* Add outer box to scene */
    reactCube.add(outerBox);

    /* Define outer box wireframe */
    outerBoxWireframe = await OuterBoxWireframe.mesh();

    /* Configure outer box wireframe */
    outerBoxWireframe.position.setY(1);

    /* Add outer box wireframe to scene */
    reactCube.add(outerBoxWireframe);

    /* Configure group */
    reactCube.rotation.y = Utils.convertRadToDeg(45);

    return reactCube;
};
