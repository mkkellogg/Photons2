import * as Photons from '../lib/photons.module.js';
import { FogMaterial } from './FogMaterial.js';
import { GLTFLoader } from './GltfLoader.js';
import * as THREE from 'three';

export class DemoScene {

    constructor (scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.particleSystems = [];
    }

    build () {
        this.setupParticleSystems();
        this.setupSceneComponents();
    }

    update() {
        for (let particleSystem of this.particleSystems) {
            particleSystem.update();
        }
    }

    render() {
        for (let particleSystem of this.particleSystems) {
            particleSystem.render(this.renderer, this.camera);
        }
    }

    static traverseScene (node, onVisit, visited) {
        visited = visited || {};
        if (!visited[node.uuid]) {
            visited[node.uuid] = true;
            onVisit(node);
            if (node.children) {
                for (let child of node.children) {
                    DemoScene.traverseScene(child, onVisit, visited);
                }
            }
        }
    }

    setupParticleSystems (){
        let scale = 0.15;
        let flamePosition = new THREE.Vector3(-.3, 1.65, 1.65);
        this.particleSystems.push(this.setupEmbers(scale, flamePosition));
        this.particleSystems.push(this.setupBaseFlame(scale, flamePosition));
        this.particleSystems.push(this.setupBrightFLame(scale, flamePosition));
    }

    setupEmbers (scale, position) {

        const embersTexture = new THREE.TextureLoader().load('assets/textures/ember.png');
        const embersAtlas = new Photons.Atlas(embersTexture);
        embersAtlas.addTileArray(1, 0.0, 0.0, 1.0, 1.0);
        const embersRoot = new THREE.Object3D();
        embersRoot.position.copy(position);
        const embersRenderer = new Photons.AnimatedSpriteRenderer(embersAtlas, true);

        const embersParticleSystem = new Photons.ParticleSystem(embersRoot, embersRenderer, this.renderer);
        embersParticleSystem.addParticleStateOperator(Photons.BaseParticleStateOperator);
        embersParticleSystem.addParticleStateInitializer(Photons.BaseParticleStateInitializer);
        embersParticleSystem.init(150);
        embersRenderer.material.blending = THREE.AdditiveBlending;
        // TODO: Remove this hack and properly implement bounds calculations
        embersRenderer.mesh.frustumCulled = false;
    
        const embersEmitter = embersParticleSystem.setEmitter(Photons.ConstantParticleEmitter);
        embersEmitter.emissionRate = 6;

        embersParticleSystem.addParticleStateInitializer(Photons.LifetimeInitializer, new Photons.RandomGenerator(0, 3.0, 1.0, 0.0, 0.0, false));
        embersParticleSystem.addParticleStateInitializer(Photons.SizeInitializer,
                                                         new Photons.RandomGenerator(THREE.Vector2, new THREE.Vector2(0.0, 0.0),
                                                                                    new THREE.Vector2(scale * 0.15, scale  * 0.15), 0.0, 0.0, false));
        embersParticleSystem.addParticleStateInitializer(Photons.BoxPositionInitializer, new THREE.Vector3(0.05 * scale, 0.0, 0.05 * scale), new THREE.Vector3(-0.025 * scale, 0.0, -0.025 * scale));
        embersParticleSystem.addParticleStateInitializer(Photons.RandomVelocityInitializer, new THREE.Vector3(0.4 * scale, 0.5 * scale, 0.4 * scale),
                                                         new THREE.Vector3(-0.2 * scale, 0.8 * scale, -0.2 * scale), 0.6 * scale, 0.8 * scale);

        const embersOpacityInterpolatorOperator = embersParticleSystem.addParticleStateOperator(Photons.OpacityInterpolatorOperator);
        embersOpacityInterpolatorOperator.addElement(0.0, 0.0);
        embersOpacityInterpolatorOperator.addElement(0.7, 0.25);
        embersOpacityInterpolatorOperator.addElement(0.9, 0.75);
        embersOpacityInterpolatorOperator.addElement(0.0, 1.0);

        const embersColorInterpolatorOperator = embersParticleSystem.addParticleStateOperator(Photons.ColorInterpolatorOperator, true);
        embersColorInterpolatorOperator.addElement(new THREE.Color(1.0, 0.7, 0.0), 0.0);
        embersColorInterpolatorOperator.addElement(new THREE.Color(1.0, 0.6, 0.0), 0.5);
        embersColorInterpolatorOperator.addElement(new THREE.Color(1.0, 0.4, 0.0), 1.0);

        embersParticleSystem.addParticleStateOperator(Photons.AccelerationOperator, new Photons.SphereRandomGenerator(THREE.Vector3, Math.PI * 2.0, 0.0, Math.PI , -Math.PI / 2, 20.0, -8, scale, scale, scale, 0.0, 0.0, 0.0));
    
        embersParticleSystem.setSimulateInWorldSpace(true);
        embersParticleSystem.start(); 
    
        return embersParticleSystem;
    }
    
    setupBaseFlame (scale, position) {
        const baseFlameTexture = new THREE.TextureLoader().load('assets/textures/base_flame.png');
        const baseFlameAtlas = new Photons.Atlas(baseFlameTexture);
        baseFlameAtlas.addTileArray(18, 0.0, 0.0, 128.0 / 1024.0, 128.0 / 512.0);
        const baseFlameRoot = new THREE.Object3D();
        baseFlameRoot.position.copy(position);
        const baseFlameRenderer = new Photons.AnimatedSpriteRenderer(baseFlameAtlas, true);
    
        const baseFlameParticleSystem = new Photons.ParticleSystem(baseFlameRoot, baseFlameRenderer, this.renderer);
        baseFlameParticleSystem.addParticleStateOperator(Photons.BaseParticleStateOperator);
        baseFlameParticleSystem.addParticleStateInitializer(Photons.BaseParticleStateInitializer);
        baseFlameParticleSystem.init(50);
        // TODO: Remove this hack and properly implement bounds calculations
        baseFlameRenderer.mesh.frustumCulled = false;
    
        const baseFlameEmitter = baseFlameParticleSystem.setEmitter(Photons.ConstantParticleEmitter);
        baseFlameEmitter.emissionRate = 10;
    
        baseFlameParticleSystem.addParticleSequence(0, 18);
        const baseFlameParticleSequences = baseFlameParticleSystem.getParticleSequences();
    
        baseFlameParticleSystem.addParticleStateInitializer(Photons.LifetimeInitializer, new Photons.RandomGenerator(0, 0.0, 0.0, 0.0, 0.0, false));
        baseFlameParticleSystem.addParticleStateInitializer(Photons.RotationInitializer, new Photons.RandomGenerator(0, Math.PI / 2.0, -Math.PI / 2.0, 0.0, 0.0, false));
        baseFlameParticleSystem.addParticleStateInitializer(Photons.RotationalSpeedInitializer, new Photons.RandomGenerator(0, 1.0, -1.0, 0.0, 0.0, false));
        baseFlameParticleSystem.addParticleStateInitializer(Photons.SizeInitializer,
                                                            new Photons.RandomGenerator(THREE.Vector2, new THREE.Vector2(0.25  * scale, 0.25 * scale),
                                                                                    new THREE.Vector2(0.5 * scale, 0.5 * scale), 0.0, 0.0, false));
    
        baseFlameParticleSystem.addParticleStateInitializer(Photons.BoxPositionInitializer, new THREE.Vector3(0.05 * scale, 0.0, 0.05 * scale), new THREE.Vector3(-0.025 * scale, 0.0, -0.025 * scale));
        baseFlameParticleSystem.addParticleStateInitializer(Photons.RandomVelocityInitializer, new THREE.Vector3(0.05 * scale, 0.4 * scale, 0.05 * scale),
                                                            new THREE.Vector3(-0.025 * scale, 0.8 * scale, -0.025 * scale),  0.35 * scale, 0.5 * scale);
        baseFlameParticleSystem.addParticleStateInitializer(Photons.SequenceInitializer, baseFlameParticleSequences);
    
        baseFlameParticleSystem.addParticleStateOperator(Photons.SequenceOperator, baseFlameParticleSequences, 0.07, false);
    
        const baseFlameOpacityInterpolatorOperator = baseFlameParticleSystem.addParticleStateOperator(Photons.OpacityInterpolatorOperator);
        baseFlameOpacityInterpolatorOperator.addElement(0.0, 0.0);
        baseFlameOpacityInterpolatorOperator.addElement(0.3, 0.25);
        baseFlameOpacityInterpolatorOperator.addElement(0.3, 0.5);
        baseFlameOpacityInterpolatorOperator.addElement(0.0, 1.0);
    
        const baseFlameSizeInterpolatorOperator = baseFlameParticleSystem.addParticleStateOperator(Photons.SizeInterpolatorOperator, true);
        baseFlameSizeInterpolatorOperator.addElement(new THREE.Vector2(0.6, 0.6), 0.0);
        baseFlameSizeInterpolatorOperator.addElement(new THREE.Vector2(1.0, 1.0), 0.4);
        baseFlameSizeInterpolatorOperator.addElement(new THREE.Vector2(1.0, 1.0), 1.0);
    
        const baseFlameColorInterpolatorOperator = baseFlameParticleSystem.addParticleStateOperator(Photons.ColorInterpolatorOperator, true);
        baseFlameColorInterpolatorOperator.addElement(new THREE.Color(1.0, 1.0, 1.0), 0.0);
        baseFlameColorInterpolatorOperator.addElement(new THREE.Color(1.5, 1.5, 1.5), 0.5);
        baseFlameColorInterpolatorOperator.addElement(new THREE.Color(1.0, 1.0, 1.0), 1.0);
    
        baseFlameParticleSystem.addParticleStateOperator(Photons.AccelerationOperator, new Photons.RandomGenerator(THREE.Vector3, new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 1.5 * scale, 0.0), 0.0, 0.0, false));
    
        baseFlameParticleSystem.setSimulateInWorldSpace(true);
        baseFlameParticleSystem.start();

        return baseFlameParticleSystem;
    }
    
    setupBrightFLame (scale, position) {
        const brightFlameTexture = new THREE.TextureLoader().load('assets/textures/bright_flame.png');
        const brightFlameAtlas = new Photons.Atlas(brightFlameTexture);
        brightFlameAtlas.addTileArray(16, 0.0, 0.0, 212.0 / 1024.0, 256.0 / 1024.0);
        const brightFlameRoot = new THREE.Object3D();
        brightFlameRoot.position.copy(position);
        const brightFlameRenderer = new Photons.AnimatedSpriteRenderer(brightFlameAtlas, true);
    
        const brightFlameParticleSystem = new Photons.ParticleSystem(brightFlameRoot, brightFlameRenderer, this.renderer);
        brightFlameParticleSystem.addParticleStateOperator(Photons.BaseParticleStateOperator);
        brightFlameParticleSystem.addParticleStateInitializer(Photons.BaseParticleStateInitializer);
        brightFlameParticleSystem.init(20);
        // TODO: Remove this hack and properly implement bounds calculations
        brightFlameRenderer.mesh.frustumCulled = false;
    
        const brightFlameEmitter = brightFlameParticleSystem.setEmitter(Photons.ConstantParticleEmitter);
        brightFlameEmitter.emissionRate = 5;
    
        brightFlameParticleSystem.addParticleSequence(0, 16);
        const brightFlameParticleSequences = brightFlameParticleSystem.getParticleSequences();
    
        brightFlameParticleSystem.addParticleStateInitializer(Photons.LifetimeInitializer, new Photons.RandomGenerator(0, 0.0, 0.0, 0.0, 0.0, false));
        brightFlameParticleSystem.addParticleStateInitializer(Photons.RotationInitializer, new Photons.RandomGenerator(0, Math.PI, -Math.PI / 2.0, 0.0, 0.0, false));
        brightFlameParticleSystem.addParticleStateInitializer(Photons.RotationalSpeedInitializer, new Photons.RandomGenerator(0, Math.PI / 2.0, -Math.PI / 4.0, 0.0, 0.0, false));
        brightFlameParticleSystem.addParticleStateInitializer(Photons.SizeInitializer,
                                                         new Photons.RandomGenerator(THREE.Vector2, new THREE.Vector2(0.0, 0.0),
                                                         new THREE.Vector2(0.0, 0.0), 0.2 * scale, 0.65 * scale, false));
        brightFlameParticleSystem.addParticleStateInitializer(Photons.BoxPositionInitializer, new THREE.Vector3(0.1 * scale, 0.0, 0.1 * scale), new THREE.Vector3(-0.05 * scale, 0.0, -0.05 * scale));
        brightFlameParticleSystem.addParticleStateInitializer(Photons.RandomVelocityInitializer, new THREE.Vector3(0.02 * scale, 0.4 * scale, 0.02 * scale),
                                                         new THREE.Vector3(-0.01 * scale, 0.4 * scale, -0.01 * scale),  0.1 * scale, .2 * scale);
        brightFlameParticleSystem.addParticleStateInitializer(Photons.SequenceInitializer, brightFlameParticleSequences);
        
    
        brightFlameParticleSystem.addParticleStateOperator(Photons.SequenceOperator, brightFlameParticleSequences, 0.1, false);
    
        const brightFlameOpacityInterpolatorOperator = brightFlameParticleSystem.addParticleStateOperator(Photons.OpacityInterpolatorOperator);
        brightFlameOpacityInterpolatorOperator.addElement(0.0, 0.0);
        brightFlameOpacityInterpolatorOperator.addElement(0.6, 0.2);
        brightFlameOpacityInterpolatorOperator.addElement(0.5, 0.75);
        brightFlameOpacityInterpolatorOperator.addElement(0.0, 1.0);
    
        const brightFlameSizeInterpolatorOperator = brightFlameParticleSystem.addParticleStateOperator(Photons.SizeInterpolatorOperator, true);
        brightFlameSizeInterpolatorOperator.addElement(new THREE.Vector2(0.3, 0.3), 0.0);
        brightFlameSizeInterpolatorOperator.addElement(new THREE.Vector2(1.0, 1.0), 0.4);
        brightFlameSizeInterpolatorOperator.addElement(new THREE.Vector2(1.0, 1.0), 0.55);
        brightFlameSizeInterpolatorOperator.addElement(new THREE.Vector2(0.65, 0.65), 0.75);
        brightFlameSizeInterpolatorOperator.addElement(new THREE.Vector2(0.1, 0.1), 1.0);
    
        const brightFlameColorInterpolatorOperator = brightFlameParticleSystem.addParticleStateOperator(Photons.ColorInterpolatorOperator, true);
        brightFlameColorInterpolatorOperator.addElement(new THREE.Color(1.0, 1.0, 1.0), 0.0);
        brightFlameColorInterpolatorOperator.addElement(new THREE.Color(2.0, 2.0, 2.0), 0.3);
        brightFlameColorInterpolatorOperator.addElement(new THREE.Color(2.0, 2.0, 2.0), 0.4);
        brightFlameColorInterpolatorOperator.addElement(new THREE.Color(0.9, 0.6, 0.3), 0.65);
        brightFlameColorInterpolatorOperator.addElement(new THREE.Color(0.75, 0.0, 0.0), 1.0);
    
        brightFlameParticleSystem.addParticleStateOperator(Photons.AccelerationOperator, new Photons.RandomGenerator(THREE.Vector3, new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 1.5 * scale, 0.0), 0.0, 0.0, false));
    
        brightFlameParticleSystem.setSimulateInWorldSpace(true);
        brightFlameParticleSystem.start();

        return brightFlameParticleSystem;
    }
    
    setupSceneComponents () {
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        this.scene.add(directionalLight) ;
        directionalLight.position.set(5, 5, 5);
    
        const modelLoader = new GLTFLoader();
        modelLoader.load("assets/models/pumpkin_graveyard/pumpkin_graveyard.gltf", (object) => {
            this.scene.add(object.scene);
            DemoScene.traverseScene(object.scene, (node) => {
                if (node.isMesh) {
                    if (node.name == "Opaque") {
                        node.castShadow = true;
                        node.receiveShadow = true;
                        const oldMaterial = node.material;
                        node.material = new THREE.MeshStandardMaterial();
                        node.material.map = oldMaterial.map;
                        node.material.normalMap = oldMaterial.normalMap;
                        node.material.normalScale.copy(oldMaterial.normalScale);
                        node.material.roughness =.6;
                    }
                }
            });
            object.scene.scale.set(0.75, 0.75, 0.75);
            const fogParent = new THREE.Object3D();
            const fogGeometry = new THREE.PlaneGeometry(1, 1);
            const fogMaterial = new FogMaterial({side: THREE.DoubleSide });
            fogMaterial.transparent = true;
            fogMaterial.depthWrite = false;
            const fogPlane = new THREE.Mesh(fogGeometry, fogMaterial);
            fogPlane.scale.set(32, 32, 0);
            fogPlane.rotateX(- Math.PI / 2);
            fogParent.add(fogPlane);
            fogParent.position.y += 1.0;
            this.scene.add(fogParent);
    
        });
    
    
        let torchPostPosition = new THREE.Vector3(-.31, 1, 1.65);
        modelLoader.load("assets/models/cartoon_torch/cartoon_torch.gltf", (object) => {
            this.scene.add(object.scene);
            DemoScene.traverseScene(object.scene, (node) => {
                if (node.isMesh) {
                    node.castShadow = false;
                    node.receiveShadow = false;
                }
            });
            object.scene.scale.set(1.2, 1.15, 1.2);
            object.scene.position.copy(torchPostPosition);
    
            const lightParent = new THREE.Object3D();
            this.scene.add(lightParent);
            lightParent.position.copy(torchPostPosition);
            lightParent.position.add(new THREE.Vector3(0, 0.65, 0));
    
            const flickerLightShadows = {
                'mapSize': 1024,
                'cameraNear': 0.5,
                'cameraFar': 500,
                'bias': .000009,
                'edgeRadius': 3
            };
            this.particleSystems[0].addLight(Photons.FlickerLight, lightParent, 10, 2, new THREE.Color().setRGB(1, .8, .4), 0, 1.0, flickerLightShadows);
        });
    }
}