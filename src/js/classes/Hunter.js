const HUNTERS = new Map();

const MOODS = {
	'happy': 2,
	'joyful': 1,
	'normal': 0,
	'sad': -1,
	'depressed': -2,
	'cannibal': -3,
};

class Hunter extends Entity {

	_type = HUNTER.type;
	static player = new Player(50, 100);

	/**
	 * @constructor
	 */
	constructor(type, options) {
		super(type, options);

		this._mood = options.mood || 'normal';
		this._talking = options.talking || false;
		this._text = {
			text: options.text || '',
			width: 0,
			height: 0,
		};
		this._objective = options.objective || null;
		this._exploding = options.exploding || false;
		this._explodingIntensity = options.explodingIntensity || 0;
		this._resetVelocity(true);
		HUNTERS.set(this._id, this);
	}

	/**
	 * @override
	 */
	set species(species) {
		if (species != this._species && this._objective && SPECIES[species].target != this._objective.species) {
			this._resetVelocity(true)
		}
		super.species = species;
	}

	get mood() {
		return this._mood;
	}
	set mood(mood) {
		this._mood = mood;
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
	remove() {
		if (this._exploding) {
			clearTimeout(this._exploding);
		}
		super.remove()
		HUNTERS.delete(this._id);

		return this;
	}

	/**
	 * @override
	 */
	startDragging() {
		super.startDragging();

		this._startTalking('dragged', true);

		return this;
	}

	/**
	 * @override
	 */
	stopDragging() {
		super.stopDragging();

		this._startTalking('dropped', true);

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
					this._newObjective();
					this._resetVelocity(true);
				} else if (detectCollision(this, this._objective)) {
					return this._objectiveReached();
				}
			} else {
				this._newObjective();
			}
			if (! this._talking && Math.random() < 1 / 1000) {
				this._startTalking();
			}
			if (! this._dragging && this._moving) {
				if (this._objective) {
					this._velocity = {
						x: xFromDistance(this._x, this._y, this._objective._x, this._objective._y) * (this.x < this._objective.x ? 1 : -1),
						y: yFromDistance(this._x, this._y, this._objective._x, this._objective._y) * (this.x < this._objective.x ? 1 : -1),
					};
				}
				let moodMult = 1;
				switch (this._mood) {
					case 'happy': 
						moodMult = 1.5;
						break;
					case 'joyful': 
						moodMult = 1.25;
						break;
					case 'sad':
						moodMult = 0.75;
						break;
					case 'depressed':
						moodMult = 0.5;
						break;
					case 'cannibal':
						moodMult = 1.1;
						break;
				}
				this._x += this._velocity.x * this._speed * moodMult;
				this._y += this._velocity.y * this._speed * moodMult;
			}
		} else if (! this._talking && Math.random() < 1 / 1000) {
			this._startTalking('pending');
		}
		if (Math.random() < 1 / (5000 * Math.abs(MOODS[this._mood || 1]))) {
			this._changeMood();
		}

		return this;
	}

	_changeMood() {
		let moodValue = MOODS[this._mood];
		let possibleMoods = [];
		Object.keys(MOODS).forEach(moodName => {
			if (MOODS[moodName] === moodValue + 1 || MOODS[moodName] === moodValue - 1) {
				possibleMoods.push(moodName);
			}
		});
		this._mood = choice(possibleMoods);
		console.log(this._mood);
	}

	/**
	 * @override
	 */
	_draw() {
		super._draw();

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

	_explode() {
		this._startTalking('exploding', true);

		this._exploding = setTimeout(() => {
			for (let i = 0; i < (HUNTERS.size < HUNTER.maxAmount ? Math.floor(Math.random() * (HUNTER.growth - 1)) + 1 : 1); i ++) {
				let newHunter = new Hunter(this._species, {
					x: this._x,
					y: this._y,
					img: this._img,
					size: this._baseSize + (Math.random() * 0.05 - 0.025),
					speed: this._speed,
				});
				HUNTERS.set(newHunter.id, newHunter);
			}
			this._exploding = false;
			this.remove();
		}, 2000);

		return this;
	}

	_newObjective() {
		let targets = this._mood === 'cannibal' ? HUNTERS : PREYS;

		if (targets.size === 0) {
			this._objective = null;
		} else {
			let feasible =[...targets.values()].filter(entity => {
				return (this._mood === 'cannibal') ?
					entity => entity !== this :
					entity.species === SPECIES[this._species].target;
			});
			if (feasible.length === 0) {
				this._objective = null;
			} else {
				this._objective = choice(feasible);
				if (Math.random() < 1 / (100 / 15)) {
					this._startTalking(this._objective ? 'seek' : 'notfound', true);
				}
			}
		}
		return this;
	}

	_objectiveReached() {
		this._startTalking('found', true);

		let nutrition = this._objective.nutrition;

		this._objective.remove();

		this._newObjective();

		this._size += nutrition;

		if (this._size >= 1) {
			this._explode();
		}
		return this;
	}

	_startTalking(context='default', override=false) {
		if (this._talking) {
			if (! override) {
				return;
			}
			this._stopTalking(true);
		}
		Hunter.player.play(SPECIES[this._species].sounds);
		this._toFront();

		this.text = choice(SPECIES[this._species].speech[context]);
		this._talking = setTimeout(() => {
			this._stopTalking();
		}, 2000);

		return this;
	}

	_stopTalking(clearPrevious=false) {
		if (! this._talking) {
			return;
		}
		if (clearPrevious) {
			clearTimeout(this._talking);
		}
		this._talking = false;

		return this;
	}
}