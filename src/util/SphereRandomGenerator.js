import * as THREE from 'three';
import { Generator } from './Generator.js';
import { BuiltinType } from './BuiltIn.js';

export class SphereRandomGenerator extends Generator {

    constructor(outType, rangeTheta, offsetTheta, rangePhi, offsetPhi, rangeRadius, offsetRadius,
                scaleX, scaleY, scaleZ, offsetX, offsetY, offsetZ) {
        super(outType);
        this.rangeTheta = rangeTheta;
        this.offsetTheta = offsetTheta;
        this.rangePhi = rangePhi;
        this.offsetPhi = offsetPhi;
        this.rangeRadius = rangeRadius;
        this.offsetRadius = offsetRadius;

        this.scaleX = scaleX;
        this.scaleY = scaleY;
        this.scaleZ = scaleZ;

        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.offsetZ = offsetZ;

        this.tempUp = new THREE.Vector3().set(0.0, 1.0, 0.0);
    }

    generate(out) {

        switch (this.outTypeID) {
            case BuiltinType.Scalar:
                // TODO: implement
            break;
            case BuiltinType.Vector2:
                // TODO: implement
            break;
            case BuiltinType.Vector3:
                return this.generateForVector3(out);
            break;
            case BuiltinType.Vector4:
                // TODO: implement
            break;
        }
    }

    generateForVector3(out) {
        this.tempUp.set(0.0, 1.0, 0.0);
        const theta = Math.random() * this.rangeTheta + this.offsetTheta;
        const phi = Math.random() * this.rangePhi + this.offsetPhi;
        const thetaX = Math.cos(theta);
        const thetaY = Math.sin(theta);
        const phiX = Math.cos(phi);
        const phiY = Math.sin(phi);

        out.set(thetaX, 0.0, -thetaY);
        out.multiplyScalar(phiX);
        this.tempUp.multiplyScalar(phiY);
        out.add(this.tempUp);

        out.normalize();

        const radius = Math.random() * this.rangeRadius + this.offsetRadius;
        out.multiplyScalar(radius);

        out.x *= this.scaleX;
        out.y *= this.scaleY;
        out.z *= this.scaleZ;

        out.x += this.offsetX;
        out.y += this.offsetY;
        out.z += this.offsetZ;
    }

    clone() {
        const clone = new SphereRandomGenerator(this.outType, this.rangeTheta, this.offsetTheta, this.rangePhi, this.offsetPhi,
                                                this.rangeRadius, this.offsetRadius, this.scaleX, this.scaleY,
                                                this.scaleZ, this.offsetX, this.offsetY, this.offsetZ);
        return clone;
    }

}
