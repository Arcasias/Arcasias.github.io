const speech = {

	default : [

		'Bröther',
		'Bröther pls',
		'Bröther, may i have some lööps ?',
		'I beg you bröther',
		'Please bröther',
		'I\'m hungry bröther',
		'Lööps',
		'Need the lööps',
		'I seek the lööps',
		'I want the lööps',
		'Just a few lööps',
		'Houston, we need the lööps',
		'Fuck i just want some lööps',
		'It\'s breakfast time',
	],
	dragged : [

		'Hey !',
		'Why ?',
		'But why',
		'What have i done ?',
		'Mommy look, i\'m flying',
		'You surprised me bröther',
		'Be gentle please',
		'You must put me back',
		'Put me back down !',
		'I can\'t get the lööps if you grab me',
		'Bröther, why have you forsaken me ?',
		'Why bröther ?',
		'Hey ! That\'s not nice !',
		'Why you dö dis ?',
		'Nööööööööö',
		'Stop dragging me around !',
		'Guess i won\'t have the lööps',
		'*Sigh*',
		'Jesus',
		'Jesus Christ',
		'Oh my god',
		'I can\'t believe you just did that',
	],
	dropped : [

		'That was mean',
		'Not nice, bröther',
		'You should be ashamed',
		'Better not try this again',
		'Your actions have consequences',
		'Thanks for the ride',
		'Well... thanks i guess',
		'Hum, thank you ?',
		'Time to get these lööps',
		'Let\'s do this',
	],
	seek : [

		'Seek and consume',
		'Target aquired',
		'Lööps spotted',
		'That looks tasty',
		'I want dis',
		'Our bröther has dispensed some lööps',
		'More lööps',
		'Oh boi',
		'Dinner is served',
		'This one is mine',
	],
	found : [

		'I got the lööps !',
		'Yesss !',
		'Yummy !',
		'*Gulp*',
		'*Click* Noice',
		'The lööps have been retrieved',
		'Lööps consumed',
		'Delicious',
		'Thanks bröther',
	],
	notfound : [

		'I\'ll get it next time',
		'Nooooooooo',
		'Damn',
		'I was too slow',
		'No lööps for me i guess',
	],
}

const morphs = [

	{
		img : 'pingu.png',
		txt : [
			'NOOT NOOT',
		],
	},
	{
		img : 'knuckles.png',
		txt : [
			'Do you know da wae ?',
			'*Klucking noises*',
			'Queen',
			'She\'s our queen',
			'Spit on him bruthers',
		],
	},
	{
		img : 'indian.png',
		txt : [
			'Show bobs and vagene',
			'Open bobs plis',
			'My pinus stands when ur vision',
			'Hav seks with me',
			'Hey sexy',
			'Nice bobs',
			'Do milk',
		],
	},
	{
		img : 'julien.png',
		txt : [
			'It\'s free real estate',
			'Nice loli',
			'If her age is on the clock...',
			'REEEEEEEEEEEEEE',
			'Et sans transition... MES COUILLES !',
		],
	},
	{
		img : 'valer.png',
		txt : [
			'YAMERO',
			'Qu\'est-ce que je fous ici ?',
			'Julien arrête tes conneries plz',
			'Mais ptn',
			'Pourquoi je suis entouré de chats moi ?',
			'Hmmmmm...',
		],
	},
	{
		img : 'megumin.png',
		txt : [
			'Ravioli, ravioli, don\'t lewd me',
			'You deserve jail',
			'Hentai',
			'Baka !',
			'I\'m not getting the lööp for you, baka',
			'エクスプロージョン',
			'YAME... YAMEROOOO !!!',
			'Yamete kudasai',
		],
	}
];

const speechFont = '20px Arial';

const baseColors = {


}

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
};

let canvas, c, mouse;
let brotherImg = {};
let loopImg = {};

let collisions = false;
let brotherAmount, brotherSpeed, brotherSize;
let loopSize;
let sizeStep = 0.02;

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
	$( document ).on( 'click', '#button-reset-settings', resetSettings );
	$( document ).on( 'click', '#button-open-changelog', openChangelog );
	$( document ).on( 'click', '#button-close-changelog', closeChangelog );
	$( document ).on( 'input', '#brothers-number', updateBrotherNumber );
	$( document ).on( 'input', '#brothers-speed', updateBrotherSpeed );
	$( document ).on( 'input', '#brothers-size', updateBrotherSize );
	$( document ).on( 'input', '#loops-size', updateLoopSize );
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

	$( document ).on( 'resize', function( event ) {

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

	brotherImg = {

		id : document.getElementById( 'brother' ),
		w : brother.clientWidth,
		h : brother.clientHeight,
		ratio : brother.clientWidth / brother.clientHeight,
	}

	loopImg = {

		id : document.getElementById( 'loop' ),
		w : loop.clientWidth,
		h : loop.clientHeight,
		ratio : loop.clientWidth / loop.clientHeight,
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

	for ( i = 0; i < brotherAmount; i ++ ) { createBrother(); }
}

function animate() {

	c.clearRect( 0, 0, canvas.width, canvas.height );
	
	if ( true === running ) {		

		Object.keys( entities ).forEach( arrayKey => {

			entities[ arrayKey ].forEach( brother => { brother.update() } );
		} );
	}

	if ( undefined !== hoveredEntity ) {

		$( '#game-area' ).removeClass( 'hide-cursor' );

	} else {

		c.drawImage( loopImg.id, mouse.x - ( 40 * loopImg.ratio ) / 2, mouse.y - 20, 40 * loopImg.ratio, 40 );
		$( '#game-area' ).addClass( 'hide-cursor' );
	}

	if ( true === colorChanging ) changeColor();
	
	requestAnimationFrame( animate );
}

function start() {
	
	init();

	running = true;

	$( '#button-start-stop' ).html( 'STOP' );
}

function stop() {

	running = false;

	c.clearRect( 0, 0, canvas.width, canvas.height );

	$( '#button-start-stop' ).html( 'START' );
}

function resetSettings() {

	$( '.cb-checkbox' ).add( '.trackbar' ).each( ( i, input ) => {

		let defaultVal = $( input ).data( 'default' );

		if ( true === defaultVal || false === defaultVal ) {

			$( input ).prop( 'checked', defaultVal );

		} else {

			$( input ).val( defaultVal );
		}
	} );

	updateSettingsValues();
}

function updateSettingsValues() {

	updateBrotherNumber();
	updateBrotherSpeed();
	updateBrotherSize();
	updateLoopSize();
	updateColorSpeed();
	updateCollisions();
	updateRGB();
}

function createBrother( x = undefined, y = undefined ) {

	let newBrother = new Brother( x, y, brotherImg.w, brotherImg.h );

	if ( undefined === x && undefined === y ) {

		let xmin = newBrother.getW() / 2;
		let xmax = canvas.width - newBrother.getW();
		let ymin = newBrother.getH() / 2;
		let ymax = canvas.height - newBrother.getH();

		newBrother.setX( randInRange( xmin, xmax ) );
		newBrother.setY( randInRange( ymin, ymax ) );
		let errorCounter = 0;

		for ( j = 0; j < entities.brothers.length; j ++ ) {

			newBrother.setX( randInRange( xmin, xmax ) );
			newBrother.setY( randInRange( ymin, ymax ) );

			if ( detectCollision( newBrother, entities.brothers[j] ) ) {

				j = -1;
				errorCounter ++;
			}

			if ( 100 < errorCounter ) return;
		}
	}

	entities.brothers.push( newBrother );
}

function createLoop() {

	let newLoop = new Loop( mouse.x, mouse.y, loopImg.w, loopImg.h );
	let loopID = entities.loops.length;

	entities.loops.push( newLoop );

	entities.brothers.forEach( brother => {

		if ( undefined === brother.getObjective() ) brother.setObjective( loopID );
	} );
}

function deleteLoop( loopID ) {

	entities.loops.splice( loopID, 1 );
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

	const velocityDiffX = entity1.velocity.x - entity2.velocity.x;
	const velocityDiffY = entity1.velocity.y - entity2.velocity.y;

	const distX = entity2.x - entity1.x;
	const distY = entity2.y - entity1.y;

	if ( 0 <= velocityDiffX * distX + velocityDiffY * distY ) {

		const angle = Math.atan2( distY, distX ) * -1;

		const m1 = entity1.getMass();
		const m2 = entity2.getMass();

		const u1 = rotate( entity1.getVelocity(), angle );
		const u2 = rotate( entity2.getVelocity(), angle );

		const v1 = {  x : u1.x * ( m1 - m2 ) / ( m1 + m2 ) + u2.x * 2 * m2 / ( m1 + m2 ), y : u1.y }
		const v2 = {  x : u2.x * ( m1 - m2 ) / ( m1 + m2 ) + u1.x * 2 * m2 / ( m1 + m2 ), y : u2.y }
	
		const finalV1 = rotate( v1, angle * -1 );
		const finalV2 = rotate( v2, angle * -1 );

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

function updateBrotherNumber() {

	let oldAmount = brotherAmount;

	brotherAmount = $( '#brothers-number' ).val() - 0;

	if ( 0 === entities.brothers.length ) return;

	let diff = brotherAmount - oldAmount;

	if ( 0 < diff ) {

		for ( i = entities.brothers.length; i < brotherAmount; i ++ ) { createBrother(); }
	
	} else {

		if ( entities.brothers.length <= brotherAmount ) return;

		entities.brothers.splice( brotherAmount );
	}	
}

function updateBrotherSpeed() {

	brotherSpeed = $( '#brothers-speed' ).val() - 0;

	if ( 0 === entities.brothers.length ) return;

	entities.brothers.forEach( brother => { brother.setSpeed( brotherSpeed ) } );
}

function updateBrotherSize() {

	brotherSize = $( '#brothers-size' ).val() * sizeStep;

	if ( 0 === entities.brothers.length ) return;

	entities.brothers.forEach( brother => { brother.setSize( brotherSize ) } );
}

function updateLoopSize() {

	loopSize = $( '#loops-size' ).val() * sizeStep;

	if ( 0 === entities.loops.length ) return;

	entities.loops.forEach( loop => { loop.setSize( loopSize ) } );
}

function updateCollisions() {

	collisions = $( '#cb-collisions' ).prop( 'checked' );
}

function updateColorSpeed() {

	colorSpeed = $( '#color-speed' ).val() - 0
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

	for ( i = 0; i < colorArray.length; i ++ ) { colorArray[i] = Math.max( Math.min( colorArray[i], 255 ), 0 ) }

	color.R = colorArray[0];
	color.G = colorArray[1];
	color.B = colorArray[2];

	updateColor();
}

function updateColor() {

	let colorString = 'rgb(' + color.R + ',' + color.G + ',' + color.B + ')';

	$( '*' ).css( { color : colorString } );
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