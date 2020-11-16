import PropTypes from 'prop-types';
import React from "react";
import createReactClass from 'create-react-class';
import SimpleSignal from "simplesignal";

import PageSectionHelper from "./../../../vendor/utils/PageSectionHelper";
import MiniTracker from "../../../vendor/tracking/MiniTracker";
import ReactUtils from "../../../vendor/utils/ReactUtils";
import DirectionUtils from "./../../../vendor/utils/DirectionUtils";

import SecurityPlannerStore from "../../../stores/SecurityPlannerStore";

import ActionButton from "../../common/ActionButton.react";

import StatementList from "./StatementList.react";

const StatementsPage = createReactClass({
    displayName: 'StatementsPage',
    hasPerformedTracking: false,
    lastNumberOfStatementsActivated: 0,
    onPageScrolled: new SimpleSignal(),
    helper: undefined,

    propTypes: {
		isLastStatementPage: PropTypes.bool,
		level: PropTypes.object, // Level
		navigator: PropTypes.object,
		onClickNext: PropTypes.func,
		stringList: PropTypes.object,
	},

    UNSAFE_componentWillMount: function() {
		this.helper = new PageSectionHelper(this);
	},

    componentDidMount: function() {
		this.helper.setComponent(this.refs.scroller);
		this.helper.onScrolled.add(this.onScrolledContent);
	},

    componentDidUpdate: function() {
		this.helper.setComponent(this.refs.scroller);
		this.helper.dispatchOnScrolled();
	},

    componentWillUnmount: function() {
		this.helper.destroy();
	},

    render: function() {
		this.hasPerformedTracking = false;
		const actionButtonCopy = this.props.isLastStatementPage ? this.props.stringList.get("statements-button-results") : this.props.stringList.get("statements-button-next");
		const canContinue = this.canContinueToNextStep();
		const contextualTitle = this.props.stringList.get("statements-title").replace("[[title]]", this.props.level.title).replace(/<(|\/)em>/g, "");

		return (
			<div
				className={ "sectionPageHolder pageStatements pageStatements-level-" + this.props.level.slug.substr(0, 1) + " " + DirectionUtils.getClass(this.props.stringList) }
				aria-hidden={ !this.helper.isActive() }
				style={ { height: this.helper.getWindowHeight() } }>
				<div
					className="content"
					ref="scroller">
					<div className="body">
						{ this.renderTitle() }
						<StatementList
							statements={ this.props.level.statements }
							allowFocus={ this.helper.isActive() }
							contextualTitle={ contextualTitle }/>
					</div>
					<div className="footer">
						<ActionButton
							className={ "button-next" + (canContinue ? "" : " disabled") }
							allowFocus={ canContinue && this.helper.isActive() }
							title={ actionButtonCopy }
							onClick={ this.onClickContinue }>
							{ actionButtonCopy }
						</ActionButton>
					</div>
				</div>
			</div>
		);
	},

    canContinueToNextStep: function() {
		let numberOfStatementsActivated = 0;
		this.props.level.statements.forEach(statement => {
			if (statement.selected) numberOfStatementsActivated++;
		});

		if (numberOfStatementsActivated != this.lastNumberOfStatementsActivated) {
			this.onChangedSelection();
			this.lastNumberOfStatementsActivated = numberOfStatementsActivated;
		}

		return numberOfStatementsActivated >= this.props.level.answersRequired;
	},

    renderTitle: function() {
		const title = this.title ? ReactUtils.getReplacedTags(this.title, "em", function(innerText) { return <em>{innerText}</em>; }) : undefined;

		return (
			<div key="title" className="common-section-title">
				<div key="text">{title}</div>
			</div>
		);
	},

    // Common events for navigation
    onActivate: function(travelOffset, viaHistoryAPI, fromOverlay) {
		// Ran when the section becomes active
		this.title = this.props.navigator.currentTitle;
		if (!this.hasPerformedTracking) {
			this.props.level.statements.forEach(statement => {
				if (SecurityPlannerStore.isStatementVisible(statement.id)) {
					MiniTracker.trackEvent("statement-card", "display", statement.slug, undefined, true);
				}
			});

			this.hasPerformedTracking = true;
		}

		if (travelOffset > 0 || !viaHistoryAPI) this.setScrollPosition(0);

		this.helper.onActivate(travelOffset, viaHistoryAPI, fromOverlay);
	},

    onDeactivate: function(travelOffset, viaHistoryAPI, toOverlay) {
		// Ran when the section becomes inactive
		this.helper.onDeactivate(travelOffset, viaHistoryAPI, toOverlay);
	},

    onClickContinue: function(e) {
		if (this.canContinueToNextStep() && this.props.onClickNext) this.props.onClickNext(e);
	},

    onChangedSelection: function() {
		// Selection has changed: remove all the pages that come after this page
		this.props.navigator.removeLocationsAfterCurrent();
	},

    onScrolledContent: function() {
		this.onPageScrolled.dispatch();
	},

    getScrollPosition: function() {
		// Return the current scroll position of the component
		return this.helper.getScrollPosition();
	},

    getMaxScrollPosition: function() {
		return this.helper.getMaxScrollPosition();
	},

    setScrollPosition: function(value) {
		this.helper.setScrollPosition(value);
	},

    getDesiredLocatorBackgroundColor: function() {
		// Return the color (as a number) that the locator bar should have when opaque
		return undefined;
	},
});

export default StatementsPage;
