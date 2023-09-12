export class ComponentContainer {

        constructor() {
            this.components = [];
        }

        addComponent(ComponentClass, ...args) {
            const component = new ComponentClass(...args);
            this.components.push(component);
            return component;
        }

        update(currentTime, timeDelta) {
            for (let component of this.components) {
                component.update(currentTime, timeDelta);
            }
        }

        getComponent(index) {
            if (index >= this.components.length) {
                throw new Error('ComponentContainer::getComponent() -> "index" is out of range.');
            }
            return this.components[index];
        }
}
