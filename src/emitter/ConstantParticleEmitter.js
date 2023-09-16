import { ContinuousParticleEmitter } from './ContinuousParticleEmitter.js';

export class ConstantParticleEmitter extends ContinuousParticleEmitter {

    constructor(emissionRate = 0.0) {
        super();
        this.emissionRate = emissionRate;
    }

    update(timeDelta) {
        if (this.internalUpdate(timeDelta)) {
            const toEmitThisFrame = this.emissionRate * this.timeActive - this.emitCount;
            if (toEmitThisFrame >= 1.0) {
                const iToEmitThisFrame = Math.floor(toEmitThisFrame);
                this.updateEmitCount(iToEmitThisFrame);
                return iToEmitThisFrame;
            }
        }
        return 0;
    }

    static fromJSON(params) {
        const emitter = new ConstantParticleEmitter();
        emitter.emissionRate = params.emissionRate || 0.0;
        return emitter;
    }

    toJSON() {
        return {
            'emissionRate': this.emissionRate
        };
    }
}
