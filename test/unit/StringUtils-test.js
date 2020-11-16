import { expect } from "chai";
import StringUtils from "./../../src/js/vendor/utils/StringUtils";

describe("StringUtils", function() {
	it("should create slugs", function() {
		expect(StringUtils.slugify("This is a testáéíóú   ---a")).to.equal("this-is-a-test----a");
		expect(StringUtils.slugifySafely("This is a testáéíóú   ---a")).to.equal("this-is-a-test----a-pmap");
		expect(StringUtils.slugifySafely("هذا اختبار")).to.equal("--4mzt");
	});

	it("should create count strings", function() {
		const id = "[[id]]";
		const templateZero = "none";
		const templateOne = "one item";
		const templateMore = "several items";
		expect(StringUtils.getCountText(0, id, templateZero, templateOne, templateMore)).to.equal("none");
		expect(StringUtils.getCountText(1, id, templateZero, templateOne, templateMore)).to.equal("one item");
		expect(StringUtils.getCountText(2, id, templateZero, templateOne, templateMore)).to.equal("several items");
		expect(StringUtils.getCountText(100, id, templateZero, templateOne, templateMore)).to.equal("several items");

		const templateZeroD = "none [[id]]";
		const templateOneD = "one item [[id]]";
		const templateMoreD = "[[id]] items";
		expect(StringUtils.getCountText(0, id, templateZeroD, templateOneD, templateMoreD)).to.equal("none 0");
		expect(StringUtils.getCountText(1, id, templateZeroD, templateOneD, templateMoreD)).to.equal("one item 1");
		expect(StringUtils.getCountText(2, id, templateZeroD, templateOneD, templateMoreD)).to.equal("2 items");
		expect(StringUtils.getCountText(100, id, templateZeroD, templateOneD, templateMoreD)).to.equal("100 items");
	});

	it("should create lists of items", function() {
		const items = ["a", "b"];
		const itemsLong = ["a", "b", "c", "d"];

		expect(StringUtils.getListedText(items, ", ")).to.equal("a, b");
		expect(StringUtils.getListedText(itemsLong, ", ")).to.equal("a, b, c, d");
		expect(StringUtils.getListedText(items, ", ", " and ")).to.equal("a and b");
		expect(StringUtils.getListedText(itemsLong, ", ", " and ")).to.equal("a, b, c, d");
		expect(StringUtils.getListedText(items, ", ", " and ", ", and ")).to.equal("a and b");
		expect(StringUtils.getListedText(itemsLong, ", ", " and ", ", and ")).to.equal("a, b, c, and d");
		expect(StringUtils.getListedText(items, ", ", " and ", ", and ", "<")).to.equal("<a and <b");
		expect(StringUtils.getListedText(items, ", ", " and ", ", and ", "<", ">")).to.equal("<a> and <b>");
		expect(StringUtils.getListedText(itemsLong, ", ", " and ", ", and ", "<")).to.equal("<a, <b, <c, and <d");
		expect(StringUtils.getListedText(itemsLong, ", ", " and ", ", and ", "<", ">")).to.equal("<a>, <b>, <c>, and <d>");
	});

	it("should test string collisions", function() {
		expect(StringUtils.testStringListCollisions([])).to.equal(0);
		expect(StringUtils.testStringListCollisions(["a"])).to.equal(0);
		expect(StringUtils.testStringListCollisions(["a", "b"])).to.equal(0);
		expect(StringUtils.testStringListCollisions(["a", "b", "c"])).to.equal(0);
		expect(StringUtils.testStringListCollisions(["a", "a", "c"])).to.equal(1);
		expect(StringUtils.testStringListCollisions(["a", "b", "a"])).to.equal(1);
		expect(StringUtils.testStringListCollisions(["a", "a", "a"])).to.equal(3);
		expect(StringUtils.testStringListCollisions(["a", "b", "b"])).to.equal(1);
		expect(StringUtils.testStringListCollisions(["a1", "a2", "a1"])).to.equal(1);
	});

	it("should create string hashes and convert back", function() {
		// Setup
		const ss = ["lorem", "ipsum", "lorem ipsum dolor sit amet consecitor"];
		const s2 = ["En", "Pa", "cx"];
		const s3 = ["MEn", "8Pa", "bcx"];

		// Create
		expect(StringUtils.hashStringArray(ss, 2)).to.deep.equal(s2);
		expect(StringUtils.hashStringArray(ss, 3)).to.deep.equal(s3);
		expect(StringUtils.hashStringArray([ss[2]], 2)).to.deep.equal([s2[2]]);
		expect(StringUtils.hashStringArray([ss[2]], 3)).to.deep.equal([s3[2]]);

		// Convert back
		expect(StringUtils.deHashStringArray([s2[0]], ss, 2)).to.deep.equal([ss[0]]);
		expect(StringUtils.deHashStringArray([s2[1]], ss, 2)).to.deep.equal([ss[1]]);
		expect(StringUtils.deHashStringArray([s2[3]], ss, 2)).to.deep.equal([ss[3]]);
		expect(StringUtils.deHashStringArray(s2, ss.concat().reverse(), 2)).to.deep.equal(ss);
		expect(StringUtils.deHashStringArray([s3[0]], ss, 3)).to.deep.equal([ss[0]]);
		expect(StringUtils.deHashStringArray([s3[1]], ss, 3)).to.deep.equal([ss[1]]);
		expect(StringUtils.deHashStringArray([s3[3]], ss, 3)).to.deep.equal([ss[3]]);
		expect(StringUtils.deHashStringArray(s3, ss.concat().reverse(), 3)).to.deep.equal(ss);

		// Basic checksum hashes
		expect(StringUtils.hashString("test", 10)).to.equal(8);
		expect(StringUtils.hashString("test", 100)).to.equal(88);
		expect(StringUtils.hashString("test", 1000)).to.equal(388);
		expect(StringUtils.hashString("", 1000)).to.equal(0);
	});

	it("should encode base 64", function() {
		expect(StringUtils.base64Encode(0, 10)).to.equal("AAAAAAAAAA");
		expect(StringUtils.base64Encode(10, 10)).to.equal("AAAAAAAAAK");
		expect(StringUtils.base64Encode(100, 10)).to.equal("AAAAAAAABk");
		expect(StringUtils.base64Encode(1000, 10)).to.equal("AAAAAAAAPo");
		expect(StringUtils.base64Encode(987236902, 10)).to.equal("AAAAA62Aom");
		expect(StringUtils.base64Encode(0, 3)).to.equal("AAA");
		expect(StringUtils.base64Encode(10, 3)).to.equal("AAK");
		expect(StringUtils.base64Encode(100, 3)).to.equal("ABk");
		expect(StringUtils.base64Encode(1000, 3)).to.equal("APo");
		expect(StringUtils.base64Encode(987236902, 3)).to.equal("Aom");
	});

	it("should convert booleans", function() {
		expect(StringUtils.getBoolean("true")).to.equal(true);
		expect(StringUtils.getBoolean("TRUE")).to.equal(true);
		expect(StringUtils.getBoolean("TrUE")).to.equal(true);
		expect(StringUtils.getBoolean("false")).to.equal(false);
		expect(StringUtils.getBoolean("FALSE")).to.equal(false);
		expect(StringUtils.getBoolean("fALse")).to.equal(false);
		expect(StringUtils.getBoolean("fuzzy")).to.equal(undefined);
	});

	it("should create a safe hash and convert back", function() {
		const sAll = ["signal", "none", "phone-encryption", "something else", "whatever", "ops"];
		const ss = ["signal", "phone-encryption", "something else"];
		const s2 = ["8i", "8i", "XX"]; // Collision example
		const s3 = ["r8i", "H8i", "VXX"];
		const sSafe = ["Xr8i", "1H8i", "XX"];
		const sSafeString = "8iXr8i1HXX";

		// Convert
		expect(StringUtils.hashStringArray(ss, 2)).to.deep.equal(s2);
		expect(StringUtils.hashStringArray(ss, 3)).to.deep.equal(s3);
		expect(StringUtils.hashStringArraySafely(ss, ss, 2)).to.deep.equal(sSafe);
		expect(StringUtils.hashStringArraySafely(ss, sAll, 2)).to.deep.equal(sSafe);

		// Convert, as string
		expect(StringUtils.hashStringArraySafelyAsString(ss, ss, 2)).to.equal(sSafeString);
		expect(StringUtils.hashStringArraySafelyAsString(ss, sAll, 2)).to.equal(sSafeString);

		// Convert back
		// 2 digits would fail because of the collision, so we only test 3+
		expect(StringUtils.deHashStringArray(s3, sAll, 3)).to.deep.equal(ss);
		expect(StringUtils.deHashStringArraySafely(sSafe, sAll, 2)).to.deep.equal(ss);

		// Convert back, strings
		expect(StringUtils.deHashStringArraySafelyFromString(sSafeString, sAll, 2)).to.deep.equal(ss);
	});
});
