export default class Review {

	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------

	constructor() {
		this.id = "";
		this.slug = ""; // Friendly slug, for reporting
		this.score = 0;
		this.review = ""; // Markdown text
		this.reviewTitle = "";
		this.author = ""; // Bio
		this.date = ""; // yyyy-mm-dd
		this.translationOutdated = false;
		this.enabled = true;
	}
}
