class Entity {
	
	constructor( x, y, w, h ) {

		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.size = 1;
		this.img = undefined;
		this.mass = 1;
		this.speed = 1;
		this.velocity = { x : 0, y : 0 };
		this.moving = true;
		this.dragging = false;
		this.arrayType = undefined;
	}
	
	update() {

		this.draw();

		if ( true === collisions ) {

			for ( i = 0; i < Object.keys( entities ).length; i ++ ) {

				let arr = entities[ Object.keys( entities )[i] ];

				for ( j = 0; j < arr.length; j ++ ) {

					if ( this === arr[j] ) continue;

					if ( detectCollision( this, arr[j] ) ) resolveCollision( this, arr[j] );
				}
			}
		}

		if ( this.getX() <= 0 || canvas.width <= this.getX() + this.getW() ) this.velocity.x = this.velocity.x * -1;
		if ( this.getY() <= 0 || canvas.height <= this.getY() + this.getH() ) this.velocity.y = this.velocity.y * -1;

		if ( this.hovered() ) {

			if ( this !== hoveredEntity ) hoveredEntity = this;

		} else {

			if ( this.dragging === false && this === hoveredEntity ) hoveredEntity = undefined;
		}

		if ( true === this.dragging ) {

			this.setX( mouse.x );
			this.setY( mouse.y );
		}
	}

	draw() {

		c.save();

		c.globalAlpha = this.opacity;
		c.drawImage( this.img, this.getX(), this.getY(), this.getW(), this.getH() );

		c.restore();
	}

	getX() {

		return this.x - this.getW() / 2;
	}

	setX( x ) {

		this.x = x + this.getW() / 2;
	}

	getY() {

		return this.y - this.getH() / 2;
	}

	setY( y ) {

		this.y = y + this.getH() / 2;
	}

	getW() {

		return this.w * this.size;
	}

	getH() {

		return this.h * this.size;
	}

	getMass() {

		return this.mass;
	}

	setMass( mass ) {

		this.mass = mass;
	}

	getSpeed() {

		return this.speed;
	}

	setSpeed( speed ) {

		this.speed = speed;
	}

	getVelocity() {

		return this.velocity;
	}

	setVelocity( x = 0, y = 0 ) {

		this.velocity.x = x;
		this.velocity.y = y;
	}

	getSize() {

		return this.size;
	}

	setSize( size ) {

		this.size = size;
	}

	hovered() {

		return ( ( this.getX() < mouse.x
			&& mouse.x < this.getX() + this.getW()
			&& this.getY() < mouse.y
			&& mouse.y < this.getY() + this.getH() ) );
	}

	toFront() {

		let thisIndex = entities[ this.arrayType ].indexOf( this );

		let stamp = entities[ this.arrayType ][ entities[ this.arrayType ].length - 1 ];
		entities[ this.arrayType ][ entities[ this.arrayType ].length - 1 ] = this;
		entities[ this.arrayType ][ thisIndex ] = stamp;
	}

	startDragging() {

		this.toFront();

		this.dragging = true;

		this.setX( mouse.x );
		this.setY( mouse.y );
	}

	stopDragging() {

		this.dragging = false;
	}
}