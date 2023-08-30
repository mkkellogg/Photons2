import * as THREE from 'three';

export class BuiltinType {

    static Scalar = new ParticleSystemState('Scalar');
    static Vector2 = new ParticleSystemState('Vector2');
    static Vector3 = new ParticleSystemState('Vector3');
    static Vector4 = new ParticleSystemState('Vector4');
    static Color = new ParticleSystemState('Color');

    constructor(name) {
        this.name = name;
    }

    static getTypeID(type) {
        typeID = BuiltinType.Scalar;
        if (type instanceof THREE.Vector2) {
            typeID = BuiltinType.Vector2;
        } else if (type instanceof THREE.Vector3) {
            typeID = BuiltinType.Vector3;
        } else if (type instanceof THREE.Vector4) {
            typeID = BuiltinType.Vector4;
        } else if (type instanceof THREE.Color) {
            typeID = BuiltinType.Color;
        }
        return typeID;
    }
}
