import { ParticleEmitter } from './ParticleEmitter.js';

export class ContinuousParticleEmitter extends ParticleEmitter {

    constructor() {
        super();
        this.emissionMinimum = 0;
        this.emissionMaximum = 0;
    }

}
