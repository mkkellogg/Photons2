import { ParticleStateInitializer } from './ParticleStateInitializer.js';

export class RotationInitializer extends ParticleStateInitializer {

    constructor(generator) {
        super();
        this.generator = generator.clone();
    }

    initializeState(state) {
        state.rotation = this.generator.generate(state.rotation);
    }

    static fromJSON(particleSystem, params) {
        const generator = params.generator.type.fromJSON(params.generator.params);
        return new RotationInitializer(generator);
    }

    toJSON(typeStore) {
        return {
            'generator': this.generator.toJSON(typeStore)
        };
    }
}
