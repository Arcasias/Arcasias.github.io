import { HUNTER, PREY, PARAMS } from '/src/js/config.js';

class Unique {

    _id = -1;

    generate() {
        return ++ this._id;
    }
}

const UID = new Unique();
const UZID = new Unique();

class Entity {
	
	/**
	 * @constructor
	 */
	constructor(species, options) {
		if (! species) {
			throw new Error(`Missing argument : \"species\".`);
		}
		// Read only
		this._id = UID.generate();
		this._zid = UZID.generate();
		this._deleted = false;

		// Object variables
		this._species = species;
		this._x = options.x || 0;
		this._y = options.y || 0;
		this._img = options.img || $('#' + species);
		this._w = options.w || this._img.clientWidth;
		this._h = options.h || this._img.clientHeight;
		this._size = options.size || 0.1;
		this._baseSize = this._size;
		this._mass = options.mass || 1;
		this._speed = options.speed || 1;
		this._velocity = options.velocity || { x : 0, y : 0 };
		this._moving = options.moving || true;
		this._dragging = options.dragging || false;
		this._type = options.type || undefined;
	}

	/** @property {number} id Entity identifier */
	get id() { return this._id; }

	/** @property {number} zid Entity order index */
	get zid() { return this._zid; }

	/** @property {boolean} deleted Checks wether the entity has been deleted */
	get deleted() { return this._deleted; }

	/**
	 * @property {number} x Position on x axis
	 */
	get x() {
		return this._x - this.w / 2;
	}
	set x(x) {
		if (isNaN(x)) {
			throw new TypeError("\"x\" must of type \"number\"");
		}
		this._x = x;
	}

	/**
	 * @property {number} y Position on y axis
	 */
	get y() {
		return this._y - this.h / 2;
	}
	set y(y) {
		if (isNaN(y)) {
			throw new TypeError("\"y\" must of type \"number\"");
		}
		this._y = y;
	}

	/**
	 * @property {number} w Entity width
	 */
	get w() {
		return this._w * this._size;
	}
	set w(w) {
		if (isNaN(w)) {
			throw new TypeError("\"w\" must of type \"number\"");
		}
		this._w = w;
	}

	/**
	 * @property {number} h Entity height
	 */
	get h() {
		return this._h * this._size;
	}
	set h(h) {
		if (isNaN(h)) {
			throw new TypeError("\"h\" must of type \"number\"");
		}
		this._h = h;
	}

	/**
	 * @property {string} species Entity species
	 */
	get species() {
		return this._species;
	}
	set species(species) {
		if (typeof species !== 'string') {
			throw new TypeError("\"species\" must of type \"string\"");
		}
		this._species = species;
		this._img = $('#' + species);
		this._w = this._img.clientWidth;
		this._h = this._img.clientHeight;
	}

	/**
	 * @property {number} mass Entity mass
	 */
	get mass() {
		return this._mass;
	}
	set mass(mass) {
		if (isNaN(mass)) {
			throw new TypeError("\"mass\" must be of type \"number\"");
		}
		this._mass = mass;
	}

	/**
	 * @property {number} speed Entity speed factor
	 */
	get speed() {
		return this._speed;
	}
	set speed(speed) {
		if (isNaN(speed)) {
			throw new TypeError("\"speed\" must be of type \"number\"");
		}
		this._speed = speed;
	}

	/**
	 * @property {object} velocity Entity velocity (object having x and y properties)
	 */
	get velocity() {
		return this._velocity;
	}
	set velocity(velocity) {
		if (velocity.x) {
			this._velocity.x = velocity.x;
		}
		if (velocity.y) {
			this._velocity.y = velocity.y;
		}
	}

	/**
	 * @property {boolean} dragging Entity dragged state
	 */
	get dragging() {
		return this._dragging;
	}
	set dragging(dragging) {
		if (typeof dragging !== 'boolean') {
			throw new TypeError("\"dragging\" must be of type \"boolean\"");
		}
		this._dragging = dragging;
	}

	/**
	 * @property {string} type Entity type
	 */
	get type() {
		return this._type;
	}
	set type(type) {
		let availableTypes = [
			HUNTER.type,
			PREY.type,
		];
		if (! availableTypes.includes(type)) {
			throw new TypeError(`"type" must be an available type : [${ availableTypes.join(', ') }]`);
		}
		this._type = type;
	}

	/**
	 * @property {boolean} hovered Wether the entity is hovered
	 */
	get hovered() {
		return this.x < PARAMS.mouse.x &&
			PARAMS.mouse.x < this.x + this.w &&
			this.y < PARAMS.mouse.y &&
			PARAMS.mouse.y < this.y + this.h;
	}

	draw() {
		PARAMS.c.drawImage(this._img, this.x, this.y, this.w, this.h);

		return this;
	}

	remove() {
		if (this === PARAMS.hovered) {
			PARAMS.hovered = null;
		}
		this._deleted = true;

		return this;
	}

	resetVelocity(random=true) {
		this._velocity = {
			x: random ? Math.random() * 2 - 1 : 0,
			y: random ? Math.random() * 2 - 1 : 0,
		};
	}

	startDragging() {
		this.toFront();

		this._dragging = true;

		this._x = PARAMS.mouse.x;
		this._y = PARAMS.mouse.y;

		return this;
	}

	stopDragging() {
		this._dragging = false;

		return this;
	}

	toFront() {
		this._zid = UZID.generate();

		return this;
	}
	
	update() {
		this.draw();

		if (PARAMS.collisions) {
			entities().forEach(entity => {
				if (this !== entity && detectCollision(this, entity)) {
					resolveCollision(this, entity);
				}
			});
		}
		if (this.x <= 0 || PARAMS.canvas.width <= this.x + this.w) {
			this._velocity.x *= -1;
		}
		if (this.y <= 0 || PARAMS.canvas.height <= this.y + this.h) {
			this._velocity.y *= -1;
		}
		if (this.hovered) {
			if (PARAMS.hovered && this.zid >= PARAMS.hovered.zid) {
				PARAMS.hovered = this;
			}
		} else if (! this._dragging && this === PARAMS.hovered) {
			PARAMS.hovered = null;
		}
		if (this._dragging) {
			this._x = PARAMS.mouse.x;
			this._y = PARAMS.mouse.y;
		}

		return this;
	}
}

export default Entity;