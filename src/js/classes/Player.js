class Player {

    constructor(queueSize = 1, margin = 0) {
        this.sounds = [];
        this.lastPlayed = Date.now();
        this.loaded = false;
        this.muted = false;
        this.margin = margin;

        if (queueSize < 1) {
            throw new Error("Queue length must be of at least 1");
        }
        for (let i = 0; i < queueSize; i++) {
            this.sounds.push({ playing: false });
        }
    }

    load(nodes) {
        for (const sound of this.sounds) {
            sound.audios = [];
            for (const node of nodes) {
                const cloned = node.cloneNode();
                cloned.muted = this.muted;
                sound.audios.push(cloned);
            }
        }
        this.loaded = true;
    }

    mute(muting) {
        if (muting === this.muted) {
            return;
        } else {
            this.muted = muting;
        }
        if (!this.loaded) {
            return;
        }
        for (const sound of this.sounds) {
            for (const audio of sound.audios) {
                audio.muted = this.muted;
            }
        }
    }

    play() {
        if (!this.loaded || this.sounds[0].audios.length === 0 || Date.now() - this.lastPlayed < this.margin) {
            return;
        } else {
            this.lastPlayed = Date.now();
        }
        for (let i = 0; i < this.sounds.length; i++) {
            if (!this.sounds[i].playing) {
                this._play(this.sounds[i]);
                return true;
            }
        }
        return false;
    }

    async _play(sound) {
        const audio = choice(sound.audios);
        try {
            await audio.play();
            sound.playing = true;
            setTimeout(() => sound.playing = false, audio.duration * 1000);
        } catch (err) {
            sound.playing = false;
            console.error(err);
        }
    }
}
