export default class Bio {
	constructor() {
		this.id = "";
		this.slug = ""; // Friendly slug, for reporting
		this.name = "";
		this.organization = "";
		this.image = "";
		this.label = "";
		this.description = "";
		this.sectionID = "";
		this.position = undefined;
		this.translationOutdated = false;
		this.enabled = true;
	}
}