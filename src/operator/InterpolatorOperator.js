import { ParticleStateOperator } from './ParticleStateOperator.js';
import { ContinuousArray } from '../util/ContinuousArray.js';
import { ParticleStateProgressType } from '../ParticleState.js';

export class InterpolatorOperator extends ParticleStateOperator {

        constructor(ElementType, relativeToInitialValue = false) {
            super();
            this.relativeToInitialValue = relativeToInitialValue;
            this.interpolationElements = new ContinuousArray(ElementType);
        }

        addElement(element, tValue) {
            this.interpolationElements.addElement(element, tValue);
        }

        getInterpolatedValue(state, out) {
            let t = 0;
            switch (state.progressType) {
                case ParticleStateProgressType.Time:
                {
                    let lifetime = state.lifetime;
                    if (lifetime != 0.0) {
                        t = state.age / state.lifetime;
                    } else {
                        t = state.age;
                    }
                }
                break;
                case ParticleStateProgressType.Sequence:
                    t = state.sequenceElement.x / state.sequenceElement.w;
                break;
            }
            return this.interpolationElements.getInterpolatedElement(t, out);
        }

}
