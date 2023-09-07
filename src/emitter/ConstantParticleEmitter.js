import { ContinuousParticleEmitter } from './ContinuousParticleEmitter.js';

export class ConstantParticleEmitter extends ContinuousParticleEmitter {

    constructor() {
        super();
        this.emissionRate = 0.0;
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

}
