import * as THREE from 'three';
import { InterpolatorOperator } from './InterpolatorOperator.js';

export class SizeInterpolatorOperator extends InterpolatorOperator {

    constructor(relativeToInitialValue) {
        super(new THREE.Vector2(), relativeToInitialValue);
    }

    updateState = function() {

        const tempSize = new THREE.Vector2();

        return function(state) {
            this.getInterpolatedValue(state, tempSize);
            if (this.relativeToInitialValue) {
                state.size.set(state.initialSize.x * tempSize.r,
                               state.initialSize.y * tempSize.g);
            } else {
                state.size.copy(tempSize);
            }
            return true;
        };

    }();

}
