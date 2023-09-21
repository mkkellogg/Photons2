import * as Photons from '../../../lib/photons.module.js';
import * as THREE from 'three';

const TWOPI = Math.PI * 2.0;
const PIOVERTWO = Math.PI / 2.0;
const UP = new THREE.Vector3(0.0, 1.0, 0.0);

export class Scene {

    constructor (scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.particleSystems = [];
        this.manager = new Photons.Manager();
        this.jsonTypeStore = new Photons.JSONTypeStore();
        this.jsonTypeStore.addNamespace('THREE', THREE);
        this.jsonTypeStore.addNamespace('Photons', Photons);
        this.startTime = performance.now() / 1000;
        this.fireballRoots = [];
    }

    build () {
        this.setupParticleSystems();
        this.setupSceneComponents();
    }

    update() {
        const currentTime = performance.now() / 1000;
        const elapsedTime = currentTime - this.startTime;

        const revolutionTime = 15.0;
        const pf = elapsedTime / revolutionTime;
        const p = (pf - Math.floor(pf)) * TWOPI;

        const spacing = TWOPI / this.fireballRoots.length;

        for (let i = 0; i < this.fireballRoots.length; i++) {
            const a = p + spacing * i;
            const tx = Math.cos(a);
            const ty = Math.sin(a);
            this.fireballRoots[i].position.set(tx, 1.0, -ty);
            this.fireballRoots[i].quaternion.setFromAxisAngle(UP, a - PIOVERTWO);
        }

        this.manager.update();
    }

    render() {
        this.manager.render(this.renderer, this.camera);
    }

    static traverseScene (node, onVisit, visited) {
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

    setupParticleSystems (){
        let scale = 0.15;
        let fireballPosition = new THREE.Vector3(1.0, 1.0, 0.0);
        for (let i = 0; i < 2; i++) {
            this.fireballRoots[i] = this.createFlameThrowerBody();
            const releaseMultiplier = 70;
            const simulateInWorldSpace = true;
            const animationSpeedMultiplier = 2.5;
            this.manager.addParticleSystem(this.setupEmbers(this.fireballRoots[i], simulateInWorldSpace, releaseMultiplier, animationSpeedMultiplier, scale, fireballPosition));
            this.manager.addParticleSystem(this.setupBaseFlame(this.fireballRoots[i], simulateInWorldSpace, releaseMultiplier, animationSpeedMultiplier, scale, fireballPosition));
            this.manager.addParticleSystem(this.setupBrightFLame(this.fireballRoots[i], simulateInWorldSpace, releaseMultiplier, animationSpeedMultiplier, scale, fireballPosition));
        }
    }

    setupEmbers (root, simulateInWorldSpace, releaseMultiplier, animationSpeedMultiplier, scale, position) {
        const embersRoot = root || new THREE.Object3D();
        position = position || new THREE.Vector3();
        embersRoot.position.copy(position);

        const texturePath = 'assets/textures/ember.png';
        const embersTexture = new THREE.TextureLoader().load(texturePath);
        const embersAtlas = new Photons.Atlas(embersTexture, texturePath);
        embersAtlas.addFrameSet(1, 0.0, 0.0, 1.0, 1.0);
        const embersRenderer = new Photons.AnimatedSpriteRenderer(embersAtlas, true, THREE.AdditiveBlending);

        const embersParticleSystem = new Photons.ParticleSystem(embersRoot, embersRenderer, this.renderer);
        embersParticleSystem.init(150 * releaseMultiplier);

        embersParticleSystem.setEmitter(new Photons.ConstantParticleEmitter(6 * releaseMultiplier));

        const sizeInitializerGenerator = new Photons.RandomGenerator(THREE.Vector2,
                                                                     new THREE.Vector2(0.0, 0.0),
                                                                     new THREE.Vector2(scale * 0.15, scale  * 0.15),
                                                                     0.0, 0.0, false);
        embersParticleSystem.addParticleStateInitializer(new Photons.LifetimeInitializer(3.0 * animationSpeedMultiplier, 1.0 * animationSpeedMultiplier, 0.0, 0.0, false));
        embersParticleSystem.addParticleStateInitializer(new Photons.SizeInitializer(sizeInitializerGenerator));
        embersParticleSystem.addParticleStateInitializer(new Photons.BoxPositionInitializer(
                                                         new THREE.Vector3(0.05 * scale, 0.0, 0.05 * scale),
                                                         new THREE.Vector3(-0.025 * scale, 0.0, -0.025 * scale)));

        const vFactor = animationSpeedMultiplier * scale;
        embersParticleSystem.addParticleStateInitializer(new Photons.RandomVelocityInitializer(
                                                         new THREE.Vector3(0, 0.5, 0),
                                                         new THREE.Vector3(0, -0.25, -1),
                                                         2 * vFactor, 2 * vFactor));

        const embersOpacityOperator = embersParticleSystem.addParticleStateOperator(new Photons.OpacityInterpolatorOperator());
        embersOpacityOperator.addElements([[0.0, 0.0], [0.7, 0.25], [0.9, 0.75], [0.0, 1.0]]);

        const embersColorOperator = embersParticleSystem.addParticleStateOperator(new Photons.ColorInterpolatorOperator(true));
        embersColorOperator.addElementsFromParameters([[[1.0, 0.7, 0.0], 0.0], [[1.0, 0.6, 0.0], 0.5], [[1.0, 0.4, 0.0], 1.0]]);

        const acceleratorOperatorGenerator = new Photons.SphereRandomGenerator(Math.PI * 2.0, 0.0, Math.PI,
                                                                              -Math.PI / 2, 5.0, -2,
                                                                              scale, scale, scale,
                                                                              0.0, 0.0, 0.0);

        embersParticleSystem.addParticleStateOperator(new Photons.AccelerationOperator(acceleratorOperatorGenerator));
    
        embersParticleSystem.setSimulateInWorldSpace(simulateInWorldSpace);
        embersParticleSystem.start(); 

        return embersParticleSystem;
    }
    
    setupBaseFlame (root, simulateInWorldSpace, releaseMultiplier, animationSpeedMultiplier, scale, position) {
        const baseFlameRoot = root || new THREE.Object3D();
        position = position || new THREE.Vector3();
        baseFlameRoot.position.copy(position);

        const texturePath = 'assets/textures/base_flame.png';
        const baseFlameTexture = new THREE.TextureLoader().load(texturePath);
        const baseFlameAtlas = new Photons.Atlas(baseFlameTexture, texturePath);
        baseFlameAtlas.addFrameSet(18, 0.0, 0.0, 128.0 / 1024.0, 128.0 / 512.0);
        const baseFlameRenderer = new Photons.AnimatedSpriteRenderer(baseFlameAtlas, true);

        const baseFlameParticleSystem = new Photons.ParticleSystem(baseFlameRoot, baseFlameRenderer, this.renderer);
        baseFlameParticleSystem.init(50 * releaseMultiplier);

        baseFlameParticleSystem.setEmitter(new Photons.ConstantParticleEmitter(10 * releaseMultiplier));

        baseFlameParticleSystem.addParticleSequence(0, 18);
        const baseFlameParticleSequences = baseFlameParticleSystem.getParticleSequences();

        baseFlameParticleSystem.addParticleStateInitializer(new Photons.LifetimeInitializer(0.0, 0.0, 0.0, 0.0, false));
        baseFlameParticleSystem.addParticleStateInitializer(new Photons.RotationInitializer(new Photons.RandomGenerator(0, 2.0 * Math.PI, -Math.PI, 0.0, 0.0, false)));
        baseFlameParticleSystem.addParticleStateInitializer(new Photons.RotationalSpeedInitializer(1.0, -1.0, 0.0, 0.0, false));
       
        baseFlameParticleSystem.addParticleStateInitializer(new Photons.SizeInitializer(
                                                            new Photons.RandomGenerator(THREE.Vector2,
                                                                                        new THREE.Vector2(0.15, 0.15),
                                                                                        new THREE.Vector2(0.0, 0.0),
                                                                                        1.15 * scale, 0.60 * scale, false)));
       
        baseFlameParticleSystem.addParticleStateInitializer(new Photons.BoxPositionInitializer(
                                                            new THREE.Vector3(0.05 * scale, 0.0, 0.05 * scale),
                                                            new THREE.Vector3(-0.025 * scale, 0.0, -0.025 * scale)));
        const vFactor = animationSpeedMultiplier * scale;
        baseFlameParticleSystem.addParticleStateInitializer(new Photons.RandomVelocityInitializer(
                                                            new THREE.Vector3(0, 0, 0),
                                                            new THREE.Vector3(0, 0, -1),
                                                            2 * vFactor, 2 * vFactor));

        baseFlameParticleSystem.addParticleStateInitializer(new Photons.SequenceInitializer(baseFlameParticleSequences));

        baseFlameParticleSystem.addParticleStateOperator(new Photons.SequenceOperator(baseFlameParticleSequences, 0.08 * animationSpeedMultiplier, false));

        const baseFlameOpacityOperator = baseFlameParticleSystem.addParticleStateOperator(new Photons.OpacityInterpolatorOperator());
        baseFlameOpacityOperator.addElements([[0.0, 0.0], [0.5, 0.4], [0.2, 0.75], [0.0, 1.0]]);

        const baseFlameSizeOperator = baseFlameParticleSystem.addParticleStateOperator(new Photons.SizeInterpolatorOperator(true));
        baseFlameSizeOperator.addElementsFromParameters([[[0.6, 0.6], 0.0], [[1.0, 1.0], 0.4], [[1.0, 1.0], 1.0]]);

        const baseFlameColorOperator = baseFlameParticleSystem.addParticleStateOperator(new Photons.ColorInterpolatorOperator(true));
        baseFlameColorOperator.addElementsFromParameters([[[1.0, 1.0, 1.0], 0.0], [[1.5, 1.5, 1.5], 0.5], [[1.0, 1.0, 1.0], 1.0]]);

        baseFlameParticleSystem.setSimulateInWorldSpace(simulateInWorldSpace);
        baseFlameParticleSystem.start();

        return baseFlameParticleSystem;
    }
    
    setupBrightFLame (root, simulateInWorldSpace, releaseMultiplier, animationSpeedMultiplier, scale, position) {
        const brightFlameRoot = root || new THREE.Object3D();
        position = position || new THREE.Vector3();
        brightFlameRoot.position.copy(position);

        const texturePath = 'assets/textures/bright_flame.png';
        const brightFlameTexture = new THREE.TextureLoader().load(texturePath);
        const brightFlameAtlas = new Photons.Atlas(brightFlameTexture, texturePath);
        brightFlameAtlas.addFrameSet(16, 0.0, 0.0, 212.0 / 1024.0, 256.0 / 1024.0);
        const brightFlameRenderer = new Photons.AnimatedSpriteRenderer(brightFlameAtlas, true);

        const brightFlameParticleSystem = new Photons.ParticleSystem(brightFlameRoot, brightFlameRenderer, this.renderer);
        brightFlameParticleSystem.init(20 * releaseMultiplier);

        brightFlameParticleSystem.setEmitter(new Photons.ConstantParticleEmitter(5 * releaseMultiplier));

        brightFlameParticleSystem.addParticleSequence(0, 16);
        const brightFlameParticleSequences = brightFlameParticleSystem.getParticleSequences();

        brightFlameParticleSystem.addParticleStateInitializer(new Photons.LifetimeInitializer(0.0, 0.0, 0.0, 0.0, false));
        brightFlameParticleSystem.addParticleStateInitializer(new Photons.RotationInitializer(new Photons.RandomGenerator(0, 2.0 * Math.PI, -Math.PI, 0.0, 0.0, false)));
        brightFlameParticleSystem.addParticleStateInitializer(new Photons.RotationalSpeedInitializer(Math.PI / 2.0, -Math.PI / 4.0, 0.0, 0.0, false));
        brightFlameParticleSystem.addParticleStateInitializer(new Photons.SizeInitializer(
                                                              new Photons.RandomGenerator(THREE.Vector2,
                                                                                          new THREE.Vector2(0.05, 0.05),
                                                                                          new THREE.Vector2(0.0, 0.0),
                                                                                          0.95 * scale, 0.50 * scale, false)));
        brightFlameParticleSystem.addParticleStateInitializer(new Photons.BoxPositionInitializer(
                                                              new THREE.Vector3(0.1 * scale, 0.0, 0.1 * scale),
                                                              new THREE.Vector3(-0.05 * scale, 0.0, -0.05 * scale)));
        
        const vFactor = animationSpeedMultiplier * scale;
        brightFlameParticleSystem.addParticleStateInitializer(new Photons.RandomVelocityInitializer(
                                                              new THREE.Vector3(0, 0, 0),
                                                              new THREE.Vector3(0, 0, -1),
                                                              2 * vFactor, 2 * vFactor));

        brightFlameParticleSystem.addParticleStateInitializer(new Photons.SequenceInitializer(brightFlameParticleSequences));

        brightFlameParticleSystem.addParticleStateOperator(new Photons.SequenceOperator(brightFlameParticleSequences, 0.1 * animationSpeedMultiplier, false));

        const brightFlameOpacityOperator = brightFlameParticleSystem.addParticleStateOperator(new Photons.OpacityInterpolatorOperator());
        brightFlameOpacityOperator.addElements([[0.0, 0.0], [0.4, 0.2], [0.35, 0.75], [0.0, 1.0]]);

        const brightFlameSizeOperator = brightFlameParticleSystem.addParticleStateOperator(new Photons.SizeInterpolatorOperator(true));
        brightFlameSizeOperator.addElementsFromParameters([[[0.3, 0.3], 0.0], [[1.0, 1.0], 0.4],
                                                           [[1.0, 1.0], 0.55], [[0.65, 0.65], 0.75], [[0.1, 0.1], 1.0]]);

        const brightFlameColorOperator = brightFlameParticleSystem.addParticleStateOperator(new Photons.ColorInterpolatorOperator(true));
        brightFlameColorOperator.addElementsFromParameters([[[1.0, 1.0, 1.0], 0.0], [[2.0, 2.0, 2.0], 0.3], [[2.0, 2.0, 2.0], 0.4],
                                                            [[0.9, 0.6, 0.3], 0.65], [[0.75, 0.0, 0.0], 1.0]]);

        brightFlameParticleSystem.setSimulateInWorldSpace(simulateInWorldSpace);

        brightFlameParticleSystem.start();
        return brightFlameParticleSystem;
    }
  
    setupSceneComponents () {
        const directionalLight = new THREE.DirectionalLight(0xffffff, 3.5);
        this.scene.add(directionalLight) ;
        directionalLight.position.set(5, 5, 5);
    }

    createFlameThrowerBody () {
        const geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 20, 10);
        const mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
        const transform = new THREE.Matrix4();
        transform.makeRotationX(Math.PI / 2.0);
        geometry.applyMatrix4(transform);
        transform.makeTranslation(0, 0, 0.2);
        geometry.applyMatrix4(transform);
        return mesh;
    }
}
