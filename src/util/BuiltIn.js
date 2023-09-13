import * as THREE from 'three';

export class BuiltinType {

    static Default = new BuiltinType('Default');
    static Vector2 = new BuiltinType('Vector2');
    static Vector3 = new BuiltinType('Vector3');
    static Vector4 = new BuiltinType('Vector4');
    static Color = new BuiltinType('Color');

    constructor(name) {
        this.name = name;
    }

    static getTypeID(type) {
        let typeID = BuiltinType.Default;
        if (type === THREE.Vector2) {
            typeID = BuiltinType.Vector2;
        } else if (type === THREE.Vector3) {
            typeID = BuiltinType.Vector3;
        } else if (type === THREE.Vector4) {
            typeID = BuiltinType.Vector4;
        } else if (type === THREE.Color) {
            typeID = BuiltinType.Color;
        }
        return typeID;
    }

    static loadJSONParameter(param, type) {
        switch (type) {
            case THREE.Vector2:
                return new THREE.Vector2().fromArray(param);
            case THREE.Vector3:
                return new THREE.Vector3().fromArray(param);
            case THREE.Vector4:
                return new THREE.Vector4().fromArray(param);
            case THREE.Color:
                return new THREE.Color().fromArray(param);
        }

        return param;
    }
}
