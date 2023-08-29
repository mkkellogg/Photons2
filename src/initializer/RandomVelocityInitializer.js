import * as THREE from 'three';
import { RandomGenerator } from '../util/RandomGenerator.js';

export class RandomVelocityInitializer {

    constructor(range, offset, speedRange, speedOffset) {
        this.directionGenerator = new RandomGenerator(new THREE.Vector3(), range, offset, 0.0, 0.0, true);
        this.speedGenerator = new RandomGenerator(0, speedRange, speedOffset, 0.0, 0.0, false);
    }

    initializeState(state) {
        directionGenerator.generate(state.velocity);
        state.velocity.multiplyScalar(speedGenerator.generate());
    }

}
