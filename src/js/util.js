EventTarget.prototype.on = function (ev, fn, opt=false) {
    this.addEventListener(ev, fn, opt);
};
EventTarget.prototype.eachChild = function (fn) {
    for (let i = 0; i < this.children.length; i ++) {
        fn(this.children[i], i);
    }
}

function $(selector) {
    return document.querySelector(selector);
}

function choice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function detectCollision(entity1, entity2) {
    return ((entity2.x < entity1.x + entity1.w
        && entity1.x < entity2.x + entity2.w
        && entity2.y < entity1.y + entity1.h
        && entity1.y < entity2.y + entity2.h));
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function resolveCollision(entity1, entity2) {
    let distX = entity2.x - entity1.x;
    let distY = entity2.y - entity1.y;

    if (0 <= (entity1.velocity.x - entity2.velocity.x) * distX + (entity1.velocity.y - entity2.velocity.y) * distY) {
        let angle = Math.atan2(distY, distX) * -1;

        let m1 = entity1.mass;
        let m2 = entity2.mass;

        let u1 = rotate(entity1.velocity, angle);
        let u2 = rotate(entity2.velocity, angle);
    
        let finalV1 = rotate({  x : u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y : u1.y }, angle * -1);
        let finalV2 = rotate({  x : u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y : u2.y }, angle * -1);

        entity1.velocity.x = finalV1.x;
        entity1.velocity.y = finalV1.y;

        entity2.velocity.x = finalV2.x;
        entity2.velocity.y = finalV2.y;
    }
}

function rotate(velocity, angle) {
    return {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle),
    };
}

function toHex(number) {
    return Number(number).toString(16).padStart('0', 2);
}

function whenReady(fn) {
    if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
        fn();
    } else {
        document.on('DOMContentLoaded', fn);
    }
}

function xFromDistance(x1, y1, x2, y2, step=1) {
    return Math.cos(Math.atan((y2 - y1) / (x2 - x1))) * step;
}

function yFromDistance(x1, y1, x2, y2, step=1) {
    return Math.sin(Math.atan((y2 - y1) / (x2 - x1))) * step;
}