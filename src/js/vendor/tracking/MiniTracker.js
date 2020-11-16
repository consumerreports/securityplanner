export default class MiniTracker {

	// ================================================================================================================
	// PUBLIC STATIC INTERFACE ----------------------------------------------------------------------------------------

	static trackPage(pageId) {
		if (pageId.substr(0, 1) != "/") pageId = "/" + pageId;

		if (!!window.ga && pageId != MiniTracker.lastTrackedPageId) {
			window.ga("send", "pageview", pageId);

			MiniTracker.lastTrackedPageId = pageId;

			if (MiniTracker.isLogging) console.log("[TRACK] Page: [" + pageId + "]"); // eslint-disable-line
		}
	}

	static trackEvent(category, action, label, value, nonInteraction) {
		// Eg. button, click, nav button, 4
		if (window.ga) {
			window.ga("send", "event", category, action, label, value, {
				"nonInteraction": nonInteraction,
				"page": MiniTracker.lastTrackedPageId,
			});

			if (MiniTracker.isLogging) console.log("[TRACK] Event: Category [" + category + "], Action [" + action + "], Label [" + label + "], Value [" + value + "] "); // eslint-disable-line
		}
	}
}

MiniTracker.lastTrackedPageId = undefined;
MiniTracker.isLogging = false;