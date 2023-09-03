export class ParticleEmitter {

    constructor() {
        this.emissionRelativeStartTime = 0.0;
        this.emissionDuration = 0.0;
        this.emitCount = 0;
        this.age = 0.0;
        this.timeActive = 0.0;
        this.activeCount = 0;
        this.maximumActiveParticles = 0;
    }

    update(timeDelta) {
        this.internalUpdate(timeDelta);
        return 0;
    }

    internalUpdate(timeDelta) {
        this.age += timeDelta;
        this.timeActive = Math.max(this.age - this.emissionRelativeStartTime, 0.0);
        return this.age >= this.emissionRelativeStartTime &&
                (this.emissionDuration == 0.0 || (this.timeActive <= emissionDuration));
    }

    updateEmitCount(count) {
        this.emitCount += count;
    }

}
