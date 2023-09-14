export class JSONTypeStore {

    constructor() {
        this.jsonTypes = {
            'default': {}
        };
        this.jsonTypeNames = {};
        this.typeIDGen = 0;
    }

    addType(typeName, type) {
        this.addTypeToNamespace('default', typeName, type);
    }

    addTypeToNamespace(namespace, typeName, type) {
        if (!this.jsonTypes[namespace]) {
            throw new Error('JSONTypeStore::addTypeToNamespace() -> namespace does not exist');
        }
        if (this.jsonTypes[namespace][typeName]) {
            throw new Error('JSONTypeStore::addTypeToNamespace() -> typeName already exists');
        }

        if (this.checkAndAddTypeName(type, typeName, namespace)) {
            this.jsonTypes[namespace][typeName] = type;
        }
    }

    addNamespace(namespace, namespaceObject) {
        if (this.jsonTypes[namespace]) {
            throw new Error('JSONTypeStore::addNamespace() -> namespace already exists');
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
        if (typeof type === 'function') {
            const typeID = this.typeIDGen++;
            type.___photonsTypeID = typeID;
            this.jsonTypeNames[typeID] = {
                'namespace': namespace,
                'typeName': typeName
            };
        }
    }

    getType(namespace, typeName) {
        if (!this.jsonTypes[namespace]) {
            throw new Error('JSONTypeStore::getType() -> namespace does not exist');
        }
        if (!this.jsonTypes[namespace][typeName]) {
            throw new Error('JSONTypeStore::getType() -> typeName does not exist');
        }

        return this.jsonTypes[namespace][typeName];
    }

    getTypeNames(type) {
        return this.jsonTypeNames[type.___photonsTypeID];
    }

    getTypePath(type) {
        const typeNames = this.getTypeNames(type);
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

    parseTypeString(typeStr) {
        const {namespace, typeName} = this.parseNamespaceAndTypename(typeStr);
        return this.getType(namespace, typeName);
    }

}
