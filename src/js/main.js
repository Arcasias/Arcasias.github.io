const presets = {

	brother : {
		brother : 'brother',
		loops : 'loops',
	},
	antoine : {
		brother : 'antoine',
		loops : 'soup',
	},
	julien : {
		brother : 'julien',
		loops : 'rope',
	},
	florent : {
		brother : 'florent',
		loops : 'emc2',
	},
};

const speechFont = '20px Arial';
const maxBrothers = 1000;

let changelogVisible = false;

let customCursor = undefined;

let running = false;
let clicking = false;
let hoveredEntity = undefined;

let entities = {};

let colorChanging = false;
let currentColor = 0;
let filling = true;
let colorSpeed;
let color = {
	R : 255,
	G : 0,
	B : 0,
	hex : '#000000',
};

let canvas, c, mouse;
let currentPreset = 'brother';
let brotherImg = {};
let brotherSpeech = {};
let loopsImg = {};

let collisions = false;
let brotherGrowth, brotherSpeed;
let brotherSizeMin = 0.2;
let brotherSizeMax = 1;
let brotherSizeStep = 0.05;
let loopSize, loopNutrition;
let loopSizeMin = 0.05;
let loopSizeStep = 0.01;

$( document ).ready( function() {

	canvas = document.getElementById( 'game-area' );
	c = canvas.getContext( '2d' );

	$( document ).on( 'keydown', function( event ) {

		// event.preventDefault();
		// console.log( event.keyCode );

		switch ( event.keyCode ) {

			case 27 :	// Esc
				if ( true === changelogVisible ) closeChangelog();
				break;

			case 82 : 	// R
				resetSettings();
				break;

			case 112 :	// F1
				event.preventDefault();
				true === changelogVisible ? closeChangelog() : openChangelog();
				break;
		}
	} );

	$( document ).on( 'click', '#button-start-stop', () => { true === running ? stop() : start() } );
	$( document ).on( 'click', '#button-reset', reset );
	$( document ).on( 'click', '#button-reset-settings', resetSettings );
	$( document ).on( 'click', '#button-open-changelog', openChangelog );
	$( document ).on( 'click', '#button-close-changelog', closeChangelog );
	$( document ).on( 'input', '#brothers-growth', updateBrotherGrowth );
	$( document ).on( 'input', '#brothers-speed', updateBrotherSpeed );
	$( document ).on( 'input', '#loops-size', updateLoopSize );
	$( document ).on( 'change', '#preset', updatePreset );
	$( document ).on( 'input', '#color-speed', updateColorSpeed );
	$( document ).on( 'input', '#cb-collisions', updateCollisions );
	$( document ).on( 'input', '#cb-rgb', updateRGB );

	$( document ).on( 'mousedown', '#game-area', mouseDown );
	$( document ).on( 'mouseup', '#game-area', mouseUp );
	$( document ).on( 'click', '#game-area', () => {

		if ( undefined !== hoveredEntity ) return;

		createLoop();
	} );

	$( document ).on( 'mousemove', function( event ) {

		mouse.x = event.clientX - canvas.offsetLeft;
		mouse.y = event.clientY - canvas.offsetTop;
	} );

	$( '#game-area' ).on( 'resize', function( event ) {

		console.log( 'resized' );

		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;

		init();
	} );

	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;

	mouse = {
		x : canvas.width / 2,
		y : canvas.height / 2,
	}

	init();
	animate();
} );

function init() {

	entities = {
		brothers : [],
		loops : [],
	};

	updateSettingsValues();
	createBrother();
}

function animate() {

	c.clearRect( 0, 0, canvas.width, canvas.height );

	Object.keys( entities ).forEach( arrayKey => {

		entities[ arrayKey ].forEach( brother => { brother.update() } );
	} );

	if ( undefined !== hoveredEntity ) {

		$( '#game-area' ).removeClass( 'hide-cursor' );

	} else {

		c.drawImage( loopsImg, mouse.x - ( 40 * loopsImg.clientWidth / loopsImg.clientHeight ) / 2, mouse.y - 20, 40 * loopsImg.clientWidth / loopsImg.clientHeight, 40 );
		$( '#game-area' ).addClass( 'hide-cursor' );
	}

	if ( true === colorChanging ) changeColor();

	updateBrotherStats();
	
	requestAnimationFrame( animate );
}

function start() {

	running = true;

	$( '#button-start-stop' ).removeClass( 'start' ).addClass( 'stop' ).html( 'STOP' );
}

function stop() {

	running = false;

	$( '#button-start-stop' ).removeClass( 'stop' ).addClass( 'start' ).html( 'START' );
}

function reset() {

	if ( true === running ) {

		stop();
	}

	init();
}

function resetSettings() {

	$( '.cb-checkbox' ).add( '.trackbar' ).add( '.select' ).each( ( i, input ) => {

		let defaultVal = $( input ).data( 'default' );

		if ( typeof defaultVal === 'boolean' ) {

			$( input ).prop( 'checked', defaultVal );

		} else {

			$( input ).val( defaultVal );
		}
	} );

	updateSettingsValues();
}

function updateSettingsValues() {

	updateBrotherGrowth();
	updateBrotherSpeed();
	updateLoopSize();
	updatePreset();
	updateColorSpeed();
	updateCollisions();
	updateRGB();
}

function createBrother( x = undefined, y = undefined ) {

	let newBrother = new Brother( x, y, brotherImg, brotherSpeech );

	if ( undefined === x && undefined === y ) {

		newBrother.setX( canvas.width / 2 );
		newBrother.setY( canvas.height / 2 );
	}

	entities.brothers.push( newBrother );
}

function createLoop() {

	let newLoop = new Loop( mouse.x, mouse.y, loopsImg );
	let loopID = entities.loops.length;

	entities.loops.push( newLoop );

	entities.brothers.forEach( brother => {

		if ( undefined === brother.getObjective() ) brother.setObjective( loopID );
	} );
}

function randInRange( min, max ) {

	return Math.random() * ( max - min ) + min;
}

function randInArray( array ) {

	return array[ Math.floor( Math.random() * array.length ) ];
}

function distance( x1, y1, x2, y2 ) {

	return Math.sqrt( Math.pow( x2 - x1, 2 ) + Math.pow( y2 - y1, 2 ) );
}

function xFromDistance( x1, y1, x2, y2, step = 1 ) {

	return Math.cos( Math.atan( ( y2 - y1 ) / ( x2 - x1 ) ) ) * step;
}

function yFromDistance( x1, y1, x2, y2, step = 1 ) {

	return Math.sin( Math.atan( ( y2 - y1 ) / ( x2 - x1 ) ) ) * step;
}

function rotate( velocity, angle ) {

    return {
        x : velocity.x * Math.cos( angle ) - velocity.y * Math.sin( angle ),
        y : velocity.x * Math.sin( angle ) + velocity.y * Math.cos( angle ),
    };
}

function detectCollision( entity1, entity2 ) {

	return ( ( entity2.getX() < entity1.getX() + entity1.getW()
		&& entity1.getX() < entity2.getX() + entity2.getW()
		&& entity2.getY() < entity1.getY() + entity1.getH()
		&& entity1.getY() < entity2.getY() + entity2.getH() ) );
}

function resolveCollision( entity1, entity2 ) {

	let distX = entity2.x - entity1.x;
	let distY = entity2.y - entity1.y;

	if ( 0 <= ( entity1.velocity.x - entity2.velocity.x ) * distX + ( entity1.velocity.y - entity2.velocity.y ) * distY ) {

		let angle = Math.atan2( distY, distX ) * -1;

		let m1 = entity1.getMass();
		let m2 = entity2.getMass();

		let u1 = rotate( entity1.getVelocity(), angle );
		let u2 = rotate( entity2.getVelocity(), angle );
	
		let finalV1 = rotate( {  x : u1.x * ( m1 - m2 ) / ( m1 + m2 ) + u2.x * 2 * m2 / ( m1 + m2 ), y : u1.y }, angle * -1 );
		let finalV2 = rotate( {  x : u2.x * ( m1 - m2 ) / ( m1 + m2 ) + u1.x * 2 * m2 / ( m1 + m2 ), y : u2.y }, angle * -1 );

		entity1.velocity.x = finalV1.x;
		entity1.velocity.y = finalV1.y;

		entity2.velocity.x = finalV2.x;
		entity2.velocity.y = finalV2.y;
	}
}

function mouseDown() {

	if ( undefined !== hoveredEntity ) hoveredEntity.startDragging();
}

function mouseUp() {

	if ( undefined !== hoveredEntity && true === hoveredEntity.dragging ) hoveredEntity.stopDragging();
}

function updateBrotherGrowth() {

	brotherGrowth = $( '#brothers-growth' ).val() - 0;
}

function updateBrotherSpeed() {

	brotherSpeed = $( '#brothers-speed' ).val() - 0;

	if ( 0 === entities.brothers.length ) return;

	entities.brothers.forEach( brother => { brother.setSpeed( brotherSpeed ) } );
}

function updateLoopSize() {

	let loopVal = $( '#loops-size' ).val() * loopSizeStep

	loopSize = Math.max( loopVal, loopSizeMin );
	loopNutrition = loopVal;
}

function updateCollisions() {

	collisions = $( '#cb-collisions' ).prop( 'checked' );
}

function updateColorSpeed() {

	colorSpeed = $( '#color-speed' ).val() - 0
}

function updateBrotherStats() {

	$( '#brothers-number' ).html( entities.brothers.length == maxBrothers ? 'MAX' : entities.brothers.length );

	$( '#brothers-progress' ).stop().animate( { width : ( Math.min( entities.brothers.length / maxBrothers * 100, 100 ) ) + '%' }, 50 );
}

function updateRGB() {

	colorChanging = $( '#cb-rgb' ).prop( 'checked' );

	if ( false === colorChanging ) $( '*' ).css( 'color', '' );
}

function changeColor() {

	let colorArray = [

		color.R,
		color.G,
		color.B,
	];

	let nextColor = ( currentColor + 1 ) % 3;

	if ( filling ) {

		colorArray[ nextColor ] < 255 ? colorArray[ nextColor ] += colorSpeed : filling = false;

	} else {

		if ( 0 < colorArray[ currentColor ] ) {

			colorArray[ currentColor ] -= colorSpeed;

		} else {

			filling = true;
			currentColor = nextColor;
		}
	}

	for ( let i = 0; i < colorArray.length; i ++ ) { colorArray[i] = Math.max( Math.min( colorArray[i], 255 ), 0 ) }

	color.R = colorArray[0];
	color.G = colorArray[1];
	color.B = colorArray[2];

	updateColor();
}

function updateColor() {

	color.hex = '#' + toHex( color.R ) + toHex( color.G ) + toHex( color.B );

	$( '*' ).css( { color : color.hex } );
}

function openChangelog() {

	changelogVisible = true;

	$( '.wrapper' ).children().not( '.changelog-wrapper' ).prop( 'disabled', true ).stop().animate( { opacity : 0.2 }, 150 );
	$( '.changelog-wrapper' ).fadeIn( 150 );
}

function closeChangelog() {

	changelogVisible = false;

	$( '.wrapper' ).children().stop().css( { opacity : 1 } );
	$( '.changelog-wrapper' ).hide();
}

function updatePreset( newPreset ) {

	if ( newPreset ) currentPreset = newPreset.target.value;

	brotherImg = $( '#' + presets[ currentPreset ].brother )[0],
	brotherSpeech = speech[ currentPreset ];
	loopsImg = $( '#' + presets[ currentPreset ].loops )[0];

	entities.brothers.forEach( brother => {

		brother.setImg( brotherImg );
		brother.setSpeech( brotherSpeech );
	} );
	entities.loops.forEach( loops => {

		loops.setImg( loopsImg );
	} );
}

function toHex( int ) {

	let hex = Number( int ).toString( 16 );

	if ( hex.length < 2 ) hex = "0" + hex;

	return hex;
}