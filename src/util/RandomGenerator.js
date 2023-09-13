import * as THREE from 'three';
import { Generator } from './Generator.js';
import { BuiltinType } from './BuiltIn.js';

export class RandomGenerator extends Generator {

    constructor(outType, range, offset, uniformRange, uniformOffset, normalize) {
        super(outType);
        this.range = range;
        this.offset = offset;
        this.uniformRange = uniformRange;
        this.uniformOffset = uniformOffset;
        this.normalize = normalize;
    }

    generate(out) {
        const uniformRange = Math.random() * this.uniformRange;
        switch (this.outTypeID) {
            case BuiltinType.Scalar:
                out = Math.random() * this.range + this.offset;
                if (this.normalize) out = out < 0 ? -1.0 : 1.0;
            break;
            case BuiltinType.Vector2:
                out.set(this.generateForElement(uniformRange, 'x'),
                        this.generateForElement(uniformRange, 'y'));
            break;
            case BuiltinType.Vector3:
                out.set(this.generateForElement(uniformRange, 'x'),
                        this.generateForElement(uniformRange, 'y'),
                        this.generateForElement(uniformRange, 'z'));
            break;
            case BuiltinType.Vector4:
                out.set(this.generateForElement(uniformRange, 'x'),
                        this.generateForElement(uniformRange, 'y'),
                        this.generateForElement(uniformRange, 'z'),
                        this.generateForElement(uniformRange, 'w'));
            break;
        }

        if (this.normalize) out.normalize();
        return out;
    }

    generateForElement(uniformRange, e) {
        return uniformRange + Math.random() * this.range[e] + this.offset[e] + this.uniformOffset;
    }

    clone() {
        const clone = new RandomGenerator(this.outType, this.range, this.offset, this.uniformRange,
                                          this.uniformOffset, this.normalize);
        return clone;
    }

    static loadJSONParameter(param, type) {
        switch (type) {
            case THREE.Vector2:
                return new THREE.Vector2().fromArray(param);
            case THREE.Vector3:
                return new THREE.Vector3().fromArray(param);
            case THREE.Vector4:
                return new THREE.Vector4().fromArray(param);
            case THREE.Color:
                return new THREE.Color().fromArray(param);
        }

        return param;
    }

    static loadFromJSON(params) {
        return new RandomGenerator(params.type,
                                   RandomGenerator.loadJSONParameter(params.range, params.type),
                                   RandomGenerator.loadJSONParameter(params.offset, params.type),
                                   params.uniformRange || 0.0, params.uniformOffset || 0.0, params.normalize);
    }
}
