export default class Language {

	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------

	constructor() {
		this.id = "";
		this.name = "";
		this.direction = "";
		this.fallbackLanguage = "";
		this.default = false;
		this.enabled = true;
		this.code = "";
	}
}

Language.DIRECTION_RTL = "right-to-left";
Language.DIRECTION_LTR = "left-to-right";