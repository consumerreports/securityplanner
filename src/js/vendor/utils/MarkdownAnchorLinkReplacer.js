import ADAUtils from "./ADAUtils";
// Replace anchor links found in parsed Markdown HTML
// With onclick events, either by
// assigning a link a custom function or
// firing off the corresponding React route

export default class MarkdownAnchorLinkReplacer {
	constructor(goToRoute, checkPage) {
		this.goToRoute = goToRoute;
		this.checkPage = checkPage;
	}

	replaceDOMLinksWithRoutes(dom, linkReplacements) {
		const self = this;
		if (!dom) {
			return null;
		}
		// Get the sections's DOM Node
		const el = dom.elConstructor;
		if (!el) {
			return null;
		}

		// Get all links inside the element
		const linkEls = el.querySelectorAll("a");

		// check for linkReplacements and existing routes for all <a> elements, 
		// and reassign default behaviour as appropriate;
		for (const linkEl of linkEls) {
			let replaced = false;
			let href = linkEl.getAttribute("href");
			if (!href) {
				continue;
			}
			href = href.replace("#", "");
			
			// check if the link's href matches
			// any hrefs in the linkReplacements collection
			// and assign their custom onclick functions 
			replaced = this.checkForLinkReplacements(linkEl, href, linkReplacements);

			if (replaced) {
				continue;
			}

			// Check if a route exists for the link, otherwise, leave as-is.
			try {
				self.checkPage(href);
				linkEl.onclick = () => {self.goToRoute(href, true, true);};
				linkEl.tabIndex = "0";
				linkEl.onkeydown = (e) => {
					if (e.type === "keydown") {
						if (e.keyCode == 32 || e.keyCode == 13) {
							self.goToRoute(href, true, true);
							e.preventDefault();
						}
					}
				};
				linkEl.removeAttribute("href");
			} catch (e) {
				continue;
			}
		}
	}

	// Check linkReplacements collection for match with href and
	// assign custom onclick function. Mark href as replaced.
	checkForLinkReplacements(linkEl, href, linkReplacements) {
		let replaced = false;
		if (linkReplacements && Array.isArray(linkReplacements)) {
			linkReplacements.map(function(linkReplacement) {
				if (linkReplacement.href === href) {
					linkEl.removeAttribute("href");
					linkEl.onclick = linkReplacement.replacementFunction;
					replaced = true;
				}
			});
		}
		return false;
	}
}