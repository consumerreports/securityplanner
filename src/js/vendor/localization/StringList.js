import MarkdownUtils from "../utils/MarkdownUtils";

export default class StringList {

	/*
	var a = new StringList(new Language(), {}, "other);
	a.addStrings({'test-1':'Test 1'});
	console.log("STR => " + a.get("test-1"));
	console.log("ONJ => ", StringList.getInstance().values, StringList.instances);
	console.log("STR => " + StringList.getInstance().get("test-1"));
	*/

	constructor(language, localizationObject, key) {
		// Adds self to the list of instances
		StringList.addInstance(key, this);

		// Language[] reference
		this.language = language;

		// Resets list
		this.values = {};

		// Adds values, if any
		if (localizationObject) this.addStrings(localizationObject);
	}

	static addInstance(key, instance) {
		const newKey = key || "default";
		if (!this.instances) this.instances = {};
		this.instances[newKey] = instance;
	}

	static getInstance(key) {
		const newKey = key || "default";
		if (!this.instances || !this.instances.hasOwnProperty(newKey)) {
			return new StringList(newKey);
		} else {
			return this.instances[newKey];
		}
	}

	/**
	 * Add a list of values to the current list.
	 * @param localizationObject An object containing a key:value object for each localization string (for example: { 'key' :  'value '} )
	 */
	addStrings(localizationObject) {
		Object.assign(this.values, localizationObject);
	}

	/**
	 * Returns the current language.
	 * @returns A Language instance
	 */
	getLanguage() {
		return this.language;
	}

	/**
	 * Returns the value from a key.
	 * @param key
	 */
	get(key) {
		if (this.values.hasOwnProperty(key)) return this.values[key];

		// Not found!
		console.warn(`Warning: no value found for localization key '${key}' in string list`); // eslint-disable-line

		// Give up
		return "{NOT_FOUND}";
	}

	getArray(key) {
		const value = this.get(key);
		if (Array.isArray(value)) {
			return value;
		} else if (typeof(value) === "string") {
			return value.split("\n");
		}

		// Not found!
		console.warn(`Warning: no value found for localization key '${key}' in string list as Array`); // eslint-disable-line

		// Give up
		return ["{NOT_FOUND}"];
	}

	getAssetArray(key) {
		// Based on a blob of text, returns a list of assets { src:string, title:string, link:string }
		// Assets must contain an image, description, and optionally a link
		const src = this.get(key);
		if (src) {
			// We search for images sequentially, using their links if they have any
			const REGEX_IMAGES_WITH_LINKS = /\[!\[(.*?)\]\((.*?)\)\]\((.*?)\)|!\[(.*?)\]\((.*?)\)/g;
			let match = REGEX_IMAGES_WITH_LINKS.exec(src);
			const assets = [];
			while (match) {
				if (match[2]) {
					// First match: image with link
					assets.push({
						title: match[1],
						src: match[2],
						link: match[3],
					});
				} else if (match[5]) {
					// Second match: image
					assets.push({
						title: match[4],
						src: match[5],
						link: undefined,
					});
				}
				match = REGEX_IMAGES_WITH_LINKS.exec(src);
			}
			return assets;
		}

		// Not found!
		console.warn(`Warning: no value found for localization key '${key}' in string list as asset Array`); // eslint-disable-line

		// Give up
		return [];
	}

	getLink(key, tagName, className, linkClass) {
		return MarkdownUtils.parseURL(this.get(key), tagName, className, linkClass);
	}

	getList(key, ulClass, liClass) {
		return MarkdownUtils.parseList(this.get(key), ulClass, liClass);
	}

	getBoolean(key) {
		const val = this.get(key);
		if (typeof val === "boolean") return val;

		if (typeof val === "string") {
			if (val.toLowerCase() === "true") {
				return true;
			} else if (val.toLowerCase() === "false") {
				return false;
			}
		}

		console.warn(`Warning: the string "${val}" does not contain a valid boolean`); // eslint-disable-line
		return undefined;
	}
}
