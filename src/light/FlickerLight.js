import * as THREE from 'three';
import { Utils } from '../util/Utils.js';

export class FlickerLight {

    constructor(parent, intensity, intensityFlux, color, distance, decay, shadows = undefined) {
        this.owner = null;
        this.light = null;
        this.lastUpdateTime = performance.now() / 1000;
        this.lastIntensityFlickerTime = this.lastUpdateTime;
        this.lastPositionFlickerTime = this.lastUpdateTime;
        this.lastIntensityAdjuster = 1.0;
        this.nextIntensityAdjuster = 1.0;
        this.lastPositionAdjuster = new THREE.Vector3();
        this.positionAdjuster = new THREE.Vector3();
        this.intensity = 1.0;
        this.intensityFlux = 2;

        this.init(parent, intensity, intensityFlux, color, distance, decay, shadows);
    }

    init(parent, intensity, intensityFlux, color, distance, decay, shadows = undefined) {
        this.owner = new THREE.Object3D();
        parent.add(this.owner);

        color = color || new THREE.Color();
        distance = distance || 0;
        if (decay == null || decay == undefined) decay = 2.0;
        const shadowsEnabled = !!shadows;

        this.light = new THREE.PointLight(0xffffff, 2, 0, 1);
        this.light.color.copy(color);
        this.light.distance = distance;
        this.light.decay = decay;
        this.light.castShadow = shadowsEnabled;
        if (shadowsEnabled) {
            this.light.shadow.mapSize.width = shadows.mapSize || 512;
            this.light.shadow.mapSize.height = shadows.mapSize || 512;
            this.light.shadow.camera.near = shadows.cameraNear || 0.5;
            this.light.shadow.camera.far = shadows.cameraFar || 500;
            this.light.shadow.bias = shadows.bias || 0.0001;
            this.light.shadow.radius = shadows.edgeRadius || 1;
        }

        this.owner.add(this.light);
        this.intensity = intensity;
        this.intensityFlux = intensityFlux;

        return this.light;
    }

    getLight() {
        return this.light;
    }

    setIntensity(intensity) {
        this.intensity = intensity;
    }

    update(time, timeDelta) {

        const elapsedTimeSinceLastIntensityFlicker = time - this.lastIntensityFlickerTime;
        const flickerIntensityIntervalsPerSecond = 8.0;
        const flickerIntensityIntervalLength = 1.0 / flickerIntensityIntervalsPerSecond;
        const perUpdateIntervalIntensityFluxRange = this.intensityFlux;
        const intensityFactorRangeLowerBound = 0.25;
        const intensityFactorRangeUpperBound = 1.5;

        if (elapsedTimeSinceLastIntensityFlicker > flickerIntensityIntervalLength) {
            this.lastIntensityFlickerTime = time;

            const intensityDiff = (Math.random() - 0.5) * 2.0 *
                                   perUpdateIntervalIntensityFluxRange * flickerIntensityIntervalLength;

            let intensityAdjuster = 1.0 + intensityDiff;
            const diff = (intensityAdjuster - this.lastIntensityAdjuster);
            intensityAdjuster = this.lastIntensityAdjuster + diff;

            this.lastIntensityAdjuster = this.nextIntensityAdjuster;
            this.nextIntensityAdjuster = Utils.clamp(intensityAdjuster,
                                                     intensityFactorRangeLowerBound, intensityFactorRangeUpperBound);

        } else {
            const elapsedFlickerIntensityT = elapsedTimeSinceLastIntensityFlicker / flickerIntensityIntervalLength;
            const intensityAdjuster = (1.0 - elapsedFlickerIntensityT) * this.lastIntensityAdjuster +
                                      elapsedFlickerIntensityT * this.nextIntensityAdjuster;
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
