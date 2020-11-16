import MiniRouter from "./../vendor/routing/MiniRouter";

export default class PreviewRoutes {

	/*
	All routes used by the app inside the "preview" page
	*/

	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------

	constructor() {
	}


	// ================================================================================================================
	// PUBLIC INTERFACE -----------------------------------------------------------------------------------------------

	getUriTool(toolSlug) {
		return "tool/" + (toolSlug == undefined ? (MiniRouter.PARAMETER_BRACKET_START + "toolSlug" + MiniRouter.PARAMETER_BRACKET_END) : toolSlug);
	}

	getUriBio(bioSlug) {
		return "bio/" + (bioSlug == undefined ? (MiniRouter.PARAMETER_BRACKET_START + "bioSlug" + MiniRouter.PARAMETER_BRACKET_END) : bioSlug);
	}

	getUriEffects() {
		return "effects";
	}
}