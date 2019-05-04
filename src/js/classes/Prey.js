import { PREY } from '/src/js/config.js';
import Entity from '/src/js/classes/Entity.js';

export const MAP = new Map();
export class Prey extends Entity {

    _type = PREY.type;
    _moving = false;

    /**
     * @constructor
     */
	constructor(species, options) {
		super(species, options);

		this._nutrition = options.nutrition || 0;
        MAP.set(this._id, this);
	}

    /**
     * @property {number} nutrition Prey nutritive value
     */
    get nutrition() {
        return this._nutrition;
    }
    set nutrition(nutrition) {
        if (isNaN(nutrition)) {
            throw new TypeError("\"nutrition\" must of type \"number\"");
        }
        this._nutrition = nutrition;
    }

    /**
     * @override
     */
    remove() {
        super.remove();

        MAP.delete(this._id);

        return this;
    }
}