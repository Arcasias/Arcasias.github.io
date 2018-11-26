import Entity from './Entity.js';

export default class Loop extends Entity {

	constructor(type, options) {
		super(type, options);

		this._arrayType = 'loops';
		this._nutrition = options.nutrition || 0;
		this._moving = false;
	}

    /**
     * @property {number} nutrition Loop nutritive value
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
}