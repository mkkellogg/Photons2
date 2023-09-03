import * as THREE from 'three';
import { RandomGenerator } from '../util/RandomGenerator.js';
import { ParticleStateInitializer } from './ParticleStateInitializer.js';

export class RandomVelocityInitializer extends ParticleStateInitializer {

    constructor(range, offset, speedRange, speedOffset) {
        super();
        this.directionGenerator = new RandomGenerator(THREE.Vector3, range, offset, 0.0, 0.0, true);
        this.speedGenerator = new RandomGenerator(0, speedRange, speedOffset, 0.0, 0.0, false);
    }

    initializeState(state) {
        this.directionGenerator.generate(state.velocity);
        state.velocity.multiplyScalar(this.speedGenerator.generate());
    }

}
