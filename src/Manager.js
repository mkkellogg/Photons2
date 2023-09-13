import * as THREE from 'three';
import { Utils } from './util/Utils.js';
import { ComponentContainer } from './ComponentContainer.js';
import { ParticleSystem } from './ParticleSystem.js';

export class Manager {

    constructor() {
        this.particleSystems = [];
        this.startupTime = performance.now() / 1000;
        this.lastUpdateTime = this.startupTime;
        this.componentContainer = new ComponentContainer();

        this.jsonTypes = {
            'default': {}
        };

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

    addJSONType(typename, type) {
        if (this.jsonTypes['default'][typename]) {
            throw new Error("Mnager::addJSONType -> typename already exists");
        }
        this.jsonTypes['default'][typename] = type;
    }

    addJSONTypeToNamespace(namespace, typename, type) {
        if (!this.jsonTypes[namespace]) {
            throw new Error("Mnager::addJSONTypeToNamespace -> namespace does not exist");
        }
        if (this.jsonTypes[namespace][typename]) {
            throw new Error("Mnager::addJSONTypeToNamespace -> typename already exists");
        }

        this.jsonTypes[namespace][typename] = type;
    }

    addJSONNamespace(name, namespace) {
        if (this.jsonTypes[name]) {
            throw new Error("Mnager::addJSONNamespace -> namespace already exists");
        }
        this.jsonTypes[name] = namespace;
    }

    getJSONType(namespace, typename) {
        if (!this.jsonTypes[namespace]) {
            throw new Error("Mnager::getJSONType -> namespace does not exist");
        }
        if (!this.jsonTypes[namespace][typename]) {
            throw new Error("Mnager::getJSONType -> typename does not exist");
        }

        return this.jsonTypes[namespace][typename];
    }

    parseNamespaceAndTypename(typeStr) {
        const components = typeStr.split('.');
        const namespace = components[0];
        components.splice(0, 1);
        const typename = components.join('.');
        return {
            'namespace': namespace,
            'typename': typename
        }
    }

    parseType(typeStr) {
        const {namespace, typename} = this.parseNamespaceAndTypename(typeStr);
        return this.getJSONType(namespace, typename);
    }

    loadParticleSystemFromJSON(json, threeRenderer) {

        const traverseJSON = (node, onVisit, visited) => {
            visited = visited || {};
            onVisit(node);
            for (const key in node) {
                const val = node[key];
                if (typeof val == 'object') {
                    traverseJSON(val, onVisit, visited);
                }
            }
        };

        traverseJSON(json, (node) => {
            if (node.type) {
                if (node.type == "Scalar") node.type = 0;
                else node.type = this.parseType(node.type);
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
            for(const sequenceJSON of json.sequences) {
                particleSystem.addParticleSequence(sequenceJSON.start, sequenceJSON.length, sequenceJSON.id);
            }
        }

        if (json.initializers) {
            for(const initializerJSON of json.initializers) {
                particleSystem.addParticleStateInitializer(initializerJSON.type.loadFromJSON(particleSystem, initializerJSON.params));
            }
        }

        if (json.operators) {
            for(const operatorJSON of json.operators) {
                const operator = particleSystem.addParticleStateOperator(operatorJSON.type.loadFromJSON(particleSystem, operatorJSON.params));
                if (operatorJSON.elements) {
                    operator.addElementsFromParameters(operatorJSON.elements);
                }
            }
        }
    
        return [particleSystem, rootObject];
    }

    convertParticleSystemToJSON() {

    }

}
