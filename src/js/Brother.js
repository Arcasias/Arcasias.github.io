class Brother extends Entity {

	constructor( x, y, w, h ) {

		super( x, y, w, h );

		this.arrayType = 'brothers';
		this.img = brotherImg.id;
		this.size = brotherSize;
		this.speed = brotherSpeed;

		this.talking = false;
		this.text = '';

		this.objectiveID = undefined;
		this.velocity = { x : 0, y : 0 };

		this.setVelocity( Math.random() * 2 - 1, Math.random() * 2 - 1 );
	}

	update() {

		super.update();

		if ( undefined !== this.getObjective() ) {

			if ( undefined === entities.loops[ this.getObjective() ] ) {

				this.setObjective();
				this.setVelocity( Math.random() * 2 - 1, Math.random() * 2 - 1 );

			} else if ( detectCollision( this, entities.loops[ this.getObjective() ] ) ) {

				this.startTalking( randInArray( speech.found ), true );
				deleteLoop( this.getObjective() );

				if ( 0 < entities.loops.length ) this.setObjective( Math.floor( Math.random() * entities.loops.length ) );

				return;
			}
		} else {

			if ( 0 < entities.loops.length ) this.setObjective( Math.floor( Math.random() * entities.loops.length ) );
		}

		if ( false === this.talking && Math.random() < 1 / 1000 ) this.startTalking();

		if ( false === this.dragging && true === this.moving ) {

			if ( undefined !== this.getObjective() ) {

				let x = this.getX();
				let y = this.getY();

				let ox = entities.loops[ this.getObjective() ].getX();
				let oy = entities.loops[ this.getObjective() ].getY();

				this.velocity = {

					x : xFromDistance( x, y, ox, oy ) * ( x < ox ? 1 : -1 ),
					y : yFromDistance( x, y, ox, oy ) * ( x < ox ? 1 : -1 ),
				}
			}

			this.x += this.velocity.x * this.speed;
			this.y += this.velocity.y * this.speed;
		}
	}

	draw() {

		super.draw();

		if ( false !== this.talking ) {

			c.save();

		    c.font = speechFont;
		    
		    let width = c.measureText( this.text ).width;

		    c.strokeStyle = '#000';
		    c.strokeRect( this.getX() + this.getW() / 2 - 10, this.getY() - 35, width + 20, parseInt( speechFont, 10 ) + 20 );
		    c.fillStyle = '#FFF';
		    c.fillRect( this.getX() + this.getW() / 2 - 10, this.getY() - 35, width + 20, parseInt( speechFont, 10 ) + 20 );
		    
		    c.fillStyle = '#000';
		    c.fillText( this.text , this.getX() + this.getW() / 2, this.getY() - 8 );
		    
		    c.restore();
		}
	}

	getObjective() {

		return this.objectiveID;
	}

	setObjective( objectiveID = undefined ) {

		this.objectiveID = objectiveID;

		if ( Math.random() < 1 / 10 ) this.startTalking( randInArray( undefined === objectiveID ? speech.notfound : speech.seek ), true );
	}

	startDragging() {

		super.startDragging();

		this.startTalking( randInArray( speech.dragged ), true );
	}

	stopDragging() {

		super.stopDragging();

		this.startTalking( randInArray( speech.dropped ), true );
	}

	startTalking( toSay = undefined, override = false ) {

		if ( false !== this.talking ) {

			if ( false === override ) return;

			this.stopTalking( true );
		}

		this.toFront();

		this.text = undefined === toSay ? randInArray( speech.default ) : toSay;

		this.talking = setTimeout( () => {

			this.stopTalking();

		}, 2000 );
	}

	stopTalking( clearPrevious = false ) {

		if ( false === this.talking ) return;

		if ( true === clearPrevious ) clearTimeout( this.talking );

		this.talking = false;
	}
}