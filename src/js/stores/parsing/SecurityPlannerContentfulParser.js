import StringUtils from "../../vendor/utils/StringUtils";

import SecurityPlannerConstants from "../../constants/SecurityPlannerConstants";

import Bio from "../data/Bio";
import Effect from "../data/Effect";
import Language from "../data/Language";
import Level from "../data/Level";
import Link from "../data/Link";
import ResourceLink from "../data/ResourceLink";
import Review from "../data/Review";
import SecurityState from "../data/SecurityState";
import Statement from "../data/Statement";
import Threat from "../data/Threat";
import Tool from "../data/Tool";
import PrimitiveString from "../data/PrimitiveString";

export default class SecurityPlannerContentfulParser {

	/**
	 * Parses data from contentful into the models we need
	 */

	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------

	constructor(contentfulLoader, desiredLanguages, skipMassagingData = false) {
		this.errors = [];
		this.warnings = [];

		this.skipMassagingData = skipMassagingData;

		this.desiredLanguages = desiredLanguages;
		this.contentfulLoader = contentfulLoader;
		this.defaultLanguage = undefined; // Language
		this.usedLanguage = undefined;	// Language; Picked later, when parsing languages

		// Support meta-data
		this.languages = [];			// Array of Language
		this.colors = {};				// key: id, value: integer

		// Real data
		this.statements = [];			// Array of Statement
		this.levels = [];				// Array of Level
		this.tools = [];				// Array of Tool
		this.threats = [];				// Array of Threat
		this.bios = []; 				// Array of Bio

		this.strings = {};				// Key: id, value: PrimitiveString

		// Aux data (children)
		this.reviews = {};				// Key: id, value: Review
		this.links = {};				// Key: id, value: Link
		this.resourceLinks = {};		// Key: id, value: ResourceLink
		this.labels = {};				// Key: id, value: PrimitiveString

		// Parse everything
		this.parse();
	}


	// ================================================================================================================
	// PUBLIC INTERFACE -----------------------------------------------------------------------------------------------

	getErrors() {
		return this.errors;
	}

	getWarnings() {
		return this.warnings;
	}

	/**
	 * Try to set the content to a new language id
	 */
	setLanguage(languageId) {
		const lang = this.languages.find(language => language.id == languageId);
		if (lang) {
			// Changing the html lang attribute dynamically
			if (lang.code) {
				document.documentElement.lang = lang.code;
			}

			this.usedLanguage = lang;
			this.parse(true);
		}
	}

	/**
	 * All the metadata available
	 */
	getMetadata() {
		return this.contentfulLoader.metadata;
	}

	/**
	 * Generate a simple list of strings
	 */
	getStrings() {
		const strs = {};
		Object.keys(this.strings).forEach(key => {
			strs[key] = this.strings[key].value;
		});
		return strs;
	}


	// ================================================================================================================
	// INTERNAL INTERFACE ---------------------------------------------------------------------------------------------

	/**
	 * Parses everything
	 */
	parse(redo = false) {
		if (!redo) this.parseLanguages();
		if (!redo) this.parseColors();
		this.parseStrings(redo);
		this.parseBios(redo);
		this.parseThreats(redo);
		this.parseReviews(redo);
		this.parseLinks(redo);
		this.parseResourceLinks(redo);
		this.parseLabels(redo);
		this.parseStatements(redo); // Depends on labels, colors, assets, links, resource links, threats
		this.parseQuestions(redo); // Depends on, and modifies, statements
		this.parseTools(redo); // Depends on links, resource links, reviews, threats, and labels
		if (!redo) this.parseEffects(); // Depends on a lot, modifies statements

		if (SecurityPlannerConstants.Parameters.IS_DEBUGGING) {
			/* eslint-disable no-console */
			console.log("LEVELS (" + this.levels.length + "): ", this.levels);
			console.log("STATEMENTS (" + this.statements.length + "): ", this.statements);
			console.log("TOOLS (" + this.tools.length + "): ", this.tools);
			console.log("THREATS (" + this.threats.length + "): ", this.threats);
			console.log("BIOS (" + this.bios.length + "): ", this.bios);
			/* eslint-enable no-console */
		}
	}

	/**
	 * Parses available languages
	 */
	parseLanguages() {
		const tLanguages = this.contentfulLoader.getEntries().language;
		this.languages = tLanguages.map(language => {
			const langData = this.getLocaleNode(language);
			const newLanguage = Object.assign(new Language(), {
				id: langData.id,
				name: langData.name,
				direction: langData.direction,
				fallbackLanguage: langData.fallbackLanguage,
				default: langData.default,
				enabled: langData.enabled,
				code: langData.code
			});
			return newLanguage;
		});

		this.languages = this.removeDisabledItems(this.languages);

		this.defaultLanguage = this.languages.find(language => language.default) || this.languages[0];

		// Also pick whatever language fits best
		let bestFit = undefined;
		for (let i = 0; i < this.desiredLanguages.length; i++) {
			// Search all available languages for a perfect fit
			const desiredLanguageId = this.desiredLanguages[i];
			bestFit = this.languages.find(language => language.id === desiredLanguageId);
			if (bestFit) break;
			// Search for a close fit (e.g. "en-US" matches "en")
			bestFit = this.languages.find(language => language.id.substr(0, 2) === desiredLanguageId.substr(0, 2));
			if (bestFit) break;
		}

		// If not found, just use the CMS's default language
		if (!bestFit) bestFit = this.defaultLanguage;

		this.usedLanguage = bestFit;
	}

	/**
	 * Parse and interprets all colors
	 */
	parseColors() {
		this.colors = {};
		const tColors = this.contentfulLoader.getEntries().color;
		tColors.forEach(color => {
			const colorData = this.getLocaleNode(color);
			if (!colorData.code) {
				return;
			}

			this.colors[colorData._id] = this.parseColor(colorData.code);
		});
	}

	/**
	 * Biopic enties
	 */
	parseBios(inPlace) {
		const tBios = this.contentfulLoader.getEntries().bio;
		let newBios = tBios.map(bio => {
			const bioData = this.getLocaleNode(bio, this.usedLanguage.id);
			const bioDataEN = this.getLocaleNode(bio);
			const newBio = Object.assign(new Bio(), {
				id: bioData._id,
				slug: StringUtils.slugify(bioDataEN.name),
				name: bioData.name,
				organization: bioData.organization,
				image: this.getAssetURL(bioData.image.sys.id),
				label: bioData.label,
				description: bioData.description,
				sectionID: bioData.section,
				position: bioData.position ? bioData.position : 9999,
				translationOutdated: bioData.translationOutdated,
				enabled: bioData.enabled,
			});
			return newBio;
		});

		newBios = this.removeDisabledItems(newBios);

		// Sort by position, and if not available, by alphabetical order
		newBios.sort((a, b) => {
			if (a.position < b.position) return -1;
			if (a.position > b.position) return 1;
			if (a.slug < b.slug) return -1;
			if (a.slug > b.slug) return 1;
			return 0;
		});

		if (!inPlace) {
			this.bios = newBios;
		} else {
			this.mergeArrays(this.bios, newBios);
		}
	}

	/**
	 * Parses tools' threat groups
	 */
	parseThreats(inPlace) {
		const tThreats = this.contentfulLoader.getEntries().threat;
		const newThreats = tThreats.map(threat => {
			const threatData = this.getLocaleNode(threat, this.usedLanguage.id);
			const threatDataEN = this.getLocaleNode(threat);
			const newThreat = Object.assign(new Threat(), {
				id: threatData._id,
				slug: StringUtils.slugify(threatDataEN.name),
				name: threatData.name,
				shortDescription: threatData.description,
				longDescription: threatData.recommendation,
				stats: threatData.statistics,
				statsSource: threatData.statisticsSourceUrl,
				statsName: threatData.statisticsSource,
				isAdditionalHelp: threatData.isAdditionalHelp,
				translationOutdated: threatData.translationOutdated,
				deprioritizeInLists: !!threatData.deprioritizeInLists,
			});
			return newThreat;
		});

		// For testing purposes:
		// newThreats[0].name = "a";
		// newThreats[1].name = "bbbbb bbbb bbb"; // works in large
		// newThreats[1].name = "bbbbb bbbb bbbb"; // break in large, works in largest medium

		if (!inPlace) {
			this.threats = newThreats;
		} else {
			this.mergeArrays(this.threats, newThreats);
		}
	}

	/**
	 * Reviews for tools
	 */
	parseReviews(inPlace) {
		let newReviews = {};
		const tReviews = this.contentfulLoader.getEntries().review;
		tReviews.forEach(review => {
			if (!review.author) {
				return;
			}

			const reviewData = this.getLocaleNode(review, this.usedLanguage.id);
			const reviewDataEN = this.getLocaleNode(review);
			const newReview = Object.assign(new Review(), {
				id: reviewData._id,
				slug: undefined,
				score: reviewData.score,
				review: reviewData.review,
				reviewTitle: reviewData.reviewTitle,
				author: this.getBio(reviewDataEN.author.sys.id),
				date: reviewData.date,
				translationOutdated: reviewData.translationOutdated,
				enabled: reviewData.enabled,
			});
			newReview.slug = StringUtils.slugify((reviewDataEN.author ? reviewDataEN.author.name : "?") + "-" + newReview.score);
			newReviews[newReview.id] = newReview;
		});

		newReviews = this.removeDisabledItems(newReviews);

		if (!inPlace) {
			this.reviews = newReviews;
		} else {
			this.mergeObjects(this.reviews, newReviews);
		}
	}

	/**
	 * Links, used in several places
	 */
	parseLinks(inPlace) {
		const newLinks = {};
		const tLinks = this.contentfulLoader.getEntries().link;
		tLinks.forEach(link => {
			const linkData = this.getLocaleNode(link, this.usedLanguage.id);
			const linkDataEN = this.getLocaleNode(link);
			const newLink = Object.assign(new Link(), {
				id: linkData._id,
				slug: StringUtils.slugify(linkDataEN.caption) + "--" + StringUtils.slugify(linkDataEN.url),
				caption: linkData.caption,
				url: linkData.url,
				translationOutdated: linkData.translationOutdated,
			});
			newLinks[newLink.id] = newLink;
		});

		if (!inPlace) {
			this.links = newLinks;
		} else {
			this.mergeObjects(this.links, newLinks);
		}
	}

	/**
	 * Resource links, used in tools
	 */
	parseResourceLinks(inPlace) {
		const newResourceLinks = {};
		const tResourceLinks = this.contentfulLoader.getEntries().resourceLink;
		tResourceLinks.forEach(resourceLink => {
			const linkData = this.getLocaleNode(resourceLink, this.usedLanguage.id);
			const linkDataEN = this.getLocaleNode(resourceLink);
			const newLink = Object.assign(new ResourceLink(), {
				id: linkData._id,
				slug: StringUtils.slugify(linkDataEN.caption) + "--" + StringUtils.slugify(linkDataEN.source || ""),
				caption: linkData.caption,
				url: linkData.url,
				source: linkData.source,
				translationOutdated: linkData.translationOutdated,
			});
			newResourceLinks[newLink.id] = newLink;
		});

		if (!inPlace) {
			this.resourceLinks = newResourceLinks;
		} else {
			this.mergeObjects(this.resourceLinks, newResourceLinks);
		}
	}

	/**
	 * Parse tool labels
	 */
	parseLabels(inPlace) {
		const newLabels = {};
		const tLabels = this.contentfulLoader.getEntries().label;
		tLabels.forEach(label => {
			const labelData = this.getLocaleNode(label, this.usedLanguage.id);
			const newLabel = Object.assign(new PrimitiveString(), {
				id: labelData._id,
				value: labelData.caption,
				translationOutdated: labelData.translationOutdated,
			});
			newLabels[labelData._id] = newLabel;
		});

		if (!inPlace) {
			this.labels = newLabels;
		} else {
			this.mergeObjects(this.labels, newLabels);
		}
	}

	/**
	 * Parses statement cards
	 */
	parseStatements(inPlace) {
		const tStatements = this.contentfulLoader.getEntries().statement;
		let newStatements = tStatements.map(statement => {
			if (Object.keys(statement).length <= 1) {
				return;
			}

			const statementData = this.getLocaleNode(statement, this.usedLanguage.id);
			const statementDataEN = this.getLocaleNode(statement);
			const newStatement = Object.assign(new Statement(), {
				id: statementData._id,
				slug: StringUtils.slugify(statementDataEN.caption),
				text: statementData.caption,
				image: this.getAssetURL(statementData.image.sys.id),
				backgroundColor: this.getColor(statementData.backgroundColor.sys.id),
				isRequired: statementData.alwaysVisible,
				requirements: this.getStatementRequirementsAny(statementData.prerequisites),
				translationOutdated: statementData.translationOutdated,
				enabled: statementData.enabled,
				// These will come later
				level: undefined, // added during parseQuestions()
				selectedEffects: [], // added during parseEffects()
				deselectedEffects: [], // added during parseEffects()
			});
			return newStatement;
		});

		newStatements = this.removeDisabledItems(newStatements);

		if (!inPlace) {
			this.statements = newStatements;
		} else {
			this.mergeArrays(this.statements, newStatements, ["selected"]);
		}
	}

	/**
	 * Parse question levels
	 */
	parseQuestions(inPlace) {
		const tQuestions = this.contentfulLoader.getEntries().question;
		let newLevels = tQuestions.map(question => {
			const questionData = this.getLocaleNode(question, this.usedLanguage.id);
			const questionDataEN = this.getLocaleNode(question);
			const newLevel = Object.assign(new Level(), {
				id: questionData._id,
				order: questionData.order,
				slug: StringUtils.slugify(questionData.order + "--" + questionDataEN.title),
				title: questionData.title,
				recommendationsNeeded: questionData.showRecommendationAfter ? 1 : 0,
				answersRequired: questionData.minimumRequiredStatements,
				translationOutdated: questionData.translationOutdated,
				enabled: questionData.enabled,
			});

			// Also update the statements, with which level they belong to
			const statementsData = questionData.statements;
			statementsData.forEach(statementData => {
				const statement = this.getStatement(statementData.sys.id);
				if (statement) {
					statement.level = newLevel.id;
					newLevel.statements.push(statement);
				}
			});

			return newLevel;
		});

		newLevels = this.removeDisabledItems(newLevels);

		// Re-order
		newLevels.sort((a, b) => {
			if (a.order < b.order) return -1;
			if (a.order > b.order) return 1;
			return 0;
		});

		if (!inPlace) {
			this.levels = newLevels;
		} else {
			this.mergeArrays(this.levels, newLevels);
		}
	}

	/**
	 * Parse tools
	 */
	parseTools(inPlace) {
		const tTools = this.contentfulLoader.getEntries().tool;
		let newTools = tTools.map(tool => {
			if (Object.keys(tool).length <= 1) {
				return;
			}

			const toolData = this.getLocaleNode(tool, this.usedLanguage.id);
			const toolDataEN = this.getLocaleNode(tool);

			// Massage data: if they used the word "Free" in the cost, remove it
			const freeEquivalent = this.strings["all-tools-filter-cost-free"].value;
			if (!this.skipMassagingData && toolDataEN.cost && freeEquivalent && toolDataEN.cost.toLowerCase() === freeEquivalent.toLowerCase()) {
				toolDataEN.cost = "";
				toolData.cost = "";
			}

			const newTool = Object.assign(new Tool(), {
				id: toolData._id,
				slug: StringUtils.slugify(toolDataEN.name),
				threat: this.getThreat(toolData.threat.sys.id),
				image: this.getAssetURL(toolData.image.sys.id),
				name: toolData.name,
				headline: toolData.callToAction,
				label: this.getLabelValue(toolData.label.sys.id),
				price: toolData.cost,
				shortDescription: toolData.shortDescription,
				longDescription: toolData.longDescription,
				overlayDescription: toolData.overlayDescription,
				whyItsImportant: toolData.whyItsImportant,
				buttons: this.getLinkList(toolData.buttons),
				earlyRecommendationAllowed: toolData.allowAsEarlyRecommendation,
				translationOutdated: toolData.translationOutdated,
				enabled: toolData.enabled,
				requirements: this.getStatementRequirementsAny(toolData.prerequisites),
				reviews: this.getReviewList(toolData.reviews),
				resources: this.getResourceLinkList(toolData.resources),
			});
			return newTool;
		});

		newTools = this.removeDisabledItems(newTools);

		if (!inPlace) {
			this.tools = newTools;
		} else {
			this.mergeArrays(this.tools, newTools);
		}
	}

	/**
	 * Parse statement selection effects for tools
	 */
	parseEffects() {
		const tEffects = this.contentfulLoader.getEntries().effect;
		tEffects.forEach(effect => {
			const effectData = this.getLocaleNode(effect, this.usedLanguage.id);
			const statement = this.getStatement(effectData.statement.sys.id);
			if (statement && effectData.tools) {
				const newEffect = new Effect();
				const points = effectData.points;
				const tools = effectData.tools ? effectData.tools.map(tool => tool.sys.id) : [];
				tools.forEach(toolId => {
					newEffect.tools[toolId] = points;
				});

				const whenSelected = effectData.value;
				if (whenSelected) {
					statement.selectedEffects.push(newEffect);
				} else {
					statement.deselectedEffects.push(newEffect);
				}
			}
		});
	}

	/**
	 * All other strings
	 */
	parseStrings(inPlace) {
		const newStrings = {};

		// String copy
		const tCopy = this.contentfulLoader.getEntries().copy;
		if (tCopy) tCopy.forEach(copy => {
			const copyData = this.getLocaleNode(copy, this.usedLanguage.id);
			const newCopy = Object.assign(new PrimitiveString(), {
				id: copyData.id,
				value: copyData.value,
				translationOutdated: copyData.translationOutdated,
			});
			newStrings[copyData.id] = newCopy;
		});

		// String (long) copy
		const tCopyBody = this.contentfulLoader.getEntries().copyBody;
		if (tCopyBody) tCopyBody.forEach(copyBody => {
			const copyData = this.getLocaleNode(copyBody, this.usedLanguage.id);
			const newCopy = Object.assign(new PrimitiveString(), {
				id: copyData.id,
				value: copyData.value,
				translationOutdated: copyData.translationOutdated,
			});
			newStrings[copyData.id] = newCopy;
		});

		if (!inPlace) {
			this.strings = newStrings;
		} else {
			this.mergeObjects(this.strings, newStrings);
		}
	}

	/**
	 * Returns a node with data from a specific locale
	 */
	getLocaleNode(node, preferredLocale = undefined) {
		const newObj = {};

		// Creates list of all preferred locales; default first, followed by its fallbacks, and finally our hard-coded default
		let locales = [];

		// Add preferred languages
		if (preferredLocale) {
			locales.push(preferredLocale);
			// Also add their fallbacks
			locales = locales.concat(this.getLocaleFallbacks(preferredLocale, locales));
		}

		// Also add the hardcoded default
		locales.push(this.defaultLanguage ? this.defaultLanguage.id : SecurityPlannerContentfulParser.DEFAULT_LANGUAGE);

		// Finally, search for a node with that key in the object
		for (const key in node) {
			let value = node[key];
			// If it has a key with any of the preferred locales, use it
			for (let i = 0; i < locales.length; i++) {
				if (value.hasOwnProperty(locales[i])) {
					value = value[locales[i]];
					break;
				}
			}
			newObj[key] = value;
		}
		return newObj;
	}

	/**
	 * Based on a locale (e.g. "en-US"), get all fallback as defined by the languages
	 */
	getLocaleFallbacks(locale, ignoreLanguages = []) {
		let locales = [];

		// Search in all languages
		for (let i = 0; i < this.languages.length; i++) {
			if (this.languages[i].id === locale) {
				const fallbackLocale = this.languages[i].fallbackLanguage;
				if (fallbackLocale && ignoreLanguages.indexOf(fallbackLocale) === -1) {
					// Has fallback
					locales.push(fallbackLocale);

					// Also add all fallbacks of the fallback
					const allFallbacks = this.getLocaleFallbacks(fallbackLocale, ignoreLanguages.concat(locale));
					if (allFallbacks && allFallbacks.length > 0) locales = locales.concat(allFallbacks);
				}
				break;
			}
		}

		return locales;
	}

	/**
	 * Based on a list of statement records, returns a list of requirements following our query format.
	 * I.e. ["statement-id-1", "or", "statement-id-2"]
	 *
	 * Notice that the parsing is simplified. The actual engine when selecting allows much more complex querying:
	 * Simple: ['my-organization-needs-better-security-practices']
	 * Negation: ['!my-organization-needs-better-security-practices']
	 * OR: ['my-accounts-are-not-secure-enough', 'or', 'mistakenly-entering-passwords-on-suspicious-web-sites']
	 * AND: ['my-accounts-are-not-secure-enough', 'and', 'mistakenly-entering-passwords-on-suspicious-web-sites']
	 * Parenthesis: ['my-accounts-are-not-secure-enough', 'and', ['mistakenly-entering-passwords-on-suspicious-web-sites', 'or', 'other']]
	 */
	getStatementRequirementsAny(statements) {
		const list = [];
		if (statements) {
			statements.forEach(statement => {
				if (list.length > 0) list.push(SecurityState.REQUIREMENTS_OPERATOR_OR);
				list.push(statement.sys.id);
			});
		}
		return list;
	}

	/**
	 * Based on an id, return the URL of an asset
	 */
	getAssetURL(id) {
		const assets = this.contentfulLoader.getAssets();
		if (assets.hasOwnProperty(id)) {
			return assets[id].url;
		} else {
			this.errors.push(`Tried reading an asset id of type ${id} that was not found`);
			return `ASSET_${id}_NOT_FOUND_URL`;
		}
	}

	/**
	 * Based on a color id, return an integer
	 */
	getColor(id) {
		if (this.colors.hasOwnProperty(id)) {
			return this.colors[id];
		} else {
			this.errors.push(`Tried reading a color with id ${id} that was not found`);
			return 0x000000;
		}
	}


	/**
	 * Based on an id, return a threat
	 */
	getThreat(id) {
		const threat = this.threats.find(threat => threat.id === id);
		if (threat) {
			return threat;
		} else {
			this.errors.push(`Tried reading a threat with id ${id} that was not found`);
			return undefined;
		}
	}

	/**
	 * Based on an id, return a statement
	 */
	getStatement(id) {
		const statement = this.statements.find(statement => statement.id === id);
		if (statement) {
			return statement;
		} else {
			this.errors.push(`Tried reading a statement with id ${id} that was not found`);
			return undefined;
		}
	}

	/**
	 * Based on a label id, return its string
	 */
	getLabelValue(id) {
		if (this.labels.hasOwnProperty(id)) {
			return this.labels[id].value;
		} else {
			this.errors.push(`Tried reading a label with id ${id} that was not found`);
			return "NOT-FOUND";
		}
	}

	/**
	 * Based on a link id, return its Link
	 */
	getLink(id) {
		if (this.links.hasOwnProperty(id)) {
			return this.links[id];
		} else {
			this.errors.push(`Tried reading a link with id ${id} that was not found`);
			return undefined;
		}
	}

	/**
	 * Based on a resource link id, return its ResourceLink
	 */
	getResourceLink(id) {
		if (this.resourceLinks.hasOwnProperty(id)) {
			return this.resourceLinks[id];
		} else {
			this.errors.push(`Tried reading a resourceLink with id ${id} that was not found`);
			return undefined;
		}
	}

	/**
	 * Based on a review id, return its Review
	 */
	getReview(id) {
		if (this.reviews.hasOwnProperty(id)) {
			return this.reviews[id];
		} else {
			this.errors.push(`Tried reading a review with id ${id} that was not found`);
			return undefined;
		}
	}

	/**
	 * Based on a bio id, return its Bio
	 */
	getBio(id) {
		const bio = this.bios.find(bio => bio.id === id);
		if (bio) {
			return bio;
		} else {
			this.errors.push(`Tried reading a bio with id ${id} that was not found`);
			return undefined;
		}
	}

	/**
	 * Pastes one array on top of another array, to change it in-place without changing references
	 */
	mergeArrays(originalList, newList, ignoreFields = []) {
		if (originalList.length != newList.length) {
			console.warn("Error: cannot merge arrays properly, different lenghts!"); // eslint-disable-line
		}
		originalList.forEach((oldItem, oldIndex) => {
			for (const key in oldItem) {
				if (!ignoreFields || ignoreFields.indexOf(key) == -1) {
					const t = typeof(oldItem[key]);
					if (t === "string" || t === "number" || t === "boolean" || t === "undefined") {
						oldItem[key] = newList[oldIndex][key];
					}
				}
			}
		});
	}

	/**
	 * Pastes one object on top of another array, to change it in-place without changing references
	 */
	mergeObjects(originalObject, newObject, levels = 1) {
		if (Object.keys(originalObject).length != Object.keys(newObject).length) {
			console.warn("Error: cannot merge objects properly, different number of values!"); // eslint-disable-line
		}
		Object.keys(originalObject).forEach(oldKey => {
			const oldItem = originalObject[oldKey];
			const t = typeof(oldItem);
			if (t === "string" || t === "number" || t === "boolean" || t === "undefined") {
				originalObject[oldKey] = newObject[oldKey];
			} else if (t === "object" && !Array.isArray(oldItem) && levels > 0) {
				this.mergeObjects(oldItem, newObject[oldKey], levels - 1);
			}
		});
	}

	/**
	 * Converts a #rrggbb color code to its 0xrrggbb equivalent
	 */
	parseColor(code) {
		if (code.length !== 7) {
			this.errors.push(`Tried parsing an invalid color code of [${code}]`);
			return 0x000000;
		} else {
			return parseInt(code.substr(1, 6), 16);
		}
	}

	/**
	 * Removes items that don't have .enabled:true
	 */
	removeDisabledItems(list) {
		if (!SecurityPlannerConstants.Content.IGNORE_DISABLED_ITEMS) return list;
		if (Array.isArray(list)) {
			return list.filter(item => item && item.enabled);
		} else {
			const keys = Object.keys(list);
			keys.forEach(key => {
				if (!list[key].enabled) {
					delete list[key];
				}
			});
			return list;
		}
	}

	/**
	 * Converts a list of internal link data into a Link array
	 */
	getLinkList(links) {
		if (!links) return [];
		return links.map(link => {
			return this.getLink(link.sys.id);
		});
	}

	/**
	 * Converts a list of internal link data into a ResourceLink array
	 */
	getResourceLinkList(resourceLinks) {
		if (!resourceLinks) return [];
		return resourceLinks.map(resourceLink => {
			return this.getResourceLink(resourceLink.sys.id);
		});
	}

	/**
	 * Converts a list of internal review data into a Review array
	 */
	getReviewList(reviews) {
		if (!reviews) return [];
		return reviews.map(review => {
			return this.getReview(review.sys.id);
		});
	}
}

SecurityPlannerContentfulParser.DEFAULT_LANGUAGE = "en-US";
