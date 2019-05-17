let frames = 0;
setInterval(function () {
	document.getElementById('fps').innerHTML = frames;
	frames = 0;
}, 1000);

let rgbRule;

(function (fn) {
	if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
	    fn();
	} else {
	    document.on('DOMContentLoaded', fn, { once: true });
	}
})(async function () {
	for (let styleSheet of document.styleSheets) {
		for (let rule of styleSheet.cssRules) {
			if (rule.selectorText === '.rgb') {
				rgbRule = rule;
			}
		}
	}
	generateChangelog();

	['label', 'text-info', 'button', 'changelog-wrapper'].forEach(className => {
		[...document.getElementsByClassName(className)].forEach(el => {
			el.classList.add('rgb');
		});
	});

	PARAMS.canvas = document.getElementById('game-area');
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

	document.getElementById('button-start-stop').on('click', () => { PARAMS.running ? stop() : start() });
	document.getElementById('button-reset').on('click', reset);
	document.getElementById('button-reset-settings').on('click', resetSettings);
	document.getElementById('button-open-changelog').on('click', toggleChangelog.bind(null, true));
	document.getElementById('button-close-changelog').on('click', toggleChangelog.bind(null, false));
	document.getElementById('hunters-growth').on('input', updateHunterGrowth);
	document.getElementById('hunters-speed').on('input', updateHunterSpeed);
	document.getElementById('preys-size').on('input', updatePreySize);
	document.getElementById('color-speed').on('input', updateColorSpeed);
	document.getElementById('cb-collisions').on('input', updateCollisions);
	document.getElementById('cb-mute').on('input', updateMute);
	document.getElementById('cb-rgb').on('input', updateRGB);
	[...document.getElementsByClassName('change-species')].forEach(speciesModifier => {
		speciesModifier.on('change', updateSpecies);
	});

	document.getElementById('game-area').on('mousedown', mouseDown);
	document.getElementById('game-area').on('mouseup', mouseUp);
	document.getElementById('game-area').on('click', () => {
		if (PARAMS.hovered) {
			return;
		}
		let newPrey = new Prey(PREY.species, {
			x: PARAMS.mouse.x,
			y: PARAMS.mouse.y,
			img: PREY.img,
			size: PREY.size,
			nutrition: PREY.nutrition,
		});
	});

	await nextTick();

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

	let availableAudios = [...document.getElementsByTagName('audio')]
		.filter(audio => SPECIES[HUNTER.species].sounds.includes(audio.id));
	Hunter.player.load(availableAudios);

	let newHunter = new Hunter(HUNTER.species, {
		x: PARAMS.canvas.width / 2,
		y: PARAMS.canvas.height / 2,
		img: document.getElementById(HUNTER.species),
		size: HUNTER.sizeMin,
		speed: HUNTER.speed,
	});
}

function animate() {
	frames ++;
	PARAMS.c.clearRect(0, 0, PARAMS.canvas.width, PARAMS.canvas.height);
	PARAMS.c.font = PARAMS.font;

	updateEntities([...HUNTERS.values()]);
	updateEntities([...PREYS.values()]);

	// Draw loops cursor if no entity is hovered
	if (PARAMS.hovered) {
		if (PARAMS.cursorHidden) {
			document.getElementById('game-area').classList.remove('hide-cursor');
			PARAMS.cursorHidden = false;
		}
	} else {
		PARAMS.c.drawImage(
			PREY.img,
			PARAMS.mouse.x - (40 * PREY.img.clientWidth / PREY.img.clientHeight) / 2,
			PARAMS.mouse.y - 20,
			40 * PREY.img.clientWidth / PREY.img.clientHeight,
			40,
		);
		if (! PARAMS.cursorHidden) {
			document.getElementById('game-area').classList.add('hide-cursor');
			PARAMS.cursorHidden = true;
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

		rgbRule.style.color = '#' + PARAMS.color.map(color => color.toString(16).padStart(2, '0')).join('');
	}
	// Update hunters and preys amount and progress
	if (HUNTERS.size != document.getElementById('hunters-number').innerHTML) {
		document.getElementById('hunters-number').innerHTML = HUNTERS.size;
		document.getElementById('hunters-progress').style.width = Math.min(HUNTERS.size / HUNTER.maxAmount * 100, 100) + '%';
	}
	if (PREYS.size != document.getElementById('preys-number').innerHTML) {
		document.getElementById('preys-number').innerHTML = PREYS.size;
		document.getElementById('preys-progress').style.width = Math.min(PREYS.size / PREY.maxAmount * 100, 100) + '%';
	}
	requestAnimationFrame(animate);
}

function start() {
	PARAMS.running = true;
	const btn = document.getElementById('button-start-stop');

	btn.classList.remove('start');
	btn.classList.add('stop');
	btn.innerHTML = "STOP";
}

function stop() {
	PARAMS.running = false;
	const btn = document.getElementById('button-start-stop');

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
	['cb-checkbox', 'trackbar', 'select'].forEach(className => {
		[...document.getElementsByClassName(className)].forEach(el => {
			let defaultVal = el.dataset['default'];
			switch (el.type) {
				case 'checkbox':
					el.checked = defaultVal === 'true';
					break;
				default:
					el.value = defaultVal;
					break;
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
	updateMute();
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
	HUNTER.growth = parseInt(document.getElementById('hunters-growth').value);
}

function updateHunterSpeed() {
	HUNTER.speed = parseInt(document.getElementById('hunters-speed').value);
}

function updatePreySize() {
	PREY.size = parseInt(document.getElementById('preys-size').value) / 100;
	PREY.nutrition = PREY.size;
}

function updateCollisions() {
	PARAMS.collisions = document.getElementById('cb-collisions').checked;
}

function updateMute() {
	PARAMS.mute = document.getElementById('cb-mute').checked;
	Hunter.player.mute(PARAMS.mute);
}

function updateColorSpeed() {
	PARAMS.colorSpeed = parseInt(document.getElementById('color-speed').value);
}

function updateRGB() {
	PARAMS.colorChanging = document.getElementById('cb-rgb').checked;

	if (! document.getElementById('cb-rgb').checked) {
		rgbRule.style.color = '';
	}
}

function resetEntities() {
	PARAMS.hovered = null;
	HUNTERS.forEach(hunter => {
		hunter.remove();
	});
	PREYS.forEach(prey => {
		prey.remove();
	});
}

function generateChangelog() {
	let versionItems = [];

	Object.keys(CHANGELOG).forEach(version => {
		let versionTag = document.createElement('div');
		versionTag.classList.add('version-title');
		versionTag.innerHTML = version;

		let versionItemsList = document.createElement('ul');
		CHANGELOG[version].forEach(item => {
			let li = document.createElement('li');
			li.innerHTML = item;
			versionItemsList.append(li);
		});
		
		document.getElementById('changelog-items').append(versionTag);
		document.getElementById('changelog-items').append(document.createElement('hr'));
		document.getElementById('changelog-items').append(versionItemsList);
	});
}

function toggleChangelog(state) {
	PARAMS.changelogVisible = state;

	document.getElementsByClassName('wrapper')[0].style.opacity = state ? 0.2 : 1;
	document.getElementById('changelog').style.display = state ? 'block' : 'none';

}

function updateSpecies() {
	HUNTER.species = document.querySelector('input[name="hunters-species"]:checked').value;
	PREY.species = document.querySelector('input[name="preys-species"]:checked').value;
	PREY.img = document.getElementById(PREY.species);
}
