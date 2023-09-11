import * as THREE from 'three';
import { InterpolatorOperator } from './InterpolatorOperator.js';

export class ColorInterpolatorOperator extends InterpolatorOperator {

    constructor(relativeToInitialValue) {
        super(THREE.Color, relativeToInitialValue);
    }

    addElementsFromParameters(elementParametersTValuePairs) {
        super.addElementsFromElementClassAndParameters(THREE.Color, elementParametersTValuePairs);
    }

    updateState = function() {

        const tempColor = new THREE.Color();

        return function(state) {
            this.getInterpolatedValue(state, tempColor);
            if (this.relativeToInitialValue) {
                state.color.setRGB(state.initialColor.r * tempColor.r,
                                   state.initialColor.g * tempColor.g,
                                   state.initialColor.b * tempColor.b);
            } else {
                state.color.setRGB(c.r, c.g, c.b);
            }
            return true;
        };

    }();

}
