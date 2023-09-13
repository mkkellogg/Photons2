import { ParticleStateInitializer } from './ParticleStateInitializer.js';

export class RotationInitializer extends ParticleStateInitializer {

    constructor(generator) {
        super();
        this.generator = generator.clone();
    }

    initializeState(state) {
        state.rotation = this.generator.generate(state.rotation);
    }

    static loadFromJSON(particleSystem, params) {
        const generator = params.generator.type.loadFromJSON(params.generator.params);
        return new RotationInitializer(generator);
    }
}
