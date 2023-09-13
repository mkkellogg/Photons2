import { ParticleStateProgressType } from '../ParticleState.js';
import { ParticleStateInitializer } from './ParticleStateInitializer.js';

export class SequenceInitializer extends ParticleStateInitializer {

    constructor(particleSequences, reverse = false) {
        super();
        this.setParticleSequences(particleSequences);
        this.reverse = reverse;
    }

    setParticleSequences(particleSequences) {
        this.particleSequences = particleSequences;
    }

    initializeState(state) {
        const sequenceIDs = this.particleSequences.getSequenceIDs();
        const r = sequenceIDs.length * Math.random();
        const ir = Math.floor(r);
        const sequenceID = sequenceIDs[ir];
        const sequence = this.particleSequences.getSequence(sequenceID);
        const sequenceElement = state.sequenceElement;
        if (this.reverse) sequenceElement.x = sequence.length - 1;
        else sequenceElement.x = sequence.start;
        sequenceElement.y = sequence.id;
        sequenceElement.z = sequence.start;
        sequenceElement.w = sequence.length;
        state.progressType = ParticleStateProgressType.Sequence;
    }

    static loadFromJSON(particleSystem, params) {
        return new SequenceInitializer(particleSystem.getParticleSequences(), params.reverse);
    }
}
