class Loop extends Entity {

	constructor( x, y, img ) {

		super( x, y, img );

		this.arrayType = 'loops';
		this.size = loopSize;
		this.nutrition = loopNutrition;
		this.moving = false;
	}
}