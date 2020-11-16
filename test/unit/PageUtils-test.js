import { expect } from "chai";
import PageUtils from "./../../src/js/vendor/utils/PageUtils";
import jsdom from "jsdom";

describe("PageUtils", function() {
	it("should get query parameters", function() {
		jsdom.changeURL(window, "http://www.domain.com/index.html?a=a&b=b&c=&d=d&amp;a&e=e+e&f=JavaScript_%D1%88%D0%B5%D0%BB%D0%BB%D1%8B&end=end");
		expect(PageUtils.getQueryParameter("a")).to.equal("a");
		expect(PageUtils.getQueryParameter("b")).to.equal("b");
		expect(PageUtils.getQueryParameter("c")).to.equal("");
		expect(PageUtils.getQueryParameter("d")).to.equal("d");
		expect(PageUtils.getQueryParameter("e")).to.equal("e e");
		expect(PageUtils.getQueryParameter("f")).to.equal("JavaScript_шеллы");
		expect(PageUtils.getQueryParameter("end")).to.equal("end");

		jsdom.changeURL(window, "http://www.domain.com/index.html");
		expect(PageUtils.getQueryParameter("a")).to.equal("");
	});

	it("should detect touch devices", function() {
		expect(PageUtils.isTouchDevice()).to.equal(false);
	});
});
