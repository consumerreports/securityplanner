import MiniRouter from "./../../src/js/vendor/routing/MiniRouter.js";

const router = new MiniRouter();

describe("MiniRouter", () => {
	test("should return undefined when a route is not found", () => {
		expect(router.handle("/start")).toBeUndefined();
	});

	test("should handle simple urls", () => {
		router.addTemplate("a", (params) => "a page");
		router.addTemplate("b", (params) => "b page");
		router.addTemplate("a/b", (params) => "a/b page");
		router.addTemplate("b/b", (params) => "b/b page");
		expect(router.handle("a")).toBe("a page");
		expect(router.handle("b")).toBe("b page");
		expect(router.handle("a/b")).toBe("a/b page");
		expect(router.handle("b/b")).toBe("b/b page");

		router.addTemplate("/start", (params) => "start page");
		router.addTemplate("/other", (params) => "other page");
		router.addTemplate("/start/sub", (params) => "start page sub");
		router.addTemplate("/deep/1", (params) => "deep page one");
		router.addTemplate("/deep/2", (params) => "deep page two");

		expect(router.handle("/start")).toBe("start page");
		expect(router.handle("/nothing")).toBeUndefined();
		expect(router.handle("/other")).toBe("other page");
		expect(router.handle("/start/sub")).toBe("start page sub");
		expect(router.handle("/deep/1")).toBe("deep page one");
		expect(router.handle("/deep/2")).toBe("deep page two");
	});

	test("should handle urls with parameters", () => {
		router.addTemplate("/start/{id}", (params) => `start page with id ${params.id}`);
		router.addTemplate("/super/{type}", (params) => `super page with type ${params.type}`);

		expect(router.handle("/start/other")).toBe("start page with id other");
		expect(router.handle("/start/others/b")).toBeUndefined();
		expect(router.handle("/super/x")).toBe("super page with type x");
		expect(router.handle("/super/x/2")).toBeUndefined();

		// Regression test
		expect(router.handle("/start")).toBe("start page");
		expect(router.handle("/start/sub")).toBe("start page sub");
	});

	test("should handle deeper urls with parameters", () => {
		router.addTemplate("/long/{type}/{id}", (params) => `long page with type ${params.type} and id ${params.id}`);
		router.addTemplate("/very-long/{type}/{id}/detail/{detail}", (params) => `very long page with type ${params.type}, id ${params.id}, and detail ${params.detail}`);

		expect(router.handle("/long/defined/123")).toBe("long page with type defined and id 123");
		expect(router.handle("/long/defined")).toBeUndefined();
		expect(router.handle("/very-long/again/abc-def/detail/look")).toBe("very long page with type again, id abc-def, and detail look");
		expect(router.handle("/very-long/again")).toBeUndefined();
	});

	test("should handle urls with ...rest parameters", () => {
		router.addTemplate("/simple-rest/{...rest}", (params) => `simple rest page with rest ${params.rest}`);

		expect(router.handle("/simple-rest/whatever")).toBe("simple rest page with rest whatever");
		expect(router.handle("/simple-rest/whatever you want")).toBe("simple rest page with rest whatever you want");
		expect(router.handle("/simple-rest/whatever/you/want")).toBe("simple rest page with rest whatever/you/want");
	});

	test(
        "should handle mixed urls with normal and ...rest parameters",
        () => {
            router.addTemplate("/mixed/{id}/a/{sub}/{...rest}", (params) => `mixed page with id ${params.id}, sub ${params.sub}, and rest ${params.rest}`);

            expect(router.handle("/mixed/123/a/xyz/something")).toBe("mixed page with id 123, sub xyz, and rest something");
            expect(router.handle("/mixed/123/a/xyz")).toBeUndefined();
            expect(router.handle("/mixed/123/a/xyz/something/or/another")).toBe("mixed page with id 123, sub xyz, and rest something/or/another");
        }
    );

	test("should remove templates", () => {
		router.removeTemplate("/start");
		expect(router.handle("/start")).toBeUndefined();
	});
});


