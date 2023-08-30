export class ParticleSystemSnapshot {

    constructor() {
        this.particleStates = [];
    }

    addState(state) {
        this.particleStates.push(state);
    }

    getState(index) {
        if (index >= this.particleStates.length) {
            throw new Error('ParticleSystemSnapShot::getState -> "index" is out of range.');
        }
        return this.particleStates[index];
    }

}
