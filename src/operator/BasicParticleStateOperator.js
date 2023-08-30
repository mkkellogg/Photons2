import { ParticleStateOperator } from './ParticleStateOperator.js';

export class BasicParticleStateOperator extends ParticleStateOperator {

    constructor() {
        super();
        this.timeScaledVelocity = new THREE.Vector3();
        this.timeScaledAcceleration = new THREE.Vector3();
        this.stateAcceleration = new THREE.Vector3();
        this.stateVelocity = new THREE.Vector3();
    }

    updateState(state, timeDelta) {
        super.updateState(state, timeDelta);
        this.stateAcceleration.copy(state.acceleration);
        this.timeScaledAcceleration.copy(this.stateAcceleration);
        this.timeScaledAcceleration.scale(timeDelta);
        state.velocity.add(this.timeScaledAcceleration);

        this.stateVelocity.copy(state.velocity);
        this.timeScaledVelocity.copy(this.stateVelocity);
        this.timeScaledVelocity.scale(timeDelta);

        state.position.add(this.timeScaledVelocity);

        state.age = state.age + timeDelta;

        state.rotation = state.rotation + timeDelta * state.rotationalSpeed;
        return true;
    }

}
