import { ParticleStateArray } from './ParticleState.js';
import { ParticleSequenceGroup } from './ParticleSequenceGroup.js';

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

    constructor(owner, maxAxtiveParticles) {
        this.owner = owner;
        this.maxAxtiveParticles = maxAxtiveParticles;
        this.activeParticleCount = 0;
        this.simulateInWorldSpace = true;
        this.emitterInitialized = false;
        this.emitter = null;
        this.particleStateInitializers = [];
        this.particleStateOperators = [];
        this.particleStates = new ParticleStateArray(this.maxAxtiveParticles);
        this.systemState = ParticleSystemState.NotStarted;
        this.particleSequences = new ParticleSequenceGroup();
    }

    update(timeDelta) {
        if (this.emitterInitialized && this.systemState == ParticleSystemState.Running) {
            const particlesToEmit = this.particleEmitter.update(timeDelta);
            if (particlesToEmit > 0) this.activateParticles(particlesToEmit);
            this.advanceActiveParticles(timeDelta);
        }
    }

    start() {
        if (this.systemState == ParticleSystemState.NotStarted || this.systemState == ParticleSystemState.Paused) {
            this.systemState = ParticleSystemState.Running;
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
        this.particleEmitter.maxActiveParticles = this.maximumActiveParticles;
        this.emitterInitialized = true;
        return this.particleEmitter;
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
}
