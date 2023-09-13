export class FrameSetDescriptor {

    constructor(length, x, y, width, height) {
        this.length = length;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

};

export class Atlas {

    constructor(texture, texturePath) {
        this.texture = texture;
        this.texturePath = texturePath;
        this.frameSets = [];
    }

    getTexture() {
        return this.texture;
    }

    getTexturePath() {
        return this.texturePath;
    }

    getFrameSetCount() {
        return this.frameSets.length;
    }

    addFrameSet(length, x, y, width, height) {
        this.frameSets.push(new FrameSetDescriptor(length, x, y, width, height));
    }

    getFrameSet(index) {
        if (index >= this.frameSets.length) {
            throw new Error('Atlas::getFrameSet -> "index" is out of range.');
        }
        return this.frameSets[index];
    }

}
