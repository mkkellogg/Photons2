import { Generator } from "./Generator.js"

class RandomGenerator extends Generator {

    constructor(range, offset, uniformRange, uniformOffset, normalize) {
        this->range = range;
        this->offset = offset;
        this->uniformRange = uniformRange;
        this->uniformOffset = uniformOffset;
        this->normalize = normalize;
    }

    generate(out) {

    }

    clone() {
        Generator<T>* clone = new(std::nothrow) RandomGenerator<T>(this->range, this->offset, this->uniformRange, this->uniformOffset, this->normalize);
        if (clone == nullptr) {
            throw AllocationException("RandomGenerator::clone() -> Unable to allocate clone object.");
        }
        return clone;
    }

    template <typename V>
    void generateForThreeElementVector(V& out) {
        Real uniformRange = Math::random() * this->uniformRange;
        out.set(uniformRange + Math::random() * this->range.x + this->offset.x + this->uniformOffset,
                uniformRange + Math::random() * this->range.y + this->offset.y + this->uniformOffset,
                uniformRange + Math::random() * this->range.z + this->offset.z + this->uniformOffset);
        if (this->normalize) out.normalize();
    }

    T range;
    T offset;
    Real uniformRange;
    Real uniformOffset;
    Bool normalize;

}
