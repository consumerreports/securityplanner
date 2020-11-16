import StringUtils from "./../../vendor/utils/StringUtils";

export default class SecurityState {

	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------

	constructor(statements, tools, threats, levels) {
		this.statements = statements;
		this.tools = tools;
		this.threats = threats;
		this.levels = levels;

		// States
		this.topRecommendedTool = undefined;	// Tool that is most recommended (the tool with the most .recommendationPoints tools from the top threat group, excluded tools with earlyRecommendationAllowed=false; in case ALL tools have earlyRecommendationAllowed=false, then disregard its value)
		this.recommendedTools = [];				// Same as tools, but sorted by recommendation strength (.recommendationPoints, higher to lower) and filtered by tools with .recommendationPoints > 0
		this.recommendedThreats = [];			// Same as threats, but sorted by the number of total .recommendationPoints in all tools of each threat (higher to lower), and filtered by threats with recommended tools only
		this.previouslyDeselectedStatements = [];

		// Caches and indexes
		this.statementsById = {};				// Same as statements[], but indexed by id
		this.toolsById = {};					// Same as tools[], but indexed by id
		this.statementsByLevelId = {};			// Key = level id, Value = array of statements
		this.savedHash = undefined;				// Saved state hash, cached

		// Everything else
		this.recalculateIndexes();
		this.recalculateRecommendations();
	}


	// ================================================================================================================
	// PRIVATE INTERFACE ----------------------------------------------------------------------------------------------

	recalculateIndexes() {
		// Creates indexed objects for quicker access
		this.statementsById = {};
		this.statements.forEach((statement) => {
			this.statementsById[statement.id] = statement;
		});

		this.toolsById = {};
		this.tools.forEach((tool) => {
			this.toolsById[tool.id] = tool;
		});

		this.statementsByLevelId = {};
		this.levels.forEach((level) => {
			this.statementsByLevelId[level.id] = [];
			this.statements.forEach((statement) => {
				if (statement.level == level.id) {
					this.statementsByLevelId[level.id].push(statement);
				}
			});
		});
	}

	/**
	 * Clears the state of all recommendations
	 */
	clearState() {
		// Reset current tool recommendation data
		this.recommendedTools = [];
		this.recommendedThreats = [];
		this.savedHash = undefined;

		for (const key in this.tools) {
			this.tools[key].recommendationPoints = 0;
			this.tools[key].recommendationPointsOnLevel = 0;
			this.tools[key].recommendationLevel = "";
		}
	}

	/**
	 * Get all statement ids. Used internally for saving.
	 */
	getStatementIds(selectedOnly = false) {
		const ids = [];
		this.statements.forEach((statement) => {
			if (!selectedOnly || statement.selected) ids.push(statement.id);
		});
		return ids;
	}

	markRecommendedToolsForLevel(numToolsNeeded, levelId, earlyRecommendationOnly, withPointsOnly) {
		// Loops through the list of recommended tools, marking some to be used as interstitial recommended tools

		let numRecommendedTools = 0;
		const tools = withPointsOnly ? this.recommendedTools : this.getSortedTools(this.tools);

		// Tries to find a recommended tool
		for (let j = 0; j < tools.length; j++) {
			// If number of tools needed met, break prematurely
			if (numRecommendedTools >= numToolsNeeded) {
				break;
			}

			const tool = tools[j];
			if (!tool.recommendationLevel && (!earlyRecommendationOnly || tool.earlyRecommendationAllowed)) {
				// Tag this tool
				tool.recommendationPointsOnLevel = tool.recommendationPoints;
				tool.recommendationLevel = levelId;
				// console.log("    Marking a tool: " + tool.id + ", points = " + tool.recommendationPoints + ", early allowed = " + tool.earlyRecommendationAllowed);
				numRecommendedTools++;
			}
		}

		return numRecommendedTools;
	}

	// Internal helper methods

	applyEffectsToResults(effects) {
		// Check all effects from an array
		const that = this;
		if (effects) {
			effects.forEach(function(effect) {
				that.applyEffectToResults(effect);
			});
		}
	}

	applyEffectToResults(effect) {
		// Checks whether an effect satisfies the requirements, and if so, applies its simpleValues to the results (.tools, .levels)

		// If empty, just ignores it
		if (!this.checkStatementRequirements(effect.requirements)) return;

		// Applies tool effects
		if (effect.hasOwnProperty("tools")) {
			for (const key in effect.tools) {
				// Add to total, creating if needed
				const tool = this.toolsById[key];
				if (tool) tool.recommendationPoints += effect.tools[key];
			}
		}
	}

	/**
	 * Checks whether a list of statement requirements  is met.
	 * @param requirement An array object with 'or' or 'and' operators, e.g. ['statementId1', 'or', ['statementId2', 'and', 'statementId3'], 'or', '!statementId4']
	 */
	checkStatementRequirements(requirement) {
		// If empty, it's true
		if (!requirement || (Array.isArray(requirement) && requirement.length == 0)) return true;

		let validated = true;
		let lastOperator = undefined;
		let expression = undefined;
		let expressionValid = false;
		let expressionIsNegative = false;
		for (let i = 0; i < requirement.length; i++) {
			if (i % 2 == 0) {
				// Id or another array
				expression = requirement[i];
				if (typeof(expression) == "string") {
					// A single id
					expressionIsNegative = expression.startsWith("!");
					expressionValid = expressionIsNegative ? !this.isStatementSelected(expression.substr(1)) : this.isStatementSelected(expression);
				} else if (expression instanceof Array) {
					// An array
					expressionValid = this.checkStatementRequirements(expression);
				} else {
					// Invalid!
					console.error("Error! Checking statement requirement for query", requirement, "contained an invalid expression at", expression); // eslint-disable-line
					expressionValid = false;
				}
				// Applies to the chain, sequentially - doesn't take AND/OR order of operations into account
				if (lastOperator == undefined) {
					// First expression
					validated = expressionValid;
				} else if (lastOperator == SecurityState.REQUIREMENTS_OPERATOR_AND) {
					// And
					validated = validated && expressionValid;
				} else {
					// Or
					validated = validated || expressionValid;
				}
			} else {
				// Operator
				expression = requirement[i];
				if (expression == SecurityState.REQUIREMENTS_OPERATOR_OR) {
					lastOperator = SecurityState.REQUIREMENTS_OPERATOR_OR;
				} else if (expression == SecurityState.REQUIREMENTS_OPERATOR_AND) {
					lastOperator = SecurityState.REQUIREMENTS_OPERATOR_AND;
				} else {
					console.log("Error! statement requirement for query", requirement, "contained an invalid operator of [" + expression + "]"); // eslint-disable-line
				}
			}
		}

		return validated;
	}

	/**
	 * Sort the recommended tool list by points, higher to lower
	 */
	getSortedTools(tools) {
		return tools.concat().sort((a, b) => {
			if (a.recommendationPoints > b.recommendationPoints) return -1;
			if (a.recommendationPoints < b.recommendationPoints) return 1;
			if (a.id < b.id) return -1;
			if (a.id > b.id) return 1;
			return 0;
		});
	}

	/**
	 * Filter the recommended tools, only keeping the ones with points
	 */
	getFilteredRecommendedTools(tools) {
		return tools.filter(tool => {
			return tool.recommendationPoints > 0;
		});
	}

	getTopToolForThreat(threatId, earlyRecommendedOnly) {
		return this.recommendedTools.find(tool => {
			return tool.threat.id === threatId && (!earlyRecommendedOnly || tool.earlyRecommendationAllowed);
		});
	}


	// ================================================================================================================
	// PUBLIC INTERFACE -----------------------------------------------------------------------------------------------

	/**
	 * Based on the selected state of concerns and requirements, recalculate the recommended tools
	 */
	recalculateRecommendations(skipLevelRecommendations = false) {
		this.clearState();

		// Create full list of tools
		this.topRecommendedTool = undefined;
		this.recommendedTools = this.tools.concat();
		let needsSorting = true;

		// Checks statements to distribute points per tool
		// This check is done per level, because some tools may need to be displayed once but not later
		for (let i = 0; i < this.levels.length; i++) {
			const level = this.levels[i];
			needsSorting = true;

			for (let j = 0; j < this.statements.length; j++) {
				const statement = this.statements[j];

				if (statement.level == level.id) {
					// This is a statement of this level
					if (this.checkStatementRequirements(statement.requirements)) {
						// This statement's requirements are met, so it's ok to apply its select/deselect effects
						if (statement.selected) {
							// Selected and with select effects
							this.applyEffectsToResults(statement.selectedEffects);
						} else {
							// Deselected and with deselect effects
							this.applyEffectsToResults(statement.deselectedEffects);
						}
					}
				}
			}

			// Remove tools that don't meet their additional statement recommendations
			this.tools.forEach((tool) => {
				if (!this.checkStatementRequirements(tool.requirements) && tool.recommendationPoints > 0) {
					tool.recommendationPoints = 0;
				}
			});

			// Recommend tools per level if needed (BEFORE statement effects from further levels are applied)
			if (!skipLevelRecommendations && level.recommendationsNeeded > 0) {
				// Pick as many tools as needed for that level
				// First, re-sort list by points (high to lower)
				this.recommendedTools = this.getSortedTools(this.recommendedTools);
				needsSorting = false;

				// console.log("Getting recommendations for level " + level.id + ", need " + level.recommendationsNeeded + " recommendations.");

				// Now, pick recommended tools for interstitials
				let recommendedTools = 0;

				// Find early recommended tools with points only
				if (recommendedTools < level.recommendationsNeeded) {
					recommendedTools += this.markRecommendedToolsForLevel(level.recommendationsNeeded, level.id, true, true);
				}

				// If not enough tools were found, pick non-early recommendation too
				if (recommendedTools < level.recommendationsNeeded) {
					recommendedTools += this.markRecommendedToolsForLevel(level.recommendationsNeeded - recommendedTools, level.id, false, true);
				}

				// Realistically the two following conditions should not happen, but it depends on how the data is

				// If not enough tools were found, pick early recommendations too, even if with negative points
				if (recommendedTools < level.recommendationsNeeded) {
					recommendedTools += this.markRecommendedToolsForLevel(level.recommendationsNeeded - recommendedTools, level.id, true, false);
				}

				// If STILL not enough tools were found, pick non-early recommendations too, even if with negative points
				if (recommendedTools < level.recommendationsNeeded) {
					recommendedTools += this.markRecommendedToolsForLevel(level.recommendationsNeeded - recommendedTools, level.id, false, false);
				}
			}
		}

		if (needsSorting) {
			this.recommendedTools = this.getSortedTools(this.recommendedTools);
		}

		// Filter and keep the recommended items only
		this.recommendedTools = this.getFilteredRecommendedTools(this.recommendedTools);

		// Reorder threats by number of total points
		this.recalculateRecommendedThreats();

		// Check to see if the first position threat is one we've marked as deprioritized, 
		// and move it from first position if need be.
		this.deprioritizeMarkedRecommendedThreats();

		// Find the top recommended tool; a tool that is allowed first, any if not
		if (this.recommendedThreats.length > 0) {
			const requiredThreatId = this.recommendedThreats[0].id;
			this.topRecommendedTool = this.getTopToolForThreat(requiredThreatId, true) || this.getTopToolForThreat(requiredThreatId, false);
		}
	}

	/**
	 * Save the state of the current recommendations as a string hash.
	 *
	 * The hash format is:
	 * > 3-char hashes
	 * > each hash is the hash of a statement id that has been selected
	 * > if the char hash matches 2 or more statement ids, it means it's a 6-char id. Read the next 3 chars and try a match again.
	 */
	saveState() {
		if (!this.savedHash) {
			const allStatementIds = this.getStatementIds();
			const selectedStatementIds = this.getStatementIds(true);
			this.savedHash = StringUtils.hashStringArraySafelyAsString(selectedStatementIds, allStatementIds, 2);
		}
		return this.savedHash;
	}

	/**
	 * Restore the state, from a hash string
	 */
	loadState(stateHash) {
		this.deselectAllStatements();

		const allStatementIds = this.getStatementIds();
		const selectedStatementIds = StringUtils.deHashStringArraySafelyFromString(stateHash, allStatementIds, 2);

		this.setStatementsSelected(selectedStatementIds, true);
		this.recalculateRecommendations();
		return;
	}

	/**
	 * Create a list of threat groups ranked by the total number of recommendation points for tools in each threat group
	 */
	recalculateRecommendedThreats() {
		// Generate list of all threats and total points
		this.recommendedThreats = [];
		const threatPoints = {};

		this.recommendedTools.forEach(tool => {
			if (this.recommendedThreats.indexOf(tool.threat) == -1) {
				// Not in the list yet, add and create an accumulator
				this.recommendedThreats.push(tool.threat);
				threatPoints[tool.threat.id] = 0;
			}
			// Add to the list of total points
			threatPoints[tool.threat.id] += tool.recommendationPoints;
		});

		// Sort by total points per threat, higher to lower
		this.recommendedThreats.sort((a, b) => {
			if (threatPoints[a.id] > threatPoints[b.id]) return -1;
			if (threatPoints[a.id] < threatPoints[b.id]) return 1;
			return 0;
		});
	}

	/**
	 * Iterate over recommended threats list until first threat
	 * that is not marked as deprioritized is found.
	 * Move that threat to the top of the list.
	 */
	deprioritizeMarkedRecommendedThreats() {
		let foundPriorityThreat = false;
		let firstPriorityThreat = null;
		for (let i = 0; i < this.recommendedThreats.length; i++) {
			if (!this.recommendedThreats[i].deprioritizeInLists) {
				firstPriorityThreat = this.recommendedThreats.splice(i, 1)[0];
				foundPriorityThreat = true;
				break;
			}
		}
		if (foundPriorityThreat) {
			this.recommendedThreats.splice(0, 0, firstPriorityThreat);
		}
	}

	isStatementVisible(statementId) {
		const statement = this.statementsById[statementId];
		return statement && this.checkStatementRequirements(statement.requirements);
	}

	isStatementSelected(statementId) {
		const statement = this.statementsById[statementId];
		return statement && statement.selected;
	}

	isAnyStatementSelected() {
		return this.statements.some(statement => statement.selected);
	}

	setStatementSelected(statementId, value) {
		const statement = this.statementsById[statementId];
		if (statement) statement.selected = value;
	}

	setStatementsSelected(statementIds, value) {
		this.statements.forEach((statement) => {
			if (statementIds.indexOf(statement.id) >= 0) statement.selected = value;
		});
	}

	toggleStatementSelected(statementId) {
		const statement = this.statementsById[statementId];
		this.toggleStatement(statement);

		if (statement.selected) {
			if (SecurityState.NONE_REGEX.test(statement.slug)) {
				this.previouslyDeselectedStatements.length = 0;
				// Deselect all other statements if a "none" statement is selected.
				for (const otherStatement of this.statements) {
					if (statement.id != otherStatement.id && statement.level == otherStatement.level && otherStatement.selected) {
						this.toggleStatement(otherStatement);
						this.previouslyDeselectedStatements.push(otherStatement);
					}
				}
			} else {
				// Deselect "none" statement, i.e. a statement containing "none" (e.g.
				// "None of the Above").
				this.statements.forEach(function(otherStatement) {
					if (statement.id != otherStatement.id && statement.level == otherStatement.level && SecurityState.NONE_REGEX.test(otherStatement.slug)) {
						otherStatement.selected = false;
					}
				});
			}
		} else {
			if (SecurityState.NONE_REGEX.test(statement.slug)) {
				for (const previouslyDeselectedStatement of this.previouslyDeselectedStatements) {
					this.toggleStatement(previouslyDeselectedStatement);
				}
			}
		}
	}

	// toggleStatement toggles a statement and changes the next levels (i.e. a
	// change in a lower level should affect statements in later levels).
	toggleStatement(statement) {
		if (statement) {
			statement.selected = !statement.selected;

			// Deselects statements of all other levels (after this statement's
			// level).
			let afterCurrentLevel = false;
			for (const level of this.levels) {
				if (afterCurrentLevel) {
					// Found previous level before, so deselect all
					this.deselectStatementsPerLevel(level.id);
				} else {
					// Not at the statement's level yet, check
					if (level.id == statement.level) afterCurrentLevel = true;
				}
			}
		}
	}

	deselectAllStatements() {
		// Deselects all statements
		this.statements.forEach((statement) => {
			if (statement.selected) {
				statement.selected = false;
			}
		});
	}

	deselectStatementsPerLevel(levelId) {
		// Deselects all statements of a given level
		this.statementsByLevelId[levelId].forEach((statement) => {
			if (statement.selected) {
				statement.selected = false;
			}
		});
	}
}

SecurityState.NONE_REGEX = /none|i-m-not-sure/i;
SecurityState.REQUIREMENTS_OPERATOR_OR = "or";
SecurityState.REQUIREMENTS_OPERATOR_AND = "and";
