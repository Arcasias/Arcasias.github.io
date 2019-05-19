const PREYS = new Map();

class Prey extends Entity {

    _moving = false;

    /**
     * @constructor
     */
	constructor(species, options) {
        options.prefix = 'P';
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