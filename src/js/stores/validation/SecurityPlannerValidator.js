import SimpleSignal from "simplesignal";

export default class SecurityPlannerValidator {

	/**
	 * Checks the validity of all data, for sanity checking. Mostly for debugging purposes.
	 */

	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------

	constructor(data, hardcoreMode = false) { // Data is a SecurityState instance
		this.errors = [];
		this.warnings = [];
		this.data = data;
		this.statementCombinationsTested = 0;
		this.statementCombinationsPossible = 0;
		this.conditionsWithZeroTools = [];

		// Used for calculation
		this.timeStartedTesting = undefined;
		this.testIntervalId = undefined;
		this.statementsByLevel = [];
		this.currentStatementIndexByLevel = [];
		this.currentStatementIndexLengthByLevel = [];

		this.onErrorsReported = new SimpleSignal();

		this.validate(hardcoreMode);
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
	validate(hardcoreMode = false) {
		const that = this;

		this.validateTools();

		// Checks statement requirements
		this.data.statements.forEach(function(statement) {
			that.validateRequirements(statement.requirements, "Statement [" + statement.slug + "]");
		});

		// Checks statement effects requirements
		this.data.statements.forEach(function(statement) {
			statement.selectedEffects.forEach(function(effect, j) {
				that.validateRequirements(effect.requirements, "Statement [" + statement.slug + "] selected effects requirements at position [" + j + "]");
			});
			statement.deselectedEffects.forEach(function(effect, j) {
				that.validateRequirements(effect.requirements, "Statement [" + statement.slug + "] deselected effects requirements at position [" + j + "]");
			});
		});

		// Prepare to check whether tools are used
		const maxUsedToolsPoints = {};

		// Check statement effects
		this.data.statements.forEach(function(statement) {
			that.validateEffects(statement.selectedEffects, "Statement [" + statement.slug + "] selected effects", maxUsedToolsPoints);
			that.validateEffects(statement.deselectedEffects, "Statement [" + statement.slug + "] deselected effects", maxUsedToolsPoints);
		});

		// Check whether all tools are actually used by some statement, and can be displayed
		this.data.tools.forEach(function(tool) {
			if (!maxUsedToolsPoints.hasOwnProperty(tool.id)) {
				that.warnings.push("Tool [" + tool.slug + "] has no points ever given to it, will not be displayed");
			} else if (maxUsedToolsPoints[tool.id] == 0) {
				that.warnings.push("Tool [" + tool.slug + "] has a maximum of 0 points ever given to it, will not be displayed");
			}
		});

		// Check whether it's possible to get reports with 0 tools
		if (hardcoreMode) {
			this.testForEmptyReports();
		}
	}

	/**
	 * Test all tools
	 */
	validateTools() {
		this.data.tools.forEach((tool, index) => {
			const description = `Tool tool ${index} [${tool.slug}] `;
			if (tool.name.length < 2) {
				this.errors.push(`${description}doesn't have a proper name`);
			}
			if (tool.headline.length < 2) {
				this.errors.push(`${description}doesn't have a proper headline`);
			}
			if (tool.label.length < 2) {
				this.errors.push(`${description}doesn't have a proper label`);
			}
			if (tool.price && tool.price.toLowerCase() === "free") {
				this.warnings.push(`${description}has a price set as "Free"; that is not needed (the field should be empty)`);
			}
			if (tool.shortDescription.length < 2) {
				this.errors.push(`${description}doesn't have a proper short description`);
			}
			if (tool.longDescription.length < 2) {
				this.errors.push(`${description}doesn't have a proper long description`);
			}
		});
	}

	/**
	 * Does exhaustive, brute force simulations to check whether it's possible to get to a report with 0 tools listed
	 */
	testForEmptyReports() {
		/* eslint-disable no-console */
		console.time("pre-create empty conditions");

		// Find all level info
		this.statementsByLevel = [];

		// Current index of statements selection order
		this.currentStatementIndexByLevel = [];
		this.currentStatementIndexLengthByLevel = [];
		let totalCombinationsPossible = 1;

		for (let i = 0; i < this.data.levels.length; i++) {
			console.log("===> level " + i);

			// Create list of statements by level
			const statementsForThisLevel = [];
			for (let j = 0; j < this.data.statements.length; j++) {
				if (this.data.statements[j].level == this.data.levels[i].id) {
					statementsForThisLevel.push(this.data.statements[j]);
				}
			}
			this.statementsByLevel.push(statementsForThisLevel);
			console.log("   ...has " + statementsForThisLevel.length + " statements.");

			// Find how many statements are needed per level
			console.log("   ...requires " + this.data.levels[i].answersRequired + " to " + this.statementsByLevel[i].length + " statements.");

			// Start counting
			this.currentStatementIndexByLevel.push(this.data.levels[i].answersRequired);
			this.currentStatementIndexLengthByLevel.push(Math.pow(2, this.statementsByLevel[i].length));

			console.log("   ...has " + this.currentStatementIndexLengthByLevel[i] + " possible combinations");

			totalCombinationsPossible *= this.currentStatementIndexLengthByLevel[i];
		}
		console.timeEnd("pre-create empty conditions");
		console.log("There are " + totalCombinationsPossible + " possible statement combinations.");

		this.conditionsWithZeroTools = [];
		this.statementCombinationsTested = 0;
		this.statementCombinationsPossible = totalCombinationsPossible;

		// 67,108,864 conditions

		// Create list of all conditions that need to be tested
		// This will take a long time, so it will be done as setInterval
		// Normally this would be in a separate worker, but let's not overcomplicate things with a separate file
		this.timeStartedTesting = Date.now();
		this.testIntervalId = window.setInterval(this.testSomeReportConditions.bind(this), 33);
		/* eslint-enable no-console */
	}

	testSomeReportConditions() {
		let conditionsTestedNow = 0;
		let moreConditionsExist = true;
		let needToUpdate = false;

		while (moreConditionsExist && conditionsTestedNow < 2000) {
			const newCondition = [];

			// Select for all levels
			for (let i = 0; i < this.data.levels.length; i++) {
				const numStatementsSelectionIndex = this.currentStatementIndexByLevel[i];

				for (let j = 0; j < this.statementsByLevel[i].length; j++) {
					if (this.shouldSelectIndex(numStatementsSelectionIndex, j)) {
						newCondition.push(this.statementsByLevel[i][j].id);
					}
				}
			}

			// Test the condition by performing all calculations
			this.data.deselectAllStatements();
			this.data.setStatementsSelected(newCondition, true);
			this.data.recalculateRecommendations(true);

			if (this.data.recommentedTools.length == 0) {
				const newConditionText = newCondition.join(",");
				if (this.conditionsWithZeroTools.indexOf(newConditionText) < 0) {
					this.conditionsWithZeroTools.push(newConditionText);
					needToUpdate = true;
					this.warnings.push("Statement combination [" + newConditionText + "] gives 0 tools selected");
				}
			}

			this.statementCombinationsTested++;
			conditionsTestedNow++;

			// Increase level
			for (let i = 0; i < this.data.levels.length; i++) {
				this.currentStatementIndexByLevel[i]++;

				if (this.currentStatementIndexByLevel[i] >= Math.pow(2, this.statementsByLevel[i].length)) {
					// Index is past the number of elements that should be selected

					// Reset current
					this.currentStatementIndexByLevel[i] = this.data.levels[i].answersRequired;

					// Will bump next level, unless it's the end
					if (i == this.data.levels.length - 1) {
						moreConditionsExist = false;
					}
				} else {
					break;
				}
			}
		}

		if (needToUpdate) {
			this.onErrorsReported.dispatch();
		}

		if (!moreConditionsExist) {
			// Finished testing
			window.clearInterval(this.testIntervalId);
			this.testIntervalId = undefined;
			console.log("There are " + this.conditionsWithZeroTools.length + " conditions where 0 tools are recommended in the results."); // eslint-disable-line
		} else {
			const testPhase = this.statementCombinationsTested / this.statementCombinationsPossible;
			const timeSpent = Date.now() - this.timeStartedTesting;
			const timeLeft = (timeSpent / testPhase) - timeSpent;
			console.log("Tested " + this.statementCombinationsTested + " of possible " + this.statementCombinationsPossible + " (" + Math.round(testPhase * 10000) / 100 + "%), " + this.conditionsWithZeroTools.length + " conditions with 0 tools found; " + Math.round((timeLeft / 1000 / 60) * 10) / 10 + " minutes left"); // eslint-disable-line
		}
	}

	shouldSelectIndex(desiredIndex, positionIndex) {
		// Returns whether an item at position positionIndex should be selected when selecting a sequencial selection at position desiredIndex
		// It's a binary calculation, where desiredIndex is a number and positionIndex is the digit
		// (1, 0) => true (because 1dec = 1bin)
		// (2, 0) => false (because 1dec = 10 bin)
		// (2, 1) => true (because 1dec = 10 bin)
		return ((desiredIndex >> positionIndex) & 1) == 1;
	}

	/**
	 * Validates requirements, making sure all ids exist and all operators are correct
	 */
	validateRequirements(requirement, errorMessageSubject) {
		if (!requirement || (requirement instanceof Array && requirement.length == 0)) return;

		if (typeof(requirement) == "string") {
			this.errors.push(errorMessageSubject + " contains a string of [" + requirement + "], should be array of strings");
			return;
		}

		const operatorOr = "or";
		const operatorAnd = "and";

		for (let i = 0; i < requirement.length; i++) {
			let expression = null;
			if (i % 2 == 0) {
				// Id or another array
				expression = requirement[i];
				if (typeof(expression) == "string") {
					// A single id
					expression = expression.trim();
					if (expression.startsWith("!")) expression = expression.substr(1).trim();
					const statement = this.data.statementsById[expression];
					if (!statement) this.errors.push(errorMessageSubject + " requires a statement with an id [" + expression + "] that was not found");
				} else if (expression instanceof Array) {
					// An array
					this.validateRequirements(expression, errorMessageSubject);
				} else {
					// Invalid!
					this.errors.push(errorMessageSubject + " contains an invalid object expression at [" + expression + "]");
				}
			} else {
				// Operator
				expression = requirement[i];
				if (typeof(expression) != "string" || (expression.toLowerCase().trim() != operatorOr && expression.toLowerCase().trim() != operatorAnd)) {
					this.errors.push(errorMessageSubject + " contains an invalid operator of [" + expression + "]");
				}
			}
		}
	}

	/**
	 * Validates tools effects, making sure all ids exist
	 */
	validateEffects(effects, errorMessageSubject, maxUsedToolsPoints) {
		const that = this;

		if (!effects || !(effects instanceof Array)) {
			this.warnings.push(errorMessageSubject + " contains an invalid effect object of " + effects + ", should be array");
			return;
		}

		effects.forEach(function(effect, i) {
			that.validateEffectsTools(effect.tools, errorMessageSubject + ", position " + i, maxUsedToolsPoints);
		});
	}

	validateEffectsTools(toolEffects, errorMessageSubject, maxUsedToolsPoints) {
		if (!toolEffects || typeof(toolEffects) != "object") {
			return;
		}

		for (const key in toolEffects) {
			const tool = this.data.toolsById[key];
			if (!tool) {
				this.warnings.push(errorMessageSubject + " gives points to a tool that was not found [" + key + "]");
			}

			if (typeof(toolEffects[key]) != "number") {
				this.warnings.push(errorMessageSubject + " gives points to tool [" + key + "] with an non-numeric expression of [" + toolEffects[key] + "]");
			} else {
				if (toolEffects[key] > 0) {
					// Add points to generate a list of max tool points
					if (!maxUsedToolsPoints.hasOwnProperty(key)) maxUsedToolsPoints[key] = 0;
					maxUsedToolsPoints[key] += toolEffects[key];
				}
			}
		}
	}
}
