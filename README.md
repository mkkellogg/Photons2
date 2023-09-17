# Photons 2 - JavaScript Particle System for Three.js

![screenshot](./demo/assets/images/example.gif)
 
Basic particle system for the Three.js 3D graphics library implemented in JavaScript. This is a sequel/complete rewrite of Photons (https://github.com/mkkellogg/Photons), my original particle system for Three.js.

**This is very much a work in progress!**

This implementation exposes typical physical attributes for each particle: 

  - Position
  - Velocity
  - Acceleration
  - Rotation
  - Rotational speed
  - Rotational acceleration
        
This implementation also exposes display attributes:

  - Color
  - Size
  - Opacity 
  - Texture

An "Initializer" can be assigned to each of the attributes mentioned above in order to initialize a particle to a desired state when it is created. 

An "Operator" can be assigned to each attribute to vary its value over the lifetime of the particle.

The current implementation also supports the concept of a texture atlas (spritesheet) so particle textures can be animated.

The repository includes a demo page (`demo/index.html`) which contains a demo of the particle system in action. The core of the relevant demo code is in `demo/assets/js/main.js`.

**Demo:** The particle system can be seen in action [here](http://projects.markkellogg.org/threejs/demo_particle_system.php).

# Sample code

To set up a particle system:

```javascript
import * as Photons from './lib/photons.module.js';
import * as THREE from 'three';

// Create atlas, in this case it only contains a single image
const embersTexture = new THREE.TextureLoader().load('assets/textures/ember.png');
const embersAtlas = new Photons.Atlas(embersTexture);
embersAtlas.addFrameSet(1, 0.0, 0.0, 1.0, 1.0);

// Create the base parent object for the particle system
const embersRoot = new THREE.Object3D();
embersRoot.position.copy(position);

// Create the renderer and pass to the particle system during construction. The particle system will perform
// additional initialization on the renderer.
const embersRenderer = new Photons.AnimatedSpriteRenderer(embersAtlas, true);

// Create and initialize the particle system
const embersParticleSystem = new Photons.ParticleSystem(embersRoot, embersRenderer, this.renderer);
embersParticleSystem.init(150);

// Modify renderer parameters (must be done after the particle system has initialized)
embersRenderer.material.blending = THREE.AdditiveBlending;
embersRenderer.mesh.frustumCulled = false;

// Set the emitter properties
const embersEmitter = embersParticleSystem.setEmitter(Photons.ConstantParticleEmitter);
embersEmitter.emissionRate = 6;

// Set up particle initializers
const lifetimeInitializerGenerator = new Photons.RandomGenerator(0, 3.0, 1.0, 0.0, 0.0, false);

const sizeInitializerGenerator = new Photons.RandomGenerator(THREE.Vector2,
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.15, 0.15),
    0.0, 0.0, false);

embersParticleSystem.addParticleStateInitializer(Photons.LifetimeInitializer, lifetimeInitializerGenerator);

embersParticleSystem.addParticleStateInitializer(Photons.SizeInitializer, sizeInitializerGenerator);

embersParticleSystem.addParticleStateInitializer(Photons.BoxPositionInitializer,
    new THREE.Vector3(0.05, 0.0, 0.05),
    new THREE.Vector3(-0.025, 0.0, -0.025));

embersParticleSystem.addParticleStateInitializer(Photons.RandomVelocityInitializer,
    new THREE.Vector3(0.4, 0.5, 0.4),
    new THREE.Vector3(-0.2, 0.8, -0.2),
    0.6, 0.8);

// Set up particle operators
const embersOpacityOperator = embersParticleSystem.addParticleStateOperator(Photons.OpacityInterpolatorOperator);
embersOpacityOperator.addElements([[0.0, 0.0], [0.7, 0.25], [0.9, 0.75], [0.0, 1.0]]);

const embersColorOperator = embersParticleSystem.addParticleStateOperator(Photons.ColorInterpolatorOperator, true);
embersColorOperator.addElementsFromParameters([[[1.0, 0.7, 0.0], 0.0], [[1.0, 0.6, 0.0], 0.5], [[1.0, 0.4, 0.0], 1.0]]);

const acceleratorOperatorGenerator = new Photons.SphereRandomGenerator(THREE.Vector3,
    Math.PI * 2.0, 0.0, Math.PI,
    -Math.PI / 2, 20.0, -8,
    1, 1, 1,
    0.0, 0.0, 0.0);

embersParticleSystem.addParticleStateOperator(Photons.AccelerationOperator, acceleratorOperatorGenerator);

// Start particle system
embersParticleSystem.setSimulateInWorldSpace(true);
embersParticleSystem.start();
```

To update and render a particle system (called every frame):

```javascript
embersParticleSystem.update();
embersParticleSystem.render(threeRenderer, threeCamera);
```
