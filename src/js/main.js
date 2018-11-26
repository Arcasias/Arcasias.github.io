import { BROTHER, DOM, LOOP, PARAMS, ENTITIES } from './config.js';
import Entity from './Entity.js';
import Brother from './Brother.js';
import Loop from './Loop.js';

let frames = 0;
setInterval(function () {
	DOM.get('fps').innerHTML = frames;
	frames = 0;
}, 1000);

whenReady(function () {

	[].slice.call(document.querySelectorAll('*'))
		.filter(el => el.id)
		.forEach(el => {
			DOM.set(el.id, el);
		});

	PARAMS.canvas = DOM.get('game-area');
	PARAMS.c = PARAMS.canvas.getContext('2d');

	PARAMS.canvas.width = PARAMS.canvas.offsetWidth;
	PARAMS.canvas.height = PARAMS.canvas.offsetHeight;

	PARAMS.mouse = {
		x : PARAMS.canvas.width / 2,
		y : PARAMS.canvas.height / 2,
	}

	document.on('mousemove', function (ev) {
		PARAMS.mouse.x = ev.clientX - PARAMS.canvas.offsetLeft;
		PARAMS.mouse.y = ev.clientY - PARAMS.canvas.offsetTop;
	});

	window.on('resize', function () {
		PARAMS.canvas.width = PARAMS.canvas.offsetWidth;
		PARAMS.canvas.height = PARAMS.canvas.offsetHeight;

		init();
	});

	DOM.get('button-start-stop').on('click', () => { PARAMS.running ? stop() : start() });
	DOM.get('button-reset').on('click', reset);
	DOM.get('button-reset-settings').on('click', resetSettings);
	DOM.get('button-open-changelog').on('click', openChangelog);
	DOM.get('button-close-changelog').on('click', closeChangelog);
	DOM.get('brothers-growth').on('input', updateBrotherGrowth);
	DOM.get('brothers-speed').on('input', updateBrotherSpeed);
	DOM.get('loops-size').on('input', updateLoopSize);
	DOM.get('color-speed').on('input', updateColorSpeed);
	DOM.get('cb-collisions').on('input', updateCollisions);
	DOM.get('cb-rgb').on('input', updateRGB);
	$('.change-look').on('change', updateLook);

	DOM.get('game-area').on('mousedown', mouseDown);
	DOM.get('game-area').on('mouseup', mouseUp);
	DOM.get('game-area').on('click', () => {
		if (ENTITIES.hovered) {
			return;
		}
		createLoop(PARAMS.mouse.x, PARAMS.mouse.y);
	});

	init();
	animate();
});

document.on('keydown', function (ev) {
	// ev.preventDefault();
	// console.log(ev.keyCode);

	switch (ev.keyCode) {
		case 27 :	// Esc
			if (PARAMS.changelogVisible) {
				closeChangelog();
			}
			break;
		case 82 : 	// R
			resetSettings();
			break;
		case 112 :	// F1
			ev.preventDefault();
			PARAMS.changelogVisible ? closeChangelog() : openChangelog();
			break;
	}
});

function init() {
	ENTITIES.brothers = [];
	ENTITIES.loops = [];
	ENTITIES.hovered = null;

	updateSettingsValues();
	createBrother();
}

function animate() {
	frames ++;
	PARAMS.c.clearRect(0, 0, PARAMS.canvas.width, PARAMS.canvas.height);

	ENTITIES.brothers.forEach(brother => {
		brother.update();
	});
	ENTITIES.loops.forEach(loop => {
		loop.update();
	});

	if (ENTITIES.hovered) {
		DOM.get('game-area').classList.remove('hide-cursor');
	} else {
		PARAMS.c.drawImage(
			LOOP.img,
			PARAMS.mouse.x - (40 * LOOP.img.clientWidth / LOOP.img.clientHeight) / 2,
			PARAMS.mouse.y - 20, 40 * LOOP.img.clientWidth / LOOP.img.clientHeight,
			40,
		);
		DOM.get('game-area').classList.add('hide-cursor');
	}

	if (PARAMS.colorChanging) {
		changeColor();
	}

	updateBrotherStats();
	requestAnimationFrame(animate);
}

function start() {
	PARAMS.running = true;
	const btn = DOM.get('button-start-stop');

	btn.classList.remove('start');
	btn.classList.add('stop');
	btn.innerHTML = "STOP";
}

function stop() {
	PARAMS.running = false;
	const btn = DOM.get('button-start-stop');

	btn.classList.remove('stop');
	btn.classList.add('start')
	btn.innerHTML = "START";
}

function reset() {
	if (PARAMS.running) {
		stop();
	}
	init();
}

function resetSettings() {
	['.cb-checkbox', '.trackbar', '.select'].forEach(selector => {
		let defaultVal = $(selector).dataset['default'];

		if (typeof defaultVal === 'boolean') {
			$(selector).checked = defaultVal;
		} else {
			$(selector).value = defaultVal;
		}
	});

	updateSettingsValues();
}

function updateSettingsValues() {
	updateBrotherGrowth();
	updateBrotherSpeed();
	updateLoopSize();
	updateLook();
	updateColorSpeed();
	updateCollisions();
	updateRGB();
	console.log({ PARAMS, LOOP, BROTHER })
}

function createBrother(x, y) {
	let options = {
		x: x || PARAMS.canvas.width / 2,
		y: y || PARAMS.canvas.height / 2,
		size: BROTHER.sizeMin,
		speed: BROTHER.speed,
		speech: BROTHER.speech,
	}
	let newBrother = new Brother(BROTHER.type, options);

	ENTITIES.brothers.push(newBrother);
}

function createLoop(x, y) {
	let options = { x, y,
		size: LOOP.size,
		nutrition: LOOP.nutrition,
	};
	let newLoop = new Loop(LOOP.type, options);

	ENTITIES.loops.push(newLoop);
}

function mouseDown() {
	if (ENTITIES.hovered) {
		ENTITIES.hovered.startDragging();
	}
}

function mouseUp() {
	if (ENTITIES.hovered && ENTITIES.hovered.dragging) {
		ENTITIES.hovered.stopDragging();
	}
}

function updateBrotherGrowth() {
	BROTHER.growth = parseInt(DOM.get('brothers-growth').value);
}

function updateBrotherSpeed() {
	BROTHER.speed = parseInt(DOM.get('brothers-speed').value);

	if (! ENTITIES.brothers.length) {
		return;
	}
	ENTITIES.brothers.forEach(brother => {
		brother.speed = BROTHER.speed;
	});
}

function updateLoopSize() {
	LOOP.size = parseInt(DOM.get('loops-size').value) / 100;
	LOOP.nutrition = LOOP.size;
}

function updateCollisions() {
	PARAMS.collisions = DOM.get('cb-collisions').checked;
}

function updateColorSpeed() {
	PARAMS.colorSpeed = parseInt(DOM.get('color-speed').value);
}

function updateBrotherStats() {
	DOM.get('brothers-number').innerHTML = ENTITIES.brothers.length == BROTHER.maxAmount ? 'MAX' : ENTITIES.brothers.length;
	DOM.get('brothers-progress').style.width = Math.min(ENTITIES.brothers.length / BROTHER.maxAmount * 100, 100) + '%';
}

function updateRGB() {
	let colorChanging = DOM.get('cb-rgb').checked;

	PARAMS.colorChanging = colorChanging;

	if (! colorChanging) {
		$('*').style.color = null;
	}
}

function changeColor() {
	let colorArray = [
		PARAMS.color.R,
		PARAMS.color.G,
		PARAMS.color.B,
	];
	let nextColor = (PARAMS.currentColor + 1) % 3;

	if (PARAMS.filling) {
		colorArray[nextColor] < 255 ? colorArray[nextColor] += PARAMS.colorSpeed : PARAMS.filling = false;
	} else {
		if (0 < colorArray[PARAMS.currentColor]) {
			colorArray[PARAMS.currentColor] -= PARAMS.colorSpeed;
		} else {
			PARAMS.filling = false;
			PARAMS.currentColor = nextColor;
		}
	}
	for (let i = 0; i < colorArray.length; i ++) {
		colorArray[i] = Math.max(Math.min(colorArray[i], 255), 0);
	}
	PARAMS.color.R = colorArray[0];
	PARAMS.color.G = colorArray[1];
	PARAMS.color.B = colorArray[2];

	updateColor();
}

function updateColor() {
	$('*').style.color = '#' + toHex(PARAMS.color.R) + toHex(PARAMS.color.G) + toHex(PARAMS.color.B);
}

function openChangelog() {
	PARAMS.changelogVisible = true;

	$('.wrapper').eachChild(child => {
		child.style.opacity = 0.2;
	});
	DOM.get('changelog').style.opacity = 1;
	DOM.get('changelog').style.display = 'block';
}

function closeChangelog() {
	PARAMS.changelogVisible = false;

	$('.wrapper').eachChild(child => {
		child.style.opacity = 1;
	});
	DOM.get('changelog').style.opacity = 0;
	DOM.get('changelog').style.display = 'none';
}

function updateLook() {
	BROTHER.type = $('input[name="brother-look"]:checked').value;
	BROTHER.speech = BROTHER.type;
	LOOP.type = $('input[name="loops-look"]:checked').value;
	LOOP.img = DOM.get(LOOP.type);

	ENTITIES.brothers.forEach(brother => {
		brother.type = BROTHER.type;
		brother.speech = BROTHER.speech;
	});
}
