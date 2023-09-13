import * as THREE from 'three';
import { ParticleStateArray } from './ParticleState.js';
import { ParticleSequenceGroup } from './ParticleSequenceGroup.js';
import { BaseParticleStateInitializer } from './initializer/BaseParticleStateInitializer.js';
import { BaseParticleStateOperator } from './operator/BaseParticleStateOperator.js';
import { Utils } from './util/Utils.js';
import { ComponentContainer } from './ComponentContainer.js';

export class ParticleSystemState {

    static NotStarted = new ParticleSystemState('NotStarted');
    static Running = new ParticleSystemState('Running');
    static Paused = new ParticleSystemState('Paused');
    static Done = new ParticleSystemState('Done');

    constructor(name) {
      this.name = name;
    }
}

export class ParticleSystem {

    constructor(owner, particleSystemRenderer) {
        this.owner = owner;
        this.owner.visible = false;
        this.visible = true;
        this.particleSystemRenderer = particleSystemRenderer;
        this.initialized = false;
        this.maximumActiveParticles = 0;
        this.activeParticleCount = 0;
        this.simulateInWorldSpace = true;
        this.emitterInitialized = false;
        this.particleEmitter = null;
        this.componentContainer = new ComponentContainer();
        this.particleStateInitializers = [];
        this.particleStateOperators = [];
        this.particleStates = null;
        this.systemState = ParticleSystemState.NotStarted;
        this.particleSequences = new ParticleSequenceGroup();
        this.onUpdateCallback = null;
    }

    init(maximumActiveParticles) {
        if (!this.initialized) {
            this.maximumActiveParticles = maximumActiveParticles;
            if (this.particleSystemRenderer) {
                this.particleSystemRenderer.setOwner(this.owner);
                this.particleSystemRenderer.init(this.maximumActiveParticles);
                this.particleStates = this.particleSystemRenderer.getParticleStateArray();
            } else {
                this.particleStates = new ParticleStateArray();
                this.particleStates.init(this.maximumActiveParticles);
            }
            this.addParticleStateInitializer(new BaseParticleStateInitializer());
            this.addParticleStateOperator(new BaseParticleStateOperator());
            this.initialized = true;
        } else {
            throw new Error('ParticleSystem::init() -> trying to intialize more than once.');
        }
    }

    getVisible() {
        return this.visible;
    }

    setVisibile(visible) {
        return this.visible = visible;
    }

    onUpdate(callback) {
        this.onUpdateCallback = callback;
    }

    update(currentTime, timeDelta) {
        if (this.systemState == ParticleSystemState.Running) {
            currentTime = (currentTime == undefined || currentTime == null) ? Utils.currentTime() : currentTime;
            timeDelta = (timeDelta == undefined || timeDelta == null) ? currentTime - this.lastUpdateTime : timeDelta;
            if (this.emitterInitialized && this.systemState == ParticleSystemState.Running) {
                const particlesToEmit = this.particleEmitter.update(timeDelta);
                if (particlesToEmit > 0) this.activateParticles(particlesToEmit);
                this.advanceActiveParticles(timeDelta);
                if (this.onUpdateCallback) this.onUpdateCallback(this.activeParticleCount);
            }
            this.componentContainer.update(currentTime, timeDelta);
            this.lastUpdateTime = currentTime;
        }
    }

    render(threeRenderer, camera) {
        if (this.getVisible()) {
            const saveAutoClear = threeRenderer.autoClear;
            threeRenderer.autoClear = false;
            this.owner.visible = true;
            threeRenderer.render(this.owner, camera);
            this.owner.visible = false;
            threeRenderer.autoClear = saveAutoClear;
        }
    }

    start() {
        if (this.systemState == ParticleSystemState.NotStarted || this.systemState == ParticleSystemState.Paused) {
            this.systemState = ParticleSystemState.Running;
            this.startTime = Utils.currentTime();
            this.lastUpdateTime = this.startTime;
        } else {
            // TODO: Decide how to handle this case
        }
    }

    pause() {
        if (this.systemState == ParticleSystemState.Running) {
            this.systemState = ParticleSystemState.Paused;
        }
    }

    stop() {

    }

    getSystemState() {
        return this.systemState;
    }

    setEmitter(emitter) {
        this.particleEmitter = emitter;
        this.particleEmitter.maximumActiveParticles = this.maximumActiveParticles;
        this.emitterInitialized = true;
        return this.particleEmitter;
    }

    addComponent(component) {
        this.componentContainer.addComponent(component);
    }

    getComponent(index) {
        return this.componentContainer.getComponent(index);
    }

    addParticleStateInitializer(initializer) {
        this.particleStateInitializers.push(initializer);
        return initializer;
    }

    getParticleStateInitializer(index) {
        if (index >= this.particleStateInitializers.length) {
            throw new Error('ParticleSystem::getParticleStateInitializer() -> "index" is out of range.');
        }
        return this.particleStateInitializers[index];
    }

    addParticleStateOperator(operator) {
        this.particleStateOperators.push(operator);
        return operator;
    }

    getParticleStateOperator(index) {
        if (index >= this.articleStateOperators.length) {
            throw new Error('ParticleSystem::getParticleStateOperator() -> "index" is out of range.');
        }
        return this.particleStateOperators[index];
    }

    getMaximumActiveParticles() {
        return this.maximumActiveParticles;
    }

    getActiveParticleCount() {
        return this.activeParticleCount;
    }

    getParticleState(index) {
        if (index >= this.activeParticleCount) {
            throw new Error('ParticleSystem::getParticleState() -> "index" is out of range.');
        }
        return this.particleStates.getState(index);
    }

    getParticleStates() {
        return this.particleStates;
    }

    getParticleSystemRenderer() {
        return this.particleSystemRenderer;
    }

    getSimulateInWorldSpace() {
        return this.simulateInWorldSpace;
    }

    setSimulateInWorldSpace(simulateInWorldSpace) {
        this.simulateInWorldSpace = simulateInWorldSpace;
    }

    addParticleSequence(start, length, id = 0) {
        this.particleSequences.addSequence(start, length, id);
    }

    getParticleSequences() {
        return this.particleSequences;
    }

    getEmitter() {
        return this.particleEmitter;
    }

    activateParticles(particleCount) {
        if (this.systemState == ParticleSystemState.Running) {
            const newActiveParticleCount = Utils.clamp(this.activeParticleCount + particleCount,
                                                    0, this.maximumActiveParticles);
            for (let i = this.activeParticleCount; i < newActiveParticleCount; i++) {
                this.activateParticle(i);
            }
            this.activeParticleCount = newActiveParticleCount;
            this.particleStates.setActiveParticleCount(this.activeParticleCount);
        }
    }

    activateParticle = function() {

        const worldPosition = new THREE.Vector4();
        const worldPosition3 = new THREE.Vector3();

        return function(index) {
            if (this.systemState == ParticleSystemState.Running) {
                const particleState = this.particleStates.getState(index);
                particleState.age = 0.0;
                for (let i = 0; i < this.particleStateInitializers.length; i++) {
                    const particleStateInitializer = this.particleStateInitializers[i];
                    particleStateInitializer.initializeState(particleState);
                }
                worldPosition.set(0, 0, 0, 1).applyMatrix4(this.owner.matrixWorld);
                worldPosition3.set(worldPosition.x, worldPosition.y, worldPosition.z);
                if (this.simulateInWorldSpace) particleState.position.add(worldPosition3);
                this.particleStates.flushParticleStateToBuffers(index);
            }
        };

    }();

    advanceActiveParticles(timeDelta) {
        if (this.systemState == ParticleSystemState.Running) {
            let i = 0;
            while (i < this.activeParticleCount) {
                const particleIsActive = this.advanceActiveParticle(i, timeDelta);
                if (!particleIsActive) {
                    if (i < this.activeParticleCount - 1) {
                        this.copyParticleInArray(this.activeParticleCount - 1, i);
                    }
                    this.activeParticleCount--;
                    continue;
                }
                i++;
            }
            this.particleStates.setActiveParticleCount(this.activeParticleCount);
        }
    }

    advanceActiveParticle(index, timeDelta) {
        if (this.systemState == ParticleSystemState.Running) {
            const particleState = this.particleStates.getState(index);
            for (let i = 0; i < this.particleStateOperators.length; i++) {
                const particleStateOperator = this.particleStateOperators[i];
                const stillAlive = particleStateOperator.updateState(particleState, timeDelta);
                const particleLifeTime = particleState.lifetime;
                if (!stillAlive || particleLifeTime != 0.0 && particleState.age >= particleLifeTime) {
                    return false;
                }
            }
            this.particleStates.flushParticleStateToBuffers(index);
            return true;
        }
        return false;
    }

    copyParticleInArray(srcIndex, destIndex) {
        this.particleStates.copyState(srcIndex, destIndex);
        this.particleStates.flushParticleStateToBuffers(destIndex);
    }

}
