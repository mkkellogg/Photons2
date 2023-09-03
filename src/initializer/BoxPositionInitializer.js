import * as THREE from 'three';
import { RandomGenerator } from '../util/RandomGenerator.js';
import { ParticleStateInitializer } from './ParticleStateInitializer.js';

export class BoxPositionInitializer extends ParticleStateInitializer {

    constructor(range, offset) {
        super();
        this.randomGenerator = new RandomGenerator(THREE.Vector3, range, offset, 0.0, 0.0, false);
    }

    initializeState(state) {
        this.randomGenerator.generate(state.position);
    }
}
