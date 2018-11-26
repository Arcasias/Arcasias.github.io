import { BROTHER, DOM, LOOP, PARAMS, ENTITIES, SPEECH, TARGETS } from './config.js';
import Entity from './Entity.js';

export default class Brother extends Entity {

	/**
	 * @constructor
	 */
	constructor(type, options) {
		super(type, options);

		this._arrayType = 'brothers';
		this._speech = options.speech || SPEECH.brother;
		this._talking = options.talking || false;
		this._text = {
			text: options.text || '',
			width: 0,
			height: 0,
		};
		this._objective = options.objective || null;
		this._exploding = options.exploding || false;
		this._explodingIntensity = options.explodingIntensity || 0;
		this._velocity = options.velocity || {
			x: Math.random() * 2 - 1,
			y: Math.random() * 2 - 1,
		};
	}

	/**
	 * @override
	 */
	set type(type) {
		if (type != this._type && this._objective && TARGETS[type] != this._objective) {
			this._velocity = {
				x: Math.random() * 2 - 1,
				y: Math.random() * 2 - 1,
			};
		}
		super.type = type;
	}

	set speech(speech) {
		if (typeof speech !== 'string') {
			throw new TypeError("\"speech\" must of type \"string\"");
		}
		this._speech = speech;
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
			width: PARAMS.c.measureText(text).width * 2,
			height: parseInt(PARAMS.font, 10),
		};
	}

	/**
	 * @override
	 */
	draw() {
		super.draw();

		if (this._talking) {
			PARAMS.c.save();
		    PARAMS.c.font = PARAMS.font;

		    PARAMS.c.strokeStyle = '#000';
		    PARAMS.c.strokeRect(this.x + this.w / 2 - 10, this.y - 35, this._text.width + 20, this._text.height + 20);
		    PARAMS.c.fillStyle = '#FFF';
		    PARAMS.c.fillRect(this.x + this.w / 2 - 10, this.y - 35, this._text.width + 20, this._text.height + 20);
		    
		    PARAMS.c.fillStyle = '#000';
		    PARAMS.c.fillText(this._text.text, this.x + this.w / 2, this.y - 8);
		    
		    PARAMS.c.restore();
		}

		return this;
	}

	explode() {
		this._exploding = true;
		this.startTalking('exploding', true);

		setTimeout(() => {
			for (let i = 0; i < (ENTITIES.brothers.length < BROTHER.maxAmount ? BROTHER.growth : 1); i ++) {
				if (BROTHER.maxAmount < ENTITIES.brothers.length) break;
				let options = {
					x: this._x,
					y: this._y,
					size: BROTHER.sizeMin,
					speed: BROTHER.speed,
					speech: this._speech,
				}
				ENTITIES.brothers.push(new Brother(this._type, options));
			}
			this.remove();
		}, 2000);

		return this;
	}

	newObjective() {
		let feasible = ENTITIES.loops.length ? ENTITIES.loops.filter(loop => loop.type === TARGETS[this._type]) : [];

		if (! feasible.length) {
			this._objective = null;
		} else {
			this._objective = choice(feasible);
			if (Math.random() < 1 / (100 / 15)) {
				this.startTalking(this._objective ? 'seek' : 'notfound', true);
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

		if (BROTHER.sizeMax <= this._size) {
			this.explode();
		}
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

		this.text = choice(SPEECH[this._speech][context]);
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
					this._velocity = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
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
						x: xFromDistance(this.x, this.y, this._objective.x, this._objective.y) * (this.x < this._objective.x ? 1 : -1),
						y: yFromDistance(this.x, this.y, this._objective.x, this._objective.y) * (this.x < this._objective.x ? 1 : -1),
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