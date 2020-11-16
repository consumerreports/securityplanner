import ContentfulLoader from "./../../src/js/stores/loading/ContentfulLoader";
import SecurityPlannerContentfulParser from "./../../src/js/stores/parsing/SecurityPlannerContentfulParser";
import SecurityPlannerConstants from "./../../src/js/constants/SecurityPlannerConstants";
import SecurityState from "./../../src/js/stores/data/SecurityState";
import SecurityPlannerValidator from "./../../src/js/stores/validation/SecurityPlannerValidator";
import SecurityPlannerLocalizationValidator from "./../../src/js/stores/validation/SecurityPlannerLocalizationValidator";

const loader = new ContentfulLoader(
	SecurityPlannerConstants.Content.CONTENTFUL_SPACE_ID,
	SecurityPlannerConstants.Parameters.IS_PREVIEWING ? SecurityPlannerConstants.Content.CONTENTFUL_PREVIEW_KEY : SecurityPlannerConstants.Content.CONTENTFUL_DELIVERY_KEY,
	SecurityPlannerConstants.Parameters.IS_PREVIEWING
);
loader.load();
const mainLanguage = "en-US";
let mainParser = undefined;
let languageParsers = [];

function checkLoaded(done) {
	if (loader.isLoaded()) {
		done();
	} else {
		loader.onComplete.add(() => { done(); });
	}
}

function checkParsed(done) {
	if (mainParser) {
		done();
	} else {
		mainParser = getParser(mainLanguage);
		languageParsers = getParsers(mainParser.languages.map(language => language.id));
		done();
	}
}

function getParser(languageId) {
	return new SecurityPlannerContentfulParser(loader, [languageId], true);
}

function getParsers(languageIds) {
	return languageIds.map(languageId => getParser(languageId));
}

describe("ContentfulLoader", () => {
	beforeEach(checkLoaded);

	test("should have loaded everything", () => {
		expect(loader.isLoaded()).toBe(true);
	});
}, 10000);

describe("ContentfulParser", () => {
	beforeEach(checkParsed);

	test("should have parsed everything", () => {
		expect(mainParser).toBeDefined();
	});
});

describe("Content", () => {
	beforeEach(checkParsed);

	test("should have an English language parser", () => {
		expect(mainParser.usedLanguage.id).toBe(mainLanguage);
	});

	test("should have more than one language", () => {
		expect(mainParser.languages.length).toBeGreaterThan(1);
		expect(languageParsers.length).toBeGreaterThan(1);
	});

	test("parsers should have no errors or warnings", () => {
		languageParsers.forEach(languageParser => {
			console.log("Error: parsers should have no errors or warnings", languageParser.getErrors());
			// console.log("Warnings", languageParser.getWarnings());
			expect(languageParser.getErrors().length).toBe(0);
			expect(languageParser.getWarnings().length).toBe(0);
		});
	});

	test("data should give no validation errors", () => {
		languageParsers.forEach(languageParser => {
			const storeState = new SecurityState(languageParser.statements, languageParser.tools, languageParser.threats, languageParser.levels);
			const validator = new SecurityPlannerValidator(storeState, false);
			console.log("Error: data should give no validation errors", validator.getErrors());
			// console.log("Warnings", validator.getWarnings());
			expect(validator.getErrors().length).toBe(0);
			expect(validator.getWarnings().length).toBe(0);
		});
	});

	test("data should give no translation validation errors", () => {
		languageParsers.forEach(languageParser => {
			if (mainParser.usedLanguage.id !== languageParser.usedLanguage.id) {
				const validator = new SecurityPlannerLocalizationValidator(mainParser, languageParser);
				console.log("Error: data should give no translation validation errors", validator.getErrors());
				// console.log("Warnings", validator.getWarnings());
				expect(validator.getErrors().length).toBe(0);
				expect(validator.getWarnings().length).toBe(0);
			}
		});
	});
});