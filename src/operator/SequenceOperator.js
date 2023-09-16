import { ParticleStateOperator } from './ParticleStateOperator.js';

export class SequenceOperator extends ParticleStateOperator {

    constructor(particleSequences, speed, loop = false, reverse = false) {
        super();
        this.particleSequences = particleSequences;
        this.speed = speed;
        this.loop = loop;
        this.reverse = reverse;
    }

   updateState(state, timeDelta) {
        const sequenceElement = state.sequenceElement;
        const activeSequence = this.particleSequences.getSequence(sequenceElement.y);
        const tdOverS = timeDelta / this.speed;
        if (this.reverse) {
            sequenceElement.x -= tdOverS;
            if (sequenceElement.x < activeSequence.start) {
                sequenceElement.x = activeSequence.start + activeSequence.length;
                if (!this.loop) return false;
            }
        } else {
            sequenceElement.x += tdOverS;
            if (sequenceElement.x >= activeSequence.start + activeSequence.length) {
                sequenceElement.x = activeSequence.start;
                if (!this.loop) return false;
            }
        }
        return true;
    }

    static fromJSON(particleSystem, params) {
        return new SequenceOperator(particleSystem.getParticleSequences(), params.speed, params.loop, params.reverse);
    }

    toJSON() {
        return {
            'speed': this.speed,
            'loop': this.loop,
            'reverse': this.reverse
        };
    }

}
