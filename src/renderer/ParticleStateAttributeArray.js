import * as THREE from 'three';
import { ParticleStateArray } from '../ParticleState.js';

export class ParticleStateAttributeArray extends ParticleStateArray {

    constructor() {
        super();
        this.verticesPerParticles = 6;
        this.vertexCount = 0;
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

    init(particleCount) {
        super.init(particleCount);
        this.allocate(particleCount);
    }

    setParticleCount(particleCount) {
        super.setParticleCount(particleCount);
        this.vertexCount = particleCount * this.verticesPerParticles;
    }

    flushParticleStateToBuffers(index) {
        if (index >= this.stateArray.particleCount) {
            throw new Error('ParticleStateAttributeArray::flushParticleStateToBuffers() -> "index" is out of range.');
        }
        particleState = this.stateArray.getState(index);

        const offset = index * this.verticesPerParticles;

        for (let i = 0; i < this.vertexCount; i++) {
            this.progressTypes.setX(offset + i, particleState.progressType);
            this.lifetimes.setX(offset + i, particleState.lifetime);
            this.ages.setX(offset + i, particleState.age);
            this.sequenceElements.setXYZW(offset + i, particleState.sequenceElement.x, particleState.sequenceElement.y,
                                                      particleState.sequenceElement.z, particleState.sequenceElement.w);
            this.positions.setXYZ(offset + i, particleState.position.x,
                                  particleState.position.y, particleState.position.z);
            this.velocities.setXYZ(offset + i, particleState.velocity.x,
                                   particleState.velocity.y, particleState.velocity.z);
            this.accelerations.setXYZ(offset + i, particleState.acceleration.x,
                                                  particleState.acceleration.y, particleState.acceleration.z);
            this.normals.setXYZ(offset + i, particleState.normal.x, particleState.normal.y, particleState.normal.z);
            this.rotations.setX(offset + i, particleState.rotation);
            this.rotationalSpeeds.setX(offset + i, particleState.rotationalSpeed);
            this.sizes.setXY(offset + i, particleState.size.x, particleState.size.y);
            this.color.setXYZ(offset + i, particleState.color.r, particleState.color.g, particleState.color.b);
            this.alphas.setX(offset + i, particleState.alpha);
            this.initialSizes.setXY(offset + i, particleState.initialSize.x, particleState.initialSize.y);
            this.initialAlphas.setX(offset + i, particleState.initialAlpha);
        }
    }

    copyState(srcIndex, destIndex) {
        super.copyState(srcIndex, destIndex);
        this.flushParticleStateToBuffers(destIndex);
    }

    setState(index, state) {
        if (index >= this.particleCount) {
            throw new Error('ParticleStateAttributeArray::setState() -> "index" is out of range.');
        }
        super.setState(index, state);
        this.flushParticleStateToBuffers(index);
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

    getGeometry() {
        return this.geometry;
    }

    allocate(particleCount) {

        super.allocate(particleCount);

        this.geometry = new THREE.BufferGeometry();

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
        this.geometry.setAttribute('progressType', this.progressTypes);

        this.lifetimes = new THREE.BufferAttribute(lifetimesArray, 1);
        this.lifetimes.dynamic = true;
        this.geometry.setAttribute('lifetime', this.lifetimes);

        this.ages = new THREE.BufferAttribute(agesArray, 1);
        this.ages.dynamic = true;
        this.geometry.setAttribute('age', this.ages);

        this.sequenceElements = new THREE.BufferAttribute(sequenceElementsArray, 4);
        this.sequenceElements.dynamic = true;
        this.geometry.setAttribute('sequenceElement', this.sequenceElements);

        this.positions = new THREE.BufferAttribute(positionsArray, 3);
        this.positions.dynamic = true;
        this.geometry.setAttribute('position', this.positions);

        this.velocities = new THREE.BufferAttribute(velocitiesArray, 3);
        this.velocities.dynamic = true;
        this.geometry.setAttribute('velocity', this.velocities);

        this.accelerations = new THREE.BufferAttribute(accelerationsArray, 3);
        this.accelerations.dynamic = true;
        this.geometry.setAttribute('acceleration', this.accelerations);

        this.normals = new THREE.BufferAttribute(normalsArray, 3);
        this.normals.dynamic = true;
        this.geometry.setAttribute('normal', this.normals);

        this.rotations = new THREE.BufferAttribute(rotationsArray, 1);
        this.rotations.dynamic = true;
        this.geometry.setAttribute('rotation', this.rotations);

        this.rotationalSpeeds = new THREE.BufferAttribute(rotationalSpeedsArray, 1);
        this.rotationalSpeeds.dynamic = true;
        this.geometry.setAttribute('rotationalSpeed', this.rotationalSpeeds);

        this.sizes = new THREE.BufferAttribute(sizesArray, 2);
        this.sizes.dynamic = true;
        this.geometry.setAttribute('size', this.sizes);

        this.colors = new THREE.BufferAttribute(colorsArray, 3);
        this.colors.dynamic = true;
        this.geometry.setAttribute('color', this.colors);

        this.alphas = new THREE.BufferAttribute(alphasArray, 1);
        this.alphas.dynamic = true;
        this.geometry.setAttribute('alpha', this.alphas);

        this.initialSizes = new THREE.BufferAttribute(initialSizesArray, 2);
        this.initialSizes.dynamic = true;
        this.geometry.setAttribute('initialSize', this.initialSizes);

        this.initialColors = new THREE.BufferAttribute(initialColorsArray, 3);
        this.initialColors.dynamic = true;
        this.geometry.setAttribute('initialColor', this.initialColors);

        this.initialAlphas = new THREE.BufferAttribute(initialAlphasArray, 1);
        this.initialAlphas.dynamic = true;
        this.geometry.setAttribute('initialAlpha', this.initialAlphas);
    }

    dispose() {
        super.dispose();
        if (this.geometry) {
            this.geometry.dispose();
            this.geometry = null;
        }
    }
}
