const PREYS = new Map();

class Prey extends Entity {

    _type = PREY.type;
    _moving = false;

    /**
     * @constructor
     */
	constructor(species, options) {
		super(species, options);
        PREYS.set(this._id, this);
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