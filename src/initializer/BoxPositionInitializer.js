import * as THREE from 'three';
import { RandomGenerator } from '../util/RandomGenerator.js';

export class BoxPositionInitializer {

    constructor(range, offset) {
        this.randomGenerator = new RandomGenerator(new THREE.Vector3(), range, offset, 0.0, 0.0, false);
    }

    initializeState(state) {
        randomGenerator.generate(state.position);
    }
}
