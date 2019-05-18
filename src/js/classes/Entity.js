const UID = new Unique();
const UZID = new Unique();

class Entity {
	
	/**
	 * @constructor
	 */
	constructor(species, options) {
		// Read only
		this._id = UID.generate();
		this._zid = UZID.generate();
		this._deleted = false;

		// Object variables
		this._species = species;
		this._x = options.x || 0;
		this._y = options.y || 0;
		this._img = options.img || null;
		this._w = options.w || this._img.clientWidth;
		this._h = options.h || this._img.clientHeight;
		this._size = options.size || 0.1;
		this._baseSize = this._size;
		this._nutrition = options.nutrition || this._size;
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
		this._x = x;
	}

	/**
	 * @property {number} y Position on y axis
	 */
	get y() {
		return this._y - this.h / 2;
	}
	set y(y) {
		this._y = y;
	}

	/**
	 * @property {number} w Entity width
	 */
	get w() {
		return this._w * this._size;
	}
	set w(w) {
		this._w = w;
	}

	/**
	 * @property {number} h Entity height
	 */
	get h() {
		return this._h * this._size;
	}
	set h(h) {
		this._h = h;
	}

	/**
	 * @property {string} species Entity species
	 */
	get species() {
		return this._species;
	}
	set species(species) {
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
		this._mass = mass;
	}

	/**
	 * @property {number} speed Entity speed factor
	 */
	get speed() {
		return this._speed;
	}
	set speed(speed) {
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
     * @property {number} nutrition Entity nutritive value
     */
    get nutrition() {
        return this._nutrition;
    }
    set nutrition(nutrition) {
        this._nutrition = nutrition;
    }

	/**
	 * @property {boolean} dragging Entity dragged state
	 */
	get dragging() {
		return this._dragging;
	}
	set dragging(dragging) {
		this._dragging = dragging;
	}

	/**
	 * @property {string} type Entity type
	 */
	get type() {
		return this._type;
	}
	set type(type) {
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

	startDragging() {
		this._toFront();

		this._dragging = true;

		this._x = PARAMS.mouse.x;
		this._y = PARAMS.mouse.y;

		return this;
	}

	stopDragging() {
		this._dragging = false;

		return this;
	}

	remove() {
		if (this === PARAMS.hovered) {
			PARAMS.hovered = null;
		}
		this._deleted = true;

		return this;
	}
	
	update() {
		this._draw();

		if (PARAMS.collisions) {
			[...HUNTERS.values()].forEach(hunter => {
				if (this !== hunter && detectCollision(this, hunter)) {
					resolveCollision(this, hunter);
				}
			});
			[...PREYS.values()].forEach(prey => {
				if (this !== prey && detectCollision(this, prey)) {
					resolveCollision(this, prey);
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
			if (! PARAMS.hovered || this.zid >= PARAMS.hovered.zid) {
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

	_draw() {
		PARAMS.c.drawImage(this._img, this.x, this.y, this.w, this.h);

		return this;
	}

	_resetVelocity(random=true) {
		this._velocity = {
			x: random ? Math.random() * 2 - 1 : 0,
			y: random ? Math.random() * 2 - 1 : 0,
		};

		return this;
	}

	_toFront() {
		this._zid = UZID.generate();

		return this;
	}
}
