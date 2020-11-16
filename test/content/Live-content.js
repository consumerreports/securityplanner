import { expect } from "chai";

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

describe("ContentfulLoader", function() {
	this.timeout(10000);
	beforeEach(checkLoaded);

	it("should have loaded everything", function() {
		expect(loader.isLoaded()).to.equal(true);
	});
});

describe("ContentfulParser", function() {
	beforeEach(checkParsed);

	it("should have parsed everything", function() {
		expect(mainParser).to.exist;
	});
});

describe("Content", function() {
	beforeEach(checkParsed);

	it("should have an English language parser", function() {
		expect(mainParser.usedLanguage.id).to.equal(mainLanguage);
	});

	it("should have more than one language", function() {
		expect(mainParser.languages.length).to.be.above(1);
		expect(languageParsers.length).to.be.above(1);
	});

	it("parsers should have no errors or warnings", function() {
		languageParsers.forEach(languageParser => {
			expect(languageParser.getErrors().length).to.equal(0);
			expect(languageParser.getWarnings().length).to.equal(0);
		});
	});

	it("data should give no validation errors", function() {
		languageParsers.forEach(languageParser => {
			const storeState = new SecurityState(languageParser.statements, languageParser.tools, languageParser.threats, languageParser.levels);
			const validator = new SecurityPlannerValidator(storeState, false);
			console.log("Errors", validator.getErrors());
			console.log("Warnings", validator.getWarnings());
			expect(validator.getErrors().length).to.equal(0);
			expect(validator.getWarnings().length).to.equal(0);
		});
	});

	it("data should give no translation validation errors", function() {
		languageParsers.forEach(languageParser => {
			if (mainParser.usedLanguage.id !== languageParser.usedLanguage.id) {
				const validator = new SecurityPlannerLocalizationValidator(mainParser, languageParser);
				console.log("Errors", validator.getErrors());
				console.log("Warnings", validator.getWarnings());
				expect(validator.getErrors().length).to.equal(0);
				expect(validator.getWarnings().length).to.equal(0);
			}
		});
	});
});