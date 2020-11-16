import React from "react";

import SecurityPlannerValidator from "./../../stores/validation/SecurityPlannerValidator";
import SecurityPlannerContentfulParser from "./../../stores/parsing/SecurityPlannerContentfulParser";
import SecurityPlannerLocalizationValidator from "./../../stores/validation/SecurityPlannerLocalizationValidator";
import SecurityState from "./../../stores/data/SecurityState";

class ValidationApp extends React.Component {
    state = {
        isLoaded: false,
        isParsed: false,
        loader: null,
        preferredLanguages: null,
        mainParser: null,
        languageParsers: null,
    };

    componentDidMount() {
		// Starts loading everything
		this.checkIfLoaded();

		document.body.style.overflow = "auto";
	}

    componentDidUpdate() {
		if (this.state.isLoaded) {
			if (!this.state.isParsed) {
				if (!this.state.mainParser) {
					// Needs main parser
					const parser = this.getParser(this.state.preferredLanguages);
					this.setState({ mainParser: parser });
				} else if (!this.state.languageParsers) {
					// Need language parsers
					const languageIds = this.state.mainParser.languages.filter(language => language.id != this.state.mainParser.usedLanguage.id).map(language => language.id);
					const parsers = this.getParsers(languageIds);
					this.setState({ languageParsers: parsers });
				} else {
					// All parsed
					this.setState({ isParsed: true });
				}
			}
		}
	}

    render() {
		// Writes everything
		if (!this.state.isLoaded) return this.renderLoading();
		if (!this.state.isParsed) return this.renderParsing();
		return this.renderResults();
	}

    renderLoading = () => {
		return (
			<div className="validation-panel">
				<div className="title">
					Loading
				</div>
				<div className="items">
					<div className="message">
						The content is loading. Please wait.
					</div>
				</div>
			</div>
		);
	};

    renderParsing = () => {
		return (
			<div className="validation-panel">
				<div className="title">
					Parsing
				</div>
				<div className="items">
					<div className="message">
						The content is parsing. Please wait.
					</div>
				</div>
			</div>
		);
	};

    renderResults = () => {
		let totalWarnings = 0;
		let totalErrors = 0;

		// Main validator
		const mainParser = this.state.mainParser;
		totalWarnings += mainParser.getWarnings().length;
		totalErrors += mainParser.getErrors().length;

		const mainValidator = this.getValidator(mainParser);
		totalWarnings += mainValidator.getWarnings().length;
		totalErrors += mainValidator.getErrors().length;

		// Translation validators
		const translationValidators = this.getTranslationValidators(mainParser, this.state.languageParsers);
		Object.keys(translationValidators).forEach((key) => {
			totalWarnings += translationValidators[key].getWarnings().length;
			totalErrors += translationValidators[key].getErrors().length;
		});

		return (
			<div className="validation-panel">
				<div className="title">
					{ this.getTitle("Content validated", totalErrors, totalWarnings) }
				</div>
				<div className="subtitle">
					{ this.getTitle("Main content parsing (English)", mainParser.getErrors().length, mainParser.getWarnings().length) }
				</div>
				<div className="items">
					{ this.renderMessage("error", mainParser.getErrors()) }
					{ this.renderMessage("warning", mainParser.getWarnings()) }
				</div>
				<div className="subtitle">
					{ this.getTitle("Main content validation (English)", mainValidator.getErrors().length, mainValidator.getWarnings().length) }
				</div>
				<div className="items">
					{ this.renderMessage("error", mainValidator.getErrors()) }
					{ this.renderMessage("warning", mainValidator.getWarnings()) }
				</div>
				{ this.renderTranslationValidators(translationValidators) }
			</div>
		);
	};

    getTitle = (title, errors, warnings) => {
		return `${title}: ${errors} errors, ${warnings} warnings, ${errors + warnings} total.`;
	};

    renderMessage = (type, list) => {
		return list.map((message, i) => {
			return (
				<div className={ type } key={ type + "-" + i }>
					{ (i + 1) + ". " + message }
				</div>
			);
		});
	};

    renderTranslationValidators = (translationValidators) => {
		const elements = [];
		Object.keys(translationValidators).forEach((key) => {
			const errors = translationValidators[key].getErrors();
			const warnings = translationValidators[key].getWarnings();
			elements.push(
				<div className="subtitle" key={ "subtitle-" + key }>
					{ this.getTitle(`Localized content validation (language "${key}")`, errors.length, warnings.length) }
				</div>
			);
			elements.push(
				<div className="items" key={ "items-" + key }>
					{ this.renderMessage("error", errors) }
					{ this.renderMessage("warning", warnings) }
				</div>
			);
		});
		return elements;
	};

    checkIfLoaded = () => {
		if (!this.state.isLoaded) {
			if (window.contentLoader) {
				// Loaded
				this.updateStateFromLoading();
			} else {
				setTimeout(this.checkIfLoaded, 30);
			}
		}
	};

    updateStateFromLoading = () => {
		this.setState(Object.assign({}, this.state, {
			isLoaded: window.contentLoader && window.preferredLanguages,
			loader: window.contentLoader,
			preferredLanguages: window.preferredLanguages,
		}));
	};

    getValidator = (parser) => {
		const storeState = new SecurityState(parser.statements, parser.tools, parser.threats, parser.levels);
		const validator = new SecurityPlannerValidator(storeState, false);
		return validator;
	};

    getTranslationValidators = (mainParser, languageParsers) => {
		// Creates new parsers, one for each new language
		const validators = {};
		languageParsers.forEach(languageParser => {
			const validator = new SecurityPlannerLocalizationValidator(mainParser, languageParser);
			validators[languageParser.usedLanguage.id] = validator;
		});

		return validators;
	};

    getParser = (languageIds) => {
		return new SecurityPlannerContentfulParser(this.state.loader, languageIds, true);
	};

    getParsers = (allLanguageIds) => {
		return allLanguageIds.map(languageId => this.getParser([languageId]));
	};
}

export default ValidationApp;
