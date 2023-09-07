import * as SceneSetup from './utils/sceneSetup.js';
import * as Photons from '../lib/photons.module.js';
import { FogMaterial } from './FogMaterial.js';
import { GLTFLoader } from './GltfLoader.js';
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
let baseFlameParticleSystem;
let brightFlameParticleSystem;
let flickerLight;

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

    /* Configure camera */
    camera.position.set(0.010393465045119121, 2.1683863686245393, 2.1185542403178967);
   // camera.rotation.set(-0.7336486758547008, 0.11186219427553079, 0.10029702167860358, "XYZ");
    camera.quaternion.set(-0.31211109312645235, 0.05162137245260911, 0.016986581102126804, 0.9484900397558116);

    /* Define scene */
    scene = SceneSetup.scene();

    /* Define grid helper */
    gridHelper = SceneSetup.gridHelper(20);

    /* Configurate grid helper */
    gridHelper.material.opacity = 0.5;
    gridHelper.material.transparent = true;

    /* Add grid helper to scene */
    //scene.add(gridHelper);

    /* Define renderer */
    renderer = SceneSetup.renderer({
        antialias: true
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;


    /* Configure renderer */
    renderer.setSize(aspectWidth, aspectHeight);

    /* Define controls */
    controls = SceneSetup.controls(camera, renderer.domElement);

    /* Configurate controls */
    controls.maxPolarAngle = (0.9 * Math.PI) / 2;
    controls.enableDamping = true;
    controls.dampingFactor = 0.15;

    controls.target.set(-0.2541900499948175, 0.3691053582677349, -0.30497185048955555);

    /* Add event listener on resize */
    window.addEventListener('resize', onResize, false);

    /* Append canvas to DOM */
    rootElement.appendChild(renderer.domElement);



    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    scene.add( directionalLight );
    directionalLight.position.set( 5, 5, 5 );

    const modelLoader = new GLTFLoader();

    function traverseScene(node, onVisit, visited) {
        visited = visited || {};
        if (!visited[node.uuid]) {
            visited[node.uuid] = true;
            onVisit(node);
            if (node.children) {
                for (let child of node.children) {
                    traverseScene(child, onVisit, visited);
                }
            }
        }
    }
  
    modelLoader.load("assets/models/pumpkin_graveyard/pumpkin_graveyard.gltf", (object) => {
        scene.add(object.scene);
        traverseScene(object.scene, (node) => {
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
        scene.add(fogParent);

    }, null, (error) => {
        console.log(error)
    });



    let torchPostPosition = new THREE.Vector3(-.31, 1, 1.65);
    modelLoader.load("assets/models/cartoon_torch/cartoon_torch.gltf", (object) => {
        scene.add(object.scene);
        traverseScene(object.scene, (node) => {
            if (node.isMesh) {
                node.castShadow = false;
                node.receiveShadow = false;
            }
        });
        object.scene.scale.set(1.2, 1.15, 1.2);
        object.scene.position.copy(torchPostPosition);

        flickerLight = new Photons.FlickerLight(object.scene);
        flickerLight.intensity = 10;
        const lightParent = new THREE.Object3D();
        scene.add(lightParent);
        lightParent.position.copy(torchPostPosition);
        lightParent.position.add(new THREE.Vector3(0, 0.65, 0));
        flickerLight.init(lightParent, true, 4096, 0.0115, 0.35, 2);
        const light = flickerLight.getLight();
        light.castShadow = true;
        light.color.setRGB( 1, .8, .4);
        light.distance = 0;
        light.decay = 1.5;
    }, null, (error) => {
        console.log(error)
    });
    


    let scale = 0.15;
    let flamePosition = new THREE.Vector3(-.3, 1.65, 1.65);

    const baseFlameTexture = new THREE.TextureLoader().load('assets/textures/base_flame.png');
    const baseFlameAtlas = new Photons.Atlas(baseFlameTexture);
    baseFlameAtlas.addTileArray(18, 0.0, 0.0, 128.0 / 1024.0, 128.0 / 512.0);
    const baseFlameRoot = new THREE.Object3D();
    baseFlameRoot.position.copy(flamePosition);
    const baseFlameRenderer = new Photons.AnimatedSpriteRenderer(baseFlameAtlas, true);

    baseFlameParticleSystem = new Photons.ParticleSystem(baseFlameRoot, baseFlameRenderer, renderer);
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


    const brightFlameTexture = new THREE.TextureLoader().load('assets/textures/bright_flame.png');
    const brightFlameAtlas = new Photons.Atlas(brightFlameTexture);
    brightFlameAtlas.addTileArray(16, 0.0, 0.0, 212.0 / 1024.0, 256.0 / 1024.0);
    const brightFlameRoot = new THREE.Object3D();
    brightFlameRoot.position.copy(flamePosition);
    const brightFlameRenderer = new Photons.AnimatedSpriteRenderer(brightFlameAtlas, true);

    brightFlameParticleSystem = new Photons.ParticleSystem(brightFlameRoot, brightFlameRenderer, renderer);
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

};

const animate = () => {
    requestAnimationFrame(animate);

    // test comment

    /* Update controls when damping */
    controls.update();

    baseFlameParticleSystem.update();
    brightFlameParticleSystem.update();
    if (flickerLight) flickerLight.update();

    /* Render scene */
    renderer.render(scene, camera);

    baseFlameParticleSystem.render(renderer, camera);
    brightFlameParticleSystem.render(renderer, camera);
};

initThreeJS().then(() => animate());
