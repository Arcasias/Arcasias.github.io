let frames = 0;
let rgbRule;
let mousemoved = false;

const DEFAULTABLE_SETTINGS = ["cb-checkbox", "trackbar", "select"];
const RGB_TARGETS = ["label", "text-info", "button", "changelog-wrapper"];

setInterval(function () {
	document.getElementById("fps").innerHTML = frames;
	frames = 0;
}, 1000);

for (const styleSheet of document.styleSheets) {
	for (const rule of styleSheet.cssRules) {
		if (rule.selectorText === ".rgb") {
			rgbRule = rule;
		}
	}
}

generateChangelog();

for (const className of RGB_TARGETS) {
	for (const el of document.getElementsByClassName(className)) {
		el.classList.add("rgb");
	}
}

setTimeout(() => {
	PARAMS.canvas = document.getElementById("game-area");

	PARAMS.canvas.width = PARAMS.canvas.offsetWidth;
	PARAMS.canvas.height = PARAMS.canvas.offsetHeight;

	PARAMS.c = PARAMS.canvas.getContext("2d");

	PARAMS.mouse = {
		x: PARAMS.canvas.width / 2,
		y: PARAMS.canvas.height / 2,
	};

	resetSettings();
	init();
	animate();
});

on(document, "mousemove", function (ev) {
	if (mousemoved) {
		return;
	}
	mousemoved = new Promise(requestAnimationFrame).then(() => {
		mousemoved = false;
	});
	PARAMS.mouse.x = ev.clientX - PARAMS.canvas.offsetLeft;
	PARAMS.mouse.y = ev.clientY - PARAMS.canvas.offsetTop;
});

on(document, "mousewheel", function (ev) {
	const up = ev.deltaY < 0;
	updateOptions({
		el: "preys-size",
		setValue: PARAMS.preySize + 5 * (up ? 1 : -1),
		param: "preySize",
	});
});

on(window, "resize", function () {
	PARAMS.canvas.width = PARAMS.canvas.offsetWidth;
	PARAMS.canvas.height = PARAMS.canvas.offsetHeight;

	init();
});

on(document.getElementById("button-start-stop"), "click", () => toggleStart(!PARAMS.running));
on(document.getElementById("button-reset"), "click", reset);
on(document.getElementById("button-reset-settings"), "click", resetSettings);
on(document.getElementById("button-open-changelog"), "click", toggleChangelog.bind(null, true));
on(document.getElementById("button-close-changelog"), "click", toggleChangelog.bind(null, false));
on(document.getElementById("preys-size"), "input", updatePreySize);
on(document.getElementById("color-speed"), "input", updateColorSpeed);
on(document.getElementById("cb-collisions"), "input", updateCollisions);
on(document.getElementById("cb-cannibalism"), "input", updateCannibalism);
on(document.getElementById("cb-mute"), "input", updateMute);
on(document.getElementById("cb-rgb"), "input", updateRGB);
for (const speciesModifier of document.getElementsByClassName("change-species")) {
	on(speciesModifier, "change", updateSpecies);
}
on(document.getElementById("game-area"), "mousedown", onMouseDown);
on(document, "mouseup", onMouseUp);
on(document.getElementById("game-area"), "click", () => {
	if (PARAMS.hovered) {
		return;
	}
	new Prey(PARAMS.preySpecies, {
		x: PARAMS.mouse.x,
		y: PARAMS.mouse.y,
		img: PARAMS.preyImg,
		size: PARAMS.preySize,
	});
});

on(document, "keydown", function (ev) {
	const preventKeys = [27, 32, 77, 82, 112];
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
			toggleStart(!PARAMS.running);
			break;
		case 77: 	// M
			updateMute(true);
			break;
		case 82: 	// R
			resetSettings();
			break;
		case 112:	// F1
			ev.preventDefault();
			toggleChangelog(!PARAMS.changelogVisible);
			break;
	}
});

function init() {
	resetEntities();
	updateSpecies();

	const availableAudios = [...document.getElementsByTagName("audio")]
		.filter(audio => SPECIES[PARAMS.hunterSpecies].sounds.includes(audio.id));
	Hunter.player.load(availableAudios);

	new Hunter(PARAMS.hunterSpecies, {
		x: PARAMS.canvas.width / 2,
		y: PARAMS.canvas.height / 2,
		img: PARAMS.hunterImg,
		speed: 3,
	});
}

function animate() {
	frames++;
	PARAMS.c.clearRect(0, 0, PARAMS.canvas.width, PARAMS.canvas.height);
	PARAMS.c.font = PARAMS.font;

	const sortedEntities = [...HUNTERS.values(), ...PREYS.values()].sort((a, b) => a.zid - b.zid);
	for (const entity of sortedEntities) {
		entity.update();
	}


	// Draw loops cursor if no entity is hovered
	if (PARAMS.hovered) {
		if (PARAMS.cursorHidden) {
			document.getElementById("game-area").classList.remove("hide-cursor");
			PARAMS.cursorHidden = false;
		}
	} else {
		const width = PARAMS.preyImg.clientWidth * (PARAMS.preySize / 100);
		const height = PARAMS.preyImg.clientWidth * (PARAMS.preySize / 100);
		PARAMS.c.drawImage(PARAMS.preyImg, PARAMS.mouse.x - width / 2, PARAMS.mouse.y - height / 2, width, height);
		if (!PARAMS.cursorHidden) {
			document.getElementById("game-area").classList.add("hide-cursor");
			PARAMS.cursorHidden = true;
		}
	}
	// Update colors if colorChanging is activated
	if (PARAMS.colorChanging) {
		PARAMS.color[PARAMS.colorPtr % 3] = Math.max(Math.min(PARAMS.color[PARAMS.colorPtr % 3] + PARAMS.colorSpeed * PARAMS.colorMult, 255), 0);
		if ((PARAMS.colorMult > 0 && PARAMS.color[PARAMS.colorPtr % 3] == 255) ||
			(PARAMS.colorMult < 0 && PARAMS.color[PARAMS.colorPtr % 3] == 0)) {
			PARAMS.colorPtr++;
			PARAMS.colorMult *= -1;
		}

		rgbRule.style.color = "#" + PARAMS.color.map(color => color.toString(16).padStart(2, "0")).join("");
	}
	// Update hunters and preys amount and progress
	if (HUNTERS.size != document.getElementById("hunters-number").innerHTML) {
		document.getElementById("hunters-number").innerHTML = HUNTERS.size;
		document.getElementById("hunters-progress").style.width = Math.min(HUNTERS.size / PARAMS.hunterMaxAmount * 100, 100) + "%";
	}
	if (PREYS.size != document.getElementById("preys-number").innerHTML) {
		document.getElementById("preys-number").innerHTML = PREYS.size;
		document.getElementById("preys-progress").style.width = Math.min(PREYS.size / PARAMS.preyMaxAmount * 100, 100) + "%";
	}
	// Update status text
	if (PARAMS.hovered) {
		document.getElementsByClassName("status")[0].style.opacity = 1;
		document.getElementById("status-id").innerHTML = PARAMS.hovered.id;
		document.getElementById("status-species").innerHTML = PARAMS.hovered.species;
		document.getElementById("status-size").innerHTML = PARAMS.hovered.size;
		if (PARAMS.hovered.mood) {
			document.getElementById("status-mood").innerHTML = `${PARAMS.hovered._mood} (${PARAMS.hovered.mood})`;
			document.getElementById("status-mood").parentNode.style.opacity = 1;
		} else {
			document.getElementById("status-mood").parentNode.style.opacity = 0;
		}
	} else {
		document.getElementsByClassName("status")[0].style.opacity = 0;
	}
	requestAnimationFrame(animate);
}

function toggleStart(start = true) {
	PARAMS.running = start;
	const btn = document.getElementById("button-start-stop");

	btn.classList.remove(start ? "start" : "stop");
	btn.classList.add(start ? "stop" : "start");
	btn.innerHTML = start ? "STOP" : "START";
}

function reset() {
	if (PARAMS.running) {
		stop();
	}
	init();
}

function resetSettings() {
	for (const className of DEFAULTABLE_SETTINGS) {
		for (const el of document.getElementsByClassName(className)) {
			const defaultVal = el.dataset.default;
			if (el.type === "checkbox") {
				el.checked = defaultVal === "true";
			} else {
				el.value = defaultVal;
			}
		}
	}
	updateSettingsValues();
}

function updateSettingsValues() {
	updateOptions([
		{ el: "preys-size", param: "size" },
		{ el: "cb-collisions", param: "collisions" },
		{ el: "cb-cannibalism", param: "cannibalism" },
		{ el: "cb-mute", param: "mute" },
		{ el: "color-speed", param: "colorSpeed" },
		{ el: "cb-rgb", param: "colorChanging" },
	]);
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
	const options = Array.isArray(option) ? option : [option];
	for (const { el: selector, param, setValue, target } of options) {
		const el = target || document.getElementById(selector);
		const property = el.type === "checkbox" ? "checked" : "value";
		if (setValue) {
			el[property] = setValue;
		}
		const value = el[property];
		if (!isNaN(value)) {
			PARAMS[param] = Number(value);
		} else if (/true|false/i.test(value)) {
			PARAMS[param] = Boolean(value);
		} else {
			PARAMS[param] = value;
		}
	}
	Hunter.player.mute(PARAMS.mute);
}

function updatePreySize(ev) {
	return updateOptions({
		el: "preys-size",
		setValue: ev.currentTarget.value,
		param: "size",
	});
}

function updateCollisions(ev) {
	return updateOptions({
		el: "cb-collisions",
		setValue: ev.currentTarget.checked,
		param: "collisions",
	});
}

function updateCannibalism(ev) {
	return updateOptions({
		el: "cb-cannibalism",
		setValue: ev.currentTarget.checked,
		param: "cannibalism",
	});
}

function updateMute(ev) {
	return updateOptions({
		el: "cb-mute",
		setValue: ev.currentTarget.checked,
		param: "mute",
	});
}

function updateColorSpeed(ev) {
	return updateOptions({
		el: "color-speed",
		setValue: ev.currentTarget.value,
		param: "colorSpeed",
	});
}

function updateRGB(ev) {
	return updateOptions({
		el: "cb-rgb",
		setValue: ev.currentTarget.checked,
		param: "colorChanging",
	});
}

function resetEntities() {
	PARAMS.hovered = null;
	HUNTERS.forEach(hunter => hunter.remove());
	PREYS.forEach(prey => prey.remove());
}

function generateChangelog() {
	for (const version in CHANGELOG) {
		const versionTag = document.createElement("div");
		versionTag.classList.add("version-title");
		versionTag.innerHTML = version;

		const versionItemsList = document.createElement("ul");
		for (const item of CHANGELOG[version]) {
			const li = document.createElement("li");
			li.innerHTML = item;
			versionItemsList.append(li);
		}

		const changeLogItems = document.getElementById("changelog-items");
		changeLogItems.appendChild(versionTag);
		changeLogItems.appendChild(document.createElement("hr"));
		changeLogItems.appendChild(versionItemsList);
	}
}

function toggleChangelog(state) {
	PARAMS.changelogVisible = state;

	document.getElementsByClassName("wrapper")[0].style.opacity = state ? 0.2 : 1;
	document.getElementById("changelog").style.display = state ? "block" : "none";
}

function updateSpecies() {
	const hunterOption = document.querySelector("input[name='hunters-species']:checked");
	const preyOption = document.querySelector("input[name='preys-species']:checked");

	PARAMS.hunterSpecies = hunterOption.value;
	PARAMS.preySpecies = preyOption.value;

	PARAMS.hunterImg = document.getElementById(hunterOption.value);
	PARAMS.preyImg = document.getElementById(preyOption.value);
}
