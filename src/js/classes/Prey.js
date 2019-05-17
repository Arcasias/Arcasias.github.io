const PREYS = new Map();

class Prey extends Entity {

    _type = PREY.type;
    _moving = false;

    /**
     * @constructor
     */
	constructor(species, options) {
		super(species, options);

		this._nutrition = options.nutrition || 0;
        PREYS.set(this._id, this);
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

        PREYS.delete(this._id);

        return this;
    }
}