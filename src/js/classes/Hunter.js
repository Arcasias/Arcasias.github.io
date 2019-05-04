import { HUNTER, PREY, PARAMS, SPEECH, TARGETS } from '/src/js/config.js';
import { MAP as PREYS } from '/src/js/classes/Prey.js';
import Entity from './Entity.js';

export const MAP = new Map();
export class Hunter extends Entity {

	_type = HUNTER.type;

	/**
	 * @constructor
	 */
	constructor(type, options) {
		super(type, options);

		this._talking = options.talking || false;
		this._text = {
			text: options.text || '',
			width: 0,
			height: 0,
		};
		this._objective = options.objective || null;
		this._exploding = options.exploding || false;
		this._explodingIntensity = options.explodingIntensity || 0;
		this.resetVelocity(true);
		MAP.set(this._id, this);
	}

	/**
	 * @override
	 */
	set type(type) {
		if (type != this._type && this._objective && TARGETS[type] != this._objective) {
			this.resetVelocity(true)
		}
		super.type = type;
	}

	get text() {
		return this._text.text;
	}
	set text(text) {
		if (typeof text !== 'string') {
			throw new TypeError("\"text\" must of type \"string\"");
		}
		this._text = {
			text: text,
			width: PARAMS.c.measureText(text).width,
			height: parseInt(PARAMS.font, 10),
		};
	}

	/**
	 * @override
	 */
	draw() {
		super.draw();

		if (this._talking) {
			let color = PARAMS.colorChanging ? `rgb(${PARAMS.color.join(',')})` : '#000000';

		    PARAMS.c.strokeStyle = color;
		    PARAMS.c.strokeRect(this.x + this.w / 2 - 10, this.y - 35, this._text.width + 20, this._text.height + 20);
		    PARAMS.c.fillStyle = '#ffffff';
		    PARAMS.c.fillRect(this.x + this.w / 2 - 10, this.y - 35, this._text.width + 20, this._text.height + 20);
		    
		    PARAMS.c.fillStyle = color;
		    PARAMS.c.fillText(this._text.text, this.x + this.w / 2, this.y - 8);
		}

		return this;
	}

	explode() {
		this._exploding = true;
		this.startTalking('exploding', true);

		setTimeout(() => {
			for (let i = 0; i < (MAP.size < HUNTER.maxAmount ? HUNTER.growth : 1); i ++) {
				let newHunter = new Hunter(this._species, {
					x: this._x,
					y: this._y,
					size: this._baseSize + (Math.random() * 0.1 - 0.05),
					speed: this._speed,
				});
				MAP.set(newHunter.id, newHunter);
			}
			this.remove();
		}, 2000);

		return this;
	}

	newObjective() {
		if (PREYS.size === 0) {
			this._objective = null;
		} else {
			let feasible = [...PREYS.values()].filter(prey => prey.species === TARGETS[this._species]);

			if (feasible.length === 0) {
				this._objective = null;
			} else {
				this._objective = choice(feasible);
				if (Math.random() < 1 / (100 / 15)) {
					this.startTalking(this._objective ? 'seek' : 'notfound', true);
				}
			}
		}
		return this;
	}

	objectiveReached() {
		this.startTalking('found', true);

		let nutrition = this._objective.nutrition;

		this._objective.remove();

		this.newObjective();

		this._size += nutrition;

		if (this._size >= 1) {
			this.explode();
		}
		return this;
	}

	/**
	 * @override
	 */
	remove() {
		super.remove()

		MAP.delete(this._id);

		return this;
	}

	/**
	 * @override
	 */
	startDragging() {
		super.startDragging();

		this.startTalking('dragged', true);

		return this;
	}

	startTalking(context='default', override=false) {
		if (this._talking) {
			if (! override) {
				return;
			}
			this.stopTalking(true);
		}

		this.toFront();

		this.text = choice(SPEECH[this._species][context]);
		this._talking = setTimeout(() => {
			this.stopTalking();
		}, 2000);

		return this;
	}

	/**
	 * @override
	 */
	stopDragging() {
		super.stopDragging();

		this.startTalking('dropped', true);

		return this;
	}

	stopTalking(clearPrevious=false) {
		if (! this._talking) {
			return;
		}
		if (clearPrevious) {
			clearTimeout(this._talking);
		}
		this._talking = false;

		return this;
	}

	/**
	 * @override
	 */
	update() {
		super.update();

		if (this._exploding) {
			this._explodingIntensity ++;
			this._x += Math.random() * this._explodingIntensity / 5 - this._explodingIntensity / 10;
			this._y += Math.random() * this._explodingIntensity / 5 - this._explodingIntensity / 10;
		} else if (PARAMS.running && this._speed > 0) {
			if (this._objective) {
				if (this._objective.deleted) {
					this.newObjective();
					this.resetVelocity(true);
				} else if (detectCollision(this, this._objective)) {
					return this.objectiveReached();
				}
			} else {
				this.newObjective();
			}
			if (! this._talking && Math.random() < 1 / 1000) {
				this.startTalking();
			}
			if (! this._dragging && this._moving) {
				if (this._objective) {
					this._velocity = {
						x: xFromDistance(this._x, this._y, this._objective._x, this._objective._y) * (this.x < this._objective.x ? 1 : -1),
						y: yFromDistance(this._x, this._y, this._objective._x, this._objective._y) * (this.x < this._objective.x ? 1 : -1),
					};
				}
				this._x += this._velocity.x * this._speed;
				this._y += this._velocity.y * this._speed;
			}
		} else if (! this._talking && Math.random() < 1 / 1000) {
			this.startTalking('pending');
		}

		return this;
	}
}