import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";

import SecurityPlannerActions from "./../../../actions/SecurityPlannerActions";
import SecurityPlannerStore from "./../../../stores/SecurityPlannerStore";

class EffectsPreview extends React.Component {
    static propTypes = {
		className: PropTypes.string,
		stringList: PropTypes.object,
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
		statements: PropTypes.array.isRequired, // Statement[]
		tools: PropTypes.array.isRequired, // Tool[]
		levels: PropTypes.array.isRequired, // Level[]
		threats: PropTypes.array.isRequired, // Threat[]
		topRecommendedTool: PropTypes.object, // Tool[]
		recommendedTools: PropTypes.array, // Tool
		recommendedThreats: PropTypes.array, // Threat[]
	};

    render() {
		return (
			<div className={ this.props.className }>
				<div className="subtitle">
					Effects
				</div>
				<div className="container">
					{ this.renderLevels(this.props.levels) }
				</div>
				<div className="container-right">
					{ this.renderRecommendedTools(this.props.topRecommendedTool, this.props.recommendedTools, this.props.recommendedThreats) }
				</div>
			</div>
		);
	}

    renderLevels = (levels) => {
		return (
			<div className="content">
				{ levels.map(level => this.renderLevel(level)) }
				{ this.renderResults() }
			</div>
		);
	};

    renderLevel = (level) => {
		return (
			<div className="section level" key={ level.id }>
				<div className="row header">
					<div className="column-box">
						{ this.getLevelId(level) }
					</div>
					<div className="column-long">
						{ level.title }
					</div>
					<div className="column-image"/>
					{ this.props.tools.map(tool => this.renderEffectHeader(tool)) }
				</div>
				{ level.statements.map((statement, index) => this.renderStatement(level, statement, index)) }
			</div>
		);
	};

    renderStatement = (level, statement, index) => {
		const statementVisible = SecurityPlannerStore.isStatementVisible(statement.id);
		const statementRowClasses = cx([
			"row",
			"statement",
			statementVisible ? "visible" : "invisible",
			statement.selected ? "selected" : "deselected",
		]);
		const statementNameStyle = {
			color: statement.selected ? "#ffffff" : undefined,
			backgroundColor: statement.selected ? this.getColor(statement.backgroundColor) : undefined,
		};
		const statementImageStyle = {
			backgroundImage: `url('${statement.image}')`,
			borderColor: this.getColor(statement.backgroundColor),
			backgroundColor: statement.selected ? this.getColor(statement.backgroundColor) : undefined,
		};
		return (
			<div
				className={ statementRowClasses }
				key={ statement.id }>
				<div className="column-box">
					{ `${this.getLevelId(level)}${index + 1}` }
				</div>
				<div
					className="column-long"
					style={ statementNameStyle }
					onClick={ statementVisible ? (() => SecurityPlannerActions.toggleStatementSelected(statement.id)) : null }>
					{ statement.text }
					{ statement.isRequired ? <span className="required"> { "(always visible)" } </span> : null }
				</div>
				<div
					className="column-image"
					onClick={ statementVisible ? (() => SecurityPlannerActions.toggleStatementSelected(statement.id)) : null }>
					<div style={ statementImageStyle }/>
				</div>
				{ this.props.tools.map(tool => this.renderEffect(statement, tool)) }
			</div>
		);
	};

    renderEffectHeader = (tool) => {
		return (
			<div className="column-effect header" key={ tool.id }>
				{ tool.name }
			</div>
		);
	};

    renderEffect = (statement, tool) => {
		let selectedPoints = 0;
		statement.selectedEffects.forEach(effect => {
			Object.keys(effect.tools).forEach(key => {
				if (key === tool.id) selectedPoints += effect.tools[key];
			});
		});

		let deselectedPoints = 0;
		statement.deselectedEffects.forEach(effect => {
			Object.keys(effect.tools).forEach(key => {
				if (key === tool.id) deselectedPoints += effect.tools[key];
			});
		});

		return (
			<div className="column-effect" key={ tool.id }>
				{ this.renderPoints(selectedPoints, statement.selected, "cell top") }
				{ this.renderPoints(deselectedPoints, !statement.selected, "cell bottom") }
			</div>
		);
	};

    renderPoints = (points, active, className) => {
		if (points === 0) return null;
		const p = this.getNumber(points);
		return (
			<div className={ className + (active ? " active" : " inactive") }>
				{ p > 0 ? `+${p}` : p }
			</div>
		);
	};

    renderResults = () => {
		return (
			<div className="section total" key={ "total" }>
				<div className="row header">
					<div className="column-box"/>
					<div className="column-long">
						{ "Total Recommendation points" }
					</div>
					<div className="column-image"/>
					{ this.props.tools.map(tool => this.renderToolTotals(tool)) }
				</div>
			</div>
		);
	};

    renderToolTotals = (tool) => {
		return (
			<div className="column-effect header" key={ tool.id }>
				{ tool.recommendationPoints }
			</div>
		);
	};

    renderRecommendedTools = (topTool, tools, threats) => {
		return (
			<div className="content">
				<div className="title">
					{ "Recommendatiom Results" }
				</div>
				{ threats.map(threat => this.renderRecommendedThreat(topTool, tools, threat)) }
			</div>
		);
	};

    renderRecommendedThreat = (topTool, tools, threat) => {
		return (
			<div className="threat" key={ threat.id }>
				<div className="title">
					{ "Threat: " + threat.name }
				</div>
				{ tools.map(tool => {
					if (tool.threat === threat) {
						return this.renderRecommendedTool(tool, topTool === tool);
					} else {
						return undefined;
					}
				}) }
			</div>
		);
	};

    renderRecommendedTool = (tool, isTopTool) => {
		return (
			<div className="tool" key={ tool.id }>
				<div className="name">
					{ tool.name + (isTopTool ? " (top)" : "")}
				</div>
				<div className="points">
					{ this.getNumber(tool.recommendationPoints) }
				</div>
			</div>
		);
	};

    getLevelId = (level) => {
		return "ABCDEFG".substr(this.props.levels.indexOf(level), 1);
	};

    getColor = (color) => {
		const clr = color.toString(16);
		return "#" + "000000".substr(0, 6 - clr.length) + clr;
	};

    getNumber = (val) => {
		return Math.round(val * 100) / 100;
	};
}

export default EffectsPreview;
