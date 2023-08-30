import { ParticleStateOperator } from './ParticleStateOperator.js';

export class AccelerationOperator extends ParticleStateOperator {

    constructor(generator) {
        super();
        this.generator = generator.clone();
    }

    updateState(state) {
        this.generator.generate(state.acceleration);
        return true;
    }

}
