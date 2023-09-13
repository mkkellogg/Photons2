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
        this.manager = new Photons.Manager();
    }

    build () {
        this.setupParticleSystems();
        this.setupSceneComponents();
    }

    update() {
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
                    DemoScene.traverseScene(child, onVisit, visited);
                }
            }
        }
    }

    setupParticleSystems (){
        let scale = 0.15;
        let flamePosition = new THREE.Vector3(-.3, 1.65, 1.65);
        this.manager.addParticleSystem(this.setupEmbers(scale, flamePosition));
        this.manager.addParticleSystem(this.setupBaseFlame(scale, flamePosition));
        this.manager.addParticleSystem(this.setupBrightFLame(scale, flamePosition));
    }

    setupEmbers (scale, position) {
        const embersRoot = new THREE.Object3D();
        embersRoot.position.copy(position);

        const embersTexture = new THREE.TextureLoader().load('assets/textures/ember.png');
        const embersAtlas = new Photons.Atlas(embersTexture);
        embersAtlas.addTileArray(1, 0.0, 0.0, 1.0, 1.0);
        const embersRenderer = new Photons.AnimatedSpriteRenderer(embersAtlas, true);

        const embersParticleSystem = new Photons.ParticleSystem(embersRoot, embersRenderer, this.renderer);
        embersParticleSystem.init(150);
        embersRenderer.material.blending = THREE.AdditiveBlending;
        // TODO: Remove this hack and properly implement bounds calculations
        embersRenderer.mesh.frustumCulled = false;
    
        embersParticleSystem.setEmitter(new Photons.ConstantParticleEmitter(6));

        const lifetimeInitializerGenerator = new Photons.RandomGenerator(0, 3.0, 1.0, 0.0, 0.0, false);
        const sizeInitializerGenerator = new Photons.RandomGenerator(THREE.Vector2,
                                                                     new THREE.Vector2(0.0, 0.0),
                                                                     new THREE.Vector2(scale * 0.15, scale  * 0.15),
                                                                     0.0, 0.0, false);
        embersParticleSystem.addParticleStateInitializer(new Photons.LifetimeInitializer(lifetimeInitializerGenerator));
        embersParticleSystem.addParticleStateInitializer(new Photons.SizeInitializer(sizeInitializerGenerator));
        embersParticleSystem.addParticleStateInitializer(new Photons.BoxPositionInitializer(
                                                         new THREE.Vector3(0.05 * scale, 0.0, 0.05 * scale),
                                                         new THREE.Vector3(-0.025 * scale, 0.0, -0.025 * scale)));
        embersParticleSystem.addParticleStateInitializer(new Photons.RandomVelocityInitializer(
                                                         new THREE.Vector3(0.4 * scale, 0.5 * scale, 0.4 * scale),
                                                         new THREE.Vector3(-0.2 * scale, 0.8 * scale, -0.2 * scale),
                                                         0.6 * scale, 0.8 * scale));

        const embersOpacityOperator = embersParticleSystem.addParticleStateOperator(new Photons.OpacityInterpolatorOperator());
        embersOpacityOperator.addElements([[0.0, 0.0], [0.7, 0.25], [0.9, 0.75], [0.0, 1.0]]);

        const embersColorOperator = embersParticleSystem.addParticleStateOperator(new Photons.ColorInterpolatorOperator(true));
        embersColorOperator.addElementsFromParameters([[[1.0, 0.7, 0.0], 0.0], [[1.0, 0.6, 0.0], 0.5], [[1.0, 0.4, 0.0], 1.0]]);

        const acceleratorOperatorGenerator = new Photons.SphereRandomGenerator(THREE.Vector3,
                                                                              Math.PI * 2.0, 0.0, Math.PI,
                                                                              -Math.PI / 2, 20.0, -8,
                                                                              scale, scale, scale,
                                                                              0.0, 0.0, 0.0);

        embersParticleSystem.addParticleStateOperator(new Photons.AccelerationOperator(acceleratorOperatorGenerator));
    
        embersParticleSystem.setSimulateInWorldSpace(true);
        embersParticleSystem.start(); 
    
        return embersParticleSystem;
    }
    
    setupBaseFlame (scale, position) {
        const baseFlameRoot = new THREE.Object3D();
        baseFlameRoot.position.copy(position);

        const baseFlameTexture = new THREE.TextureLoader().load('assets/textures/base_flame.png');
        const baseFlameAtlas = new Photons.Atlas(baseFlameTexture);
        baseFlameAtlas.addTileArray(18, 0.0, 0.0, 128.0 / 1024.0, 128.0 / 512.0);
        const baseFlameRenderer = new Photons.AnimatedSpriteRenderer(baseFlameAtlas, true);

        const baseFlameParticleSystem = new Photons.ParticleSystem(baseFlameRoot, baseFlameRenderer, this.renderer);
        baseFlameParticleSystem.init(50);
        // TODO: Remove this hack and properly implement bounds calculations
        baseFlameRenderer.mesh.frustumCulled = false;

        baseFlameParticleSystem.setEmitter(new Photons.ConstantParticleEmitter(10));

        baseFlameParticleSystem.addParticleSequence(0, 18);
        const baseFlameParticleSequences = baseFlameParticleSystem.getParticleSequences();

        baseFlameParticleSystem.addParticleStateInitializer(new Photons.LifetimeInitializer(new Photons.RandomGenerator(0, 0.0, 0.0, 0.0, 0.0, false)));
        baseFlameParticleSystem.addParticleStateInitializer(new Photons.RotationInitializer(new Photons.RandomGenerator(0, Math.PI / 2.0, -Math.PI / 2.0, 0.0, 0.0, false)));
        baseFlameParticleSystem.addParticleStateInitializer(new Photons.RotationalSpeedInitializer(new Photons.RandomGenerator(0, 1.0, -1.0, 0.0, 0.0, false)));
        baseFlameParticleSystem.addParticleStateInitializer(new Photons.SizeInitializer(
                                                            new Photons.RandomGenerator(THREE.Vector2,
                                                                                        new THREE.Vector2(0.25  * scale, 0.25 * scale),
                                                                                        new THREE.Vector2(0.5 * scale, 0.5 * scale),
                                                                                        0.0, 0.0, false)));

        baseFlameParticleSystem.addParticleStateInitializer(new Photons.BoxPositionInitializer(
                                                            new THREE.Vector3(0.05 * scale, 0.0, 0.05 * scale),
                                                            new THREE.Vector3(-0.025 * scale, 0.0, -0.025 * scale)));
        baseFlameParticleSystem.addParticleStateInitializer(new Photons.RandomVelocityInitializer(new THREE.Vector3(0.05 * scale, 0.4 * scale, 0.05 * scale),
                                                            new THREE.Vector3(-0.025 * scale, 0.8 * scale, -0.025 * scale),  0.35 * scale, 0.5 * scale));
        baseFlameParticleSystem.addParticleStateInitializer(new Photons.SequenceInitializer(baseFlameParticleSequences));

        baseFlameParticleSystem.addParticleStateOperator(new Photons.SequenceOperator(baseFlameParticleSequences, 0.07, false));

        const baseFlameOpacityOperator = baseFlameParticleSystem.addParticleStateOperator(new Photons.OpacityInterpolatorOperator());
        baseFlameOpacityOperator.addElements([[0.0, 0.0], [0.3, 0.25], [0.3, 0.5], [0.0, 1.0]]);

        const baseFlameSizeOperator = baseFlameParticleSystem.addParticleStateOperator(new Photons.SizeInterpolatorOperator(true));
        baseFlameSizeOperator.addElementsFromParameters([[[0.6, 0.6], 0.0], [[1.0, 1.0], 0.4], [[1.0, 1.0], 1.0]]);

        const baseFlameColorOperator = baseFlameParticleSystem.addParticleStateOperator(new Photons.ColorInterpolatorOperator(true));
        baseFlameColorOperator.addElementsFromParameters([[[1.0, 1.0, 1.0], 0.0], [[1.5, 1.5, 1.5], 0.5], [[1.0, 1.0, 1.0], 1.0]]);

        baseFlameParticleSystem.addParticleStateOperator(new Photons.AccelerationOperator(
                                                         new Photons.RandomGenerator(THREE.Vector3, new THREE.Vector3(0.0, 0.0, 0.0),
                                                                                                    new THREE.Vector3(0.0, 1.5 * scale, 0.0),
                                                                                                    0.0, 0.0, false)));

        baseFlameParticleSystem.setSimulateInWorldSpace(true);
        baseFlameParticleSystem.start();

        return baseFlameParticleSystem;
    }
    
    setupBrightFLame (scale, position) {
        const brightFlameRoot = new THREE.Object3D();
        brightFlameRoot.position.copy(position);

        const brightFlameTexture = new THREE.TextureLoader().load('assets/textures/bright_flame.png');
        const brightFlameAtlas = new Photons.Atlas(brightFlameTexture);
        brightFlameAtlas.addTileArray(16, 0.0, 0.0, 212.0 / 1024.0, 256.0 / 1024.0);
        const brightFlameRenderer = new Photons.AnimatedSpriteRenderer(brightFlameAtlas, true);

        const brightFlameParticleSystem = new Photons.ParticleSystem(brightFlameRoot, brightFlameRenderer, this.renderer);
        brightFlameParticleSystem.init(20);
        // TODO: Remove this hack and properly implement bounds calculations
        brightFlameRenderer.mesh.frustumCulled = false;

        brightFlameParticleSystem.setEmitter(new Photons.ConstantParticleEmitter(5));

        brightFlameParticleSystem.addParticleSequence(0, 16);
        const brightFlameParticleSequences = brightFlameParticleSystem.getParticleSequences();

        brightFlameParticleSystem.addParticleStateInitializer(new Photons.LifetimeInitializer(new Photons.RandomGenerator(0, 0.0, 0.0, 0.0, 0.0, false)));
        brightFlameParticleSystem.addParticleStateInitializer(new Photons.RotationInitializer(new Photons.RandomGenerator(0, Math.PI, -Math.PI / 2.0, 0.0, 0.0, false)));
        brightFlameParticleSystem.addParticleStateInitializer(new Photons.RotationalSpeedInitializer(new Photons.RandomGenerator(0, Math.PI / 2.0, -Math.PI / 4.0, 0.0, 0.0, false)));
        brightFlameParticleSystem.addParticleStateInitializer(new Photons.SizeInitializer(
                                                              new Photons.RandomGenerator(THREE.Vector2, new THREE.Vector2(0.0, 0.0),
                                                              new THREE.Vector2(0.0, 0.0), 0.2 * scale, 0.65 * scale, false)));
        brightFlameParticleSystem.addParticleStateInitializer(new Photons.BoxPositionInitializer(
                                                              new THREE.Vector3(0.1 * scale, 0.0, 0.1 * scale),
                                                              new THREE.Vector3(-0.05 * scale, 0.0, -0.05 * scale)));
        brightFlameParticleSystem.addParticleStateInitializer(new Photons.RandomVelocityInitializer(new THREE.Vector3(0.02 * scale, 0.4 * scale, 0.02 * scale),
                                                              new THREE.Vector3(-0.01 * scale, 0.4 * scale, -0.01 * scale),  0.1 * scale, .2 * scale));
        brightFlameParticleSystem.addParticleStateInitializer(new Photons.SequenceInitializer(brightFlameParticleSequences));

        brightFlameParticleSystem.addParticleStateOperator(new Photons.SequenceOperator(brightFlameParticleSequences, 0.1, false));

        const brightFlameOpacityOperator = brightFlameParticleSystem.addParticleStateOperator(new Photons.OpacityInterpolatorOperator());
        brightFlameOpacityOperator.addElements([[0.0, 0.0], [0.6, 0.2], [0.5, 0.75], [0.0, 1.0]]);

        const brightFlameSizeOperator = brightFlameParticleSystem.addParticleStateOperator(new Photons.SizeInterpolatorOperator(true));
        brightFlameSizeOperator.addElementsFromParameters([[[0.3, 0.3], 0.0], [[1.0, 1.0], 0.4],
                                                           [[1.0, 1.0], 0.55], [[0.65, 0.65], 0.75], [[0.1, 0.1], 1.0]]);

        const brightFlameColorOperator = brightFlameParticleSystem.addParticleStateOperator(new Photons.ColorInterpolatorOperator(true));
        brightFlameColorOperator.addElementsFromParameters([[[1.0, 1.0, 1.0], 0.0], [[2.0, 2.0, 2.0], 0.3], [[2.0, 2.0, 2.0], 0.4],
                                                            [[0.9, 0.6, 0.3], 0.65], [[0.75, 0.0, 0.0], 1.0]]);

        brightFlameParticleSystem.addParticleStateOperator(new Photons.AccelerationOperator(
                                                           new Photons.RandomGenerator(THREE.Vector3,
                                                                                       new THREE.Vector3(0.0, 0.0, 0.0),
                                                                                       new THREE.Vector3(0.0, 1.5 * scale, 0.0),
                                                                                       0.0, 0.0, false)));

        brightFlameParticleSystem.setSimulateInWorldSpace(true);


        const brightFlameJSON = {
            'maxParticleCount': 20,
            'simulateInWorldSpace': true,
            'renderer': {
                'type': 'Photons.AnimatedSpriteRenderer',
                'params': {
                    'atlas': {
                        'interpolateFrames': true,
                        'texture': 'assets/textures/bright_flame.png',
                        'frames': {
                            'count': 16,
                            'x': 0.0,
                            'y': 0.0,
                            'width': 212.0 / 1024.0,
                            'height': 256.0 / 1024.0
                        }
                    }
                }
            },
            'emitter': {
                'type': 'Photons.ConstantParticleEmitter',
                'params': {
                    'emissionRate': 5,
                }
            },
            'sequences': [
                {
                    'start': 0,
                    'length': 16
                }
            ],
            'initializers': [
                {
                    'type': 'Photons.LifetimeInitializer',
                    'params': {
                        'generator': {
                            'type': 'Photons.RandomGenerator',
                            'params': {
                                'type': 'Scalar',
                                'range': 0.0,
                                'offset': 0.0,
                                'uniformOffset': 0.0,
                                'uniformRange': 0.0,
                                'normalize': false
                            }
                        }
                    }
                },
                {
                    'type': 'Photons.RotationInitializer',
                    'params': {
                        'generator': {
                            'type': 'Photons.RandomGenerator',
                            'params': {
                                'type': 'Scalar',
                                'range': Math.PI,
                                'offset': -Math.PI / 2.0,
                                'uniformOffset': 0.0,
                                'uniformRange': 0.0,
                                'normalize': false
                            }
                        }
                    }
                },
                {
                    'type': 'Photons.RotationalSpeedInitializer',
                    'params': {
                        'generator': {
                            'type': 'Photons.RandomGenerator',
                            'params': {
                                'type': 'Scalar',
                                'range': Math.PI / 2.0,
                                'offset': -Math.PI / 4.0,
                                'uniformOffset': 0.0,
                                'uniformRange': 0.0,
                                'normalize': false
                            }
                        }
                    }
                },
                {
                    'type': 'Photons.SizeInitializer',
                    'params': {
                        'generator': {
                            'type': 'Photons.RandomGenerator',
                            'params': {
                                'type': 'THREE.Vector2',
                                'range': [0.0, 0.0],
                                'offset': [0.0, 0.0],
                                'uniformOffset': 0.03,
                                'uniformRange': 0.0975,
                                'normalize': false
                            }
                        }
                    }
                },
                {
                    'type': 'Photons.BoxPositionInitializer',
                    'params': {
                        'range': [0.015, 0.0, 0.015],
                        'offset': [-0.0075, 0.0, -0.0075]
                    }
                },
                {
                    'type': 'Photons.RandomVelocityInitializer',
                    'params': {
                        'range': [0.003, 0.06, 0.003],
                        'offset': [-0.0015, 0.06, -0.0015],
                        'speedRange': 0.015,
                        'speedOffset': 0.03
                    }
                },
                {
                    'type': 'Photons.SequenceInitializer',
                    'params': {
                        'reverse': false
                    }
                }
            ],
            'operators': [
                {
                    'type': 'Photons.SequenceOperator',
                    'params': {}
                },
                {
                    'type': 'Photons.OpacityInterpolatorOperator',
                    'params': {},
                    'elements': [
                        [0.0, 0.0],
                        [0.6, 0.2],
                        [0.5, 0.75],
                        [0.0, 1.0]
                    ]
                },
                {
                    'type': 'Photons.SizeInterpolatorOperator',
                    'params': {
                        'relativeToInitialValue': true
                    },
                    'elements': [
                        [[0.3, 0.3], 0.0],
                        [[1.0, 1.0], 0.4],
                        [[1.0, 1.0], 0.55],
                        [[0.65, 0.65], 0.75],
                        [[0.1, 0.1], 1.0]
                    ]
                },
                {
                    'type': 'Photons.ColorInterpolatorOperator',
                    'params': {
                        'relativeToInitialValue': true
                    },
                    'elements': [
                        [[[1.0, 1.0, 1.0], 0.0],
                         [[2.0, 2.0, 2.0], 0.3],
                         [[2.0, 2.0, 2.0], 0.4],
                         [[0.9, 0.6, 0.3], 0.65],
                         [[0.75, 0.0, 0.0], 1.0]]
                    ]
                },
                {
                    'type': 'Photons.AccelerationOperator',
                    'params': {
                        'generator': {
                            'type': 'Photons.RandomGenerator',
                            'params': {
                                'type': 'THREE.Vector3',
                                'range': [0.0, 0.0, 0.0],
                                'offset': [0.0, 0.225, 0.0],
                                'uniformOffset': 0.0,
                                'uniformRange': 0.0,
                                'normalize': false
                            }
                        }
                    }
                }
            ]
        };
        this.manager.addJSONNamespace('THREE', THREE);
        this.manager.addJSONNamespace('Photons', Photons);
        const [testParticleSystemFromJSON, ownerObject] = this.manager.loadParticleSystemFromJSON(brightFlameJSON);


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
            this.manager.addComponent(new Photons.FlickerLight(lightParent, 10, 2, new THREE.Color().setRGB(1, .8, .4), 0, 1.0, flickerLightShadows));
        });
    }
}
