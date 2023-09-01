import * as THREE from 'three';

export class ParticleStateProgressType {

    static Time = new ParticleStateProgressType('Time');
    static Sequence = new ParticleStateProgressType('Sequence');

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

    copyTo(dest) {
        dest.setAll(this.progressType, this.lifetime, this.age, this.sequenceElement, this.position,
                    this.velocity, this.acceleration, this.normal, this.rotation, this.rotationalSpeed,
                    this.size, this.color, this.alpha, this.initialSize, this.initialColor, this.initialAlpha);
    }

    copy(src) {
        this.setAll(src.progressType, src.lifetime, src.age, src.sequenceElement, src.position,
                    src.velocity, src.acceleration, src.normal, src.rotation, src.rotationalSpeed,
                    src.size, src.color, src.alpha, src.initialSize, src.initialColor, src.initialAlpha);
    }
}

export class ParticleStateArray {

    constructor() {
        this.particleCount = 0;
        this.particleStates = [];
    }

    init(particleCount) {
        this.setParticleCount(particleCount);
    }

    setParticleCount(particleCount) {
        if (this.particleCount != particleCount) {
            this.dispose();
            this.allocate(particleCount);
        }
        this.particleCount = particleCount;
    }

    allocate(particleCount) {
        this.particleStates = [];
        this.particleCount = particleCount;
        for (let i = 0; i < particleCount; i++) this.particleStates[i] = new ParticleState();
    }

    dispose() {
    }

    getParticleCount() {
        return this.particleCount;
    }

    copyState(srcIndex, destIndex) {
        if (srcIndex >= this.particleCount) {
            throw new Error('ParticleStateAttributeArray::copyState() -> "srcIndex" is out of range.');
        }
        if (destIndex >= this.particleCount) {
            throw new Error('ParticleStateAttributeArray::copyState() -> "destIndex" is out of range.');
        }

        srcParticleState = this.particleStates[srcIndex];
        destParticleState = this.particleStates[destIndex];

        srcParticleState.copyTo(destParticleState);
    }

    setState(index, state) {
        if (index >= this.particleCount) {
            throw new Error('ParticleStateArrayBase::setState() -> "index" is out of range.');
        }
        return this.particleStates[index].copy(state);
    }

    getState(index) {
        if (index >= this.particleCount) {
            throw new Error('ParticleStateArrayBase::getState() -> "index" is out of range.');
        }
        return this.particleStates[index];
    }

}
