import { expect } from "chai";
import MiniRouter from "./../../src/js/vendor/routing/MiniRouter.js";

const router = new MiniRouter();

describe("MiniRouter", function() {
	it("should return undefined when a route is not found", function() {
		expect(router.handle("/start")).to.equal(undefined);
	});

	it("should handle simple urls", function() {
		router.addTemplate("a", (params) => "a page");
		router.addTemplate("b", (params) => "b page");
		router.addTemplate("a/b", (params) => "a/b page");
		router.addTemplate("b/b", (params) => "b/b page");
		expect(router.handle("a")).to.equal("a page");
		expect(router.handle("b")).to.equal("b page");
		expect(router.handle("a/b")).to.equal("a/b page");
		expect(router.handle("b/b")).to.equal("b/b page");

		router.addTemplate("/start", (params) => "start page");
		router.addTemplate("/other", (params) => "other page");
		router.addTemplate("/start/sub", (params) => "start page sub");
		router.addTemplate("/deep/1", (params) => "deep page one");
		router.addTemplate("/deep/2", (params) => "deep page two");

		expect(router.handle("/start")).to.equal("start page");
		expect(router.handle("/nothing")).to.equal(undefined);
		expect(router.handle("/other")).to.equal("other page");
		expect(router.handle("/start/sub")).to.equal("start page sub");
		expect(router.handle("/deep/1")).to.equal("deep page one");
		expect(router.handle("/deep/2")).to.equal("deep page two");
	});

	it("should handle urls with parameters", function() {
		router.addTemplate("/start/{id}", (params) => `start page with id ${params.id}`);
		router.addTemplate("/super/{type}", (params) => `super page with type ${params.type}`);

		expect(router.handle("/start/other")).to.equal("start page with id other");
		expect(router.handle("/start/others/b")).to.equal(undefined);
		expect(router.handle("/super/x")).to.equal("super page with type x");
		expect(router.handle("/super/x/2")).to.equal(undefined);

		// Regression test
		expect(router.handle("/start")).to.equal("start page");
		expect(router.handle("/start/sub")).to.equal("start page sub");
	});

	it("should handle deeper urls with parameters", function() {
		router.addTemplate("/long/{type}/{id}", (params) => `long page with type ${params.type} and id ${params.id}`);
		router.addTemplate("/very-long/{type}/{id}/detail/{detail}", (params) => `very long page with type ${params.type}, id ${params.id}, and detail ${params.detail}`);

		expect(router.handle("/long/defined/123")).to.equal("long page with type defined and id 123");
		expect(router.handle("/long/defined")).to.equal(undefined);
		expect(router.handle("/very-long/again/abc-def/detail/look")).to.equal("very long page with type again, id abc-def, and detail look");
		expect(router.handle("/very-long/again")).to.equal(undefined);
	});

	it("should handle urls with ...rest parameters", function() {
		router.addTemplate("/simple-rest/{...rest}", (params) => `simple rest page with rest ${params.rest}`);

		expect(router.handle("/simple-rest/whatever")).to.equal("simple rest page with rest whatever");
		expect(router.handle("/simple-rest/whatever you want")).to.equal("simple rest page with rest whatever you want");
		expect(router.handle("/simple-rest/whatever/you/want")).to.equal("simple rest page with rest whatever/you/want");
	});

	it("should handle mixed urls with normal and ...rest parameters", function() {
		router.addTemplate("/mixed/{id}/a/{sub}/{...rest}", (params) => `mixed page with id ${params.id}, sub ${params.sub}, and rest ${params.rest}`);

		expect(router.handle("/mixed/123/a/xyz/something")).to.equal("mixed page with id 123, sub xyz, and rest something");
		expect(router.handle("/mixed/123/a/xyz")).to.equal(undefined);
		expect(router.handle("/mixed/123/a/xyz/something/or/another")).to.equal("mixed page with id 123, sub xyz, and rest something/or/another");
	});

	it("should remove templates", function() {
		router.removeTemplate("/start");
		expect(router.handle("/start")).to.equal(undefined);
	});
});


