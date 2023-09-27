import * as THREE from 'three';
import { ParticleStateArray } from '../ParticleState.js';

export class ParticleStateAttributeArray extends ParticleStateArray {

    constructor() {
        super();
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
        this.instanced = false;
        this.verticesPerParticle = 6;
    }

    init(particleCount, instanced = false) {
        this.instanced = instanced;
        if (this.instanced) {
            this.verticesPerParticle = 1;
        } else {
            this.verticesPerParticle = 6;
        }
        super.init(particleCount);
        this.allocate(particleCount);
    }

    setParticleCount(particleCount) {
        super.setParticleCount(particleCount);
    }

    setActiveParticleCount(activeParticleCount) {
        super.setActiveParticleCount(activeParticleCount);
        if (activeParticleCount > 0) {
            if (this.instanced) {
                this.geometry.instanceCount = activeParticleCount;
            } else {
                this.geometry.setDrawRange(0, this.verticesPerParticle * activeParticleCount);
            }
        } else {
            if (this.instanced) {
                this.geometry.instanceCount = 0;
            } else {
                this.geometry.setDrawRange(0, 0);
            }
        }
    }

    flushParticleStateToBuffers(index) {
        if (index >= this.particleCount) {
            throw new Error('ParticleStateAttributeArray::flushParticleStateToBuffers() -> "index" is out of range.');
        }
        const particleState = this.getState(index);

        const offset = index * this.verticesPerParticle;

        for (let i = 0; i < this.verticesPerParticle; i++) {
            this.lifetimes.setX(offset + i, particleState.lifetime);
            this.lifetimes.needsUpdate = true;

            this.ages.setX(offset + i, particleState.age);
            this.ages.needsUpdate = true;

            this.sequenceElements.setXYZW(offset + i, particleState.sequenceElement.x, particleState.sequenceElement.y,
                                                      particleState.sequenceElement.z, particleState.sequenceElement.w);
            this.sequenceElements.needsUpdate = true;

            this.positions.setXYZ(offset + i, particleState.position.x,
                                  particleState.position.y, particleState.position.z);
            this.positions.needsUpdate = true;

            this.velocities.setXYZ(offset + i, particleState.velocity.x,
                                   particleState.velocity.y, particleState.velocity.z);
            this.velocities.needsUpdate = true;

            this.accelerations.setXYZ(offset + i, particleState.acceleration.x,
                                      particleState.acceleration.y, particleState.acceleration.z);
            this.accelerations.needsUpdate = true;

            this.normals.setXYZ(offset + i, particleState.normal.x, particleState.normal.y, particleState.normal.z);
            this.normals.needsUpdate = true;

            this.rotations.setX(offset + i, particleState.rotation);
            this.rotations.needsUpdate = true;

            this.rotationalSpeeds.setX(offset + i, particleState.rotationalSpeed);
            this.rotationalSpeeds.needsUpdate = true;

            this.sizes.setXY(offset + i, particleState.size.x, particleState.size.y);
            this.sizes.needsUpdate = true;

            this.colors.setXYZ(offset + i, particleState.color.r, particleState.color.g, particleState.color.b);
            this.colors.needsUpdate = true;

            this.alphas.setX(offset + i, particleState.alpha);
            this.alphas.needsUpdate = true;

            this.initialSizes.setXY(offset + i, particleState.initialSize.x, particleState.initialSize.y);
            this.initialSizes.needsUpdate = true;

            this.initialAlphas.setX(offset + i, particleState.initialAlpha);
            this.initialAlphas.needsUpdate = true;
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

        const createAttributeBuffer = (bufferArray, componentCount) => {
            if (this.instanced) {
                return new THREE.InstancedBufferAttribute(bufferArray, componentCount);
            } else {
                return new THREE.BufferAttribute(bufferArray, componentCount);
            }
        };

        const vertexCount = this.verticesPerParticle * this.particleCount;

        if (this.instanced) {
            const baseGeometry = new THREE.BufferGeometry();

            const basePositionsArray = new Float32Array(18);
            this.basePositions = new THREE.BufferAttribute(basePositionsArray, 3);
            baseGeometry.setAttribute('position', this.basePositions);
            this.basePositions.needsUpdate = true;
            this.basePositions.setXYZ(0, -1.0, 1.0, 0.0);
            this.basePositions.setXYZ(1, -1.0, -1.0, 0.0);
            this.basePositions.setXYZ(2, 1.0, 1.0, 0.0);
            this.basePositions.setXYZ(3, -1.0, -1.0, 0.0);
            this.basePositions.setXYZ(4, 1.0, -1.0, 0.0);
            this.basePositions.setXYZ(5, 1.0, 1.0, 0.0);

            const baseUVsArray = new Float32Array(12);
            this.baseUVs = new THREE.BufferAttribute(baseUVsArray, 2);
            baseGeometry.setAttribute('baseUV', this.baseUVs);
            this.baseUVs.needsUpdate = true;
            this.baseUVs.setXY(0, 0.0, 1.0);
            this.baseUVs.setXY(1, 0.0, 0.0);
            this.baseUVs.setXY(2, 1.0, 1.0);
            this.baseUVs.setXY(3, 0.0, 0.0);
            this.baseUVs.setXY(4, 1.0, 0.0);
            this.baseUVs.setXY(5, 1.0, 1.0);

            const customIndexesArray = new Float32Array(6);
            this.customIndexes = new THREE.BufferAttribute(customIndexesArray, 1);
            baseGeometry.setAttribute('customIndex', this.customIndexes);
            this.customIndexes.needsUpdate = true;

            this.customIndexes.setX(0, 0);
            this.customIndexes.setX(1, 1);
            this.customIndexes.setX(2, 3);
            this.customIndexes.setX(3, 1);
            this.customIndexes.setX(4, 2);
            this.customIndexes.setX(5, 3);

            this.geometry = new THREE.InstancedBufferGeometry().copy(baseGeometry);
            this.geometry.instanceCount = 0;
        } else {
            this.geometry = new THREE.BufferGeometry();

            const customIndexesArray = new Float32Array(vertexCount);
            this.customIndexes = new THREE.BufferAttribute(customIndexesArray, 1);
            this.geometry.setAttribute('customIndex', this.customIndexes);
            this.customIndexes.needsUpdate = true;

            for (let p = 0; p < this.particleCount; p++) {
                const offset = p * this.verticesPerParticle;
                this.customIndexes.setX(offset, 0);
                this.customIndexes.setX(offset + 1, 1);
                this.customIndexes.setX(offset + 2, 3);
                this.customIndexes.setX(offset + 3, 1);
                this.customIndexes.setX(offset + 4, 2);
                this.customIndexes.setX(offset + 5, 3);
            }
        }

        const lifetimesArray = new Float32Array(vertexCount);
        const agesArray = new Float32Array(vertexCount);
        const sequenceElementsArray = new Float32Array(vertexCount * 4);
        const positionsArray = new Float32Array(vertexCount * 3);
        const velocitiesArray = new Float32Array(vertexCount * 3);
        const accelerationsArray = new Float32Array(vertexCount * 3);
        const normalsArray = new Float32Array(vertexCount * 3);
        const rotationsArray = new Float32Array(vertexCount);
        const rotationalSpeedsArray = new Float32Array(vertexCount);
        const sizesArray = new Float32Array(vertexCount * 2);
        const colorsArray = new Float32Array(vertexCount * 3);
        const alphasArray = new Float32Array(vertexCount);
        const initialSizesArray = new Float32Array(vertexCount * 2);
        const initialColorsArray = new Float32Array(vertexCount * 3);
        const initialAlphasArray = new Float32Array(vertexCount);

        this.positions = createAttributeBuffer(positionsArray, 3);
        this.positions.setUsage(THREE.DynamicDrawUsage);
        this.geometry.setAttribute('particlePosition', this.positions);

        this.lifetimes = createAttributeBuffer(lifetimesArray, 1);
        this.lifetimes.setUsage(THREE.DynamicDrawUsage);
        this.geometry.setAttribute('lifetime', this.lifetimes);

        this.ages = createAttributeBuffer(agesArray, 1);
        this.ages.setUsage(THREE.DynamicDrawUsage);
        this.geometry.setAttribute('age', this.ages);

        this.sequenceElements = createAttributeBuffer(sequenceElementsArray, 4);
        this.sequenceElements.setUsage(THREE.DynamicDrawUsage);
        this.geometry.setAttribute('sequenceElement', this.sequenceElements);

        this.velocities = createAttributeBuffer(velocitiesArray, 3);
        this.velocities.setUsage(THREE.DynamicDrawUsage);
        this.geometry.setAttribute('velocity', this.velocities);

        this.accelerations = createAttributeBuffer(accelerationsArray, 3);
        this.accelerations.setUsage(THREE.DynamicDrawUsage);
        this.geometry.setAttribute('acceleration', this.accelerations);

        this.normals = createAttributeBuffer(normalsArray, 3);
        this.normals.setUsage(THREE.DynamicDrawUsage);
        this.geometry.setAttribute('normal', this.normals);

        this.rotations = createAttributeBuffer(rotationsArray, 1);
        this.rotations.setUsage(THREE.DynamicDrawUsage);
        this.geometry.setAttribute('rotation', this.rotations);

        this.rotationalSpeeds = createAttributeBuffer(rotationalSpeedsArray, 1);
        this.rotationalSpeeds.setUsage(THREE.DynamicDrawUsage);
        this.geometry.setAttribute('rotationalSpeed', this.rotationalSpeeds);

        this.sizes = createAttributeBuffer(sizesArray, 2);
        this.sizes.setUsage(THREE.DynamicDrawUsage);
        this.geometry.setAttribute('size', this.sizes);

        this.colors = createAttributeBuffer(colorsArray, 3);
        this.colors.setUsage(THREE.DynamicDrawUsage);
        this.geometry.setAttribute('color', this.colors);

        this.alphas = createAttributeBuffer(alphasArray, 1);
        this.alphas.setUsage(THREE.DynamicDrawUsage);
        this.geometry.setAttribute('alpha', this.alphas);

        this.initialSizes = createAttributeBuffer(initialSizesArray, 2);
        this.initialSizes.setUsage(THREE.DynamicDrawUsage);
        this.geometry.setAttribute('initialSize', this.initialSizes);

        this.initialColors = createAttributeBuffer(initialColorsArray, 3);
        this.initialColors.setUsage(THREE.DynamicDrawUsage);
        this.geometry.setAttribute('initialColor', this.initialColors);

        this.initialAlphas = createAttributeBuffer(initialAlphasArray, 1);
        this.initialAlphas.setUsage(THREE.DynamicDrawUsage);
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
