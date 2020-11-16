export default class ArrayUtils {

	/**
	 * Shallow comparison of two arrays
	 */
	static equal(array1, array2) {
		return Array.isArray(array1) &&
			Array.isArray(array2) &&
			array1.length === array2.length &&
			array1.every((item, index) => item === array2[index]);
	}

	/**
	 * Finds one set of duplicates in an array, and returns the index
	 */
	static findDuplicates(array) {
		for (let i = 0; i < array.length; i++) {
			const duplicates = [i];
			for (let j = i + 1; j < array.length; j++) {
				if (array[i] === array[j]) duplicates.push(j);
			}
			if (duplicates.length > 1) return duplicates;
		}
		return [];
	}

	/**
	 * Returns a unique string that maps to a field in each of the array's items
	 */
	static getArrayFieldUniqueIndex(array, fieldName) {
		return array.map(item => item[fieldName]).join(",");
	}
}
