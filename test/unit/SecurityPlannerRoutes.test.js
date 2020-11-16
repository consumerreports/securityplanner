import SecurityPlannerRoutes from "./../../src/js/routing/SecurityPlannerRoutes";
import PreviewRoutes from "./../../src/js/routing/PreviewRoutes"

const previewRoutes = new PreviewRoutes;
const routes = new SecurityPlannerRoutes;

describe("SecurityPlannerRoutes", () => {
	test("should get all top level routes", () => {
		expect(routes.getUriCover()).toBe("/");
		expect(routes.getUriReport()).toBe("/action-plan");
		expect(routes.getUriAllTools()).toBe("/all-recommendations");
		expect(routes.getUriAbout()).toBe("/who-we-are");
		expect(routes.getUriPhilosophy()).toBe("/philosophy");
		expect(routes.getUriTerms()).toBe("/terms");
		expect(routes.getUriPrintTerms()).toBe("/terms-print");
		expect(routes.getUriFeedback()).toBe("/feedback");
		expect(routes.getUriOverlayShare()).toBe("/share");
		expect(routes.getUriNoMatch()).toBe("/404");
	});

	test("should get all sublevel routes", () => {
		expect(routes.getUriStatements(0)).toBe("/statements/1");
		expect(routes.getUriStatements()).toBe("/statements/{id}");
		expect(routes.getUriInterstitial(1)).toBe("/interstitial/2");
		expect(routes.getUriInterstitial()).toBe("/interstitial/{id}");
		expect(routes.getUriReportWithHash("page")).toBe("/action-plan/page");
		expect(routes.getUriPrintReport("page")).toBe("/action-plan-print/page");
		expect(routes.getUriAllToolsThreat("page")).toBe("/all-recommendations/page");
		expect(routes.getUriOverlayTool("page")).toBe("/tool/page");
		expect(routes.getUriOverlayBio("page")).toBe("/who-we-are/bio/page");
		expect(routes.getUriOverlayToolFeedback("page")).toBe("/tool/page/feedback");
		expect(routes.getUriOverlayThreatMenu("page")).toBe("/threat-menu/page");
		expect(routes.getUriOverlayToolsFilter("page")).toBe("/tools-filter/page");
		expect(routes.getUriPreview("page")).toBe("/preview/page");
	});

	test("should get preview page routes", () => {
		expect(previewRoutes.getUriTool("page")).toBe("tool/page");
		expect(previewRoutes.getUriTool()).toBe("tool/{toolSlug}");
		expect(previewRoutes.getUriBio("page")).toBe("bio/page");
		expect(previewRoutes.getUriBio()).toBe("bio/{bioSlug}");
		expect(previewRoutes.getUriEffects()).toBe("effects");
	});
});