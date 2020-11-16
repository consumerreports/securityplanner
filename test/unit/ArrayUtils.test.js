import ArrayUtils from "./../../src/js/vendor/utils/ArrayUtils";

describe("ArrayUtils", () => {
	test("should compare arrays deeply", () => {
		expect(ArrayUtils.equal(["a"], ["a"])).toBe(true);
		expect(ArrayUtils.equal(["a"], [])).toBe(false);
		expect(ArrayUtils.equal(["a"], undefined)).toBe(false);
		expect(ArrayUtils.equal(["a"], ["b"])).toBe(false);
		expect(ArrayUtils.equal(["a", "b", "c", "d"], ["a", "b", "c", "d"])).toBe(true);
		expect(ArrayUtils.equal(["a", "b", "c", "d"], ["a", "b", "c"])).toBe(false);
		expect(ArrayUtils.equal(undefined, ["a"])).toBe(false);
	});

	test("should return an unique array index", () => {
		const i1 = { id: "1" };
		const i2 = { id: "2" };
		expect(ArrayUtils.getArrayFieldUniqueIndex([], "id")).toBe("");
		expect(ArrayUtils.getArrayFieldUniqueIndex([i1], "id")).toBe("1");
		expect(ArrayUtils.getArrayFieldUniqueIndex([i1, i2], "id")).toBe("1,2");
	});

	test("should find duplicates", () => {
		expect(ArrayUtils.findDuplicates([1, 2, 3])).toEqual([]);
		expect(ArrayUtils.findDuplicates([1, 1, 2, 3])).toEqual([0, 1]);
		expect(ArrayUtils.findDuplicates([1, 1, 2, 3, 3])).toEqual([0, 1]);
		expect(ArrayUtils.findDuplicates([1, 2, 3, 3])).toEqual([2, 3]);
		expect(ArrayUtils.findDuplicates([1, 2, 2, 2, 3])).toEqual([1, 2, 3]);
	});
});
