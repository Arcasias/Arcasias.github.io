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

	document.on('mousewheel', function (ev) {
		let up = ev.deltaY < 0;

		updateOptions({
			el: 'preys-size',
			setValue: PARAMS.preySize + 5 * (up ? 1 : -1),
			param: 'preySize',
		});
	});

	window.on('resize', function () {
		PARAMS.canvas.width = PARAMS.canvas.offsetWidth;
		PARAMS.canvas.height = PARAMS.canvas.offsetHeight;

		init();
	});

	document.getElementById('button-start-stop').on('click', () => { toggleStart(! PARAMS.running) });
	document.getElementById('button-reset').on('click', reset);
	document.getElementById('button-reset-settings').on('click', resetSettings);
	document.getElementById('button-open-changelog').on('click', toggleChangelog.bind(null, true));
	document.getElementById('button-close-changelog').on('click', toggleChangelog.bind(null, false));
	document.getElementById('preys-size').on('input', updateOptions);
	document.getElementById('color-speed').on('input', updateColorSpeed);
	document.getElementById('cb-collisions').on('input', updateCollisions);
	document.getElementById('cb-cannibalism').on('input', updateCannibalism);
	document.getElementById('cb-mute').on('input', updateMute);
	document.getElementById('cb-rgb').on('input', updateRGB);
	[...document.getElementsByClassName('change-species')].forEach(speciesModifier => {
		speciesModifier.on('change', updateSpecies);
	});

	document.getElementById('game-area').on('mousedown', onMouseDown);
	document.on('mouseup', onMouseUp);
	document.getElementById('game-area').on('click', () => {
		if (PARAMS.hovered) {
			return;
		}
		let newPrey = new Prey(PARAMS.preySpecies, {
			x: PARAMS.mouse.x,
			y: PARAMS.mouse.y,
			img: PARAMS.preyImg,
			size: PARAMS.preySize,
		});
	});

	await nextTick();

	resetSettings();
	init();
	animate();
});

document.on('keydown', function (ev) {
	// ev.preventDefault();
	// console.log(ev.keyCode);
	let preventKeys = [27, 32, 77, 82, 112];
	if (preventKeys.includes(ev.keyCode)) {
		ev.preventDefault();
	}
	switch (ev.keyCode) {
		case 27:	// Esc
			if (PARAMS.changelogVisible) {
				toggleChangelog(false);
			}
			break;
		case 32: 	// Spacebar
			toggleStart(! PARAMS.running)
			break;
		case 77: 	// M
			updateMute(true);
			break;
		case 82: 	// R
			resetSettings();
			break;
		case 112:	// F1
			ev.preventDefault();
			toggleChangelog(! PARAMS.changelogVisible);
			break;
	}
});

function init() {
	resetEntities();
	console.log(PARAMS);

	let availableAudios = [...document.getElementsByTagName('audio')]
		.filter(audio => SPECIES[PARAMS.hunterSpecies].sounds.includes(audio.id));
	Hunter.player.load(availableAudios);

	let newHunter = new Hunter(PARAMS.hunterSpecies, {
		x: PARAMS.canvas.width / 2,
		y: PARAMS.canvas.height / 2,
		img: PARAMS.hunterImg,
		size: PARAMS.hunterSizeMin,
		speed: 3,
	});
}

function animate() {
	frames ++;
	PARAMS.c.clearRect(0, 0, PARAMS.canvas.width, PARAMS.canvas.height);
	PARAMS.c.font = PARAMS.font;

	let entities = [...HUNTERS.values()].concat([...PREYS.values()]);
	entities.sort((a, b) => a.zid - b.zid)
	    .forEach(entity => {
	        entity.update();
	    });

	// Draw loops cursor if no entity is hovered
	if (PARAMS.hovered) {
		if (PARAMS.cursorHidden) {
			document.getElementById('game-area').classList.remove('hide-cursor');
			PARAMS.cursorHidden = false;
		}
	} else {
		let width = PARAMS.preyImg.clientWidth * PARAMS.preySize;
		let height = PARAMS.preyImg.clientWidth * PARAMS.preySize;
		PARAMS.c.drawImage(PARAMS.preyImg, PARAMS.mouse.x - width / 2, PARAMS.mouse.y - height / 2, width, height);
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
		document.getElementById('hunters-progress').style.width = Math.min(HUNTERS.size / PARAMS.hunterMaxAmount * 100, 100) + '%';
	}
	if (PREYS.size != document.getElementById('preys-number').innerHTML) {
		document.getElementById('preys-number').innerHTML = PREYS.size;
		document.getElementById('preys-progress').style.width = Math.min(PREYS.size / PARAMS.preyMaxAmount * 100, 100) + '%';
	}
	// Update status text
	if (PARAMS.hovered) {
		document.getElementsByClassName('status')[0].style.opacity = 1;
		document.getElementById('status-id').innerHTML = PARAMS.hovered.id;
		document.getElementById('status-species').innerHTML = PARAMS.hovered.species;
		document.getElementById('status-size').innerHTML = PARAMS.hovered.size;
		if (PARAMS.hovered.mood) {
			document.getElementById('status-mood').innerHTML = `${PARAMS.hovered._mood} (${PARAMS.hovered.mood})`;
			document.getElementById('status-mood').parentNode.style.opacity = 1;
		} else {
			document.getElementById('status-mood').parentNode.style.opacity = 0;
		}
	} else {
		document.getElementsByClassName('status')[0].style.opacity = 0;
	}
	requestAnimationFrame(animate);
}

function toggleStart(start=true) {
	PARAMS.running = start;
	const btn = document.getElementById('button-start-stop');

	btn.classList.remove(start ? 'start' : 'stop');
	btn.classList.add(start ? 'stop' : 'start');
	btn.innerHTML = start ? "STOP" : "START";
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
	updateOptions([
		{	
			el: 'preys-size',
			param: 'size',
		},
		{		
			el: 'cb-collisions',
			param: 'collisions',
		},
		{		
			el: 'cb-cannibalism',
			param: 'cannibalism',
		},
		{		
			el: 'cb-mute',
			param: 'mute',
		},
		{		
			el: 'color-speed',
			param: 'colorSpeed',
		},
		{		
			el: 'cb-rgb',
			param: 'colorChanging',
		},
		
	]);
	Hunter.player.mute(PARAMS.mute);
}

function onMouseDown() {
	if (PARAMS.hovered) {
		PARAMS.hovered.startDragging();
	}
}

function onMouseUp() {
	if (PARAMS.hovered && PARAMS.hovered.dragging) {
		PARAMS.hovered.stopDragging();
	}
}

// TODO gather all update...() into this
function updateOptions(option) {
	let options = Array.isArray(option) ? option : [option];
	options.forEach(opt => {
		let el = opt.target || document.getElementById(opt.el);
		let property = el.type === 'checkbox' ? 'checked' : 'value';
		if (opt.setValue) {
			el[property] = setValue;
		}
		PARAMS[opt.param] = el[property];
	});
}

function updatePreySize(setValue) {
	return updateOptions({
		el: 'preys-size',
		setValue: setValue,
		param: 'size',
	});
}

function updateCollisions(setValue) {
	return updateOptions({
		el: 'cb-collisions',
		setValue: setValue,
		param: 'collisions',
	});
}

function updateCannibalism(setValue) {
	return updateOptions({
		el: 'cb-cannibalism',
		setValue: setValue,
		param: 'cannibalism',
	});
}

function updateMute(setValue) {
	return updateOptions({
		el: 'cb-mute',
		setValue: setValue,
		param: 'mute',
	});
	Hunter.player.mute(PARAMS.mute);
}

function updateColorSpeed(setValue) {
	return updateOptions({
		el: 'color-speed',
		setValue: setValue,
		param: 'colorSpeed',
	});
}

function updateRGB(setValue) {
	return updateOptions({
		el: 'cb-rgb',
		setValue: setValue,
		param: 'colorChanging',
	});
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
	PARAMS.hunterSpecies = document.querySelector('input[name="hunters-species"]:checked').value;
	PARAMS.hunterImg = document.getElementById(PARAMS.hunterSpecies);
	PARAMS.preySpecies = document.querySelector('input[name="preys-species"]:checked').value;
	PARAMS.preyImg = document.getElementById(PARAMS.preySpecies);
}
