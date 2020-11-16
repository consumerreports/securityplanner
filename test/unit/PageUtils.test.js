import PageUtils from "./../../src/js/vendor/utils/PageUtils";


describe("PageUtils", () => {

	const changeUrl = (url) => {
		Object.defineProperty(window, 'location', {
			writable: true,
			value: {
				href: url,
				search: url
			}
		});
	}
	
	test("should get query parameters", () => {
		global.window = Object.create(window);
		changeUrl("http://www.domain.com/index.html?a=a&b=b&c=&d=d&amp;a&e=e+e&f=JavaScript_%D1%88%D0%B5%D0%BB%D0%BB%D1%8B&end=end");
		expect(PageUtils.getQueryParameter("a")).toBe("a");
		expect(PageUtils.getQueryParameter("b")).toBe("b");
		expect(PageUtils.getQueryParameter("c")).toBe("");
		expect(PageUtils.getQueryParameter("d")).toBe("d");
		expect(PageUtils.getQueryParameter("e")).toBe("e e");
		expect(PageUtils.getQueryParameter("f")).toBe("JavaScript_шеллы");
		expect(PageUtils.getQueryParameter("end")).toBe("end");		
	});

	test("should get empty query parameter", () => {
		global.window = Object.create(window);
		changeUrl("http://www.domain.com/index.html");
		expect(PageUtils.getQueryParameter("a")).toBe("");
	})

	test("should detect touch devices", () => {
		expect(PageUtils.isTouchDevice()).toBe(false);
	});
});