export default class Threat {

	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------

	constructor() {
		this.id = "";
		this.slug = ""; // Friendly slug, for reporting
		this.name = "";
		this.shortDescription = ""; // "Defend your device."
		this.longDescription = ""; // "Your top priority should be to depend your device."
		this.stats = "";
		this.statsSource = "";
		this.statsName = "";
		this.isAdditionalHelp = undefined; // This is the "additional help" threat category
		this.translationOutdated = false;
		this.deprioritizeInLists = false;
	}
}


