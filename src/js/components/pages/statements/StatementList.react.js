import PropTypes from 'prop-types';
import React from "react";

import createReactClass from 'create-react-class';

import SecurityPlannerStore from "../../../stores/SecurityPlannerStore";

import ResizeUtils from "../../../vendor/utils/ResizeUtils";

import Statement from "./Statement.react.js";

const StatementList = createReactClass({
    displayName: 'StatementList',
    statementsGroupElement: undefined,

    propTypes: {
		statements: PropTypes.array.isRequired,
		allowFocus: PropTypes.bool,
		contextualTitle: PropTypes.string,
	},

    getInitialState: function() {
		return {
			breakpoint: ResizeUtils.getCurrentBreakpoint(), // string
		};
	},

    componentDidMount: function() {
		window.addEventListener("resize", this.onResize);

		// Hack with timeout to focus element in IE
		this.focusTimeout = setTimeout(() => {
			this.statementsGroupElement.focus();
		}, 0);
	},

    componentWillUnmount: function() {
		window.removeEventListener("resize", this.onResize);

		clearTimeout(this.focusTimeout);
		this.focusTimeout = null;
	},

    render: function() {
		const currentPossibleStatements = this.props.statements.filter(statement => statement.isRequired || SecurityPlannerStore.isStatementVisible(statement.id));
		const maxStatementsVisible = this.state.breakpoint === "small" ? 9 : 8;
		const numRequiredStatements = currentPossibleStatements.filter(statement => statement.isRequired).length;
		let numNonRequiredStatements = 0;

		const visibleStatements = currentPossibleStatements.filter(statement => {
			// If the statement is required, we display it.
			// If not required, we need to see if there's room to show it by checking the number of non-required
			// statements already displayed vs. the max-number we can display.
			if (statement.isRequired) {
				return true;
			} else {
				numNonRequiredStatements++;

				if (numNonRequiredStatements + numRequiredStatements <= maxStatementsVisible) {
					return true;
				}
			}
		});

		return (
			<div
				className="statements"
				role="group"
				aria-label={ this.props.contextualTitle }
				tabIndex={ -1 }
				ref={ e => this.statementsGroupElement = e  }>
				{ visibleStatements.map((statement, i) => {
					return (
						<Statement
							statement={ statement }
							key={ statement.id }
							allowFocus={ this.props.allowFocus }
							index={ i }/>
					);
				}) }
			</div>
		);
	},

    onResize: function() {
		this.setState({
			breakpoint: ResizeUtils.getCurrentBreakpoint(),
		});
	},
});

export default StatementList;
