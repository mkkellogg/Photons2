import { ParticleStateInitializer } from './ParticleStateInitializer.js';
import { RandomGenerator } from '../util/RandomGenerator.js';

export class LifetimeInitializer extends ParticleStateInitializer {

    constructor(range, offset, uniformRange, uniformOffset, normalize) {
        super();
        this.range = range;
        this.offset = offset;
        this.uniformRange = uniformRange;
        this.uniformOffset = uniformOffset;
        this.normalize = normalize;
        this.generator = new RandomGenerator(0, this.range, this.offset, this.uniformRange, this.uniformOffset, this.normalize);
    }

    initializeState(state) {
        state.lifetime = this.generator.generate();
    }

    static fromJSON(particleSystem, params) {
        return new LifetimeInitializer(params.range, params.offset, params.uniformRange, params.uniformOffset, params.normalize);
    }

    toJSON() {
        return {
            'range': this.range,
            'offset': this.offset,
            'uniformRange': this.uniformRange,
            'uniformOffset': this.uniformOffset,
            'normalize': this.normalize
        };
    }
}
