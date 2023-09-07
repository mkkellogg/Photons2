export class TileArrayDescriptor {

    constructor(length, x, y, width, height) {
        this.length = length;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

};

export class Atlas {

    constructor(texture) {
        this.texture = texture;
        this.tileArrays = [];
    }

    getTexture() {
        return this.texture;
    }

    getTileArrayCount() {
        return this.tileArrays.length;
    }

    addTileArray(length, x, y, width, height) {
        this.tileArrays.push(new TileArrayDescriptor(length, x, y, width, height));
    }

    getTileArray(index) {
        if (index >= this.tileArrays.length) {
            throw new Error('Atlas::getTileArray -> "index" is out of range.');
        }
        return this.tileArrays[index];
    }

}
