import React from "react";
import StringList from "./../../src/js/vendor/localization/StringList";
import Language from "./../../src/js/stores/data/Language";

describe("StringList", () => {
	// Setup test
	const lang = new Language();
	lang.id = "en-US";
	lang.name = "English";
	lang.direction = Language.DIRECTION_LTR;
	lang.default = true;
	lang.enabled = true;

	const testSL = new StringList(lang);
	testSL.addStrings({
		"test-1": "Test 1",
		"test-2": "Test 2",
		"test-3": "Test 3",
		"test-4": "Test 4",
		"test-boolean": true,
		"test-boolean-str": "true",
		"test-boolean-false": false,
		"test-boolean-str-false": "false",
		"test-array": "a\nb\nc",
		"test-array-str": ["x", "y", "z"],
	});

	const nameSL = "stringlist-id";
	const testNamedSL = new StringList(lang, {}, nameSL);

	// Tests

	test("should be a function", () => {
		expect(StringList).toBeInstanceOf(Function);
	});

	test("should be accessible as a named singleton", () => {
		expect(StringList.getInstance()).not.toBe(testNamedSL);
		expect(StringList.getInstance(nameSL)).toBe(testNamedSL);
	});

	test("should have a language", () => {
		expect(testSL.getLanguage()).toEqual(lang);
	});

	test("should have proper strings", () => {
		expect(testSL.get("test-1")).toBe("Test 1");
		expect(testSL.get("test-2")).toBe("Test 2");
		expect(testSL.get("test-3")).toBe("Test 3");
	});

	test("should have proper arrays", () => {
		expect(testSL.get("test-array")).toBe("a\nb\nc");
		expect(testSL.getArray("test-array")).toEqual(["a", "b", "c"]);
		expect(testSL.getArray("test-array-str")).toEqual(["x", "y", "z"]);
	});

	test("should have proper boolean", () => {
		expect(testSL.getBoolean("test-boolean")).toBe(true);
		expect(testSL.getBoolean("test-boolean-str")).toBe(true);
		expect(testSL.getBoolean("test-boolean-false")).toBe(false);
		expect(testSL.getBoolean("test-boolean-str-false")).toBe(false);
		expect(testSL.getBoolean("test-1")).toBeUndefined();
		expect(testSL.getBoolean("test-nothing")).toBeUndefined();
	});

	test("should return markdown", () => {
		const sl = StringList.getInstance(new Language(), {}, "new-name");
		sl.addStrings({
			"slist": "* One\n* Two",
			"slinks": "a [link](url) [link2](url2) end",
		});

		expect(sl.getLink("slinks", "span", "className", "linkClass")).toEqual(
            <span className={ "className" } dangerouslySetInnerHTML={ { __html: "a <a href=\"url\" target=\"_blank\" class=\"linkClass\">link</a> <a href=\"url2\" target=\"_blank\" class=\"linkClass\">link2</a> end" } } />
        );
		expect(sl.getList("slist", "ulClass", "liClass")).toEqual(
            <ul className={ "ulClass" } dangerouslySetInnerHTML={ { __html: "<li><p class=\"liClass\">One</p></li>\n<li><p class=\"liClass\">Two</p></li>" } } />
        );
	});
});