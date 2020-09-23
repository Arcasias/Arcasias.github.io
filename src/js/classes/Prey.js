const PREYS = new Map();

class Prey extends Entity {

    /**
     * @constructor
     */
    constructor(species, options) {
        super(species, Object.assign({}, options, {
            prefix: "P",
            moving: false,
        }));

        PREYS.set(this._id, this);
    }

    /**
     * @override
     */
    remove() {
        super.remove();

        PREYS.delete(this._id);
    }
}
