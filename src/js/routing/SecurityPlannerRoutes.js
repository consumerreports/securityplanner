import MiniRouter from "./../vendor/routing/MiniRouter";

export default class SecurityPlannerRoutes {

	/*
	All routes used by the app
	*/

	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------

	constructor() {
	}


	// ================================================================================================================
	// PUBLIC INTERFACE -----------------------------------------------------------------------------------------------

	getUriCover() {
		return "/";
	}

	getUriStatements(levelIndex) {
		return "/statements/" + (isNaN(levelIndex) ? (MiniRouter.PARAMETER_BRACKET_START + "id" + MiniRouter.PARAMETER_BRACKET_END) : levelIndex + 1);
	}

	getUriInterstitial(levelIndex) {
		return "/interstitial/" + (isNaN(levelIndex) ? (MiniRouter.PARAMETER_BRACKET_START + "id" + MiniRouter.PARAMETER_BRACKET_END) : levelIndex + 1);
	}

	getUriReport() {
		return "/action-plan";
	}

	getUriReportWithHash(stateHash) {
		return "/action-plan/" + (stateHash == undefined ? (MiniRouter.PARAMETER_BRACKET_START + "hash" + MiniRouter.PARAMETER_BRACKET_END) : stateHash);
	}

	getUriPrintReport(stateHash) {
		return "/action-plan-print/" + (stateHash == undefined ? (MiniRouter.PARAMETER_BRACKET_START + "hash" + MiniRouter.PARAMETER_BRACKET_END) : stateHash);
	}

	getUriAllTools() {
		return "/all-recommendations";
	}

	getUriAllToolsThreat(threatSlug) {
		return "/all-recommendations/" + (threatSlug == undefined ? (MiniRouter.PARAMETER_BRACKET_START + "threatSlug" + MiniRouter.PARAMETER_BRACKET_END) : threatSlug);
	}

	getUriAbout() {
		return "/who-we-are";
	}

	getUriPhilosophy() {
		return "/philosophy";
	}

	getUriTerms() {
		return "/terms";
	}
	
	getUriPrintTerms() {
		return "/terms-print";
	}

	getUriFeedback() {
		return "/feedback";
	}

	getUriOverlayShare() {
		return "/share";
	}

	getUriOverlayTool(toolSlug) {
		return "/tool/" + (toolSlug == undefined ? (MiniRouter.PARAMETER_BRACKET_START + "toolSlug" + MiniRouter.PARAMETER_BRACKET_END) : toolSlug);
	}

	getUriOverlayBio(bioSlug) {
		return "/who-we-are/bio/" + (bioSlug == undefined ? (MiniRouter.PARAMETER_BRACKET_START + "bioSlug" + MiniRouter.PARAMETER_BRACKET_END) : bioSlug);
	}

	getUriOverlayToolFeedback(toolSlug) {
		return "/tool/" + (toolSlug == undefined ? (MiniRouter.PARAMETER_BRACKET_START + "toolSlug" + MiniRouter.PARAMETER_BRACKET_END) : toolSlug) + "/feedback";
	}

	getUriOverlayThreatMenu(transportId) {
		return "/threat-menu/" + (transportId == undefined ? (MiniRouter.PARAMETER_BRACKET_START + "transportId" + MiniRouter.PARAMETER_BRACKET_END) : transportId);
	}

	getUriOverlayToolsFilter(transportId) {
		return "/tools-filter/" + (transportId == undefined ? (MiniRouter.PARAMETER_BRACKET_START + "transportId" + MiniRouter.PARAMETER_BRACKET_END) : transportId);
	}

	getUriPreview(rest) {
		return "/preview/" + (rest == undefined ? (MiniRouter.PARAMETER_BRACKET_START + MiniRouter.PARAMETER_REST_START + "rest" + MiniRouter.PARAMETER_BRACKET_END) : rest);
	}

	getUriNoMatch() {
		return "/404";
	}
}
