import * as THREE from 'three';
import { InterpolatorOperator } from './InterpolatorOperator.js';

export class SizeInterpolatorOperator extends InterpolatorOperator {

    constructor(relativeToInitialValue = false) {
        super(THREE.Vector2, relativeToInitialValue);
    }

    addElementsFromParameters(elementParametersTValuePairs) {
        super.addElementsFromElementClassAndParameters(THREE.Vector2, elementParametersTValuePairs);
    }

    updateState = function() {

        const tempSize = new THREE.Vector2();

        return function(state) {
            this.getInterpolatedValue(state, tempSize);
            if (this.relativeToInitialValue) {
                state.size.set(state.initialSize.x * tempSize.x,
                               state.initialSize.y * tempSize.y);
            } else {
                state.size.copy(tempSize);
            }
            return true;
        };

    }();

    static loadFromJSON(particleSystem, params) {
        return new SizeInterpolatorOperator(params.relativeToInitialValue);
    }
}
