EventTarget.prototype.on = function (ev, fn, opt=false) {
    this.addEventListener(ev, fn, opt);
};

function $(selector) {
    if (selector instanceof Element) {
        return selector;
    }
    if (typeof selector !== 'string') {
        throw new TypeError("Selector must be of type string.");
    }
    let res;
    switch (selector.charAt(0)) {
        case '#':
            return document.getElementById(selector.slice(1));
        case '.':
            res = [...document.getElementsByClassName(selector.slice(1))];
            break;
        default:
            res = [...document.querySelectorAll(selector)];
            break;
    }
    return res.length === 1 ? res[0] : res;
}

function choice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function detectCollision(e1, e2) {
    return e2.x < e1.x + e1.w &&
        e1.x < e2.x + e2.w &&
        e2.y < e1.y + e1.h &&
        e1.y < e2.y + e2.h;
}

function resolveCollision(e1, e2) {
    let distX = e2.x - e1.x;
    let distY = e2.y - e1.y;

    if (0 <= (e1.velocity.x - e2.velocity.x) * distX + (e1.velocity.y - e2.velocity.y) * distY) {
        let angle = Math.atan2(distY, distX) * -1;

        let u1 = rotate(e1.velocity, angle);
        let u2 = rotate(e2.velocity, angle);
    
        e1.velocity = rotate({
            x: u1.x * (e1.mass - e2.mass) / (e1.mass + e2.mass) + u2.x * 2 * e2.mass / (e1.mass + e2.mass),
            y: u1.y,
        }, angle * -1);
        e2.velocity = rotate({
            x: u2.x * (e1.mass - e2.mass) / (e1.mass + e2.mass) + u1.x * 2 * e2.mass / (e1.mass + e2.mass),
            y: u2.y,
        }, angle * -1);
    }
}

function rotate(velocity, angle) {
    return {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle),
    };
}

function onReady(fn) {
    if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
        fn();
    } else {
        document.on('DOMContentLoaded', fn, { once: true });
    }
}

function xFromDistance(x1, y1, x2, y2) {
    return Math.cos(Math.atan((y2 - y1) / (x2 - x1)));
}

function yFromDistance(x1, y1, x2, y2) {
    return Math.sin(Math.atan((y2 - y1) / (x2 - x1)));
}