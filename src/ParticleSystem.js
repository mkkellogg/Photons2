import * as THREE from 'three';
import { ParticleStateAttributeArray } from './ParticleState.js'
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

        this.particlesStates = new ParticleStateAttributeArray(this.maxAxtiveParticles);
        this.particlesStates.setParticleCount(this.maxAxtiveParticles);

        const particleSequences= new ParticleSequenceGroup();

        this.systemState = ParticleSystemState.NotStarted;
    }

    update(timeDelta){

    }

    start() {

    }

    pause() {

    }

    stop() {

    }

    getSystemState() {
        return this.systemState;
    }

    setEmitter(...args) {

    }

    addParticleStateInitializer(...args) {

    }

    getParticleStateInitializer() {

    }

    addParticleStateOperator(...args) {

    }

    getParticleStateOperator() {

    }

    getMaximumActiveParticles() {

    }

    getActiveParticleCount() {

    }

    getParticleStatePointer(index) {

    }

    getParticleStates() {

    }

    getSimulateInWorldSpace() {

    }

    setSimulateInWorldSpace(simulateInWorldSpace) {

    }

    addParticleSequence(start, length, id = 0) {

    }
    
    getParticleSequences() {

    }

    getEmitter() {

    }
};