import Bowser from "bowser";
import PropTypes from 'prop-types';
import React from "react";
import ReactDOM from 'react-dom';
import createReactClass from 'create-react-class';
import SimpleSignal from "simplesignal";

import ToolList from "./ToolList.react";

import ActionButton from "../../common/ActionButton.react";

import MiniTracker from "../../../vendor/tracking/MiniTracker";
import ReactUtils from "../../../vendor/utils/ReactUtils";
import DirectionUtils from "./../../../vendor/utils/DirectionUtils";

const InterstitialPage = createReactClass({
    displayName: 'InterstitialPage',
    hasPerformedTracking: false,
    onPageScrolled: new SimpleSignal(),
    scrollComponent: undefined,

    propTypes: {
		stringList: PropTypes.object,
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
		onClickNext: PropTypes.func,
		navigator: PropTypes.object,
		tools: PropTypes.array, // Tool
		level: PropTypes.object, // Level
	},

    componentDidMount: function() {
		this.scrollComponent = ReactDOM.findDOMNode(this).querySelector(".middle");
		this.scrollComponent.addEventListener("scroll", this.onScrolledContent);
	},

    componentWillUnmount: function() {
		this.scrollComponent.removeEventListener("scroll", this.onScrolledContent);
	},

    render: function() {
		this.hasPerformedTracking = false;

		return (
			<div className={ "sectionPageHolder pageInterstitial " + DirectionUtils.getClass(this.props.stringList) }>
				<div className="middle" data-testid="interstitial-scroll-container">
					<div className="content">
						{ this.renderTitle() }
						<div className="sidebar">
							<div className="wrapper">
								<p className="title">{(this.props.tools && this.props.tools.length > 0 ? this.props.tools[0].threat.longDescription : "")}</p>
								<hr key="hr" className="hr"/>
								<p className="subtitle">{this.props.tools && this.props.tools.length > 0 ? ReactUtils.getReplacedTags(this.props.tools[0].threat.stats, "em", function(innerText) { return <em>{innerText}</em>; }) : ""}</p>
								<ActionButton className="button-next" onClick={ this.props.onClickNext }>
									{this.props.stringList.get("interstitial-button-continue")}
								</ActionButton>
							</div>
						</div>
						<div className="body">
							<ToolList stringList={ this.props.stringList }
								dataTestId="interstitial"
								routes={ this.props.routes }
								goToPage={ this.props.goToPage }
								tools={ this.props.tools }
								recommendationLevel={ this.props.level.id }/>
						</div>
						<div className="footer">
							<ActionButton className="button-next" onClick={ this.props.onClickNext }>
								{this.props.stringList.get("interstitial-button-continue")}
							</ActionButton>
						</div>
					</div>
				</div>
			</div>
		);
	},

    renderTitle: function() {
		const title = this.props.navigator.currentTitle ? ReactUtils.getReplacedTags(this.props.navigator.currentTitle, "em", function(innerText) { return <em>{innerText}</em>; }) : undefined;

		return (
			<div key="title" className="common-section-title">
				<div key="text">{title}</div>
			</div>
		);
	},

    /**
	 * Ran when the section becomes the focused section
	 */
    onActivate: function(travelOffset, viaHistoryAPI, fromOverlay) { // eslint-disable-line no-unused-vars
		if (!this.hasPerformedTracking && this.props.tools.length > 0) {
			this.props.tools.forEach(tool => {
				if (tool.recommendationLevel == this.props.level.id) {
					MiniTracker.trackEvent("tool", "display-interstitial", tool.slug, Math.round(tool.recommendationPointsOnLevel * 100), true);
				}
			});

			this.hasPerformedTracking = true;
		}

		this.validateScrollPosition();
	},

    /**
	 * Ran when the section is about to lose focus
	 */
    onDeactivate: function(travelOffset, viaHistoryAPI, toOverlay) { // eslint-disable-line no-unused-vars
	},

    onScrolledContent: function() {
		this.validateScrollPosition();
		this.onPageScrolled.dispatch();
	},

    getScrollPosition: function() {
		// Return the current scroll position of the component
		return this.scrollComponent ? this.scrollComponent.scrollTop : 0;
	},

    getMaxScrollPosition: function() {
		return this.scrollComponent ? this.scrollComponent.scrollHeight - this.scrollComponent.clientHeight : 0;
	},

    setScrollPosition: function(value) {
		if (this.scrollComponent) this.scrollComponent.scrollTop = value;
	},

    validateScrollPosition: function() {
		// Validate the scroll position to avoid overscroll flickering on iOS:
		// it only happens when scrolling from the edges, so always move away from the edges
		if (Bowser.ios) {
			if (this.getScrollPosition() < 1) {
				this.setScrollPosition(1);
			} else if (this.getScrollPosition() > this.getMaxScrollPosition() - 1) {
				this.setScrollPosition(this.getMaxScrollPosition() - 1);
			}
		}
	},

    getDesiredLocatorBackgroundColor: function() {
		// Return the color (as a number) that the locator bar should have when opaque
		return undefined;
	},
});

export default InterstitialPage;
