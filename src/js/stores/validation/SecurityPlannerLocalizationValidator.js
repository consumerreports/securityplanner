export default class SecurityPlannerLocalizationValidator {

	/**
	 * Checks the validity of all data, for sanity checking. Mostly for debugging purposes.
	 * Complementary to SecurityPlannerValidator, but acting on EN->Other Language only, for comparison.
	 */

	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------

	constructor(mainParser, languageParser) { // SecurityPlannerContentfulParser instances
		this.errors = [];
		this.warnings = [];

		this.mainParser = mainParser;
		this.languageParser = languageParser;

		this.languageId = this.languageParser.usedLanguage.id;

		this.validate();
	}


	// ================================================================================================================
	// PUBLIC INTERFACE -----------------------------------------------------------------------------------------------

	getErrors() {
		return this.errors;
	}

	getWarnings() {
		return this.warnings;
	}


	// ================================================================================================================
	// INTERNAL INTERFACE ---------------------------------------------------------------------------------------------

	/**
	 * Validates everything
	 */
	validate() {
		this.validateLevels();
		this.validateStatements();
		this.validateTools();
		this.validateBios();
		this.validateLinks();
		this.validateResourceLinks();
		this.validateReviews();
		this.validateThreats();
		this.validateLabels();
		this.validateCopy();
	}

	/**
	 * Test all levels ("questions")
	 */
	validateLevels() {
		const ml = this.mainParser.levels;
		const ol = this.languageParser.levels;

		ml.forEach((mainLevel, i) => {
			const description = `Language [${this.languageId}] question level ${i} [${mainLevel.slug}] `;
			const otherLevel = ol[i];
			if (mainLevel.title === otherLevel.title || !otherLevel.title) {
				this.errors.push(`${description}doesn't have a translated caption`);
			}
			if (otherLevel.translationOutdated) {
				this.errors.push(`${description}is marked as having an outdated translation`);
			}
		});
	}

	/**
	 * Test all statements ("answers")
	 */
	validateStatements() {
		const ms = this.mainParser.statements;
		const os = this.languageParser.statements;

		ms.forEach((mainStatement, i) => {
			const description = `Language [${this.languageId}] statement ${i} [${mainStatement.slug}] `;
			const otherStatement = os[i];
			if (mainStatement.text === otherStatement.text || !otherStatement.text) {
				this.errors.push(`${description}doesn't have a translated caption`);
			}
			if (otherStatement.translationOutdated) {
				this.errors.push(`${description}is marked as having an outdated translation`);
			}
		});
	}

	/**
	 * Test all tools
	 */
	validateTools() {
		const mt = this.mainParser.tools;
		const ot = this.languageParser.tools;

		mt.forEach((mainTool, i) => {
			const description = `Language [${this.languageId}] tool ${i} [${mainTool.slug}] `;
			const otherTool = ot.find((tool) => tool.id === mainTool.id );
			if (otherTool.translationOutdated) {
				this.errors.push(`${description}is marked as having an outdated translation`);
			}
			if (mainTool.name === otherTool.name || !otherTool.name) {
				this.warnings.push(`${description}doesn't have a translated name`);
			}
			if (mainTool.headline === otherTool.headline || !otherTool.headline) {
				this.errors.push(`${description}doesn't have a translated headline`);
			}
			if (mainTool.label === otherTool.label || !otherTool.label) {
				this.errors.push(`${description}doesn't have a translated label`);
			}
			if (mainTool.price && mainTool.price.match(/[a-z]/) && otherTool.price === mainTool.price) {
				this.errors.push(`${description}doesn't have a translated price`);
			}
			if (mainTool.shortDescription === otherTool.shortDescription || !otherTool.shortDescription || otherTool.shortDescription.match(/missing/i)) {
				this.errors.push(`${description}doesn't have a translated short description`);
			}
			if (mainTool.overlayDescription === otherTool.overlayDescription || !otherTool.overlayDescription || otherTool.overlayDescription.match(/missing/i)) {
				this.errors.push(`${description}doesn't have a translated overlay description`);
			}
			if (mainTool.longDescription === otherTool.longDescription || !otherTool.longDescription || otherTool.longDescription.match(/missing/i)) {
				this.errors.push(`${description}doesn't have a translated long description`);
			}
			if (mainTool.whyItsImportant === otherTool.whyItsImportant || !otherTool.whyItsImportant || otherTool.whyItsImportant.match(/missing/i)) {
				this.errors.push(`${description}doesn't have a translated why its important`);
			}
		});
	}

	/**
	 * Test all bios
	 */
	validateBios() {
		const mb = this.mainParser.bios;
		const ob = this.languageParser.bios;

		mb.forEach((mainBio, i) => {
			const description = `Language [${this.languageId}] bio ${i} [${mainBio.slug}] `;
			const otherBio = ob.find((bio) => bio.id === mainBio.id );
			if (otherBio.translationOutdated) {
				this.errors.push(`${description}is marked as having an outdated translation`);
			}
		});
	}

	/**
	 * Test all links
	 */
	validateLinks() {
		const ml = this.mainParser.links;
		const ol = this.languageParser.links;

		Object.keys(ml).forEach((key, i) => {
			const mainLink = ml[key];
			const description = `Language [${this.languageId}] link ${i} [${mainLink.slug}] `;
			const otherLink = ol[key];
			if (otherLink.translationOutdated) {
				this.errors.push(`${description}is marked as having an outdated translation`);
			}
		});
	}

	/**
	 * Test all resource links
	 */
	validateResourceLinks() {
		const ml = this.mainParser.resourceLinks;
		const ol = this.languageParser.resourceLinks;

		Object.keys(ml).forEach((key, i) => {
			const mainLink = ml[key];
			const description = `Language [${this.languageId}] tool resource link ${i} [${mainLink.slug}] `;
			const otherLink = ol[key];
			if (otherLink.translationOutdated) {
				this.errors.push(`${description}is marked as having an outdated translation`);
			}
		});
	}

	/**
	 * Test all tool reviews
	 */
	validateReviews() {
		const mr = this.mainParser.reviews;
		const or = this.languageParser.reviews;

		Object.keys(mr).forEach((key, i) => {
			const mainReview = mr[key];
			const description = `Language [${this.languageId}] tool review ${i} [${mainReview.slug}] `;
			const otherReview = or[key];
			if (otherReview.translationOutdated) {
				this.errors.push(`${description}is marked as having an outdated translation`);
			}
		});
	}

	/**
	 * Test all groups of tool threats
	 */
	validateThreats() {
		const mt = this.mainParser.threats;
		const ot = this.languageParser.threats;

		mt.forEach((mainThreat, i) => {
			const description = `Language [${this.languageId}] threat ${i} [${mainThreat.slug}] `;
			const otherThreat = ot.find((threat) => threat.id === mainThreat.id );
			if (mainThreat.name === otherThreat.name || !otherThreat.name) {
				this.errors.push(`${description}doesn't have a translated name`);
			}
			if (otherThreat.translationOutdated) {
				this.errors.push(`${description}is marked as having an outdated translation`);
			}
			if (mainThreat.longDescription === otherThreat.longDescription || !otherThreat.longDescription) {
				this.errors.push(`${description}doesn't have a translated long description`);
			}
			if (mainThreat.shortDescription === otherThreat.shortDescription || !otherThreat.shortDescription) {
				this.errors.push(`${description}doesn't have a translated short description`);
			}
			if (Boolean(mainThreat.stats) !== Boolean(otherThreat.stats)) {
				this.errors.push(`${description}should ${(!mainThreat.stats ? "not" : "")} have (translated) stats field to match`);
			}
			if (mainThreat.stats && mainThreat.stats === otherThreat.stats) {
				this.errors.push(`${description}doesn't have a translated stats field`);
			}
			if (Boolean(mainThreat.statsSource) !== Boolean(otherThreat.statsSource)) {
				this.errors.push(`${description}should ${(!mainThreat.statsSource ? "not" : "")} have stats source field to match`);
			}
			if (Boolean(mainThreat.statsName) !== Boolean(otherThreat.statsName)) {
				this.errors.push(`${description}should ${(!mainThreat.statsName ? "not" : "")} have stats name field to match`);
			}
		});
	}

	/**
	 * Test all tool labels
	 */
	validateLabels() {
		const ml = this.mainParser.labels;
		const ol = this.languageParser.labels;

		Object.keys(ml).forEach((key, i) => {
			const mainLabel = ml[key];
			const description = `Language [${this.languageId}] tool label ${i} [${mainLabel.value}] `;
			const otherLabel = ol[key];
			if (mainLabel.value === otherLabel.name || !otherLabel.value) {
				this.errors.push(`${description}doesn't have a translated value`);
			}
			if (otherLabel.translationOutdated) {
				this.errors.push(`${description}is marked as having an outdated translation`);
			}
		});
	}

	/**
	 * Test all other localization strings
	 */
	validateCopy() {
		const ms = this.mainParser.strings;
		const os = this.languageParser.strings;

		Object.keys(ms).forEach(key => {
			const description = `Language [${this.languageId}] copy string [${key}] `;
			const mainString = ms[key];
			const otherString = os[key];
			if (!otherString.value) {
				this.errors.push(`${description}is not present in translated version`);
			} else {
				if (mainString.value === otherString.value && !key.match(/url/) && mainString.length > 3) {
					this.errors.push(`${description}doesn't have a translated version`);
				}
			}
			if (otherString.translationOutdated) {
				this.errors.push(`${description}is marked as having an outdated translation`);
			}
		});
	}
}
