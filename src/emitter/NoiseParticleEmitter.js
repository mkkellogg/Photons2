import { ContinuousParticleEmitter } from '../ContinuousParticleEmitter.js';

export class NoiseParticleEmitter extends ContinuousParticleEmitter {

    constructor() {
        super();
        this.scaleEmissionToUsedControlPoints = 0;
        this.timeNoiseCoordinateScale = 0.0;
        this.timeCoordinateOffset = 0.0;
        this.absoluteValue = 0.0;
        this.invertAbsoluteValue = 0.0;
        this.worldTimeNoiseCoordinateScale = 0.0;
    }

}
