export class ParticleSystemManager {

    constructor() {
        this.particleSystems = [];
        this.startupTime = performance.now();
        this.lastUpdateTime = this.startupTime;
    }

    update() {
        const currentTime = performance.now();
        const timeDelta = currentTime - this.lastUpdateTime;
        for (let particleSystem of this.particleSystems) {
            particleSystem.update(timeDelta);
        }
        this.lastUpdateTime = currentTime;
    }

    addParticleSystem(particleSystem) {
        this.particleSystems.push(particleSystem);
    }

}
