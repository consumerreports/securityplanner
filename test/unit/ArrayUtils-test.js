import { expect } from "chai";
import ArrayUtils from "./../../src/js/vendor/utils/ArrayUtils";

describe("ArrayUtils", function() {
	it("should compare arrays deeply", function() {
		expect(ArrayUtils.equal(["a"], ["a"])).to.equal(true);
		expect(ArrayUtils.equal(["a"], [])).to.equal(false);
		expect(ArrayUtils.equal(["a"], undefined)).to.equal(false);
		expect(ArrayUtils.equal(["a"], ["b"])).to.equal(false);
		expect(ArrayUtils.equal(["a", "b", "c", "d"], ["a", "b", "c", "d"])).to.equal(true);
		expect(ArrayUtils.equal(["a", "b", "c", "d"], ["a", "b", "c"])).to.equal(false);
		expect(ArrayUtils.equal(undefined, ["a"])).to.equal(false);
	});

	it("should return an unique array index", function() {
		const i1 = { id: "1" };
		const i2 = { id: "2" };
		expect(ArrayUtils.getArrayFieldUniqueIndex([], "id")).to.equal("");
		expect(ArrayUtils.getArrayFieldUniqueIndex([i1], "id")).to.equal("1");
		expect(ArrayUtils.getArrayFieldUniqueIndex([i1, i2], "id")).to.equal("1,2");
	});

	it("should find duplicates", function() {
		expect(ArrayUtils.findDuplicates([1, 2, 3])).to.deep.equal([]);
		expect(ArrayUtils.findDuplicates([1, 1, 2, 3])).to.deep.equal([0, 1]);
		expect(ArrayUtils.findDuplicates([1, 1, 2, 3, 3])).to.deep.equal([0, 1]);
		expect(ArrayUtils.findDuplicates([1, 2, 3, 3])).to.deep.equal([2, 3]);
		expect(ArrayUtils.findDuplicates([1, 2, 2, 2, 3])).to.deep.equal([1, 2, 3]);
	});
});
