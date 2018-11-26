import { BROTHER, DOM, LOOP, PARAMS, ENTITIES, SPEECH, TARGETS } from './config.js';

let _ID = -1;
const newId = () => {
	_ID ++;
	return _ID;
}

export default class Entity {
	
	/**
	 * @constructor
	 */
	constructor(type, options) {
		if (! type) {
			throw new Error(`Missing argument : \"type\".`);
		}
		this._id = newId();
		this._deleted = false;

		this._type = type;
		this._x = options.x || 0;
		this._y = options.y || 0;
		this._img = options.img || $('#' + type);
		this._w = options.w || this._img.clientWidth;
		this._h = options.h || this._img.clientHeight;
		this._size = options.size || 1;
		this._mass = options.mass || 1;
		this._speed = options.speed || 1;
		this._velocity = options.velocity || { x : 0, y : 0 };
		this._moving = options.moving || true;
		this._dragging = options.dragging || false;
		this._arrayType = options.arrayType || undefined;
		this._zindex = options.zindex || 0;
	}

	/**
	 * @property {number} id Entity id
	 */
	get id() {
		return this._id;
	}

	/**
	 * @property {boolean} deleted Checks wether the entity has been deleted
	 */
	get deleted() {
		return this._deleted;
	}

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
	 * @property {string} type Entity type
	 */
	get type() {
		return this._type;
	}
	set type(type) {
		if (typeof type !== 'string') {
			throw new TypeError("\"type\" must of type \"string\"");
		}
		this._type = type;
		this._img = $('#' + type);
		this._w = this._img.clientWidth;
		this._h = this._img.clientHeight;
	}

	/**
	 * @property {number} w Entity mass
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
	 * @property {number} w Entity speed factor
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
	 * @property {object} w Entity velocity (object having x and y properties)
	 */
	get velocity() {
		return this._velocity;
	}
	set velocity(velocity) {
		if (typeof dragging !== 'object') {
			throw new TypeError("\"velocity\" must be of type \"object\"");
		}
		this._velocity = velocity;
	}

	/**
	 * @property {boolean} w Entity dragged state
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

	draw() {
		PARAMS.c.save();

		PARAMS.c.globalAlpha = this.opacity;
		PARAMS.c.drawImage(this._img, this.x, this.y, this.w, this.h);

		PARAMS.c.restore();
	}

	hovered() {
		return ((this.x < PARAMS.mouse.x
			&& PARAMS.mouse.x < this.x + this.w
			&& this.y < PARAMS.mouse.y
			&& PARAMS.mouse.y < this.y + this.h));
	}

	remove() {
		if (this === ENTITIES.hovered) {
			ENTITIES.hovered = null;
		}
		this._deleted = true;
		ENTITIES[this._arrayType].splice(ENTITIES[this._arrayType].indexOf(this), 1);
	}

	startDragging() {
		this.toFront();

		this._dragging = true;

		this._x = PARAMS.mouse.x;
		this._y = PARAMS.mouse.y;
	}

	stopDragging() {
		this._dragging = false;
	}

	toFront() {
		let thisIndex = ENTITIES[this._arrayType].indexOf(this);
		let stamp = ENTITIES[this._arrayType][ENTITIES[this._arrayType].length - 1];

		ENTITIES[this._arrayType][ENTITIES[this._arrayType].length - 1] = this;
		ENTITIES[this._arrayType][thisIndex] = stamp;
	}
	
	update() {
		this.draw();

		if (PARAMS.collisions) {
			ENTITIES.brothers.forEach(brother => {
				if (this !== brother && detectCollision(this, brother)) {
					resolveCollision(this, brother);
				}
			});
			ENTITIES.loops.forEach(loop => {
				if (this === loop && detectCollision(this, loop)) {
					resolveCollision(this, loop);
				}
			});
		}
		if (this.x <= 0 || PARAMS.canvas.width <= this.x + this.w) {
			this._velocity.x = this._velocity.x * -1;
		}
		if (this.y <= 0 || PARAMS.canvas.height <= this.y + this.h) {
			this._velocity.y = this._velocity.y * -1;
		}
		if (this.hovered()) {
			ENTITIES.hovered = this;
		} else if (! this._dragging && this === ENTITIES.hovered) {
			ENTITIES.hovered = null;
		}
		if (this._dragging) {
			this._x = PARAMS.mouse.x;
			this._y = PARAMS.mouse.y;
		}
	}
}