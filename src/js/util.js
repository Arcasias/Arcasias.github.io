'use strict';
EventTarget.prototype.on = EventTarget.prototype.addEventListener;

function choice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function rotate(velocity, angle) {
    return {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle),
    };
}

function nextTick(fn) {
    return new Promise(res => {
        setTimeout(res, 0);
    }).then(() => {
        if (fn) {
            fn();
        }
    });
}

function xFromDistance(x1, y1, x2, y2) {
    return Math.cos(Math.atan((y2 - y1) / (x2 - x1)));
}

function yFromDistance(x1, y1, x2, y2) {
    return Math.sin(Math.atan((y2 - y1) / (x2 - x1)));
}
