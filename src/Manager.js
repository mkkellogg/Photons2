import * as THREE from 'three';
import { Utils } from './util/Utils.js';
import { ComponentContainer } from './ComponentContainer.js';
import { ParticleSystem } from './ParticleSystem.js';
import { BaseParticleStateInitializer } from './initializer/BaseParticleStateInitializer.js';
import { BaseParticleStateOperator } from './operator/BaseParticleStateOperator.js';

export class Manager {

    constructor() {
        this.particleSystems = [];
        this.startupTime = performance.now() / 1000;
        this.lastUpdateTime = this.startupTime;
        this.componentContainer = new ComponentContainer();
    }

    update() {
        const currentTime = Utils.currentTime();
        const timeDelta = currentTime - this.lastUpdateTime;
        for (let particleSystem of this.particleSystems) {
            particleSystem.update(currentTime, timeDelta);
        }
        this.componentContainer.update(currentTime, timeDelta);
        this.lastUpdateTime = currentTime;
    }

    render(threeRenderer, camera) {
        for (let particleSystem of this.particleSystems) {
            particleSystem.render(threeRenderer, camera);
        }
    }

    addParticleSystem(particleSystem) {
        this.particleSystems.push(particleSystem);
    }

    addComponent(component) {
        this.componentContainer.addComponent(component);
    }

    getComponent(index) {
        return this.componentContainer.getComponent(index);
    }

}
