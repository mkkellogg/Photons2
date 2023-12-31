import { ParticleSequence } from './ParticleSequence.js';

export class ParticleSequenceGroup {

    constructor() {
        this.sequences = {};
        this.ids = [];
    }

    addSequence(start, length, id) {
        if (this.hasID(id)) {
            throw new Error('ParticleSequenceGroup::addParticleSequence -> Tried to add sequence with duplicate ID.');
        }

        const sequence = new ParticleSequence(start, length, id);
        this.sequences[id] = sequence;
        this.ids.push(id);
        return sequence;
    }

    getSequence(id) {
        if (!this.hasID(id)) {
            throw new Error('ParticleSequenceGroup::getSequence -> Invalid ID.');
        }
        return this.sequences[id];
    }

    getSequenceIDs() {
        return this.ids;
    }

    hasID(id) {
        if (!this.sequences[id]) return false;
        return true;
    }

}
