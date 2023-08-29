import * as THREE from 'three';
import { Generator, GeneratorType } from './Generator.js';

export class SphereRandomGenerator extends Generator {

    constructor(rangeTheta, offsetTheta, rangePhi, offsetPhi, rangeRadius, offsetRadius,
                scaleX, scaleY, scaleZ, offsetX, offsetY, offsetZ) {
        super();
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
    }

    generate(out) {

        switch (this.type) {
            case GeneratorType.Scalar:
                // TODO: implement
            break;
            case GeneratorType.Vector2:
                // TODO: implement
            break;
            case GeneratorType.Vector3:
                return generateForVector3(out);
            break;
            case GeneratorType.Vector4:
                // TODO: implement
            break;
        }
    }

    generateForVector3(out) {
        const up = new THREE.Vector3().set(0.0, 1.0, 0.0);
        const theta = Math.random() * this.rangeTheta + this.offsetTheta;
        const phi = Math.random() * this.rangePhi + this.offsetPhi;
        const thetaX = Math.cos(theta);
        const thetaY = Math.sin(theta);
        const phiX = Math.cos(phi);
        const phiY = Math.sin(phi);

        out.set(thetaX, 0.0, -thetaY);
        out.scale(phiX);
        up.scale(phiY);
        out.add(up);

        out.normalize();

        const radius = Math.random() * this.rangeRadius + this.offsetRadius;
        out.scale(radius);

        out.x *= this.scaleX;
        out.y *= this.scaleY;
        out.z *= this.scaleZ;

        out.add(this.offsetX, this.offsetY, this.offsetZ);
    }

    clone() {
        const clone = new SphereRandomGenerator(this.rangeTheta, this.offsetTheta, this.rangePhi, this.offsetPhi,
                                                this.rangeRadius, this.offsetRadius, this.scaleX, this.scaleY,
                                                this.scaleZ, this.offsetX, this.offsetY, this.offsetZ);
        return clone;
    }

}
