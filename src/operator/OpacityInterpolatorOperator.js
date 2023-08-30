import { InterpolatorOperator } from 'InterpolatorOperator.js';

export class OpacityInterpolatorOperator extends InterpolatorOperator {

    constructor(relativeToInitialValue) {
        super(0, relativeToInitialValue);
    }

    updateState(state) {
        if (this.relativeToInitialValue) {
            state.alpha = state.initialAlpha * this.getInterpolatedValue(state, state.alpha);
        } else {
            state.alpha = this.getInterpolatedValue(state, state.alpha);
        }
        return true;
    }

}
