import * as Photons from '../../../lib/photons.module.js';
import { FBXLoader } from '../../FBXLoader.js';
import { LoadingSpinner } from '../../LoadingSpinner.js';
import * as THREE from 'three';

export class Scene {

    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.mixer = null;
        this.sword = null;
        this.particleSystems = [];
        this.manager = new Photons.Manager();
        this.clock = new THREE.Clock();
        this.jsonTypeStore = new Photons.JSONTypeStore();
        this.jsonTypeStore.addNamespace('THREE', THREE);
        this.jsonTypeStore.addNamespace('Photons', Photons);
        this.currentRenderSlot = 1;
        this.instancedParticleSystems = true;
    }

    build() {
        const loadingSpinner = new LoadingSpinner();
        loadingSpinner.show();
        this.setupSceneComponents().then(() => {
            loadingSpinner.hide();
            this.setupParticleSystems();
        });
    }

    update() {
        this.manager.update();
        if (this.mixer) this.mixer.update(this.clock.getDelta());
    }

    render() {
        this.manager.render(this.renderer, this.camera);
    }

    static traverseScene(node, onVisit, visited) {
        visited = visited || {};
        if (!visited[node.uuid]) {
            visited[node.uuid] = true;
            onVisit(node);
            if (node.children) {
                for (let child of node.children) {
                    Scene.traverseScene(child, onVisit, visited);
                }
            }
        }
    }

    setupParticleSystems() {
        const root = new THREE.Object3D();
        this.sword.add(root);

        let positionOffset = new THREE.Vector3(0, 5, 0);
        let emissionFactor = 120;
        let scale = 0.2;
        this.manager.addParticleSystem(this.setupEmbers(root, scale, 1.0, emissionFactor * .15, true, positionOffset));
        this.manager.addParticleSystem(this.setupBaseFlame(root, scale, 0.5, emissionFactor, true, positionOffset));
        this.manager.addParticleSystem(this.setupBrightFLame(root, scale, 0.25, emissionFactor, true, positionOffset));

        emissionFactor = 10;
        scale = .3;
        positionOffset.set(4, 5, 0);
        this.manager.addParticleSystem(this.setupBaseFlame(root, scale, 1.0, emissionFactor, false, positionOffset));
        this.manager.addParticleSystem(this.setupBrightFLame(root, scale, 1.0, emissionFactor, false, positionOffset));
    }

    setupEmbers(root, scale, opacityFactor, emissionFactor, simulateInWorldSpace, positionOffset) {
        positionOffset = new THREE.Vector3().copy(positionOffset);
        const embersRoot = root;

        const texturePath = 'assets/textures/ember.png';
        const embersTexture = new THREE.TextureLoader().load(texturePath);
        const embersAtlas = new Photons.Atlas(embersTexture, texturePath);
        embersAtlas.addFrameSet(1, 0.0, 0.0, 1.0, 1.0);
        const embersRenderer = new Photons.AnimatedSpriteRenderer(this.instancedParticleSystems, embersAtlas, true, THREE.AdditiveBlending, true, this.currentRenderSlot++);

        const embersParticleSystem = new Photons.ParticleSystem(embersRoot, embersRenderer, this.renderer);
        embersParticleSystem.init(150 * emissionFactor);

        embersParticleSystem.setEmitter(new Photons.ConstantParticleEmitter(6 * emissionFactor));

        const sizeInitializerGenerator = new Photons.RandomGenerator(THREE.Vector2,
            new THREE.Vector2(0.0, 0.0).multiplyScalar(scale),
            new THREE.Vector2(0.15, 0.15).multiplyScalar(scale),
            0.0, 0.0, false);
        embersParticleSystem.addParticleStateInitializer(new Photons.LifetimeInitializer(3.0, 1.0, 0.0, 0.0, false));
        embersParticleSystem.addParticleStateInitializer(new Photons.SizeInitializer(sizeInitializerGenerator));
        embersParticleSystem.addParticleStateInitializer(new Photons.BoxPositionInitializer(
            new THREE.Vector3(0, 0.0, 85),
            positionOffset));
        embersParticleSystem.addParticleStateInitializer(new Photons.RandomVelocityInitializer(
            new THREE.Vector3(0.4, 0.5, 0.4).multiplyScalar(scale),
            new THREE.Vector3(-.02, .8, -0.2).multiplyScalar(scale),
            0.6 * scale, 0.8 * scale, false));

        const embersOpacityOperator = embersParticleSystem.addParticleStateOperator(new Photons.OpacityInterpolatorOperator());
        embersOpacityOperator.addElements([
            [0.0, 0.0],
            [0.7 * opacityFactor, 0.25],
            [0.9 * opacityFactor, 0.75],
            [0.0, 1.0]
        ]);

        const embersColorOperator = embersParticleSystem.addParticleStateOperator(new Photons.ColorInterpolatorOperator(true));
        embersColorOperator.addElementsFromParameters([
            [[1.0, 0.7, 0.0], 0.0],
            [[1.0, 0.6, 0.0], 0.5],
            [[1.0, 0.4, 0.0], 1.0]
        ]);

        const acceleratorOperatorGenerator = new Photons.SphereRandomGenerator(Math.PI * 2.0, 0.0, Math.PI,
            -Math.PI / 1.75, 20.0, -8,
            scale, scale, scale,
            0.0, 0.0, 0.0);

        embersParticleSystem.addParticleStateOperator(new Photons.AccelerationOperator(acceleratorOperatorGenerator));

        embersParticleSystem.setSimulateInWorldSpace(simulateInWorldSpace);
        embersParticleSystem.setTransformInitialDirectionInWorldSpace(false);
        embersParticleSystem.start();

        return embersParticleSystem;
    }

    setupBaseFlame(root, scale, opacityFactor, emissionFactor, simulateInWorldSpace, positionOffset) {
        positionOffset = new THREE.Vector3().copy(positionOffset);
        const baseFlameRoot = root;

        const texturePath = 'assets/textures/base_flame.png';
        const baseFlameTexture = new THREE.TextureLoader().load(texturePath);
        const baseFlameAtlas = new Photons.Atlas(baseFlameTexture, texturePath);
        baseFlameAtlas.addFrameSet(18, 0.0, 0.0, 128.0 / 1024.0, 128.0 / 512.0);
        const baseFlameRenderer = new Photons.AnimatedSpriteRenderer(this.instancedParticleSystems, baseFlameAtlas, true, THREE.NormalBlending, true, this.currentRenderSlot++);

        const baseFlameParticleSystem = new Photons.ParticleSystem(baseFlameRoot, baseFlameRenderer, this.renderer);
        baseFlameParticleSystem.init(50 * emissionFactor);

        baseFlameParticleSystem.setEmitter(new Photons.ConstantParticleEmitter(10 * emissionFactor));

        baseFlameParticleSystem.addParticleSequence(0, 18);
        const baseFlameParticleSequences = baseFlameParticleSystem.getParticleSequences();

        baseFlameParticleSystem.addParticleStateInitializer(new Photons.LifetimeInitializer(0.0, 0.0, 0.0, 0.0, false));
        baseFlameParticleSystem.addParticleStateInitializer(new Photons.RotationInitializer(new Photons.RandomGenerator(0, Math.PI * 2.0, -Math.PI, 0.0, 0.0, false)));
        baseFlameParticleSystem.addParticleStateInitializer(new Photons.RotationalSpeedInitializer(2.0, -1.0, 0.0, 0.0, false));
        baseFlameParticleSystem.addParticleStateInitializer(new Photons.SizeInitializer(
            new Photons.RandomGenerator(THREE.Vector2,
                new THREE.Vector2(0.25, 0.25).multiplyScalar(scale),
                new THREE.Vector2(0.5, 0.5).multiplyScalar(scale),
                0.0, 0.0, false)));
        baseFlameParticleSystem.addParticleStateInitializer(new Photons.BoxPositionInitializer(
            new THREE.Vector3(17, 10, 75),
            positionOffset.add(new THREE.Vector3(-12, -16, 10))));
        baseFlameParticleSystem.addParticleStateInitializer(new Photons.RandomVelocityInitializer(
            new THREE.Vector3(0.05, 0.2, 0.05).multiplyScalar(scale),
            new THREE.Vector3(-0.025, 0.5, -0.025).multiplyScalar(scale),
            0.2 * scale, 0.3 * scale, false));
        baseFlameParticleSystem.addParticleStateInitializer(new Photons.SequenceInitializer(baseFlameParticleSequences));

        baseFlameParticleSystem.addParticleStateOperator(new Photons.SequenceOperator(baseFlameParticleSequences, 0.07, false));

        const baseFlameOpacityOperator = baseFlameParticleSystem.addParticleStateOperator(new Photons.OpacityInterpolatorOperator());
        baseFlameOpacityOperator.addElements([
            [0.0, 0.0],
            [0.3 * opacityFactor, 0.2],
            [0.1 * opacityFactor, 0.4],
            [0.05 * opacityFactor, 0.6],
            [0.0, 1.0]
        ]);

        const baseFlameSizeOperator = baseFlameParticleSystem.addParticleStateOperator(new Photons.SizeInterpolatorOperator(true));
        baseFlameSizeOperator.addElementsFromParameters([
            [[0.6, 0.6], 0.0],
            [[1.0, 1.0], 0.4],
            [[1.0, 1.0], 1.0]
        ]);

        const baseFlameColorOperator = baseFlameParticleSystem.addParticleStateOperator(new Photons.ColorInterpolatorOperator(true));
        baseFlameColorOperator.addElementsFromParameters([
            [[1.0, 1.0, 1.0], 0.0],
            [[1.5, 1.5, 1.5], 0.5],
            [[1.0, 1.0, 1.0], 1.0]
        ]);

        baseFlameParticleSystem.addParticleStateOperator(new Photons.AccelerationOperator(
            new Photons.RandomGenerator(THREE.Vector3, new THREE.Vector3(0.0, 0.0, 0.0).multiplyScalar(scale),
                new THREE.Vector3(0.0, 1.5, 0.0).multiplyScalar(scale),
                0.0, 0.0, false)));

        baseFlameParticleSystem.setSimulateInWorldSpace(simulateInWorldSpace);
        baseFlameParticleSystem.setTransformInitialDirectionInWorldSpace(false);
        baseFlameParticleSystem.start();

        return baseFlameParticleSystem;
    }

    setupBrightFLame(root, scale, opacityFactor, emissionFactor, simulateInWorldSpace, positionOffset) {
        positionOffset = new THREE.Vector3().copy(positionOffset);
        const brightFlameRoot = root;

        const texturePath = 'assets/textures/bright_flame.png';
        const brightFlameTexture = new THREE.TextureLoader().load(texturePath);
        const brightFlameAtlas = new Photons.Atlas(brightFlameTexture, texturePath);
        brightFlameAtlas.addFrameSet(16, 0.0, 0.0, 212.0 / 1024.0, 256.0 / 1024.0);
        const brightFlameRenderer = new Photons.AnimatedSpriteRenderer(this.instancedParticleSystems, brightFlameAtlas, true, THREE.NormalBlending, true, this.currentRenderSlot++);

        const brightFlameParticleSystem = new Photons.ParticleSystem(brightFlameRoot, brightFlameRenderer, this.renderer);
        brightFlameParticleSystem.init(20 * emissionFactor);

        brightFlameParticleSystem.setEmitter(new Photons.ConstantParticleEmitter(5 * emissionFactor));

        brightFlameParticleSystem.addParticleSequence(0, 16);
        const brightFlameParticleSequences = brightFlameParticleSystem.getParticleSequences();

        brightFlameParticleSystem.addParticleStateInitializer(new Photons.LifetimeInitializer(0.0, 0.0, 0.0, 0.0, false));
        brightFlameParticleSystem.addParticleStateInitializer(new Photons.RotationInitializer(new Photons.RandomGenerator(0, Math.PI, -Math.PI / 2.0, 0.0, 0.0, false)));
        brightFlameParticleSystem.addParticleStateInitializer(new Photons.RotationalSpeedInitializer(Math.PI / 2.0, -Math.PI / 4.0, 0.0, 0.0, false));
        brightFlameParticleSystem.addParticleStateInitializer(new Photons.SizeInitializer(
            new Photons.RandomGenerator(THREE.Vector2,
                new THREE.Vector2(0.0, 0.0),
                new THREE.Vector2(0.0, 0.0),
                0.2 * scale, 0.65 * scale, false)));

        brightFlameParticleSystem.addParticleStateInitializer(new Photons.BoxPositionInitializer(
            new THREE.Vector3(17, 10, 60),
            positionOffset.add(new THREE.Vector3(-12, -16, 20))));
        brightFlameParticleSystem.addParticleStateInitializer(new Photons.RandomVelocityInitializer(
            new THREE.Vector3(0.02, 0.3, 0.02).multiplyScalar(scale),
            new THREE.Vector3(-0.01, 0.6, -0.01).multiplyScalar(scale),
            0.3 * scale, .5 * scale, false));
        brightFlameParticleSystem.addParticleStateInitializer(new Photons.SequenceInitializer(brightFlameParticleSequences));

        brightFlameParticleSystem.addParticleStateOperator(new Photons.SequenceOperator(brightFlameParticleSequences, 0.08, false));

        const brightFlameOpacityOperator = brightFlameParticleSystem.addParticleStateOperator(new Photons.OpacityInterpolatorOperator());
        brightFlameOpacityOperator.addElements([
            [0.0, 0.0],
            [0.3 * opacityFactor, 0.2],
            [0.1 * opacityFactor, 0.4],
            [0.05 * opacityFactor, 0.6],
            [0.0, 1.0]
        ]);

        const brightFlameSizeOperator = brightFlameParticleSystem.addParticleStateOperator(new Photons.SizeInterpolatorOperator(true));
        brightFlameSizeOperator.addElementsFromParameters([
            [[0.3, 0.3], 0.0],
            [[1.0, 1.0], 0.4],
            [[1.0, 1.0], 0.55],
            [[0.65, 0.65], 0.75],
            [[0.1, 0.1], 1.0]
        ]);

        const brightFlameColorOperator = brightFlameParticleSystem.addParticleStateOperator(new Photons.ColorInterpolatorOperator(true));
        brightFlameColorOperator.addElementsFromParameters([
            [[1.0, 1.0, 1.0], 0.0],
            [[2.0, 2.0, 2.0], 0.3],
            [[2.0, 2.0, 2.0], 0.4],
            [[0.9, 0.6, 0.3], 0.65],
            [[0.75, 0.0, 0.0], 1.0]
        ]);

        brightFlameParticleSystem.addParticleStateOperator(new Photons.AccelerationOperator(
            new Photons.RandomGenerator(THREE.Vector3,
                new THREE.Vector3(0.0, 0.0, 0.0).multiplyScalar(scale),
                new THREE.Vector3(0.0, 1.5, 0.0).multiplyScalar(scale),
                0.0, 0.0, false)));

        brightFlameParticleSystem.setSimulateInWorldSpace(simulateInWorldSpace);
        brightFlameParticleSystem.setTransformInitialDirectionInWorldSpace(false);
        brightFlameParticleSystem.start();
        return brightFlameParticleSystem;
    }

    setupSceneComponents() {
        const directionalLight = new THREE.DirectionalLight(0xffffff, .5);
        this.scene.add(directionalLight);
        directionalLight.position.set(5, 2, 5);

        function createMetalMaterial(oldMaterial) {
            const newMaterial = new THREE.MeshStandardMaterial({
                color: 0xAAAAAA,
                roughness: 0.3,
                metalness: 0.85,
                map: oldMaterial.map
            });
            return newMaterial;
        }

        const fbxLoader = new FBXLoader();
        const textureLoader = new THREE.TextureLoader();

        const modelLoadPromise = new Promise((resolve, reject) => {
            fbxLoader.load('assets/models/knight/idlebattle.fbx', (object) => {

                this.mixer = new THREE.AnimationMixer(object);
                const action = this.mixer.clipAction(object.animations[0]);
                action.play();

                object.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        if (child.name == 'warrior') {
                            child.material[0] = createMetalMaterial(child.material[0]);
                            child.material.forEach((material) => {material.shadowSide = THREE.DoubleSide});
                            child.receiveShadow = false;
                        } else if (child.name == 'shield' || child.name == 'sword') {
                            child.material = createMetalMaterial(child.material);
                            child.material.shadowSide = THREE.DoubleSide
                            if (child.name == 'sword') {
                                this.sword = child;

                                const lightParent = new THREE.Object3D();
                                this.sword.add(lightParent);
                                lightParent.position.set(0, 0, 100);

                                const flickerLightShadows = {
                                    'mapSize': 1024,
                                    'cameraNear': 0.01,
                                    'cameraFar': 500,
                                    'bias': .000009,
                                    'edgeRadius': 5
                                };
                                const flameFlickerLight = new Photons.FlickerLight(lightParent,  20, 3, new THREE.Color().setRGB(1, .8, .4), 0, 1.0, flickerLightShadows);
                                const flameLight = flameFlickerLight.getLight();
                                flameLight.distance = 4;
                                flameLight.decay = 1.5;
                                flameLight.castShadow = true;

                                this.manager.addComponent(flameFlickerLight);
                            }
                        }
                    }
                });

                resolve(object);
            });
        });

        const groundMaterial = new THREE.MeshStandardMaterial();
        groundMaterial.roughness = 0.1;
        groundMaterial.metalness = 0.2;
        groundMaterial.color.setRGB(.25, .25, .25);
        const baseColorLoadPromise = new Promise((resolve) => {
            textureLoader.load( 'assets/textures/stone_floor/basecolor.jpg', 
                function ( texture ) {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.repeat.x = 4;
                    texture.repeat.y = 4;
                    groundMaterial.map = texture;
                    groundMaterial.roughness = 0.9;
                    groundMaterial.needsUpdate = true;
                    resolve(texture);
                });
        });

        const normalMapLoadPromise = new Promise((resolve) => {
            textureLoader.load( 'assets/textures/stone_floor/normal.jpg', 
                function ( texture ) {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.repeat.x = 4;
                    texture.repeat.y = 4;
                    groundMaterial.normalMap = texture;
                    groundMaterial.normalScale.set(8, 8);
                    groundMaterial.needsUpdate = true;
                    resolve(texture);
                });
        });

        return Promise.all([baseColorLoadPromise, normalMapLoadPromise, modelLoadPromise])
        .then(([baseColorTexture, normalTexture, knightModelObject]) => {
            const cylinderGeometry = new THREE.CylinderGeometry( 4, 4, .1, 32 ); 
            const groundMesh = new THREE.Mesh(cylinderGeometry, groundMaterial);
            groundMesh.receiveShadow = true;
            this.scene.add(groundMesh);
            this.scene.add(knightModelObject);
        });
    }
}