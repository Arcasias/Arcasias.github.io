class Unique {

    _ids = {};

    constructor(size=6) {
        this._size = size;
    }

    generate(prefix='') {
        let selector = prefix.length === 0 ? 'default' : prefix;
        if (! this._ids[selector]) {
            this._ids[selector] = { id: 0 };
        }
        let id = ++ this._ids[selector].id;
        return `${prefix || ''}${id.toString().padStart(this._size, '0')}`;
    }
}