import ArrayUtils from "./ArrayUtils";

export default class StringUtils {
	static slugify(text) {
		if (!text) {
			return;
		}

		return text.trim()
			.replace(/[^\w- ]/g, " ")	// Removes anything except word characters, space and -
			.replace(/ +/g, "-")		// Removes one or more space characters
			.toLowerCase();
	}

	static slugifySafely(text) {
		return StringUtils.slugify(text + "-" + StringUtils.hashStringArray([text], 4)[0]);
	}

	static getCountText(count, id, templateZero, templateOne, templateMore) {
		// Generates a descriptive text of a count (e.g. "1 item", "no item", "0 items")
		if (count == 0) {
			return templateZero.split(id).join(count);
		} else if (count == 1) {
			return templateOne.split(id).join(count);
		} else {
			return templateMore.split(id).join(count);
		}
	}

	static getListedText(items, divider, dividerEndSingle = undefined, dividerEndMultiple = undefined, itemStart = "", itemEnd = "") {
		// Generates a list from an array of strings
		// E.g. "item 0, item 1, and item 2" (", " is divider, ", and " is dividerEndMultiple) (oxford comma)
		// E.g. "item 0 and item 2" (", " is divider, " and " is dividerEndSingle)

		let list = "";
		for (let i = 0; i < items.length; i++) {
			if (i > 0) {
				if (i < items.length - 1) {
					// Between items
					list += divider;
				} else {
					// Between two last items
					if (items.length == 2) {
						list += dividerEndSingle || dividerEndMultiple || divider;
					} else {
						list += dividerEndMultiple || divider;
					}
				}
			}
			list += itemStart + items[i] + itemEnd;
		}

		return list;
	}

	static testStringListCollisions(strings) {
		// Check if strings repeat in a list
		let collisions = 0;
		strings.forEach((str, index) => {
			for (let j = index + 1; j < strings.length; j++) {
				if (str == strings[j]) collisions++;
			}
		});

		return collisions;
	}

	static hashStringArray(strings, digits = 2) {
		// Converts a list of strings to a list of string hashes with a given number of base64 char digits
		const cap = Math.pow(64, digits);
		return strings.map(str => StringUtils.base64Encode(StringUtils.hashString(str, cap), digits));
	}

	/**
	 * Creates a list of strings to a list of string hashes, each made of a base64 id with a specific number of digits.
	 * Can be understood as a string array super compressor, if the array is made of a known (and unchanging) set of strings.
	 *
	 * Examples:
	 * 2 chars:
	 *   ["lorem", "ipsum"], ["lorem", "ipsum", "other"], 2 => ["En", "Pa"]
	 * 3 chars:
	 *   ["lorem", "ipsum"], ["lorem", "ipsum", "other"], 3 => ["MEn", "8Pa"]
	 * 2 chars, avoiding collisions ("signal" and "phone-encryption" would have the same 2-char hash):
	 *   ["signal", "phone-encryption", "something else"], ["signal", "phone-encryption", "something else"], 2 => ["Xr8i", "1H8i", "XX"]
	 *
	 * @param	strings				The array of strings that needs to be compressed
	 * @params	potentialStrings	The array of ALL possible strings, to check for collisions. Can be the same as the strings if strings is not a subset
	 * @param	digits				Number of "Digits" wanted by default for each hash
	 * @returns						An array of hashes
	 */
	static hashStringArraySafely(strings, potentialStrings, defaultDigits = 2) {
		let digits = defaultDigits;
		let cap = Math.pow(64, digits);

		// Create a list of all potential hashes to check for collisions first
		const hashes = potentialStrings.map(potentialString => {
			return StringUtils.base64Encode(StringUtils.hashString(potentialString, cap), digits);
		});

		// Expand as needed
		let duplicates = ArrayUtils.findDuplicates(hashes);
		while (duplicates.length > 0) {
			digits *= 2;
			cap = Math.pow(64, digits);
			duplicates.forEach(index => {
				hashes[index] = StringUtils.base64Encode(StringUtils.hashString(potentialStrings[index], cap), digits);
			});
			duplicates = ArrayUtils.findDuplicates(hashes);
		}

		// Create the actual list
		const newList = strings.map((value, index) => {
			return hashes[potentialStrings.indexOf(strings[index])];
		});

		return newList;
	}

	/**
	 * Creates a list of strings to a list of string hashes, each made of a base64 id with a specific number of digits.
	 * Can be understood as a string array super compressor, if the array is made of a known (and unchanging) set of strings.
	 *
	 * This does the same as hashStringArraySafely(), but producing a string.
	 *
	 * Example:
	 * 2 chars:
	 *   ["lorem", "ipsum"], ["lorem", "ipsum", "other"], 2 => "EnPa"
	 * 3 chars:
	 *   ["lorem", "ipsum"], ["lorem", "ipsum", "other"], 3 => "MEn8Pa"
	 * 2 chars, avoiding collisions ("signal" and "phone-encryption" would have the same 2-char hash):
	 *   ["signal", "phone-encryption", "something else"], ["signal", "phone-encryption", "something else"], 2 => "8iXr8i1HXX"
	 *
	 * @see deHashStringArraySafelyFromString()
	 *
	 * @param	strings				The array of strings that needs to be compressed
	 * @params	potentialStrings	The array of ALL possible strings, to check for collisions. Can be the same as the strings if strings is not a subset
	 * @param	digits				Number of "Digits" wanted by default for each hash
	 * @returns						A string hash that represents the string array passed
	 */
	static hashStringArraySafelyAsString(strings, potentialStrings, defaultDigits = 2) {
		// Read the hashes
		const hashes = StringUtils.hashStringArraySafely(strings, potentialStrings, defaultDigits);
		// The "safe" hashed array might contain ids with more than the number of default digits,
		// so we re-encode them using little-ending like encoding to easily parse when decoding.
		let listHash = "";
		hashes.forEach(hash => {
			while (hash.length >= defaultDigits) {
				listHash += hash.substr(hash.length - defaultDigits, defaultDigits);
				hash = hash.substr(0, hash.length - defaultDigits);
			}
		});

		return listHash;
	}

	static deHashStringArray(hashes, possibleValues, digits) {
		// Converts a list of hashes to their possible strings, given a list of known possible values
		// This is the counterpart to hashStringArray()

		// Hashes initial list first
		const possibleHashes = StringUtils.hashStringArray(possibleValues, digits);

		// Find all from the list
		return hashes.map(hash => {
			const idx = possibleHashes.indexOf(hash);
			return idx > -1 ? possibleValues[idx] : undefined;
		});
	}

	static deHashStringArraySafely(hashes, possibleValues, digits) {
		// Converts a list of hashes to their possible strings, given a list of known possible values
		// Same as deHashStringArray(), but counterpart to hashStringArraySafely()

		// Hashes initial list first
		const possibleHashes = StringUtils.hashStringArraySafely(possibleValues, possibleValues, digits);

		// Find all from the list
		return hashes.map(hash => {
			const idx = possibleHashes.indexOf(hash);
			return idx > -1 ? possibleValues[idx] : undefined;
		});
	}

	static deHashStringArraySafelyFromString(hash, possibleValues, digits) {
		// Same as deHashStringArraySafely(), but converting from a full string hash with little-endian encoding first

		// Hashes initial list first
		const possibleHashes = StringUtils.hashStringArraySafely(possibleValues, possibleValues, digits);
		const newList = [];

		let currentString = "";
		for (let i = 0; i < hash.length; i += digits) {
			currentString = hash.substr(i, digits) + currentString;
			const idx = possibleHashes.indexOf(currentString);

			if (idx > -1) {
				// Has index, use and reset the string accumulator
				newList.push(possibleValues[idx]);
				currentString = "";
			}
		}

		return newList;
	}

	static hashString(text, cap) {
		// Calculates a string to a minimum hash, and returns the numeric value

		let h = 0;
		const MULTIPLIER = 37;

		for (let i = 0; i < text.length; i++) {
			const p = text.charCodeAt(i);
			h = (MULTIPLIER * h + p) % cap;
		}

		return h; // or, h % ARRAY_SIZE;
	}

	static base64Encode(value, digits) {
		// Simple base64-like encoding for numbers
		const table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

		let result = "";

		let val = value;
		while (result.length < digits) {
			const div = val % 64;
			result = table.charAt(div) + result;
			val = (val - div) / 64;
		}

		return result;
	}

	static getBoolean(str) {
		if (str.toLowerCase() === "true") {
			return true;
		} else if (str.toLowerCase() === "false") {
			return false;
		} else {
			console.error(`The string "${str}" does not contain a boolean`); // eslint-disable-line
		}

		return undefined;
	}
}
