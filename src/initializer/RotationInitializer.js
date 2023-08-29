export class RotationInitializer {

    constructor(generator) {
        this.generator = generator.clone();
    }

    initializeState(state) {
        this.generator.generate(state.rotation);
    }

}
