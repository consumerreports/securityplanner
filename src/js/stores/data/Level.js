export default class Level {

	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------

	constructor() {
		this.id = "";
		this.slug = "";
		this.title = "";
		this.recommendationsNeeded = 0;
		this.answersRequired = 0;
		this.statements = []; // Statement
		this.translationOutdated = false;
		this.enabled = true;
	}
}


