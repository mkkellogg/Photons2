import * as THREE from 'three';

export class ParticleStateProgressType {

    static Time = new ParticleStateProgressType('Time');
    static Sequence = new ParticleStateProgressType('Sequence');

    constructor(name) {
        this.name = name;
    }
}

export class ParticleState {

    constructor() {
        this.init();
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
        this.size = new THREE.Vector2();
        this.color = new THREE.Color();
        this.alpha = 1.0;
        this.initialSize = new THREE.Vector2();
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
        this.activeParticleCount = 0;
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

    setActiveParticleCount(activeParticleCount) {
        this.activeParticleCount = activeParticleCount;
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

    flushParticleStateToBuffers() {
    }

    copyState(srcIndex, destIndex) {
        if (srcIndex >= this.particleCount) {
            throw new Error('ParticleStateArray::copyState() -> "srcIndex" is out of range.');
        }
        if (destIndex >= this.particleCount) {
            throw new Error('ParticleStateArray::copyState() -> "destIndex" is out of range.');
        }

        const srcParticleState = this.particleStates[srcIndex];
        const destParticleState = this.particleStates[destIndex];

        srcParticleState.copyTo(destParticleState);
    }

    setState(index, state) {
        if (index >= this.particleCount) {
            throw new Error('ParticleStateArray::setState() -> "index" is out of range.');
        }
        return this.particleStates[index].copy(state);
    }

    getState(index) {
        if (index >= this.particleCount) {
            throw new Error('ParticleStateArray::getState() -> "index" is out of range.');
        }
        return this.particleStates[index];
    }

    computeBoundingBox = function() {

        const tempPos = new THREE.Vector3();

        return function(outBox = new THREE.Box3(), positionTransform = null) {
            const min = outBox.min;
            const max = outBox.max;
            for (let i = 0; i < this.activeParticleCount; i++) {
                const particleState = this.getState(i);
                let pos = particleState.position;
                if (positionTransform) {
                    tempPos.copy(pos);
                    tempPos.applyMatrix4(positionTransform);
                    pos = tempPos;
                }
                const maxExtent = Math.max(particleState.size.x, particleState.size.y);
                const lowerX = pos.x - maxExtent;
                const upperX = pos.x + maxExtent;
                const lowerY = pos.y - maxExtent;
                const upperY = pos.y + maxExtent;
                const lowerZ = pos.x - maxExtent;
                const upperZ = pos.x + maxExtent;
                if (i == 0 || pos.x < lowerX) min.x = lowerX;
                if (i == 0 || pos.x > upperX) max.x = upperX;
                if (i == 0 || pos.y < lowerY) min.y = lowerY;
                if (i == 0 || pos.y > upperY) max.y = upperY;
                if (i == 0 || pos.z < lowerZ) min.z = lowerZ;
                if (i == 0 || pos.z > upperZ) max.z = upperZ;
            }
            return outBox;
        };

    }();

    computeBoundingSphere = function() {

        const tempCenter = new THREE.Vector3();
        const tempVector = new THREE.Vector3();
        const tempPos = new THREE.Vector3();

        return function(outSphere = new THREE.Sphere(), positionTransform = null) {
            let radius = 0;
            for (let i = 0; i < this.activeParticleCount; i++) {
                const particleState = this.getState(i);
                let pos = particleState.position;
                if (positionTransform) {
                    tempPos.copy(pos);
                    tempPos.applyMatrix4(positionTransform);
                    pos = tempPos;
                }
                const maxExtent = Math.max(particleState.size.x, particleState.size.y);
                if (i == 0) {
                    tempCenter.copy(pos);
                    radius = maxExtent;
                } else {
                    tempVector.copy(pos).sub(tempCenter);
                    const distFromCenter = tempVector.length();
                    if (distFromCenter > radius) {
                        const diff = distFromCenter - radius;
                        const adjustDiff = diff / 2;
                        tempVector.normalize().multiplyScalar(adjustDiff);
                        tempCenter.add(tempVector);
                        radius += adjustDiff;
                    }
                }
            }
            outSphere.center.copy(tempCenter);
            outSphere.radius = radius;
            return outSphere;
        };

    }();
}
