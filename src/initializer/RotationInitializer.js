import { ParticleStateInitializer } from './ParticleStateInitializer.js';

export class RotationInitializer extends ParticleStateInitializer {

    constructor(generator) {
        super();
        this.generator = generator.clone();
    }

    initializeState(state) {
        this.generator.generate(state.rotation);
    }

}
