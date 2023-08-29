import * as THREE from 'three';

export class ParticleStateProgressType {

    static Time = new ParticleSystemState('Time');
    static Sequence = new ParticleSystemState('Sequence');
  
    constructor(name) {
      this.name = name;
    }
}

export class ParticleState {

    constructor(progressType, lifetime, age, sequenceElement, position, velocity, acceleration, normal, rotation, rotationalSpeed, size, color, initialSize, initialColor) {
        this.init();
        this.setAll(progressType, lifetime, age, sequenceElement, position, velocity, acceleration, normal, rotation, rotationalSpeed, size, color, initialSize, initialColor);
    }

    init() {
        this.progressType = ParticleStateProgressType.Time;
        this.lifetime = 1.0;
        this.age = 0.0;
        this.sequenceElement = sequenceElement;
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.normal = new THREE.Vector3();
        this.rotation = 0.0;
        this.rotationalSpeed = 0.0;
        this.size = 1.0;
        this.color = new THREE.Color();
        this.initialSize = 1.0;
        this.initialColor = new THREE.Color();
    }

    setAll(progressType, lifetime, age, sequenceElement, position, velocity, acceleration, normal, rotation, rotationalSpeed, size, color, initialSize, initialColor) {
        this.progressType = progressType;
        this.lifetime = lifetime;
        this.age = age;
        this.sequenceElement = sequenceElement;
        this.position.copy(position);
        this.velocity.copy(velocity);
        this.acceleration.copy(acceleration);
        this.normal.copy(normal);''
        this.rotation = rotation;
        this.rotationalSpeed = rotationalSpeed;
        this.size = size;
        this.color.copy(color);
        this.initialSize = initialSize;
        this.initialColor.copy(initialColor); 
    }
}

export class ParticleStateArrayBase {

    constructor() {
        this.particleCount = 0;
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

class ParticleStateAttributeArray extends ParticleStateArrayBase {

    constructor() {
        this.particleStates = [];
    }

    copyParticleState(srcIndex, destIndex) {
        if (srcIndex >= this.particleCount) {
            throw new Error("ParticleStateAttributeArray::copyParticleState() -> 'srcIndex' is out of range.");
        }
        if (destIndex >= this.particleCount) {
            throw new Error("ParticleStateAttributeArray::copyParticleState() -> 'destIndex' is out of range.");
        }

        this->progressTypes->copyAttribute(srcIndex, destIndex);
        this->lifetimes->copyAttribute(srcIndex, destIndex);
        this->ages->copyAttribute(srcIndex, destIndex);
        this->sequenceElements->copyAttribute(srcIndex, destIndex);
        this->positions->copyAttribute(srcIndex, destIndex);
        this->velocities->copyAttribute(srcIndex, destIndex);
        this->accelerations->copyAttribute(srcIndex, destIndex);
        this->normals->copyAttribute(srcIndex, destIndex);
        this->rotations->copyAttribute(srcIndex, destIndex);
        this->rotationalSpeeds->copyAttribute(srcIndex, destIndex);
        this->sizes->copyAttribute(srcIndex, destIndex);
        this->colors->copyAttribute(srcIndex, destIndex);

        this->initialSizes->copyAttribute(srcIndex, destIndex);
        this->initialColors->copyAttribute(srcIndex, destIndex);
    }

    getParticleStatePointer(index) {
        if (index >= this.particleCount) {
            throw new Error("ParticleStateAttributeArray::getParticleStatePtr() -> 'index' is out of range.");
        }
        return this.particleStatePointers.get()[index];
    }

    std::shared_ptr<AttributeArray<Point3rs>> getPositions() {return this->positions;}
    std::shared_ptr<AttributeArray<Vector2rs>> getSizes() {return this->sizes;}
    std::shared_ptr<ScalarAttributeArray<Real>> getRotations() {return this->rotations;}
    std::shared_ptr<AttributeArray<Vector4rs>> getSequenceElements() {return this->sequenceElements;}
    std::shared_ptr<AttributeArray<ColorS>> getColors() {return this->colors;}

protected:

    void allocate(UInt32 particleCount) override {
        this->progressTypes = std::make_shared<ScalarAttributeArray<Real>>(particleCount, AttributeType::Float, false);
        this->lifetimes = std::make_shared<ScalarAttributeArray<Real>>(particleCount, AttributeType::Float, false);
        this->ages = std::make_shared<ScalarAttributeArray<Real>>(particleCount, AttributeType::Float, false);
        this->sequenceElements = std::make_shared<AttributeArray<Vector4rs>>(particleCount, AttributeType::Float, false);
        this->positions = std::make_shared<AttributeArray<Point3rs>>(particleCount, AttributeType::Float, false);
        this->velocities = std::make_shared<AttributeArray<Vector3rs>>(particleCount, AttributeType::Float, false);
        this->accelerations = std::make_shared<AttributeArray<Vector3rs>>(particleCount, AttributeType::Float, false);
        this->normals = std::make_shared<AttributeArray<Vector3rs>>(particleCount, AttributeType::Float, false);
        this->rotations = std::make_shared<ScalarAttributeArray<Real>>(particleCount, AttributeType::Float, false);
        this->rotationalSpeeds = std::make_shared<ScalarAttributeArray<Real>>(particleCount, AttributeType::Float, false);
        this->sizes = std::make_shared<AttributeArray<Vector2rs>>(particleCount, AttributeType::Float, false);
        this->colors = std::make_shared<AttributeArray<ColorS>>(particleCount, AttributeType::Float, false);

        this->initialSizes = std::make_shared<AttributeArray<Vector2rs>>(particleCount, AttributeType::Float, false);
        this->initialColors = std::make_shared<AttributeArray<ColorS>>(particleCount, AttributeType::Float, false);

        ParticleStatePtr* particleStatePointers = new(std::nothrow) ParticleStatePtr[particleCount];
        if (particleStatePointers == nullptr) {
            throw AllocationException("ParticleStateAttributeArray::allocate -> Unable to allocate particle state pointer array");
        }
        this->particleStatePointers = std::shared_ptr<ParticleStatePtr>(particleStatePointers);
        for (UInt32 i = 0; i < particleCount; i++) {
            this->bindParticleStatePtr(i, this->particleStatePointers.get()[i]);
        }
    }

    void deallocate() override {
    }

    std::shared_ptr<ScalarAttributeArray<Real>> progressTypes;
    std::shared_ptr<ScalarAttributeArray<Real>> lifetimes;
    std::shared_ptr<ScalarAttributeArray<Real>> ages;
    std::shared_ptr<AttributeArray<Vector4rs>> sequenceElements;
    std::shared_ptr<AttributeArray<Point3rs>> positions;
    std::shared_ptr<AttributeArray<Vector3rs>> velocities;
    std::shared_ptr<AttributeArray<Vector3rs>> accelerations;
    std::shared_ptr<AttributeArray<Vector3rs>> normals;
    std::shared_ptr<ScalarAttributeArray<Real>> rotations;
    std::shared_ptr<ScalarAttributeArray<Real>> rotationalSpeeds;
    std::shared_ptr<AttributeArray<Vector2rs>> sizes;
    std::shared_ptr<AttributeArray<ColorS>> colors;

    std::shared_ptr<AttributeArray<Vector2rs>> initialSizes;
    std::shared_ptr<AttributeArray<ColorS>> initialColors;
}
