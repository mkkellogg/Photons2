import { ParticleStateProgressType } from '../ParticleState.js';

export class ParticleStateInitializer {

    constructor() {
    }

    initializeState(state) {
        state.initialColor.set(1.0, 1.0, 1.0);
        state.initialSize.set(1.0, 1.0);
        state.initialAlpha = 1.0;
        state.progressType = ParticleStateProgressType.Time;
        state.lifetime = 0.0;
        state.age = 0.0;
        state.sequenceElement.set(0, 0, 0, 0);
        state.position.set(0.0, 0.0, 0.0);
        state.velocity.set(0.0, 0.0, 0.0);
        state.acceleration.set(0.0, 0.0, 0.0);
        state.normal.set(0.0, 0.0, 1.0);
        state.rotation = 0.0;
        state.rotationalSpeed = 0.0;
        state.size.copy(state.initialSize);
        state.color.copy(state.initialColor);
        state.alpha = 1.0;
    }

}
