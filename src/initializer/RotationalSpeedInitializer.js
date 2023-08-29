export class RotationalSpeedInitializer {

    constructor(generator) {
        this.generator = generator.clone();
    }

    initializeState(state) {
        state.rotationalSpeed = this.generator.generate();
    }

}
