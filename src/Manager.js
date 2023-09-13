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

        this.jsonTypeNames = {};
        this.typeIDGen = 0;
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

    addJSONType(typeName, type) {
        this.addJSONTypeToNamespace('default', typeName, type);
    }

    addJSONTypeToNamespace(namespace, typeName, type) {
        if (!this.jsonTypes[namespace]) {
            throw new Error('Mnager::addJSONTypeToNamespace -> namespace does not exist');
        }
        if (this.jsonTypes[namespace][typeName]) {
            throw new Error('Mnager::addJSONTypeToNamespace -> typeName already exists');
        }

        if (this.checkAndAddTypeName(type, typeName, namespace)) {
            this.jsonTypes[namespace][typeName] = type;
        }
    }

    addJSONNamespace(namespace, namespaceObject) {
        if (this.jsonTypes[namespace]) {
            throw new Error('Mnager::addJSONNamespace -> namespace already exists');
        }
        this.jsonTypes[namespace] = namespaceObject;
        for (const typeName in namespaceObject) {
            if (!namespaceObject.hasOwnProperty || namespaceObject.hasOwnProperty(typeName)) {
                const type = namespaceObject[typeName];
                this.checkAndAddTypeName(type, typeName, namespace);
            }
        }
    }

    checkAndAddTypeName(type, typeName, namespace) {
        if (typeof type === "function") {
            const typeID = this.typeIDGen++;
            type.___photonsTypeID = typeID;
            this.jsonTypeNames[typeID] = {
                'namespace': namespace,
                'typeName': typeName
            };
        }
    }

    getJSONType(namespace, typeName) {
        if (!this.jsonTypes[namespace]) {
            throw new Error('Mnager::getJSONType -> namespace does not exist');
        }
        if (!this.jsonTypes[namespace][typeName]) {
            throw new Error('Mnager::getJSONType -> typeName does not exist');
        }

        return this.jsonTypes[namespace][typeName];
    }

    getJSONTypeNames(type) {
        return this.jsonTypeNames[type.___photonsTypeID];
    }

    getJSONTypePath(type) {
        const typeNames = this.jsonTypeNames[type.___photonsTypeID];
        if (typeNames) {
            return `${typeNames.namespace}.${typeNames.typeName}`;
        } else {
            return undefined;
        }
    }

    parseNamespaceAndTypename(typeStr) {
        const components = typeStr.split('.');
        const namespace = components[0];
        components.splice(0, 1);
        const typeName = components.join('.');
        return {
            'namespace': namespace,
            'typeName': typeName
        };
    }

    parseType(typeStr) {
        const {namespace, typeName} = this.parseNamespaceAndTypename(typeStr);
        return this.getJSONType(namespace, typeName);
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
                if (node.type == 'Scalar') node.type = 0;
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
        const json = {
            'maxParticleCount': particleSystem.getMaximumActiveParticles(),
            'simulateInWorldSpace': particleSystem.getSimulateInWorldSpace(),
            'renderer': {
                'type': scope.getJSONTypePath(particleSystemRenderer.constructor),
                'params': particleSystemRenderer.toJSON()
            }
        };

        return json;
    }

}
