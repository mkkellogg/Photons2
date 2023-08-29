export class SizeInitializer {

    constructor(generator) {
        this.generator = generator.clone();
    }

    initializeState(state) {
        this.generator.generate(state.size);
        state.initialSize.copy(state.size);
    }

}
