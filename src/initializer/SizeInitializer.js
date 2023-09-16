import { ParticleStateInitializer } from './ParticleStateInitializer.js';

export class SizeInitializer extends ParticleStateInitializer {

    constructor(generator) {
        super();
        this.generator = generator.clone();
    }

    initializeState(state) {
        this.generator.generate(state.size);
        state.initialSize.copy(state.size);
    }

    static fromJSON(particleSystem, params) {
        const generator = params.generator.type.fromJSON(params.generator.params);
        return new SizeInitializer(generator);
    }

    toJSON(typeStore) {
        return {
            'generator': this.generator.toJSON(typeStore)
        };
    }
}
