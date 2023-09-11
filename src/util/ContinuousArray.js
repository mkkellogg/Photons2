import * as THREE from 'three';
import { BuiltinType } from './BuiltIn.js';
import { Utils } from '../util/Utils.js';

export class ContinuousArray {

    constructor(ElementType, interpolator) {
        this.elements = [];
        this.tValues = [];
        this.elementTypeID = BuiltinType.getTypeID(ElementType);
        if (interpolator) {
            this.interpolator = interpolator;
        } else {
            this.interpolator = this.getInterpolatorForTypeID(this.elementTypeID);
        }
    }

    addElement(element, tValue) {
        this.elements.push(element);
        this.tValues.push(tValue);
    }

    getInterpolatedElement(t, out) {
        return this.interpolator(t, this.elements, this.tValues, out);
    }

    getInterpolatorForTypeID = function() {

        const iResult = {
            'lowerIndex': 0,
            'upperIndex': 0,
            'localT': 0.0
        };
        const upper2 = new THREE.Vector2();
        const upper3 = new THREE.Vector3();
        const upper4 = new THREE.Vector4();
        const upperC = new THREE.Color();

        const getVectorBasedInterpolator = (upperVector) => {
            return (tValue, elements, tValues, out) => {
                ContinuousArray.getInterpolationValuesForTValue(tValues, tValue, iResult);
                upperVector.copy(elements[iResult.upperIndex]).multiplyScalar(iResult.localT);
                out.copy(elements[iResult.lowerIndex]).multiplyScalar((1.0 - iResult.localT)).add(upperVector);

            };
        };

        return function(typeID) {
            switch (typeID) {
                case BuiltinType.Scalar:
                    return (tValue, elements, tValues) => {
                        ContinuousArray.getInterpolationValuesForTValue(tValues, tValue, iResult);
                        return (1.0 - iResult.localT) * elements[iResult.lowerIndex] +
                                iResult.localT * elements[iResult.upperIndex];
                    };
                case BuiltinType.Vector2:
                    return getVectorBasedInterpolator(upper2);
                case BuiltinType.Vector3:
                    return getVectorBasedInterpolator(upper3);
                case BuiltinType.Vector4:
                    return getVectorBasedInterpolator(upper4);
                case BuiltinType.Color:
                    return getVectorBasedInterpolator(upperC);
            }
        };

    }();

    static getInterpolationValuesForTValue(tValues, t, iResult) {
        let tValueCount = tValues.length;
        if (tValueCount === 0) {
            iResult.lowerIndex = -1;
            iResult.upperIndex = -1;
            iResult.localT = -1.0;
            return;
        }
        let tValue = 0.0;
        let lowerIndex = -1;
        let upperIndex = 0;
        for (let i = 0; i < tValueCount; i++) {
            tValue = tValues[i];
            if (tValue > t) break;
            lowerIndex++;
            upperIndex++;
        }
        iResult.lowerIndex = Utils.clamp(lowerIndex, 0, tValueCount - 1);
        iResult.upperIndex = Utils.clamp(upperIndex, 0, tValueCount - 1);
        let lowerTValue = tValues[lowerIndex];
        let upperTValue = tValues[upperIndex];
        iResult.localT = (t - lowerTValue) / (upperTValue - lowerTValue);
    }

}
