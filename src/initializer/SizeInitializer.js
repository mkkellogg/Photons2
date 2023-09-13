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

    static loadFromJSON(particleSystem, params) {
        const generator = params.generator.type.loadFromJSON(params.generator.params);
        return new SizeInitializer(generator);
    }

}
