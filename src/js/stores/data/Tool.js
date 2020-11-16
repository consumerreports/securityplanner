export default class Tool {

	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------

	constructor() {
		this.id = "";
		this.slug = ""; // Friendly slug, for reporting
		this.threat = undefined;
		this.image = "";
		this.name = "";
		this.headline = "";
		this.label = "";
		this.price = "";
		this.shortDescription = "";
		this.overlayDescription = "";
		this.longDescription = "";
		this.whyItsImportant = "";
		this.buttons = []; // Link[]
		this.earlyRecommendationAllowed = false;
		this.translationOutdated = false;
		this.enabled = true;

		this.requirements = []; // Array with  statement ids and operators (to Statement.requirements)

		this.reviews = []; // Review[]
		this.resources = []; // ResourceLink[]

		this.recommendationPoints = 0;
		this.recommendationPointsOnLevel = 0;
		this.recommendationLevel = "";
	}
}
