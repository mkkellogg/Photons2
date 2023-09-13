import { ParticleStateInitializer } from './ParticleStateInitializer.js';

export class LifetimeInitializer extends ParticleStateInitializer {

    constructor(generator) {
        super();
        this.generator = generator.clone();
    }

    initializeState(state) {
        state.lifetime = this.generator.generate();
    }

    static loadFromJSON(particleSystem, params) {
        const generator = params.generator.type.loadFromJSON(params.generator.params);
        return new LifetimeInitializer(generator);
    }

}
