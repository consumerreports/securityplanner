/* eslint-disable no-console */

/**
 * Small text content loading manager
 * This is a separate, small JS file to allow better parallel loading
 */

import SecurityPlannerConstants from "./constants/SecurityPlannerConstants";
import ContentfulLoader from "./stores/loading/ContentfulLoader";

// This object holds all the content
window.contentInit = function() {
	// Create the content holder as a global reference so app.js code can access it
	const contentLoader = new ContentfulLoader(
		SecurityPlannerConstants.Content.CONTENTFUL_SPACE_ID,
		SecurityPlannerConstants.Parameters.IS_PREVIEWING ? SecurityPlannerConstants.Content.CONTENTFUL_PREVIEW_KEY : SecurityPlannerConstants.Content.CONTENTFUL_DELIVERY_KEY,
		SecurityPlannerConstants.Parameters.IS_PREVIEWING
	);

	contentLoader.onComplete.add(loader => {
		window.contentComplete(loader);
	});

	contentLoader.load();
};

window.contentComplete = function(loader) {
	// Decides on default languages
	window.preferredLanguages = navigator.languages ? navigator.languages.concat() : [navigator.language || navigator.userLanguage];
	// If a language parameter is passed, it's the first option
	const replacementLanguage = SecurityPlannerConstants.Parameters.PREFERRED_LANGUAGE;
	if (replacementLanguage) window.preferredLanguages.unshift(replacementLanguage);

	// End; this will signal to the app that it's ok to start
	window.contentLoader = loader;
};

window.contentInit();

/* eslint-enable no-console */
