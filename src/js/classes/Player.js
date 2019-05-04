export default class Player {

    #sounds = [];

    constructor(queueSize = 5) {
        for (let i = 0; i < queueSize; i ++) {
            this.#sounds.push({
                audio: new Audio('src/sounds/oof.mp3'),
                playing: false,
            });
        }
    }

    play() {
        for (let i = 0; i < this.#sounds.length; i ++) {
            if (! this.#sounds[i].playing) {
                this.#sounds[i].playing = true;
                this.#sounds[i].audio.play().then(() => {
                    this.#sounds[i].playing = false;
                });
                return true;
            }
        }
        return false;
    }
}