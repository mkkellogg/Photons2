import * as THREE from 'three';
import { Utils } from '../util/Utils.js';

export class FlickerLight {

    constructor() {
        this.owner = null;
        this.light = null;
        this.lastUpdateTime = performance.now() / 1000;
        this.lastIntensityFlickerTime = this.lastUpdateTime;
        this.lastPositionFlickerTime = this.lastUpdateTime;
        this.lastIntensityAdjuster = 1.0;
        this.nextIntensityAdjuster = 1.0;
        this.intensity = 1.0;
        this.lastPositionAdjuster = new THREE.Vector3();
        this.positionAdjuster = new THREE.Vector3();
        this.intensityFlux = 2;
    }

    init(parent, shadowsEnabled, shadowMapSize, constantShadowBias, angularShadowBias, intensityFlux) {
        this.owner = new THREE.Object3D();
        parent.add(this.owner);

        this.light = new THREE.PointLight(0xffffff, 2, 0, 1);
        this.light.castShadow = shadowsEnabled;
        this.light.shadowCameraNear = 1;
        this.light.shadowCameraFar = 1000;
        this.light.shadowDarkness = .8;
        this.light.mapSize = shadowMapSize;
        this.light.shadow.bias = .000009;
        this.light.shadow.radius = 3;
      //  this.light.shadowBias = constantShadowBias;
        this.owner.add(this.light);

        this.intensityFlux = intensityFlux;

        return this.light;
    }

    getLight() {
        return this.light;
    }

    setIntensity(intensity) {
        this.intensity = intensity;
    }

    update() {

        const time = performance.now() / 1000;

        const elapsedTimeSinceLastIntensityFlicker = time - this.lastIntensityFlickerTime;
        const flickerIntensityIntervalsPerSecond = 8.0;
        const flickerIntensityIntervalLength = 1.0 / flickerIntensityIntervalsPerSecond;
        const perUpdateIntervalIntensityFluxRange = this.intensityFlux;
        const intensityFactorRangeLowerBound = 0.25;
        const intensityFactorRangeUpperBound = 1.5;

        if (elapsedTimeSinceLastIntensityFlicker > flickerIntensityIntervalLength) {
            this.lastIntensityFlickerTime = time;

            const intensityDiff = (Math.random() - 0.5) * 2.0 * perUpdateIntervalIntensityFluxRange * flickerIntensityIntervalLength;

            let intensityAdjuster = 1.0 + intensityDiff;
            const diff = (intensityAdjuster - this.lastIntensityAdjuster);
            intensityAdjuster = this.lastIntensityAdjuster + diff;

            this.lastIntensityAdjuster = this.nextIntensityAdjuster;
            this.nextIntensityAdjuster = Utils.clamp(intensityAdjuster, intensityFactorRangeLowerBound, intensityFactorRangeUpperBound);

        } else {
            const elapsedFlickerIntensityT = elapsedTimeSinceLastIntensityFlicker / flickerIntensityIntervalLength;
            const intensityAdjuster = (1.0 - elapsedFlickerIntensityT) * this.lastIntensityAdjuster + elapsedFlickerIntensityT * this.nextIntensityAdjuster;
            this.light.intensity = intensityAdjuster * this.intensity;
        }

        const elapsedTimeSinceLastPositionFlicker = time - this.lastPositionFlickerTime;
        const flickerPositionIntervalsPerSecond = 16.0;
        const flickerPositionIntervalLength = 1.0 / flickerPositionIntervalsPerSecond;

        if (elapsedTimeSinceLastPositionFlicker > flickerPositionIntervalLength) {
            this.lastPositionFlickerTime = time;

            const deltaTime = time - this.lastUpdateTime;
            this.positionAdjuster.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
            this.positionAdjuster.multiplyScalar(deltaTime);

            this.positionAdjuster.add(this.lastPositionAdjuster);
            this.positionAdjuster.multiplyScalar(0.5);

            this.owner.position.copy(this.positionAdjuster);

            this.lastPositionAdjuster.copy(this.positionAdjuster);
            this.lastUpdateTime = time;
        }
    }
}
