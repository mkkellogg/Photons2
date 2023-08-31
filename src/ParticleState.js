import * as THREE from 'three';

export class ParticleStateProgressType {

    static Time = new ParticleSystemState('Time');
    static Sequence = new ParticleSystemState('Sequence');

    constructor(name) {
        this.name = name;
    }
}

export class ParticleState {

    constructor(progressType, lifetime, age, sequenceElement, position, velocity, acceleration,
                normal, rotation, rotationalSpeed, size, color, alpha, initialSize, initialColor, initialAlpha) {
        this.init();
        this.setAll(progressType, lifetime, age, sequenceElement, position, velocity, acceleration,
                    normal, rotation, rotationalSpeed, size, color, alpha, initialSize, initialColor, initialAlpha);
    }

    init() {
        this.progressType = ParticleStateProgressType.Time;
        this.lifetime = 1.0;
        this.age = 0.0;
        this.sequenceElement = new THREE.Vector4();
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.normal = new THREE.Vector3();
        this.rotation = 0.0;
        this.rotationalSpeed = 0.0;
        this.size = 1.0;
        this.color = new THREE.Color();
        this.alpha = 1.0;
        this.initialSize = 1.0;
        this.initialColor = new THREE.Color();
        this.initialAlpha = 1.0;
    }

    setAll(progressType, lifetime, age, sequenceElement, position, velocity, acceleration,
           normal, rotation, rotationalSpeed, size, color, alpha, initialSize, initialColor, initialAlpha) {
        this.progressType = progressType;
        this.lifetime = lifetime;
        this.age = age;
        this.sequenceElement.copy(sequenceElement);
        this.position.copy(position);
        this.velocity.copy(velocity);
        this.acceleration.copy(acceleration);
        this.normal.copy(normal);
        this.rotation = rotation;
        this.rotationalSpeed = rotationalSpeed;
        this.size = size;
        this.color.copy(color);
        this.alpha = alpha;
        this.initialSize.copy(initialSize);
        this.initialColor.copy(initialColor);
        this.initialAlpha = initialAlpha;
    }

    coptTo(dest) {
        dest.setAll(this.progressType, this.lifetime, this.age, this.sequenceElement, this.position,
                    this.velocity, this.acceleration, this.normal, this.rotation, this.rotationalSpeed,
                    this.size, this.color, this.alpha, this.initialSize, this.initialColor, this.initialAlpha);
    }
}

export class ParticleStateArray {

    constructor(particleCount) {
        this.particleCount = 0;
        this.particleStates = [];
        this.onParticleCountChangedCallback = null;
        this.onParticleStateCopiedCallback = null;

        this.setParticleCount(particleCount);
    }

    onParticleCountChanged(callback) {
        this.onParticleCountChangedCallback = callback;
    }

    onParticleStateCopied(callback) {
        this.onParticleStateCopiedCallback = callback;
    }

    allocate(particleCount) {
        this.particleStates = [];
        this.particleCount = particleCount;
        for (let i = 0; i < particleCount; i++) this.particleStates[i] = new ParticleState();
    }

    dispose() {
    }

    setParticleCount(particleCount) {
        if (this.particleCount != particleCount) {
            const oldParticleCount = this.particleCount;
            this.dispose();
            this.allocate(particleCount);
            if (this.onParticleCountChangedCallback) {
                this.onParticleCountChangedCallback(oldParticleCount, particleCount);
            }
        }
        this.particleCount = particleCount;
    }

    getParticleCount() {
        return this.particleCount;
    }

    copyParticleState(srcIndex, destIndex) {
        if (srcIndex >= this.particleCount) {
            throw new Error('ParticleStateAttributeArray::copyParticleState() -> "srcIndex" is out of range.');
        }
        if (destIndex >= this.particleCount) {
            throw new Error('ParticleStateAttributeArray::copyParticleState() -> "destIndex" is out of range.');
        }

        srcParticleState = this.particleStates[srcIndex];
        destParticleState = this.particleStates[destIndex];

        srcParticleState.copyTo(destParticleState);

        if (this.onParticleStateCopiedCallback) {
            this.onParticleStateCopiedCallback(srcIndex, destIndex);
        }
    }

    getState(index) {
        if (index >= this.particleCount) {
            throw new Error('ParticleStateArrayBase::getState() -> "index" is out of range.');
        }
        return this.particleStates[index];
    }

}
