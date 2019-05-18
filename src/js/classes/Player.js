class Player {

    _sounds = [];
    _lastPlayed = Date.now();
    _loaded = false;
    _mute = false;

    constructor(queueSize=1, margin=0) {
        if (queueSize < 1) {
            throw new Error("Queue length must be of at least 1");
        }
        for (let i = 0; i < queueSize; i ++) {
            this._sounds.push({ playing: false });
        }
        this._margin = margin;
    }

    load(nodes) {
        this._sounds.forEach(sound => {
            sound.audios = [];
            nodes.forEach(node => {
                let cloned = node.cloneNode();
                cloned.muted = this._mute;
                sound.audios.push(cloned);
            });
        });
        this._loaded = true;
    }

    mute(muting) {
        if (muting === this._mute) {
            return;
        } else {
            this._mute = muting;
        }
        if (! this._loaded) {
            return;
        }
        this._sounds.forEach(sound => {
            sound.audios.forEach(audio => {
                audio.muted = this._mute;
            });
        });
    }

    play() {
        if (! this._loaded || this._sounds[0].audios.length === 0 || Date.now() - this._lastPlayed < this._margin) {
            return;
        } else {
            this._lastPlayed = Date.now();
        }
        for (let i = 0; i < this._sounds.length; i ++) {
            if (! this._sounds[i].playing) {
                this._sounds[i].playing = true;
                let audio = choice(this._sounds[i].audios);
                audio.play().then(() => {
                    setTimeout(() => {
                        this._sounds[i].playing = false;
                    }, audio.duration * 1000);
                }).catch(err => {
                    this._sounds[i].playing = false;
                    console.error(err);
                });
                return true;
            }
        }
        return false;
    }
}