import { ParticleStateInitializer } from './ParticleStateInitializer.js';

export class RotationalSpeedInitializer extends ParticleStateInitializer {

    constructor(generator) {
        super();
        this.generator = generator.clone();
    }

    initializeState(state) {
        state.rotationalSpeed = this.generator.generate();
    }

}
