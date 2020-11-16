/* eslint-disable no-console */

import Events from "events";

import AppDispatcher from "./../dispatcher/AppDispatcher";
import SecurityPlannerConstants from "./../constants/SecurityPlannerConstants";
import SecurityPlannerContentfulParser from "./parsing/SecurityPlannerContentfulParser";
import SecurityState from "./data/SecurityState";
import StringList from "./../vendor/localization/StringList";
import MiniTracker from "./../vendor/tracking/MiniTracker";

const EventEmitter = Events.EventEmitter;

// Initializer

const CHANGE_EVENT = "change";

let hasContent = false;
const _storeState = {

	securityState: undefined, // SecurityState

	// Data handlers
	parser: undefined,

	// String values
	stringList: undefined, // StringList

	// Toast messages
	toasts: [], // Array of { text: string, icon: string, time: datetime it was displayed in ms}
};

// Internal methods

function checkIfContentExists() {
	if (!hasContent) {
		// Data not loaded and parsed yet
		if (window.hasOwnProperty("contentLoader")) {
			// All loaded!

			// Create the parser
			if (SecurityPlannerConstants.Parameters.IS_DEBUGGING) {
				console.time("parse");
			}

			const loader = window.contentLoader;
			const languages = window.preferredLanguages;
			_storeState.parser = new SecurityPlannerContentfulParser(loader, languages, false);

			if (SecurityPlannerConstants.Parameters.IS_DEBUGGING) {
				console.log("Parsed store data; " + _storeState.parser.getErrors().length + " errors and " + _storeState.parser.getWarnings().length + " warnings detected.");
				if (_storeState.parser.getErrors().length > 0) console.log("Errors: ", _storeState.parser.getErrors());
				if (_storeState.parser.getWarnings().length > 0) console.log("Warnings: ", _storeState.parser.getWarnings());
				console.timeEnd("parse");
			}

			if (SecurityPlannerConstants.Parameters.IS_DEBUGGING) {
				console.log("DESIRED LANGUAGES: ", _storeState.parser.desiredLanguages);
				console.log("AUTO-SELECTED LANGUAGE: ", _storeState.parser.usedLanguage.id);
			}

			// Report on detected and selected languages
			MiniTracker.trackEvent("language", "detected", _storeState.parser.desiredLanguages[0], undefined, true);
			MiniTracker.trackEvent("language", "auto-selected", _storeState.parser.usedLanguage, undefined, true);

			// Initialize the recommendation state
			_storeState.securityState = new SecurityState(_storeState.parser.statements, _storeState.parser.tools, _storeState.parser.threats, _storeState.parser.levels);

			// For testing purposes
			if (SecurityPlannerConstants.Parameters.PRESELECTED_STATEMENTS) {
				for (let i = 0; i < SecurityPlannerConstants.Parameters.PRESELECTED_STATEMENTS.length; i++) {
					_storeState.securityState.setStatementSelected(SecurityPlannerConstants.Parameters.PRESELECTED_STATEMENTS[i], true);
				}
			}

			// Create aux content
			createStringList();

			hasContent = true;

			SecurityPlannerStore.emitChange();
		} else {
			// Object doesn't exist (must be loading), wait and try again
			setTimeout(checkIfContentExists, 1000 / 30);
		}
	}
}

function createStringList() {
	_storeState.stringList = new StringList(_storeState.parser.usedLanguage, _storeState.parser.getStrings(), "other");
}

function changeLanguage(languageId, laguageDir) {
	if (hasContent) {
		_storeState.parser.setLanguage(languageId);

		const languageCode = languageId.substring(0,2);
		document.documentElement.lang = languageCode;

		// Need to manually reset the list
		createStringList();
	}
}

function getTotalToastTime() {
	return (SecurityPlannerConstants.UI.TOAST_TIME_FADE_IN + SecurityPlannerConstants.UI.TOAST_TIME_STAY + SecurityPlannerConstants.UI.TOAST_TIME_FADE_OUT) * 1000;
}

function showToastNotification(text, success, icon) {
	const toast = {
		text: text,
		success: success,
		icon: icon,
		time: Date.now(),
	};

	// Trigger a later cleanup
	setTimeout(() => {
		cleanupToastNotifications();
		SecurityPlannerStore.emitChange();
	}, getTotalToastTime() + 10);

	_storeState.toasts.push(toast);
}

function cleanupToastNotifications() {
	// Clear the list of old toasts from the store, since they're not displayed anymore
	const now = Date.now();
	_storeState.toasts = _storeState.toasts.filter(toast => toast.time + getTotalToastTime() > now);
}

// Actual store

const SecurityPlannerStore = Object.assign({}, EventEmitter.prototype, {

	emitChange: function() {
		this.emit(CHANGE_EVENT);
	},

	hasContent: function() {
		return hasContent;
	},

	getBios: function() {
		if (!this.hasContent()) return [];
		return _storeState.parser.bios;
	},

	getAvailableLanguages: function() {
		if (!this.hasContent()) return [];
		return _storeState.parser.languages;
	},

	getSelectedLanguage: function() {
		if (!this.hasContent()) return undefined;
		return _storeState.parser.usedLanguage;
	},

	getMetadata: function() {
		if (!this.hasContent()) return {};
		return _storeState.parser.getMetadata();
	},

	getStringList: function() {
		if (!_storeState.stringList) return undefined;
		return _storeState.stringList;
	},

	getLevels: function() {
		if (!this.hasContent()) return [];
		return _storeState.securityState.levels;
	},

	getTopRecommendedTool: function() {
		if (!this.hasContent()) return undefined;
		return _storeState.securityState.topRecommendedTool;
	},

	getRecommendedTools: function() {
		if (!this.hasContent()) return [];
		return _storeState.securityState.recommendedTools;
	},

	getRecommendedThreats: function() {
		if (!this.hasContent()) return [];
		return _storeState.securityState.recommendedThreats;
	},

	getStatements: function() {
		if (!this.hasContent()) return [];
		return _storeState.securityState.statements;
	},

	getThreats: function() {
		if (!this.hasContent()) return [];
		return _storeState.securityState.threats;
	},

	getTools: function() {
		if (!this.hasContent()) return [];
		return _storeState.securityState.tools;
	},

	isAnyStatementSelected: function() {
		if (!this.hasContent()) return undefined;
		return _storeState.securityState.isAnyStatementSelected();
	},

	isStatementSelected: function(statementId) {
		// TODO: remove this altogether, move to the statement data?
		if (!this.hasContent()) return undefined;
		return _storeState.securityState.isStatementSelected(statementId);
	},

	isStatementVisible: function(statementId) {
		// TODO: remove this altogether, move to the statement data?
		if (!this.hasContent()) return undefined;
		return _storeState.securityState.isStatementVisible(statementId);
	},

	loadState: function(stateHash) {
		if (this.hasContent()) _storeState.securityState.loadState(stateHash);
	},

	saveState: function() {
		if (!this.hasContent()) return undefined;
		return _storeState.securityState.saveState();
	},

	getToasts: function() {
		return _storeState.toasts;
	},

	/**
	 * @param {function} callback
	 */
	addChangeListener: function(callback) {
		this.on(CHANGE_EVENT, callback);
	},

	/**
	 * @param {function} callback
	 */
	removeChangeListener: function(callback) {
		this.removeListener(CHANGE_EVENT, callback);
	},
});

// Register callback to handle all updates
AppDispatcher.register(function(action) {
	switch (action.actionType) {
		case SecurityPlannerConstants.Actions.SECURITY_PLANNER_TOGGLE_STATEMENT_SELECTED:
			_storeState.securityState.toggleStatementSelected(action.text.trim());
			_storeState.securityState.recalculateRecommendations();
			SecurityPlannerStore.emitChange();
			break;
		case SecurityPlannerConstants.Actions.SECURITY_PLANNER_DESELECT_ALL_STATEMENTS:
			if (_storeState.securityState) {
				_storeState.securityState.deselectAllStatements();
				_storeState.securityState.recalculateRecommendations();
				SecurityPlannerStore.emitChange();
			}
			break;
		case SecurityPlannerConstants.Actions.CHANGE_LANGUAGE:
			changeLanguage(action.languageId, action.languageDir);
			SecurityPlannerStore.emitChange();
			break;
		case SecurityPlannerConstants.Actions.SECURITY_PLANNER_SHOW_TOAST_NOTIFICATION:
			showToastNotification(action.text, action.success, action.icon);
			SecurityPlannerStore.emitChange();
			break;
		case SecurityPlannerConstants.Actions.SECURITY_PLANNER_CLEANUP_TOAST_NOTIFICATIONS:
			cleanupToastNotifications();
			SecurityPlannerStore.emitChange();
			break;
		default:
			// None
	}
});

export default SecurityPlannerStore;

// Start waiting for the content to load
checkIfContentExists();
/* eslint-enable no-console */