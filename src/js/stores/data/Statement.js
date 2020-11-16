export default class Statement {

	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------

	constructor() {
		this.id = "";
		this.slug = ""; // Friendly slug, for reporting
		this.text = "";
		this.image = "";
		this.backgroundColor = 0xffffff;
		this.level = ""; // String id
		this.requirements = []; // Array with statement ids and operators
		this.isRequired = false;
		this.selectedEffects = []; // Effect[]
		this.deselectedEffects = []; // Effect[]
		this.translationOutdated = false;
		this.enabled = true;

		this.selected = false;
	}
}