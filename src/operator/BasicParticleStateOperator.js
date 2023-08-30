export class BasicParticleStateOperator {

    constructor() {
    }

    updateState = function() {

        const timeScaledVelocity = new THREE.Vector3();
        const timeScaledAcceleration = new THREE.Vector3();
        const stateAcceleration = new THREE.Vector3();
        const stateVelocity = new THREE.Vector3();

        return function (state, timeDelta) {
            super.updateState(state, timeDelta);
            stateAcceleration.copy(state.acceleration);
            timeScaledAcceleration.copy(stateAcceleration);
            timeScaledAcceleration.scale(timeDelta);
            state.velocity.add(timeScaledAcceleration);
    
            stateVelocity.copy(state.velocity);
            timeScaledVelocity.copy(stateVelocity);
            timeScaledVelocity.scale(timeDelta);
           
            state.position.add(timeScaledVelocity);
    
            state.age = state.age + timeDelta;
    
            state.rotation = state.rotation + timeDelta * state.rotationalSpeed;
            return true;
        };
    
    }();

}
