import { expect } from "chai";
import React from "react";
import StringList from "./../../src/js/vendor/localization/StringList";
import Language from "./../../src/js/stores/data/Language";

describe("StringList", function() {
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

	it("should be a function", function() {
		expect(StringList).to.be.an("function");
	});

	it("should be accessible as a named singleton", function() {
		expect(StringList.getInstance()).to.not.equal(testNamedSL);
		expect(StringList.getInstance(nameSL)).to.equal(testNamedSL);
	});

	it("should have a language", function() {
		expect(testSL.getLanguage()).to.deep.equal(lang);
	});

	it("should have proper strings", function() {
		expect(testSL.get("test-1")).to.equal("Test 1");
		expect(testSL.get("test-2")).to.equal("Test 2");
		expect(testSL.get("test-3")).to.equal("Test 3");
	});

	it("should have proper arrays", function() {
		expect(testSL.get("test-array")).to.equal("a\nb\nc");
		expect(testSL.getArray("test-array")).to.deep.equal(["a", "b", "c"]);
		expect(testSL.getArray("test-array-str")).to.deep.equal(["x", "y", "z"]);
	});

	it("should have proper boolean", function() {
		expect(testSL.getBoolean("test-boolean")).to.equal(true);
		expect(testSL.getBoolean("test-boolean-str")).to.equal(true);
		expect(testSL.getBoolean("test-boolean-false")).to.equal(false);
		expect(testSL.getBoolean("test-boolean-str-false")).to.equal(false);
		expect(testSL.getBoolean("test-1")).to.equal(undefined);
		expect(testSL.getBoolean("test-nothing")).to.equal(undefined);
	});

	it("should return markdown", function() {
		const sl = StringList.getInstance(new Language(), {}, "new-name");
		sl.addStrings({
			"slist": "* One\n* Two",
			"slinks": "a [link](url) [link2](url2) end",
		});

		expect(sl.getLink("slinks", "span", "className", "linkClass")).to.deep.equal(
			<span className={ "className" } dangerouslySetInnerHTML={ { __html: "a <a href=\"url\" target=\"_blank\" class=\"linkClass\">link</a> <a href=\"url2\" target=\"_blank\" class=\"linkClass\">link2</a> end" } } />
		);
		expect(sl.getList("slist", "ulClass", "liClass")).to.deep.equal(
			<ul className={ "ulClass" } dangerouslySetInnerHTML={ { __html: "<li><p class=\"liClass\">One</p></li>\n<li><p class=\"liClass\">Two</p></li>" } } />
		);
	});
});