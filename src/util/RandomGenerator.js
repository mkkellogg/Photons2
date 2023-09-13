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
            case BuiltinType.Default:
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

    static getParameterJSON(param) {
        if (param instanceof THREE.Vector2 || param instanceof THREE.Vector3 ||
            param instanceof THREE.Vector4 || param instanceof THREE.Color) return param.toArray();
        return param;
    }

    static loadFromJSON(params) {
        return new RandomGenerator(params.type,
                                   BuiltinType.loadJSONParameter(params.range, params.type),
                                   BuiltinType.loadJSONParameter(params.offset, params.type),
                                   params.uniformRange || 0.0, params.uniformOffset || 0.0, params.normalize);
    }

    toJSON(typeStore) {
        const params = {
            'range': RandomGenerator.getParameterJSON(this.range),
            'offset': RandomGenerator.getParameterJSON(this.offset),
            'uniformRange': this.uniformRange,
            'uniformOffset': this.uniformOffset
        };
        const type = typeStore.getJSONTypePath(this.range.constructor);
        if (type !== undefined && type !== null) {
            params['type'] = type;
        }
        return {
            'type': typeStore.getJSONTypePath(RandomGenerator),
            'params': params
        };
    }
}
