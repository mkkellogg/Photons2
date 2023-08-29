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
                    normal, rotation, rotationalSpeed, size, color,  alpha, initialSize, initialColor, initialAlpha);
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

export class ParticleStateArrayBase {

    constructor() {
        this.particleCount = 0;
        this.verticesPerParticles = 6;
        this.vertexCount = this.particleCount * this.verticesPerParticles;
    }

    allocate(particleCount) {
    }

    dispose() {
    }

    setParticleCount(particleCount) {
        if (this.particleCount != particleCount) {
            this.dispose();
            this.allocate(particleCount);
        }
        this.particleCount = particleCount;
    }

    getParticleCount() {
        return this.particleCount;
    }

}

export class ParticleStateAttributeArray extends ParticleStateArrayBase {

    constructor() {
        super();
        this.particleStates = [];
        this.geometry = null;
        this.progressTypes = null;
        this.lifetimes = null;
        this.ages = null;
        this.sequenceElements = null;
        this.positions = null;
        this.velocities = null;
        this.accelerations = null;
        this.normals = null;
        this.rotations = null;
        this.rotationalSpeeds = null;
        this.sizes = null;
        this.colors = null;
        this.initialSizes = null;
        this.initialColors = null;
    }

    flushParticleStateToBuffers(index) {
        if (index >= this.particleCount) {
            throw new Error("ParticleStateAttributeArray::flushParticleStateToBuffers() -> 'index' is out of range.");
        }
        particleState = this.particleStates[index];

        this.progressTypes.setX(index, particleState.progressType);
        this.lifetimes.setX(index, particleState.lifetime);
        this.ages.setX(index, particleState.age);
        this.sequenceElements.setXYZW(index, particleState.sequenceElement.x, particleState.sequenceElement.y,
                                             particleState.sequenceElement.z, particleState.sequenceElement.w);
        this.positions.setXYZ(index, particleState.position.x, particleState.position.y, particleState.position.z);
        this.velocities.setXYZ(index, particleState.velocity.x, particleState.velocity.y, particleState.velocity.z);
        this.accelerations.setXYZ(index, particleState.acceleration.x, particleState.acceleration.y, particleState.acceleration.z);
        this.normals.setXYZ(index, particleState.normal.x, particleState.normal.y, particleState.normal.z);
        this.rotations.setX(index, particleState.rotation);
        this.rotationalSpeeds.setX(index, particleState.rotationalSpeed);
        this.sizes.setXY(index, particleState.size.x, particleState.size.y);
        this.color.setXYZ(index, particleState.color.r, particleState.color.g, particleState.color.b);
        this.alphas.setX(index, particleState.alpha);
        this.initialSizes.setXY(index, particleState.initialSize.x, particleState.initialSize.y);
        this.initialAlphas.setX(index, particleState.initialAlpha);     
    }

    copyParticleState(srcIndex, destIndex) {
        if (srcIndex >= this.particleCount) {
            throw new Error("ParticleStateAttributeArray::copyParticleState() -> 'srcIndex' is out of range.");
        }
        if (destIndex >= this.particleCount) {
            throw new Error("ParticleStateAttributeArray::copyParticleState() -> 'destIndex' is out of range.");
        }

        srcParticleState = this.particleStates[srcIndex];
        destParticleState = this.particleStates[destIndex];

        srcParticleState.copyTo(destParticleState);
        this.flushParticleStateToBuffers(destIndex);
    }

    getState(index) {
        if (index >= this.particleCount) {
            throw new Error("ParticleStateAttributeArray::getParticleState() -> 'index' is out of range.");
        }
        return this.particleStatePointers.get()[index];
    }

    getPositions() {
        return this.positions;
    }

    getSizes() {
        return this.sizes;
    }

    getRotations() {
        return this.rotations;
    }

    getSequenceElements() {
        return this.sequenceElements;
    }

    getColors() {
        return this.colors;
    }

    allocate(particleCount) {
        super.allocate(particleCount);

        this.particleGeometry = new THREE.BufferGeometry();

        this.particleStates = [];
        for (let i = 0; i < particleCount; i++) this.particleStates[i] = new ParticleState();

        const progressTypesArray = new Float32Array(this.vertexCount);
        const lifetimesArray = new Float32Array(this.vertexCount);
        const agesArray = new Float32Array(this.vertexCount);
        const sequenceElementsArray = new Float32Array(this.vertexCount * 4);
        const positionsArray = new Float32Array(this.vertexCount * 3);
        const velocitiesArray = new Float32Array(this.vertexCount * 3);
        const accelerationsArray = new Float32Array(this.vertexCount * 3);
        const normalsArray = new Float32Array(this.vertexCount * 3);
        const rotationsArray = new Float32Array(this.vertexCount);
        const rotationalSpeedsArray = new Float32Array(this.vertexCount);
        const sizesArray = new Float32Array(this.vertexCount * 2);
        const colorsArray = new Float32Array(this.vertexCount * 3);
        const alphasArray = new Float32Array(this.vertexCount);
        const initialSizesArray = new Float32Array(this.vertexCount * 2);
        const initialColorsArray = new Float32Array(this.vertexCount * 3);
        const initialAlphasArray = new Float32Array(this.vertexCount);

        this.progressTypes = new THREE.BufferAttribute(progressTypesArray, 1);
		this.progressTypes.dynamic = true;
		this.particleGeometry.setAttribute('progressType', this.progressTypes);

        this.lifetimes = new THREE.BufferAttribute(lifetimesArray, 1);
		this.lifetimes.dynamic = true;
		this.particleGeometry.setAttribute('lifetime', this.lifetimes);

        this.ages = new THREE.BufferAttribute(agesArray, 1);
		this.ages.dynamic = true;
		this.particleGeometry.setAttribute('age', this.ages);
        
        this.sequenceElements = new THREE.BufferAttribute(sequenceElementsArray, 4);
		this.sequenceElements.dynamic = true;
		this.particleGeometry.setAttribute('sequenceElement', this.sequenceElements);

        this.positions = new THREE.BufferAttribute(positionsArray, 3);
		this.positions.dynamic = true;
		this.particleGeometry.setAttribute('position', this.positions);

        this.velocities = new THREE.BufferAttribute(velocitiesArray, 3);
		this.velocities.dynamic = true;
		this.particleGeometry.setAttribute('velocity', this.velocities);

        this.accelerations = new THREE.BufferAttribute(accelerationsArray, 3);
		this.accelerations.dynamic = true;
		this.particleGeometry.setAttribute('acceleration', this.accelerations);

        this.normals = new THREE.BufferAttribute(normalsArray, 3);
		this.normals.dynamic = true;
		this.particleGeometry.setAttribute('normal', this.normals);

        this.rotations = new THREE.BufferAttribute(rotationsArray, 1);
		this.rotations.dynamic = true;
		this.particleGeometry.setAttribute('rotation', this.rotations);

        this.rotationalSpeeds = new THREE.BufferAttribute(rotationalSpeedsArray, 1);
		this.rotationalSpeeds.dynamic = true;
		this.particleGeometry.setAttribute('rotationalSpeed', this.rotationalSpeeds);

        this.sizes = new THREE.BufferAttribute(sizesArray, 2);
		this.sizes.dynamic = true;
		this.particleGeometry.setAttribute('size', sizes);

        this.colors = new THREE.BufferAttribute(colorsArray, 3);
		this.colors.dynamic = true;
		this.particleGeometry.setAttribute('color', colors);

        this.alphas = new THREE.BufferAttribute(alphasArray, 1);
		this.alphas.dynamic = true;
		this.particleGeometry.setAttribute('alpha', alphas);

        this.initialSizes = new THREE.BufferAttribute(initialSizesArray, 2);
		this.initialSizes.dynamic = true;
		this.particleGeometry.setAttribute('initialSize', initialSizes);

        this.initialColors = new THREE.BufferAttribute(initialColorsArray, 3);
		this.initialColors.dynamic = true;
		this.particleGeometry.setAttribute('initialColor', initialColors);

        this.initialAlphas = new THREE.BufferAttribute(initialAlphasArray, 1);
		this.initialAlphas.dynamic = true;
		this.particleGeometry.setAttribute('initialAlpha', initialAlphas);
    }

    deallocate() {
        super.deallocate();

        this.particleGeometry.dispose();
        this.particleGeometry = null;
    }
}
