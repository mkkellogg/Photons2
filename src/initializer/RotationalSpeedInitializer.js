import { ParticleStateInitializer } from './ParticleStateInitializer.js';

export class RotationalSpeedInitializer extends ParticleStateInitializer {

    constructor(generator) {
        super();
        this.generator = generator.clone();
    }

    initializeState(state) {
        state.rotationalSpeed = this.generator.generate();
    }

    static loadFromJSON(particleSystem, params) {
        const generator = params.generator.type.loadFromJSON(params.generator.params);
        return new RotationalSpeedInitializer(generator);
    }

}
