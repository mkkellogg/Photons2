import { InterpolatorOperator } from './InterpolatorOperator.js';

export class OpacityInterpolatorOperator extends InterpolatorOperator {

    constructor(relativeToInitialValue = false) {
        super(0, relativeToInitialValue);
    }

    addElementsFromParameters(elementParametersTValuePairs) {
        super.addElements(elementParametersTValuePairs);
    }

    updateState(state) {
        if (this.relativeToInitialValue) {
            state.alpha = state.initialAlpha * this.getInterpolatedValue(state, state.alpha);
        } else {
            state.alpha = this.getInterpolatedValue(state, state.alpha);
        }
        return true;
    }


    static loadFromJSON(particleSystem, params) {
        return new OpacityInterpolatorOperator(params.relativeToInitialValue);
    }
}
