import * as SceneSetup from './utils/sceneSetup.js';
import * as Photons from '../lib/photons.module.js';
import * as THREE from 'three';

/* Define DOM elements */
const rootElement = document.querySelector('#root');

/* Define Three variables */
let camera;
let controls;
let scene;
let renderer;
let aspectHeight;
let aspectWidth;
let gridHelper;
let flameParticleSystem;
let flame2ParticleSystem;

const onResize = () => {
    aspectWidth = window.innerWidth;
    aspectHeight = window.innerHeight - rootElement.getBoundingClientRect().bottom;
    camera.aspect = aspectWidth / aspectHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(aspectWidth, aspectHeight);
};

const initThreeJS = async () => {
    /* Define aspect */
    aspectWidth = window.innerWidth;
    aspectHeight = window.innerHeight - rootElement.getBoundingClientRect().bottom;

    /* Define camera */
    camera = SceneSetup.camera(aspectWidth, aspectHeight);

    /* Configurate camera */
    camera.position.set(0, 5, 5.65);

    /* Define scene */
    scene = SceneSetup.scene();

    /* Define grid helper */
    gridHelper = SceneSetup.gridHelper(20);

    /* Configurate grid helper */
    gridHelper.material.opacity = 0.5;
    gridHelper.material.transparent = true;

    /* Add grid helper to scene */
    scene.add(gridHelper);

    /* Define renderer */
    renderer = SceneSetup.renderer({
        antialias: true
    });

    /* Configure renderer */
    renderer.setSize(aspectWidth, aspectHeight);

    /* Define controls */
    controls = SceneSetup.controls(camera, renderer.domElement);

    /* Configurate controls */
    controls.maxPolarAngle = (0.9 * Math.PI) / 2;
    controls.enableDamping = true;
    controls.dampingFactor = 0.15;

    /* Add event listener on resize */
    window.addEventListener('resize', onResize, false);

    /* Append canvas to DOM */
    rootElement.appendChild(renderer.domElement);


    const scale = 1.0;

    const flameTexture = new THREE.TextureLoader().load('assets/textures/fire_particle_2_half.png');
    const flameAtlas = new Photons.Atlas(flameTexture);
    flameAtlas.addTileArray(18, 0.0, 0.0, 128.0 / 1024.0, 128.0 / 512.0);
    const flameRoot = new THREE.Object3D();
    const flameRenderer = new Photons.AnimatedSpriteRenderer(flameAtlas, true);

    flameParticleSystem = new Photons.ParticleSystem(flameRoot, flameRenderer, renderer);
    flameParticleSystem.addParticleStateOperator(Photons.BaseParticleStateOperator);
    flameParticleSystem.addParticleStateInitializer(Photons.BaseParticleStateInitializer);
    flameParticleSystem.init(50);

    const flameEmitter = flameParticleSystem.setEmitter(Photons.ConstantParticleEmitter);
    flameEmitter.emissionRate = 10;

    flameParticleSystem.addParticleSequence(0, 18);
    const flameParticleSequences = flameParticleSystem.getParticleSequences();

    flameParticleSystem.addParticleStateInitializer(Photons.LifetimeInitializer, new Photons.RandomGenerator(0, 0.0, 0.0, 0.0, 0.0, false));
    flameParticleSystem.addParticleStateInitializer(Photons.RotationInitializer, new Photons.RandomGenerator(0, Math.PI / 2.0, -Math.PI / 2.0, 0.0, 0.0, false));
    flameParticleSystem.addParticleStateInitializer(Photons.RotationalSpeedInitializer, new Photons.RandomGenerator(0, 1.0, -1.0, 0.0, 0.0, false));
    flameParticleSystem.addParticleStateInitializer(Photons.SizeInitializer,
                                                    new Photons.RandomGenerator(THREE.Vector2, new THREE.Vector2(0.25  * scale, 0.25 * scale),
                                                                                new THREE.Vector2(0.5 * scale, 0.5 * scale), 0.0, 0.0, false));

    flameParticleSystem.addParticleStateInitializer(Photons.BoxPositionInitializer, new THREE.Vector3(0.05 * scale, 0.0, 0.05 * scale), new THREE.Vector3(0.0, 0.0, 0.0));
    flameParticleSystem.addParticleStateInitializer(Photons.RandomVelocityInitializer, new THREE.Vector3(0.05 * scale, 0.4 * scale, 0.05 * scale),
                                                    new THREE.Vector3(-0.025 * scale, 0.8 * scale, -0.025 * scale),  0.5 * scale, 1.0 * scale);
    flameParticleSystem.addParticleStateInitializer(Photons.SequenceInitializer, flameParticleSequences);

    flameParticleSystem.addParticleStateOperator(Photons.SequenceOperator, flameParticleSequences, 0.055, false);

    const flameOpacityInterpolatorOperator = flameParticleSystem.addParticleStateOperator(Photons.OpacityInterpolatorOperator);
    flameOpacityInterpolatorOperator.addElement(0.0, 0.0);
    flameOpacityInterpolatorOperator.addElement(0.3, 0.25);
    flameOpacityInterpolatorOperator.addElement(0.3, 0.5);
    flameOpacityInterpolatorOperator.addElement(0.0, 1.0);

    const flameSizeInterpolatorOperator = flameParticleSystem.addParticleStateOperator(Photons.SizeInterpolatorOperator, true);
    flameSizeInterpolatorOperator.addElement(new THREE.Vector2(0.6, 0.6), 0.0);
    flameSizeInterpolatorOperator.addElement(new THREE.Vector2(1.0, 1.0), 0.4);
    flameSizeInterpolatorOperator.addElement(new THREE.Vector2(1.0, 1.0), 1.0);

    const flameColorInterpolatorOperator = flameParticleSystem.addParticleStateOperator(Photons.ColorInterpolatorOperator, true);
    flameColorInterpolatorOperator.addElement(new THREE.Color(1.0, 1.0, 1.0), 0.0);
    flameColorInterpolatorOperator.addElement(new THREE.Color(1.5, 1.5, 1.5), 0.5);
    flameColorInterpolatorOperator.addElement(new THREE.Color(1.0, 1.0, 1.0), 1.0);

    flameParticleSystem.setSimulateInWorldSpace(true);
    flameParticleSystem.start();



    const flame2Texture = new THREE.TextureLoader().load('assets/textures/fire_particle_4_flat_half.png');
    const flame2Atlas = new Photons.Atlas(flame2Texture);
    flame2Atlas.addTileArray(16, 0.0, 0.0, 212.0 / 1024.0, 256.0 / 1024.0);
    const flame2Root = new THREE.Object3D();
    const flame2Renderer = new Photons.AnimatedSpriteRenderer(flame2Atlas, true);

    flame2ParticleSystem = new Photons.ParticleSystem(flame2Root, flame2Renderer, renderer);
    flame2ParticleSystem.addParticleStateOperator(Photons.BaseParticleStateOperator);
    flame2ParticleSystem.addParticleStateInitializer(Photons.BaseParticleStateInitializer);
    flame2ParticleSystem.init(20);

    const flame2Emitter = flame2ParticleSystem.setEmitter(Photons.ConstantParticleEmitter);
    flame2Emitter.emissionRate = 5;

    flame2ParticleSystem.addParticleSequence(0, 16);
    const flame2ParticleSequences = flame2ParticleSystem.getParticleSequences();

    flame2ParticleSystem.addParticleStateInitializer(Photons.LifetimeInitializer, new Photons.RandomGenerator(0, 0.0, 0.0, 0.0, 0.0, false));
    flame2ParticleSystem.addParticleStateInitializer(Photons.RotationInitializer, new Photons.RandomGenerator(0, Math.PI / 2.0, -Math.PI / 2.0, 0.0, 0.0, false));
    flame2ParticleSystem.addParticleStateInitializer(Photons.RotationalSpeedInitializer, new Photons.RandomGenerator(0, Math.PI, -Math.PI / 2.0, 0.0, 0.0, false));
    flame2ParticleSystem.addParticleStateInitializer(Photons.SizeInitializer,
                                                     new Photons.RandomGenerator(THREE.Vector2, new THREE.Vector2(0.0, 0.0),
                                                     new THREE.Vector2(0.0, 0.0), 0.2 * scale, 0.65 * scale, false));
    flame2ParticleSystem.addParticleStateInitializer(Photons.BoxPositionInitializer, new THREE.Vector3(0.1 * scale, 0.0, 0.1 * scale), new THREE.Vector3(0.0, 0.0, 0.0));
    flame2ParticleSystem.addParticleStateInitializer(Photons.RandomVelocityInitializer, new THREE.Vector3(0.02 * scale, 0.4 * scale, 0.02 * scale),
                                                     new THREE.Vector3(-0.01 * scale, 0.4 * scale, -0.01 * scale),  0.2 * scale, .6 * scale);
    flame2ParticleSystem.addParticleStateInitializer(Photons.SequenceInitializer, flame2ParticleSequences);
    

    flame2ParticleSystem.addParticleStateOperator(Photons.SequenceOperator, flame2ParticleSequences, 0.1, false);

    const flame2OpacityInterpolatorOperator = flame2ParticleSystem.addParticleStateOperator(Photons.OpacityInterpolatorOperator);
    flame2OpacityInterpolatorOperator.addElement(0.0, 0.0);
    flame2OpacityInterpolatorOperator.addElement(0.6, 0.2);
    flame2OpacityInterpolatorOperator.addElement(0.5, 0.75);
    flame2OpacityInterpolatorOperator.addElement(0.0, 1.0);

    const flame2SizeInterpolatorOperator = flame2ParticleSystem.addParticleStateOperator(Photons.SizeInterpolatorOperator, true);
    flame2SizeInterpolatorOperator.addElement(new THREE.Vector2(0.3, 0.3), 0.0);
    flame2SizeInterpolatorOperator.addElement(new THREE.Vector2(1.0, 1.0), 0.4);
    flame2SizeInterpolatorOperator.addElement(new THREE.Vector2(1.0, 1.0), 0.55);
    flame2SizeInterpolatorOperator.addElement(new THREE.Vector2(0.65, 0.65), 0.75);
    flame2SizeInterpolatorOperator.addElement(new THREE.Vector2(0.1, 0.1), 1.0);

    const flame2ColorInterpolatorOperator = flame2ParticleSystem.addParticleStateOperator(Photons.ColorInterpolatorOperator, true);
    flame2ColorInterpolatorOperator.addElement(new THREE.Color(1.0, 1.0, 1.0), 0.0);
    flame2ColorInterpolatorOperator.addElement(new THREE.Color(2.0, 2.0, 2.0), 0.3);
    flame2ColorInterpolatorOperator.addElement(new THREE.Color(2.0, 2.0, 2.0), 0.4);
    flame2ColorInterpolatorOperator.addElement(new THREE.Color(0.9, 0.6, 0.3), 0.65);
    flame2ColorInterpolatorOperator.addElement(new THREE.Color(0.75, 0.0, 0.0), 1.0);

    flame2ParticleSystem.addParticleStateOperator(Photons.AccelerationOperator, new Photons.RandomGenerator(THREE.Vector3, new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 1.5 * scale, 0.0), 0.0, 0.0, false));

    flame2ParticleSystem.setSimulateInWorldSpace(true);
    flame2ParticleSystem.start();

};

const animate = () => {
    requestAnimationFrame(animate);

    // test comment

    /* Update controls when damping */
    controls.update();

    flameParticleSystem.update();
    flame2ParticleSystem.update();

    /* Render scene */
    renderer.render(scene, camera);

    flameParticleSystem.render(renderer, camera);
    flame2ParticleSystem.render(renderer, camera);
};

initThreeJS().then(() => animate());
