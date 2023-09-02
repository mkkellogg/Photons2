import * as SceneSetup from './utils/sceneSetup.js';
import * as ReactCube from './box/group.js';
import * as Photons from '../lib/photons.module.js';
import * as THREE from 'three';

/* Define DOM elements */
const rootElement = document.querySelector('#root');
const contentElement = document.querySelector('#content-wrapper');

/* Define Three variables */
let camera;
let controls;
let scene;
let renderer;
let aspectHeight;
let aspectWidth;
let gridHelper;

const appendContent = () => {
    // Create Webpack SVG logo node
    const webpackLogo = document.createElement('img');
    webpackLogo.src = 'assets/images/logos/webpack-logo.svg';

    // Create Three.js PNG logo node
    const threeLogo = document.createElement('img');
    threeLogo.src = 'assets/images/logos/three-icon.png';

    // Create heading node
    const greeting = document.createElement('h1');
    greeting.textContent = 'Three.js Webpack boilerplate';

    // Append logos and heading nodes to the content DOM element
    contentElement.querySelector('#logo-wrapper').append(threeLogo, webpackLogo);
    contentElement.append(greeting);
};

const onResize = () => {
    aspectWidth = window.innerWidth;
    aspectHeight = window.innerHeight - contentElement.getBoundingClientRect().bottom;
    camera.aspect = aspectWidth / aspectHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(aspectWidth, aspectHeight);
};

const initThreeJS = async () => {
    /* Define aspect */
    aspectWidth = window.innerWidth;
    aspectHeight = window.innerHeight - contentElement.getBoundingClientRect().bottom;

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

    /* Add react cube to scene */
    scene.add(await ReactCube.group());

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

    let flameRoot = new THREE.Object3D();
    let flameRenderer = new Photons.AnimatedSpriteRenderer();
    let flame = new Photons.ParticleSystem(flameRoot, flameRenderer, renderer);
    flame.init(250);
};

const animate = () => {
    requestAnimationFrame(animate);

    // test comment

    /* Update controls when damping */
    controls.update();

    /* Render scene */
    renderer.render(scene, camera);
};

appendContent();
initThreeJS().then(() => animate());
