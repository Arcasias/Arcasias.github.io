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
		this._x = 0;
		this._y = 0;
		this._img = options.img || null;
		this._w = options.w || this._img.clientWidth;
		this._h = options.h || this._img.clientHeight;
		this.size = options.size || 0.1;
		if (options.x) {
			this.x = options.x;
		}
		if (options.y) {
			this.y = options.y;
		}
		this._baseSize = this._size;
		this._nutrition = options.nutrition || null;
		this._mass = options.mass || 1;
		this._speed = options.speed || 1;
		this._velocity = options.velocity || { x : 0, y : 0 };
		this._moving = options.moving || true;
		this._dragging = options.dragging || false;
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
		return this._x + this.w / 2;
	}
	set x(x) {
		this._x = x - this.w / 2;
	}

	/**
	 * @property {number} y Position on y axis
	 */
	get y() {
		return this._y + this.h / 2;
	}
	set y(y) {
		this._y = y - this.h / 2;
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

	get size() {
		return this._size;
	}
	set size(size) {
		this._size = Math.floor(size * 100) / 100;
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
        return this._nutrition || this._size;
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
	 * @property {boolean} hovered Wether the entity is hovered
	 */
	get hovered() {
		return this._x < PARAMS.mouse.x &&
			PARAMS.mouse.x < this._x + this.w &&
			this._y < PARAMS.mouse.y &&
			PARAMS.mouse.y < this._y + this.h;
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
			[...HUNTERS.values()].concat([...PREYS.values()]).forEach(entity => {
				if (this !== entity && this._detectCollision(entity)) {
					this._resolveCollision(entity);
				}
			});
		}
		// Follow the mouse when dragged
		if (this._dragging) {
			this.x = PARAMS.mouse.x;
			this.y = PARAMS.mouse.y;
		}
		// Can't go out of boundaries for X axis ...
		if (this._x <= 0) {
			this._velocity.x *= -1;
			this._x = 0;
		} else if (PARAMS.canvas.width <= this._x + this.w) {
			this._velocity.x *= -1;
			this._x = PARAMS.canvas.width - this.w;
		}
		// ... same for Y axis
		if (this._y <= 0) {
			this._velocity.y *= -1;
			this._y = 0;
		} else if (PARAMS.canvas.height <= this._y + this.h) {
			this._velocity.y *= -1;
			this._y = PARAMS.canvas.height - this.h;
		}
		// Handles hovered state
		if (this.hovered) {
			if (! PARAMS.hovered || this.zid >= PARAMS.hovered.zid) {
				PARAMS.hovered = this;
			}
		} else if (! this._dragging && this === PARAMS.hovered) {
			PARAMS.hovered = null;
		}

		return this;
	}

	_detectCollision(entity) {
	    return entity._x < this._x + this.w &&
	        this._x < entity._x + entity.w &&
	        entity._y < this._y + this.h &&
	        this._y < entity._y + entity.h;
	}


	_draw() {
		PARAMS.c.drawImage(this._img, this._x, this._y, this.w, this.h);

		return this;
	}

	_resetVelocity(random=true) {
		this._velocity = {
			x: random ? Math.random() * 2 - 1 : 0,
			y: random ? Math.random() * 2 - 1 : 0,
		};

		return this;
	}

	_resolveCollision(entity) {
	    let distX = entity.x - this.x;
	    let distY = entity.y - this.y;

	    if (0 <= (this.velocity.x - entity.velocity.x) * distX + (this.velocity.y - entity.velocity.y) * distY) {
	        let angle = Math.atan2(distY, distX) * -1;

	        let u1 = rotate(this.velocity, angle);
	        let u2 = rotate(entity.velocity, angle);
	    
	        this.velocity = rotate({
	            x: u1.x * (this.mass - entity.mass) / (this.mass + entity.mass) + u2.x * 2 * entity.mass / (this.mass + entity.mass),
	            y: u1.y,
	        }, angle * -1);
	        entity.velocity = rotate({
	            x: u2.x * (this.mass - entity.mass) / (this.mass + entity.mass) + u1.x * 2 * entity.mass / (this.mass + entity.mass),
	            y: u2.y,
	        }, angle * -1);
	    }
	}

	_toFront() {
		this._zid = UZID.generate();

		return this;
	}
}
