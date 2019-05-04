import { HUNTER, PREY, PARAMS } from '/src/js/config.js';
import { Hunter, MAP as HUNTERS } from '/src/js/classes/Hunter.js';
import { Prey, MAP as PREYS } from '/src/js/classes/Prey.js';
import Changelog from '/changelog.js';

let frames = 0;
setInterval(function () {
	DOM.get('fps').innerHTML = frames;
	frames = 0;
}, 1000);

const rgbDOM = [];

window.entities = () => [...HUNTERS.values()].concat([...PREYS.values()]);
window.
window.DOM = new Map();
window.PARAMS = PARAMS;

onReady(function () {

	$('*').forEach(el => {
		if (el.id) {
			DOM.set(el.id, el);
		}
		if (! el.children.length && el.innerHTML !== '') {
			rgbDOM.push(el);
		}
	});

	PARAMS.canvas = DOM.get('game-area');
	PARAMS.c = PARAMS.canvas.getContext('2d');

	PARAMS.canvas.width = PARAMS.canvas.offsetWidth;
	PARAMS.canvas.height = PARAMS.canvas.offsetHeight;

	PARAMS.mouse = {
		x: PARAMS.canvas.width / 2,
		y: PARAMS.canvas.height / 2,
	};

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
	DOM.get('button-open-changelog').on('click', toggleChangelog.bind(null, true));
	DOM.get('button-close-changelog').on('click', toggleChangelog.bind(null, false));
	DOM.get('hunters-growth').on('input', updateHunterGrowth);
	DOM.get('hunters-speed').on('input', updateHunterSpeed);
	DOM.get('preys-size').on('input', updatePreySize);
	DOM.get('color-speed').on('input', updateColorSpeed);
	DOM.get('cb-collisions').on('input', updateCollisions);
	DOM.get('cb-rgb').on('input', updateRGB);
	$('.change-species').forEach(speciesModifier => {
		speciesModifier.on('change', updateSpecies);
	});

	DOM.get('game-area').on('mousedown', mouseDown);
	DOM.get('game-area').on('mouseup', mouseUp);
	DOM.get('game-area').on('click', () => {
		if (PARAMS.hovered) {
			return;
		}
		let newPrey = new Prey(PREY.species, {
			x: PARAMS.mouse.x,
			y: PARAMS.mouse.y,
			size: PREY.size,
			nutrition: PREY.nutrition,
		});
	});

	generateChangelog();

	init();
	animate();
});

document.on('keydown', function (ev) {
	// ev.preventDefault();
	// console.log(ev.keyCode);

	switch (ev.keyCode) {
		case 27 :	// Esc
			if (PARAMS.changelogVisible) {
				toggleChangelog(false);
			}
			break;
		case 82 : 	// R
			resetSettings();
			break;
		case 112 :	// F1
			ev.preventDefault();
			toggleChangelog(! PARAMS.changelogVisible);
			break;
	}
});

function init() {
	resetEntities();
	updateSettingsValues();

	let newHunter = new Hunter(HUNTER.species, {
		x: PARAMS.canvas.width / 2,
		y: PARAMS.canvas.height / 2,
		size: HUNTER.sizeMin,
		speed: HUNTER.speed,
	});
}

function animate() {
	frames ++;
	PARAMS.c.clearRect(0, 0, PARAMS.canvas.width, PARAMS.canvas.height);
	PARAMS.c.font = PARAMS.font;

	entities()
		.sort((a, b) => a.zid > b.zid)
		.forEach(entity => {
			entity.update();
		});

	// Draw loops cursor if no entity is hovered
	if (PARAMS.hovered) {
		if (DOM.get('game-area').classList.contains('hide-cursor')) {
			DOM.get('game-area').classList.remove('hide-cursor');
		}
	} else {
		PARAMS.c.drawImage(
			PREY.img,
			PARAMS.mouse.x - (40 * PREY.img.clientWidth / PREY.img.clientHeight) / 2,
			PARAMS.mouse.y - 20,
			40 * PREY.img.clientWidth / PREY.img.clientHeight,
			40,
		);
		if (! DOM.get('game-area').classList.contains('hide-cursor')) {
			DOM.get('game-area').classList.add('hide-cursor');
		}
	}
	// Update colors if colorChanging is activated
	if (PARAMS.colorChanging) {
		PARAMS.color[PARAMS.colorPtr % 3] = Math.max(Math.min(PARAMS.color[PARAMS.colorPtr % 3] + PARAMS.colorSpeed * PARAMS.colorMult, 255), 0);
		if ((PARAMS.colorMult > 0 && PARAMS.color[PARAMS.colorPtr % 3] == 255) ||
			(PARAMS.colorMult < 0 && PARAMS.color[PARAMS.colorPtr % 3] == 0)) {
			PARAMS.colorPtr ++;
			PARAMS.colorMult *= -1;
		}

		let hexColor = '#' + PARAMS.color.map(color => color.toString(16).padStart(2, '0')).join('');
		rgbDOM.forEach(el => {
			el.style.color = hexColor;
		});
	}
	// Update hunters and preys amount and progress
	if (HUNTERS.size != DOM.get('hunters-number').innerHTML) {
		DOM.get('hunters-number').innerHTML = HUNTERS.size;
		DOM.get('hunters-progress').style.width = Math.min(HUNTERS.size / HUNTER.maxAmount * 100, 100) + '%';
	}
	if (PREYS.size != DOM.get('preys-number').innerHTML) {
		DOM.get('preys-number').innerHTML = PREYS.size;
		DOM.get('preys-progress').style.width = Math.min(PREYS.size / PREY.maxAmount * 100, 100) + '%';
	}
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
	btn.classList.add('start');
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
		$(selector).forEach(el => {
			let defaultVal = el.dataset['default'];

			if (typeof defaultVal === 'boolean') {
				el.checked = defaultVal;
			} else {
				el.value = defaultVal;
			}
		});
	});

	updateSettingsValues();
}

function updateSettingsValues() {
	updateHunterGrowth();
	updateHunterSpeed();
	updatePreySize();
	updateSpecies();
	updateColorSpeed();
	updateCollisions();
	updateRGB();
}

function mouseDown() {
	if (PARAMS.hovered) {
		PARAMS.hovered.startDragging();
	}
}

function mouseUp() {
	if (PARAMS.hovered && PARAMS.hovered.dragging) {
		PARAMS.hovered.stopDragging();
	}
}

function updateHunterGrowth() {
	HUNTER.growth = parseInt(DOM.get('hunters-growth').value);
}

function updateHunterSpeed() {
	HUNTER.speed = parseInt(DOM.get('hunters-speed').value);
}

function updatePreySize() {
	PREY.size = parseInt(DOM.get('preys-size').value) / 100;
	PREY.nutrition = PREY.size;
}

function updateCollisions() {
	PARAMS.collisions = DOM.get('cb-collisions').checked;
}

function updateColorSpeed() {
	PARAMS.colorSpeed = parseInt(DOM.get('color-speed').value);
}

function updateRGB() {
	PARAMS.colorChanging = DOM.get('cb-rgb').checked;

	if (! DOM.get('cb-rgb').checked) {
		rgbDOM.forEach(el => {
			el.style.color = null;
		});
	}
}

function resetEntities() {
	PARAMS.hovered = null;
	HUNTERS.clear();
	PREYS.clear();
}

function generateChangelog() {
	let versionItems = [];

	Object.keys(Changelog).forEach(version => {
		let versionTag = document.createElement('div');
		versionTag.classList.add('version-title');
		versionTag.innerHTML = version;

		let versionItemsList = document.createElement('ul');
		Changelog[version].forEach(item => {
			let li = document.createElement('li');
			li.innerHTML = item;
			versionItemsList.append(li);
		});
		
		DOM.get('changelog-items').append(versionTag);
		DOM.get('changelog-items').append(document.createElement('hr'));
		DOM.get('changelog-items').append(versionItemsList);
	});
}

function toggleChangelog(state) {
	PARAMS.changelogVisible = state;

	$('.wrapper').style.opacity = state ? 0.2 : 1;
	DOM.get('changelog').style.display = state ? 'block' : 'none';

}

function updateSpecies() {
	HUNTER.species = $('input[name="hunters-species"]:checked').value;
	PREY.species = $('input[name="preys-species"]:checked').value;
	PREY.img = DOM.get(PREY.species);
}
