export class Renderer {

    constructor() {
        this.initialized = false;
        this.particleCount = 0;
    }

    getParticleStateArray() {
    }

    init(particleCount) {
        this.particleCount = particleCount;
        if (!this.initialized) {
            this.initialized = true;
            return true;
        } else {
            throw new Error('Renderer::init() -> trying to intialize more than once.');
        }
    }
}
