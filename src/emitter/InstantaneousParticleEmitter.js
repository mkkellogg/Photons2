import { ParticleEmitter } from '../ParticleEmitter.js';

export class InstantaneousParticleEmitter extends ParticleEmitter {

    constructor(burstSize, maxBursts, waitTimetBetweenBursts) {
        super();
        this.burstSize = burstSize;
        this.maxBursts = maxBursts;
        this.waitTimetBetweenBursts = waitTimetBetweenBursts;
        this.burstCount = 0;
        this.timeSinceLastBurst = 0.0;
    }

    update(timeDelta) {
        if (this.internalUpdate(timeDelta)) {
            this.timeSinceLastBurst += timeDelta;
            if (this.burstCount < this.maxBursts || this.maxBursts == 0) {
                if (this.timeSinceLastBurst >= this.waitTimetBetweenBursts) {
                    this.timeSinceLastBurst -= this.waitTimetBetweenBursts;
                    this.burstCount++;
                    const toEmitThisFrame = this.burstSize;
                    this.updateEmitCount(toEmitThisFrame);
                    return toEmitThisFrame;
                }
            }
        }
        return 0;
    }

}
