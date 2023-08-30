import { BuiltinType } from './BuiltIn.js';

export class Generator {

    constructor(outType) {
        this.outTypeID = BuiltinType.getTypeID(outType);
    }

}

