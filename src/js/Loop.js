class Loop extends Entity {

	constructor( x, y, w, h ) {

		super( x, y, w, h );

		this.arrayType = 'loops';
		this.img = loopImg.id;
		this.size = loopSize;
		this.moving = false;
	}
}