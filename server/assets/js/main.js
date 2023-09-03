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

    flameParticleSystem.init(250);

    const flameEmitter = flameParticleSystem.setEmitter(Photons.ConstantParticleEmitter);
    flameEmitter.emissionRate = 5;

    flameParticleSystem.addParticleSequence(0, 18);
    const flameParticleSequences = flameParticleSystem.getParticleSequences();

    const lifetimeInitializerGenerator = new Photons.RandomGenerator(0, 0.0, 0.0, 0.0, 0.0, false);
    flameParticleSystem.addParticleStateInitializer(Photons.LifetimeInitializer, lifetimeInitializerGenerator);

    const rotationalSpeedInitializerGenerator = new Photons.RandomGenerator(0, 1.0, -1.0, 0.0, 0.0, false);
    flameParticleSystem.addParticleStateInitializer(Photons.RotationalSpeedInitializer, rotationalSpeedInitializerGenerator);

    const sizeInitializerGenerator = new Photons.RandomGenerator(THREE.Vector2, new THREE.Vector2(0.25  * scale, 0.25 * scale), new THREE.Vector2(0.5 * scale, 0.5 * scale), 0.0, 0.0, false);
    flameParticleSystem.addParticleStateInitializer(Photons.SizeInitializer, sizeInitializerGenerator);

    flameParticleSystem.addParticleStateInitializer(Photons.BoxPositionInitializer, new THREE.Vector3(0.05 * scale, 0.0, 0.05 * scale), new THREE.Vector3(0.0, 0.0, 0.0));

    flameParticleSystem.addParticleStateInitializer(Photons.RandomVelocityInitializer, new THREE.Vector3(0.05 * scale, 0.4 * scale, 0.05 * scale),  new THREE.Vector3(-0.025 * scale, 0.8 * scale, -0.025 * scale),  0.5 * scale, 1.0 * scale);

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

};

const animate = () => {
    requestAnimationFrame(animate);

    // test comment

    /* Update controls when damping */
    controls.update();

    flameParticleSystem.update();

    /* Render scene */
    renderer.render(scene, camera);

    flameParticleSystem.render(renderer, camera);
};

initThreeJS().then(() => animate());
