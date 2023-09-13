export class ComponentContainer {

        constructor() {
            this.components = [];
        }

        addComponent(component) {
            this.components.push(component);
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
