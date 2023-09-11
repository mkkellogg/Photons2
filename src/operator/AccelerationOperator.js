import { ParticleStateOperator } from './ParticleStateOperator.js';

export class AccelerationOperator extends ParticleStateOperator {

    constructor(generator) {
        super();
        this.generator = generator.clone();
    }

    addElementsFromParameters(elementParametersTValuePairs) {
        super.addElementsFromElementClassAndParameters(THREE.Vector3, elementParametersTValuePairs);
    }

    updateState(state) {
        this.generator.generate(state.acceleration);
        return true;
    }

}
