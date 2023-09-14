import * as THREE from 'three';
import { Utils } from './util/Utils.js';
import { JSONTypeStore } from './util/JSONTypeStore.js';
import { ComponentContainer } from './ComponentContainer.js';
import { ParticleSystem } from './ParticleSystem.js';
import { BaseParticleStateInitializer } from './initializer/BaseParticleStateInitializer.js';
import { BaseParticleStateOperator } from './operator/BaseParticleStateOperator.js';

export class Manager {

    constructor() {
        this.particleSystems = [];
        this.startupTime = performance.now() / 1000;
        this.lastUpdateTime = this.startupTime;
        this.componentContainer = new ComponentContainer();
        this.jsonTypeStore = new JSONTypeStore();
    }

    getJSONTypeStore() {
        return this.jsonTypeStore;
    }

    update() {
        const currentTime = Utils.currentTime();
        const timeDelta = currentTime - this.lastUpdateTime;
        for (let particleSystem of this.particleSystems) {
            particleSystem.update(currentTime, timeDelta);
        }
        this.componentContainer.update(currentTime, timeDelta);
        this.lastUpdateTime = currentTime;
    }

    render(threeRenderer, camera) {
        for (let particleSystem of this.particleSystems) {
            particleSystem.render(threeRenderer, camera);
        }
    }

    addParticleSystem(particleSystem) {
        this.particleSystems.push(particleSystem);
    }

    addComponent(component) {
        this.componentContainer.addComponent(component);
    }

    getComponent(index) {
        return this.componentContainer.getComponent(index);
    }

    loadParticleSystemFromJSON(json, threeRenderer) {

        const traverseJSON = (node, onVisit, visited) => {
            visited = visited || {};
            onVisit(node);
            for (const key in node) {
                if (node.hasOwnProperty(key)) {
                    const val = node[key];
                    if (typeof val == 'object') {
                        traverseJSON(val, onVisit, visited);
                    }
                }
            }
        };

        traverseJSON(json, (node) => {
            if (node.type) {
                node.type = this.jsonTypeStore.parseTypeString(node.type);
            }
        });

        const maxParticleCount = json.maxParticleCount;
        const simulateInWorldSpace = json.simulateInWorldSpace;

        const rendererJSON = json.renderer;
        const renderer = rendererJSON.type.loadFromJSON(rendererJSON.params);

        const rootObject = new THREE.Object3D();
        const particleSystem = new ParticleSystem(rootObject, renderer, threeRenderer);
        particleSystem.init(maxParticleCount);
        particleSystem.setSimulateInWorldSpace(simulateInWorldSpace);

        const emitterJSON = json.emitter;
        const emitter = emitterJSON.type.loadFromJSON(emitterJSON.params);
        particleSystem.setEmitter(emitter);

        if (json.sequences) {
            for (const sequenceJSON of json.sequences) {
                particleSystem.addParticleSequence(sequenceJSON.start, sequenceJSON.length, sequenceJSON.id);
            }
        }

        if (json.initializers) {
            for (const initializerJSON of json.initializers) {
                particleSystem.addParticleStateInitializer(initializerJSON.type.loadFromJSON(particleSystem, initializerJSON.params));
            }
        }

        if (json.operators) {
            for (const operatorJSON of json.operators) {
                const operator =
                    particleSystem.addParticleStateOperator(operatorJSON.type.loadFromJSON(particleSystem, operatorJSON.params));
                if (operatorJSON.elements) {
                    operator.addElementsFromParameters(operatorJSON.elements);
                }
            }
        }

        return [particleSystem, rootObject];
    }

    convertParticleSystemToJSON(particleSystem) {
        const scope = this;
        const particleSystemRenderer = particleSystem.getParticleSystemRenderer();
        const particleSystemEmitter = particleSystem.getEmitter();

        const particleSequenceGroup = particleSystem.getParticleSequences();
        const sequences = particleSequenceGroup.getSequenceIDs().map((sequenceID) => {
            const sequence = particleSequenceGroup.getSequence(sequenceID);
            return {
                'id': sequenceID,
                'start': sequence.start,
                'length': sequence.length
            };
        });

        const initializers = [];
        const initializerCount = particleSystem.getParticleStateInitializerCount();
        for (let i = 0; i < initializerCount; i++) {
            const initializer = particleSystem.getParticleStateInitializer(i);
            if (initializer.constructor !== BaseParticleStateInitializer) {
                initializers.push({
                    'type': scope.jsonTypeStore.getTypePath(initializer.constructor),
                    'params': initializer.toJSON(scope.jsonTypeStore)
                });
            }
        }

        const operators = [];
        const operatorCount = particleSystem.getParticleStateOperatorCount();
        for (let i = 0; i < operatorCount; i++) {
            const operator = particleSystem.getParticleStateOperator(i);
            if (operator.constructor !== BaseParticleStateOperator) {
                const json = operator.toJSON(scope.jsonTypeStore);
                const params = json.params || json;
                const elements = json.params ? json.elements : null;
                const operatorJSON = {
                    'type': scope.jsonTypeStore.getTypePath(operator.constructor),
                    'params': params
                };
                if (elements) {
                    operatorJSON['elements'] = elements;
                }
                operators.push(operatorJSON);
            }
        }

        const json = {
            'maxParticleCount': particleSystem.getMaximumActiveParticles(),
            'simulateInWorldSpace': particleSystem.getSimulateInWorldSpace(),
            'renderer': {
                'type': scope.jsonTypeStore.getTypePath(particleSystemRenderer.constructor),
                'params': particleSystemRenderer.toJSON()
            },
            'emitter': {
                'type': scope.jsonTypeStore.getTypePath(particleSystemEmitter.constructor),
                'params': particleSystemEmitter.toJSON()
            },
            'sequences': sequences,
            'initializers': initializers,
            'operators': operators
        };

        return json;
    }

}
