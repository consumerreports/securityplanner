import StringUtils from "./../../src/js/vendor/utils/StringUtils";

beforeEach(() => {
	jest.spyOn(console, 'warn').mockImplementation(() => {});
	jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe("StringUtils", () => {
	test("should create slugs", () => {
		expect(StringUtils.slugify("This is a testáéíóú   ---a")).toBe("this-is-a-test----a");
		expect(StringUtils.slugifySafely("This is a testáéíóú   ---a")).toBe("this-is-a-test----a-pmap");
		expect(StringUtils.slugifySafely("هذا اختبار")).toBe("--4mzt");
	});

	test("should create count strings", () => {
		const id = "[[id]]";
		const templateZero = "none";
		const templateOne = "one item";
		const templateMore = "several items";
		expect(StringUtils.getCountText(0, id, templateZero, templateOne, templateMore)).toBe("none");
		expect(StringUtils.getCountText(1, id, templateZero, templateOne, templateMore)).toBe("one item");
		expect(StringUtils.getCountText(2, id, templateZero, templateOne, templateMore)).toBe("several items");
		expect(StringUtils.getCountText(100, id, templateZero, templateOne, templateMore)).toBe("several items");

		const templateZeroD = "none [[id]]";
		const templateOneD = "one item [[id]]";
		const templateMoreD = "[[id]] items";
		expect(StringUtils.getCountText(0, id, templateZeroD, templateOneD, templateMoreD)).toBe("none 0");
		expect(StringUtils.getCountText(1, id, templateZeroD, templateOneD, templateMoreD)).toBe("one item 1");
		expect(StringUtils.getCountText(2, id, templateZeroD, templateOneD, templateMoreD)).toBe("2 items");
		expect(StringUtils.getCountText(100, id, templateZeroD, templateOneD, templateMoreD)).toBe("100 items");
	});

	test("should create lists of items", () => {
		const items = ["a", "b"];
		const itemsLong = ["a", "b", "c", "d"];

		expect(StringUtils.getListedText(items, ", ")).toBe("a, b");
		expect(StringUtils.getListedText(itemsLong, ", ")).toBe("a, b, c, d");
		expect(StringUtils.getListedText(items, ", ", " and ")).toBe("a and b");
		expect(StringUtils.getListedText(itemsLong, ", ", " and ")).toBe("a, b, c, d");
		expect(StringUtils.getListedText(items, ", ", " and ", ", and ")).toBe("a and b");
		expect(StringUtils.getListedText(itemsLong, ", ", " and ", ", and ")).toBe("a, b, c, and d");
		expect(StringUtils.getListedText(items, ", ", " and ", ", and ", "<")).toBe("<a and <b");
		expect(StringUtils.getListedText(items, ", ", " and ", ", and ", "<", ">")).toBe("<a> and <b>");
		expect(StringUtils.getListedText(itemsLong, ", ", " and ", ", and ", "<")).toBe("<a, <b, <c, and <d");
		expect(StringUtils.getListedText(itemsLong, ", ", " and ", ", and ", "<", ">")).toBe("<a>, <b>, <c>, and <d>");
	});

	test("should test string collisions", () => {
		expect(StringUtils.testStringListCollisions([])).toBe(0);
		expect(StringUtils.testStringListCollisions(["a"])).toBe(0);
		expect(StringUtils.testStringListCollisions(["a", "b"])).toBe(0);
		expect(StringUtils.testStringListCollisions(["a", "b", "c"])).toBe(0);
		expect(StringUtils.testStringListCollisions(["a", "a", "c"])).toBe(1);
		expect(StringUtils.testStringListCollisions(["a", "b", "a"])).toBe(1);
		expect(StringUtils.testStringListCollisions(["a", "a", "a"])).toBe(3);
		expect(StringUtils.testStringListCollisions(["a", "b", "b"])).toBe(1);
		expect(StringUtils.testStringListCollisions(["a1", "a2", "a1"])).toBe(1);
	});

	test("should create string hashes and convert back", () => {
		// Setup
		const ss = ["lorem", "ipsum", "lorem ipsum dolor sit amet consecitor"];
		const s2 = ["En", "Pa", "cx"];
		const s3 = ["MEn", "8Pa", "bcx"];

		// Create
		expect(StringUtils.hashStringArray(ss, 2)).toEqual(s2);
		expect(StringUtils.hashStringArray(ss, 3)).toEqual(s3);
		expect(StringUtils.hashStringArray([ss[2]], 2)).toEqual([s2[2]]);
		expect(StringUtils.hashStringArray([ss[2]], 3)).toEqual([s3[2]]);

		// Convert back
		expect(StringUtils.deHashStringArray([s2[0]], ss, 2)).toEqual([ss[0]]);
		expect(StringUtils.deHashStringArray([s2[1]], ss, 2)).toEqual([ss[1]]);
		expect(StringUtils.deHashStringArray([s2[3]], ss, 2)).toEqual([ss[3]]);
		expect(StringUtils.deHashStringArray(s2, ss.concat().reverse(), 2)).toEqual(ss);
		expect(StringUtils.deHashStringArray([s3[0]], ss, 3)).toEqual([ss[0]]);
		expect(StringUtils.deHashStringArray([s3[1]], ss, 3)).toEqual([ss[1]]);
		expect(StringUtils.deHashStringArray([s3[3]], ss, 3)).toEqual([ss[3]]);
		expect(StringUtils.deHashStringArray(s3, ss.concat().reverse(), 3)).toEqual(ss);

		// Basic checksum hashes
		expect(StringUtils.hashString("test", 10)).toBe(8);
		expect(StringUtils.hashString("test", 100)).toBe(88);
		expect(StringUtils.hashString("test", 1000)).toBe(388);
		expect(StringUtils.hashString("", 1000)).toBe(0);
	});

	test("should encode base 64", () => {
		expect(StringUtils.base64Encode(0, 10)).toBe("AAAAAAAAAA");
		expect(StringUtils.base64Encode(10, 10)).toBe("AAAAAAAAAK");
		expect(StringUtils.base64Encode(100, 10)).toBe("AAAAAAAABk");
		expect(StringUtils.base64Encode(1000, 10)).toBe("AAAAAAAAPo");
		expect(StringUtils.base64Encode(987236902, 10)).toBe("AAAAA62Aom");
		expect(StringUtils.base64Encode(0, 3)).toBe("AAA");
		expect(StringUtils.base64Encode(10, 3)).toBe("AAK");
		expect(StringUtils.base64Encode(100, 3)).toBe("ABk");
		expect(StringUtils.base64Encode(1000, 3)).toBe("APo");
		expect(StringUtils.base64Encode(987236902, 3)).toBe("Aom");
	});

	test("should convert booleans", () => {
		expect(StringUtils.getBoolean("true")).toBe(true);
		expect(StringUtils.getBoolean("TRUE")).toBe(true);
		expect(StringUtils.getBoolean("TrUE")).toBe(true);
		expect(StringUtils.getBoolean("false")).toBe(false);
		expect(StringUtils.getBoolean("FALSE")).toBe(false);
		expect(StringUtils.getBoolean("fALse")).toBe(false);
		expect(StringUtils.getBoolean("fuzzy")).toBeUndefined();
	});

	test("should create a safe hash and convert back", () => {
		const sAll = ["signal", "none", "phone-encryption", "something else", "whatever", "ops"];
		const ss = ["signal", "phone-encryption", "something else"];
		const s2 = ["8i", "8i", "XX"]; // Collision example
		const s3 = ["r8i", "H8i", "VXX"];
		const sSafe = ["Xr8i", "1H8i", "XX"];
		const sSafeString = "8iXr8i1HXX";

		// Convert
		expect(StringUtils.hashStringArray(ss, 2)).toEqual(s2);
		expect(StringUtils.hashStringArray(ss, 3)).toEqual(s3);
		expect(StringUtils.hashStringArraySafely(ss, ss, 2)).toEqual(sSafe);
		expect(StringUtils.hashStringArraySafely(ss, sAll, 2)).toEqual(sSafe);

		// Convert, as string
		expect(StringUtils.hashStringArraySafelyAsString(ss, ss, 2)).toBe(sSafeString);
		expect(StringUtils.hashStringArraySafelyAsString(ss, sAll, 2)).toBe(sSafeString);

		// Convert back
		// 2 digits would fail because of the collision, so we only test 3+
		expect(StringUtils.deHashStringArray(s3, sAll, 3)).toEqual(ss);
		expect(StringUtils.deHashStringArraySafely(sSafe, sAll, 2)).toEqual(ss);

		// Convert back, strings
		expect(StringUtils.deHashStringArraySafelyFromString(sSafeString, sAll, 2)).toEqual(ss);
	});
});
