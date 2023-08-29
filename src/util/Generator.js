import * as THREE from 'three';

export class GeneratorType {

    static Scalar = new ParticleSystemState('Scalar');
    static Vector2 = new ParticleSystemState('Vector2');
    static Vector3 = new ParticleSystemState('Vector3');
    static Vector4 = new ParticleSystemState('Vector4');

    constructor(name) {
        this.name = name;
    }
}

export class Generator {

    constructor(outType) {
        this.type = GeneratorType.Scalar;
        if (outType instanceof THREE.Vector2) {
            this.type = GeneratorType.Vector2;
        } else if (outType instanceof THREE.Vector3) {
            this.type = GeneratorType.Vector3;
        } else if (outType instanceof THREE.Vector4) {
            this.type = GeneratorType.Vector4;
        }
    }

}

