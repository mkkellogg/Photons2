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

        return function(typeID) {
            switch (typeID) {
                case BuiltinType.Scalar:
                    return (tValue) => {
                        this.getInterpolationValuesForTValue(tValue, iResult);
                        return (1.0 - iResult.localT) * this.elements[iResult.lowerIndex] +
                                iResult.localT * this.elements[iResult.upperIndex];
                    };
                case BuiltinType.Vector2:
                    return (tValue, elements, tValues, out) => {
                        this.getInterpolationValuesForTValue(tValue, iResult);
                        out.copy(this.elements[iResult.lowerIndex]);
                        upper2.copy(this.elements[iResult.upperIndex]);
                        out.set(out.x * (1.0 - iResult.localT) + iResult.localT * upper2.x,
                                out.y * (1.0 - iResult.localT) + iResult.localT * upper2.y);

                    };
                case BuiltinType.Vector3:
                    return (tValue, elements, tValues, out) => {
                        this.getInterpolationValuesForTValue(tValue, iResult);
                        out.copy(this.elements[iResult.lowerIndex]);
                        upper3.copy(this.elements[iResult.upperIndex]);
                        out.set(out.x * (1.0 - iResult.localT) + iResult.localT * upper3.x,
                                out.y * (1.0 - iResult.localT) + iResult.localT * upper3.y,
                                out.z * (1.0 - iResult.localT) + iResult.localT * upper3.z);
                    };
                case BuiltinType.Vector4:
                    return (tValue, elements, tValues, out) => {
                        this.getInterpolationValuesForTValue(tValue, iResult);
                        out.copy(this.elements[iResult.lowerIndex]);
                        upper4.copy(this.elements[iResult.upperIndex]);
                        out.set(out.x * (1.0 - iResult.localT) + iResult.localT * upper4.x,
                                out.y * (1.0 - iResult.localT) + iResult.localT * upper4.y,
                                out.z * (1.0 - iResult.localT) + iResult.localT * upper4.z,
                                out.w * (1.0 - iResult.localT) + iResult.localT * upper4.w);
                    };
                case BuiltinType.Color:
                    return (tValue, elements, tValues, out) => {
                        this.getInterpolationValuesForTValue(tValue, iResult);
                        out.copy(this.elements[iResult.lowerIndex]);
                        upperC.copy(this.elements[iResult.upperIndex]);
                        out.setRGB(out.r * (1.0 - iResult.localT) + iResult.localT * upperC.r,
                                   out.g * (1.0 - iResult.localT) + iResult.localT * upperC.g,
                                   out.b * (1.0 - iResult.localT) + iResult.localT * upperC.b);
                    };

            }
        };

    }();

    getInterpolationValuesForTValue(t, iResult) {
        let tValueCount = this.tValues.length;
        if (tValueCount === 0) {
            iResult.lowerIndex = -1;
            iResult.upperIndex = -1;
            iResult.localT = -1.0;
            return;
        }
        let tValue = 0.0;
        lowerIndex = -1;
        upperIndex = 0;
        for (let i = 0; i < tValueCount; i++) {
            tValue = this.tValues[i];
            if (tValue > t) break;
            lowerIndex++;
            upperIndex++;
        }
        iResult.lowerIndex = Utils.clamp(lowerIndex, 0, tValueCount - 1);
        iResult.upperIndex = Utils.clamp(upperIndex, 0, tValueCount - 1);
        let lowerTValue = this.tValues[lowerIndex];
        let upperTValue = this.tValues[upperIndex];
        iResult.localT = (t - lowerTValue) / (upperTValue - lowerTValue);
    }

}
