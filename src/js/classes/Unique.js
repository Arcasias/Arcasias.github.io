class Unique {

	constructor(length = 6) {
		this.ids = {};
		this.length = length;
	}

	generate(prefix = "") {
		let selector = prefix.length === 0 ? "default" : prefix;
		if (!this.ids[selector]) {
			this.ids[selector] = { id: 0 };
		}
		let id = ++this.ids[selector].id;
		return `${prefix || ""}${id.toString().padStart(this.length, "0")}`;
	}
}
