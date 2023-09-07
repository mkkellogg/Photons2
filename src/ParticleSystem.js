import * as THREE from 'three';
import { ParticleStateArray } from './ParticleState.js';
import { ParticleSequenceGroup } from './ParticleSequenceGroup.js';
import { Utils } from './util/Utils.js';

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
        this.particleSystemRenderer = particleSystemRenderer;
        this.initialized = false;
        this.maximumActiveParticles = 0;
        this.activeParticleCount = 0;
        this.simulateInWorldSpace = true;
        this.emitterInitialized = false;
        this.emitter = null;
        this.lights = [];
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
        } else {
            throw new Error('ParticleSystem::init() -> trying to intialize more than once.');
        }
    }

    currentTime() {
        return performance.now() / 1000;
    }

    onUpdate(callback) {
        this.onUpdateCallback = callback;
    }

    update() {
        const curTime = this.currentTime();
        const timeDelta = curTime - this.lastUpdateTime;
        if (this.emitterInitialized && this.systemState == ParticleSystemState.Running) {
            const particlesToEmit = this.particleEmitter.update(timeDelta);
            if (particlesToEmit > 0) this.activateParticles(particlesToEmit);
            this.advanceActiveParticles(timeDelta);
            if (this.onUpdateCallback) this.onUpdateCallback(this.activeParticleCount);
        }
        for (let light of this.lights) {
            light.update(curTime, timeDelta);
        }
        this.lastUpdateTime = curTime;
    }

    render(threeRenderer, camera) {
        const saveAutoClear = threeRenderer.autoClear;
        threeRenderer.autoClear = false;
        this.owner.visible = true;
        threeRenderer.render(this.owner, camera);
        this.owner.visible = false;
        threeRenderer.autoClear = saveAutoClear;
    }

    start() {
        if (this.systemState == ParticleSystemState.NotStarted || this.systemState == ParticleSystemState.Paused) {
            this.systemState = ParticleSystemState.Running;
            this.startTime = this.currentTime();
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

    setEmitter(EmitterClass, ...args) {
        this.particleEmitter = new EmitterClass(...args);
        this.particleEmitter.maximumActiveParticles = this.maximumActiveParticles;
        this.emitterInitialized = true;
        return this.particleEmitter;
    }

    addLight(LightClass, ...args) {
        const light = new LightClass(...args);
        this.lights.push(light);
        return light;
    }

    getLight(index) {
        if (index >= this.lights.length) {
            throw new Error('ParticleSystem::getLight() -> "index" is out of range.');
        }
        return this.lights[index];
    }

    addParticleStateInitializer(InitializerClass, ...args) {
        const initializer = new InitializerClass(...args);
        this.particleStateInitializers.push(initializer);
        return initializer;
    }

    getParticleStateInitializer(index) {
        if (index >= this.particleStateInitializers.length) {
            throw new Error('ParticleSystem::getParticleStateInitializer() -> "index" is out of range.');
        }
        return this.particleStateInitializers[index];
    }

    addParticleStateOperator(OperatorClass, ...args) {
        const operator = new OperatorClass(...args);
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
        return this.emitter;
    }

    activateParticles(particleCount) {
        const newActiveParticleCount = Utils.clamp(this.activeParticleCount + particleCount,
                                                   0, this.maximumActiveParticles);
        for (let i = this.activeParticleCount; i < newActiveParticleCount; i++) {
            this.activateParticle(i);
        }
        this.activeParticleCount = newActiveParticleCount;
        this.particleStates.setActiveParticleCount(this.activeParticleCount);
    }

    activateParticle = function() {

        const worldPosition = new THREE.Vector4();
        const worldPosition3 = new THREE.Vector3();

        return function(index) {
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
        };

    }();

    advanceActiveParticles(timeDelta) {
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

    advanceActiveParticle(index, timeDelta) {
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

    copyParticleInArray(srcIndex, destIndex) {
        this.particleStates.copyState(srcIndex, destIndex);
        this.particleStates.flushParticleStateToBuffers(destIndex);
    }

}
