import PropTypes from 'prop-types';
import React from "react";

import SecurityPlannerActions from "./../../../actions/SecurityPlannerActions";

import Card from "./Card.react.js";

class Statement extends React.Component {
    static propTypes = {
		statement: PropTypes.object,
		index: PropTypes.number,
		allowFocus: PropTypes.bool,
	};

    lastStateSelected = undefined;
    lastStateStatementId = undefined;

    shouldComponentUpdate(nextProps) {
		if (nextProps.statement != this.props.statement ||
			nextProps.allowFocus != this.props.allowFocus ||
			(nextProps.statement && (nextProps.statement.id != this.lastStateStatementId || nextProps.statement.selected != this.lastStateSelected))
		) {
			return true;
		} else {
			return false;
		}
	}

    render() {
		// Update state
		this.lastStateSelected = this.props.statement ? this.props.statement.selected : undefined;
		this.lastStateStatementId = this.props.statement ? this.props.statement.id : undefined;

		// Render
		if (this.props.statement == undefined) {
			// Empty statement
			return (
				<Card className={ "statement statement-" + this.props.index }
					isEmpty={ true }/>
			);
		} else {
			// Normal statement
			return (
				<Card className={ "statement statement-" + this.props.index }
					onClick={ this.toggleStatementSelected }
					isSelected={ this.props.statement.selected }
					text={ this.props.statement.text }
					image={ this.props.statement.image }
					allowFocus={ this.props.allowFocus }
					backgroundColor={ this.props.statement.backgroundColor }/>
			);
		}
	}

    toggleStatementSelected = () => {
		// console.time("select-statement");
		// console.profile("select-statement");

		if (!!React && !!React.addons && !!React.addons.Perf) {
			// console.profile("select-statement");
			React.addons.Perf.start();
		}

		SecurityPlannerActions.toggleStatementSelected(this.props.statement.id, this.props.statement.slug);

		if (!!React && !!React.addons && !!React.addons.Perf) {
			setTimeout(function() {
				// console.profileEnd();
				React.addons.Perf.stop();
				React.addons.Perf.printWasted();
				React.addons.Perf.printInclusive();
				React.addons.Perf.printExclusive();
			}, 500);
		}

		// console.profileEnd();
		// console.timeEnd("select-statement");
	};
}

export default Statement;