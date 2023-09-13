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

    static loadFromJSON(params) {
        return new RandomGenerator(params.type, params.range, params.offset,
                                   params.uniformRange || 0.0, params.offsetRange || 0.0, params.normalize);
    }
}
