import PropTypes from 'prop-types';
import React from "react";

import ReactDOM from 'react-dom';

import SecurityPlannerStore from "../../stores/SecurityPlannerStore";

const cacheMaxToolPoints = {}; // Cache object for max points per tool key
const cacheMaxThreatPoints = {}; // Cache object for max points per threat key

class DebugPanel extends React.Component {
    static propTypes = {
		statements: PropTypes.array.isRequired, // Statement[]
		tools: PropTypes.array.isRequired, // Tool[]
		levels: PropTypes.array.isRequired, // Level[]
		threats: PropTypes.array.isRequired, // Threat[]
		recommendedThreats: PropTypes.array.isRequired, // Threat[]
		topRecommendedTool: PropTypes.object, // Tool
		recommendedTools: PropTypes.array.isRequired, // Tool[]
	};

    render() {
		// Decides all elements
		const items = [];
		let subitems = [];

		let title = "";
		let key = "";
		let i = 0;
		let j = 0;

		// Levels
		items.push(
			<div
				key="levels"
				className="title"
				onClick={ () => this.toggleDiv("levels-content") }>
				{"STATEMENT LEVELS"}
			</div>
		);
		subitems = [];
		for (i = 0; i < this.props.levels.length; i++) {
			// Title
			const tLevel = this.props.levels[i];
			title = "LEVEL [" + i + "]";
			key = "levels-" + tLevel.id;

			subitems.push(
				<div key={ key } className="subtitle">
					{title}
				</div>
			);

			// Statements
			for (j = 0; j < this.props.statements.length; j++) {
				if (this.props.statements[j].level == tLevel.id) {
					const tStatement = this.props.statements[j];
					subitems.push(
						<div key={ key + "-" + j } className={ "item" + (tStatement.selected ? " selected" : "") + (SecurityPlannerStore.isStatementVisible(tStatement.id) ? "" : " hidden") }>
							{ tStatement.slug }
						</div>
					);
				}
			}
		}

		items.push(
			<div
				ref="levels-content"
				key="levels-content"
				className="content">
				{subitems}
			</div>
		);

		// Tool recommendations
		let numTools = 0;
		for (i = 0; i < this.props.recommendedTools.length; i++) {
			if (this.props.recommendedTools[i].recommendationPoints > 0) numTools++;
		}

		items.push(
			<div
				key="tools"
				className="title"
				onClick={ () => this.toggleDiv("tools-content") }>
				{ `RECOMMENDED TOOLS (${numTools} / ${this.props.tools.length})` }
			</div>
		);

		subitems = [];
		for (i = 0; i < this.props.levels.length; i++) {
			// Level title
			const tLevel = this.props.levels[i];
			subitems.push(
				<div key={ "level-" + tLevel.id } className={ "subtitle" }>
					{ `FROM LEVEL [${i}] ONLY` }
				</div>
			);

			// Tools for that level
			this.props.recommendedTools.forEach(tool => {
				if (tool.recommendationLevel == tLevel.id) {
					subitems.push(this.renderTool(tool, tool.recommendationPointsOnLevel, "level-" + tLevel.id));
				}
			});
		}

		// For level-less tools
		subitems.push(
			<div key={ "level-none" } className={ "subtitle" }>
				{ "ALL LEVELS CONSIDERED" }
			</div>
		);

		// All other tools
		subitems = subitems.concat(this.props.recommendedTools.map((tool) => {
			return this.renderTool(tool, tool.recommendationPoints, "recommended");
		}));

		items.push(
			<div
				ref="tools-content"
				key="tools-content"
				className="content">
				{subitems}
			</div>
		);

		// Threats
		items.push(
			<div
				key="threats"
				className="title"
				onClick={ () => this.toggleDiv("threats-content") }>
				{ `CURRENT THREATS (${this.props.recommendedThreats.length} / ${this.props.threats.length})` }
			</div>
		);

		subitems = [];
		this.props.recommendedThreats.forEach(threat => {
			// Threat
			subitems.push(this.renderThreat(threat));

			// Tools for that threat
			this.props.recommendedTools.forEach(tool => {
				if (tool.threat.id == threat.id) {
					subitems.push(this.renderTool(tool, tool.recommendationPoints, "threat-" + threat.id));
				}
			});
		});

		items.push(
			<div
				ref="threats-content"
				key="threats-content"
				className="content">
				{subitems}
			</div>
		);

		// Finally, writes everything
		return (
			<div className="debug-panel">
				{items}
			</div>
		);
	}

    renderTool = (tool, points, groupId) => {
		const pts = Math.round(points * 100) / 100;
		const maxPts = Math.round(this.getMaxToolPoints(tool.id) * 100) / 100;
		return (
			<div
				key={ "tools-" + tool.id + "-group-" + groupId }
				className={ "item" + (points > 0 ? "" : " hidden") + (tool == this.props.topRecommendedTool ? " top" : "") }>
				{ `${tool.slug} (${pts} / ${maxPts} pts)` }
			</div>
		);
	};

    renderThreat = (threat) => {
		const pts = Math.round(this.getThreatPoints(threat.id) * 100) / 100;
		const maxPts = Math.round(this.getMaxThreatPoints(threat.id) * 100) / 100;
		return (
			<div key={ "threats-" + threat.id } className="subtitle">
				{ `${threat.slug} (${pts} of ${maxPts} pts)` }
			</div>
		);
	};

    toggleDiv = (ref) => {
		const element = ReactDOM.findDOMNode(this.refs[ref]);
		if (element.style.display == "none") {
			element.style.display = "";
		} else {
			element.style.display = "none";
		}
	};

    getMaxToolPoints = (toolId) => {
		if (!cacheMaxToolPoints.hasOwnProperty(toolId)) {
			// Max points unknown, find first
			let maxPoints = 0;
			this.props.statements.forEach(statement => {
				if (statement.hasOwnProperty("selectedEffects")) {
					statement.selectedEffects.forEach(effect => {
						if (effect.hasOwnProperty("tools")) {
							for (const key in effect.tools) {
								if (key == toolId && effect.tools[key] > 0) maxPoints += effect.tools[key];
							}
						}
					});
				}
				if (statement.hasOwnProperty("deselectedEffects")) {
					statement.deselectedEffects.forEach(effect => {
						if (effect.hasOwnProperty("tools")) {
							for (const key in effect.tools) {
								if (key == toolId && effect.tools[key] > 0) maxPoints += effect.tools[key];
							}
						}
					});
				}
			});
			cacheMaxToolPoints[toolId] = maxPoints;
		}
		return cacheMaxToolPoints[toolId];
	};

    getThreatPoints = (threatId) => {
		return this.props.recommendedTools.reduce((prev, tool) => {
			return prev + (tool.threat.id === threatId ? Math.max(tool.recommendationPoints, 0) : 0);
		}, 0);
	};

    getMaxThreatPoints = (threatId) => {
		if (!cacheMaxThreatPoints.hasOwnProperty(threatId)) {
			// Max points unknown, find first
			let maxPoints = 0;
			this.props.tools.forEach(tool => {
				if (tool.threat.id == threatId) maxPoints += this.getMaxToolPoints(tool.id);
			});
			cacheMaxThreatPoints[threatId] = maxPoints;
		}
		return cacheMaxThreatPoints[threatId];
	};
}

export default DebugPanel;
