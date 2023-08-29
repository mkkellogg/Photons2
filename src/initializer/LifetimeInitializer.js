export class LifetimeInitializer {

    constructor(generator) {
        this.generator = generator.clone();
    }

    initializeState(state) {
        state.lifetime = this.generator.generate();
    }

}
