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

    static fromJSON(particleSystem, params) {
        return new RandomVelocityInitializer(new THREE.Vector3().fromArray(params.range),
                                             new THREE.Vector3().fromArray(params.offset),
                                             params.speedRange, params.speedOffset);
    }

    toJSON() {
        return {
            'range': this.directionGenerator.range.toArray(),
            'offset': this.directionGenerator.offset.toArray(),
            'speedRange': this.speedGenerator.range,
            'speedOffset': this.speedGenerator.offset
        };
    }
}
