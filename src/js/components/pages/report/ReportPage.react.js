import Bowser from "bowser";
import { clamp, map } from "moremath";
import PropTypes from 'prop-types';
import React from "react";
import ReactDOM from 'react-dom';
import createReactClass from 'create-react-class';
import SimpleSignal from "simplesignal";

import SecurityPlannerConstants from "./../../../constants/SecurityPlannerConstants";
import SecurityPlannerStore from "./../../../stores/SecurityPlannerStore";
import MiniTracker from "./../../../vendor/tracking/MiniTracker";
import Easing from "./../../../vendor/transitions/Easing";
import Fween from "./../../../vendor/transitions/Fween";
import DirectionUtils from "./../../../vendor/utils/DirectionUtils";
import PageSectionHelper from "./../../../vendor/utils/PageSectionHelper";
import PositionUtils from "./../../../vendor/utils/PositionUtils";
import ResizeUtils from "./../../../vendor/utils/ResizeUtils";
import WindowScrollUtils from "./../../../vendor/utils/WindowScrollUtils";
import FooterMenu from "./../../common/FooterMenu.react";
import ImageContainer from "./../../common/ImageContainer.react";
import SecondaryMenu from "./../../common/SecondaryMenu.react";
import Text from "./../../common/Text.react";
import ThreatMenu from "./../../common/ThreatMenu.react";
import ToolList from "./../../common/ToolList.react";
import SpeechBubble from "./../../common/SpeechBubble.react"
import Footer from "./Footer.react";
import Header from "./Header.react";

const ReportPage = createReactClass({
    displayName: 'ReportPage',
    hasPerformedTracking: false,
    shareURL: undefined,
    lastAlignedThreatId: undefined,
    lastAlignedLanguageId: undefined,
    onPageScrolled: new SimpleSignal(),
    canChangeGradients: !Bowser.ios || parseFloat(Bowser.version) > 7,
    printingWindow: undefined,

    // A saved tool state, to preserve the selected list even if it changes
    savedState: undefined,

    isScrolling: false,
    threatScrollPosition: undefined,
    threatIdToScrollTo: undefined,
    positionToScrollFrom: undefined,
    helper: undefined,

    propTypes: {
		stringList: PropTypes.object,
		selectedLanguage: PropTypes.object, // Language
		availableLanguages: PropTypes.arrayOf(PropTypes.object), // Language[]
		navigator: PropTypes.object,
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
		onClickToStart: PropTypes.func,
		tools: PropTypes.array, // Tool[]
		topTool: PropTypes.object, // Tool
		threats: PropTypes.array, // Threat[]
		isFromSharing: PropTypes.bool,
	},

    getInitialState: function() {
		return {
			backgroundColor: "#" + this.getThreatColorByIndex(this.canChangeGradients ? 0 : -1),
			breakpoint: ResizeUtils.getCurrentBreakpoint(),
			isThreatMenuFixed: false,
			isTransitioning: false,
			threatSubtitle: "",
			statsSource: "#",
			statsName: "",
			scrollPosition: 0,
		};
	},

    UNSAFE_componentWillMount: function() {
		this.helper = new PageSectionHelper(this);
		this.title = this.props.navigator.currentTitle;

		this.scrollOffsets = {
			"tiny": 80,
			"small": 80,
			"medium": 80,
			"large": 80,
		};

		// If we use data from sharing, we save the state, since we want to preserve it
		// in case the user goes back and forth and change and change statements
		const topTool = this.props.topTool;
		const topToolIndex = this.props.tools.findIndex(tool => tool === topTool);
		const toolsToUse = [topTool].concat(this.props.tools.slice(0, topToolIndex)).concat(this.props.tools.slice(topToolIndex + 1));
		const threatsToUse = this.getThreatsToUse(this.props.threats, this.props.tools);

		this.savedState = {
			topTool: topTool,
			toolsToUse: toolsToUse,
			threatsToUse: threatsToUse,
			resultsHash: SecurityPlannerStore.saveState(),
		};

		document.addEventListener("visibilitychange", this.onVisibilityChange);
	},

    componentDidMount: function() {
		this.helper.setComponent(this);
		this.helper.onScrolled.add(this.onScrolledContent);
		this.helper.onResized.add(this.onResize);
		this.helper.dispatchOnScrolled();

		if (this.props.isFromSharing) {
			MiniTracker.trackEvent("page", "shared-plan-visit", "*********");
		}

		this.headerEl = ReactDOM.findDOMNode(this.headerComp);
		this.forceHeadAdjustInterval = setInterval(this.tick, 3000);
	},

    tick: function() {
		this.adjustHeadPosition();
	},

    shouldComponentUpdate: function(nextProps, nextState) {
		return nextProps.stringList != this.props.stringList ||
			nextProps.selectedLanguage != this.props.selectedLanguage ||
			nextProps.availableLanguages != this.props.availableLanguages ||
			nextProps.navigator != this.props.navigator ||
			nextProps.routes != this.props.routes ||
			nextProps.goToPage != this.props.goToPage ||
			nextProps.tools != this.props.tools ||
			nextProps.topTool != this.props.topTool ||
			nextProps.threats != this.props.threats ||
			nextProps.isFromSharing != this.props.isFromSharing ||
			nextState.backgroundColor != this.state.backgroundColor ||
			nextState.breakpoint != this.state.breakpoint ||
			nextState.isThreatMenuFixed != this.state.isThreatMenuFixed ||
			nextState.isTransitioning != this.state.isTransitioning ||
			nextState.threatSubtitle != this.state.threatSubtitle ||
			nextState.statsName != this.state.statsName ||
			nextState.statsSource != this.state.statsSource ||
			nextState.scrollPosition != this.state.scrollPosition;
	},

    componentWillUnmount: function() {
		this.helper.destroy();
		document.removeEventListener("visibilitychange", this.onVisibilityChange);
		clearInterval(this.forceHeadAdjustInterval);
	},

    componentDidUpdate: function() {
		this.helper.setComponent(this);
		this.helper.dispatchOnScrolled();
	},

    render: function() {
		this.shareURL = this.getShareURL();
		this.hasPerformedTracking = false;

		const mainStyle = {
			backgroundColor: this.state.backgroundColor,
			height: this.helper.getWindowHeight(),
		};

		const additionalThreat = this.props.threats.find(threat => threat.isAdditionalHelp);
		const additionalThreatSlug = additionalThreat ? additionalThreat.slug : undefined;

		return (
			<div
				className={ "sectionPageHolder pageReport " + DirectionUtils.getClass(this.props.stringList) + (this.props.isFromSharing ? " shared" : " non-shared") + (this.state.isTransitioning ? " changing" : "") }
				aria-hidden={ !this.helper.isActive() }
				style={ mainStyle }>
				{ this.props.isFromSharing ? this.renderSecondaryMenu() : null }
				<Header stringList={ this.props.stringList }
						title={ this.title }
						ref={ (r) => this.headerComp = r }
						numTools={ this.savedState.toolsToUse.length }
						threatList={ this.savedState.threatsToUse }
						scrolledAmount={ this.state.scrollPosition }
						onClickedThreat={ this.onClickedToShowThreat }
						onClickedPrint={ this.helper.isActive() ? this.onClickPrint : null }
						isFromSharing={ this.props.isFromSharing }
						allowFocus={ this.helper.isActive() }
						topTool={ this.savedState.topTool }
						routes={ this.props.routes }
						goToPage={ this.props.goToPage } />
				<div className="content">
					<ThreatMenu
						activeFilter={ {} }
						backgroundColor={ this.state.backgroundColor }
						currentActiveThreatId={ this.lastAlignedThreatId }
						isFixed={ this.state.isThreatMenuFixed }
						isVisible={ this.state.isThreatMenuFixed }
						menuTitle={ this.props.stringList.get("action-plan-navigation-title") }
						onClickThreat={ this.onClickedToShowThreat }
						onClickPrint={ this.onClickPrint }
						stringList={ this.props.stringList }
						routes={ this.props.routes }
						goToPage={ this.props.goToPage }
						threatList={ this.savedState.threatsToUse }
						allowFocus={ this.helper.isActive() }/>
					<div
						className="middle"
						ref="middle"
						style={ { backgroundColor: this.state.backgroundColor } }
						id={ SecondaryMenu.LOCATION_ACTION_PLAN }>
						<div className="sidebar-placeholder">
							<div className="sidebar special-positioning-glued-parent">
								<div className="threat-panel">
									<Text className="title" ref="title"/>
									<div className="threat-info">
										{ <SpeechBubble 
											toolList={ this.refs["toolList"] }
											ref="subtitle"
											link={ this.state.statsSource }
											onWheel={ this.onWheelStats }
											tabIndex={ this.helper.isActive() && this.state.statsSource ? 0 : -1 }
											subtitle={ this.state.threatSubtitle } 
											currentActiveThreatId={ this.lastAlignedThreatId }
											threats={ this.savedState.threatsToUse }
											classNameStats={ DirectionUtils.getClass(this.props.stringList) }
											statsName={ this.state.statsName }
										/> }
										<div className="head"/>
									</div>
								</div>
							</div>
						</div>
						<div className="body">
							<ToolList
								ref="toolList"
								stringList={ this.props.stringList }
								dataTestId="report"
								routes={ this.props.routes }
								goToPage={ this.props.goToPage }
								tools={ this.savedState.toolsToUse }
								topTool={ this.savedState.topTool }
								threats={ this.savedState.threatsToUse }
								sizeFirstTool="medium"
								sizeOtherTools="medium"
								allowFocus={ this.helper.isActive() }
								onChangedListSize={ this.onChangedListSize }
								tabSequence={ (nextThreatID, currentTool, e) => nextThreatID ? this.scrollToThreat(nextThreatID, currentTool, e) : null }
								maxVisibleThreats={ SecurityPlannerConstants.Values.RECOMMENDATION_MAX_VISIBLE_THREATS }
								maxVisibleToolsPerThreat={ SecurityPlannerConstants.Values.RECOMMENDATION_MAX_VISIBLE_TOOLS_PER_THREAT }/>
						</div>
					</div>
					<Footer
						stringList={ this.props.stringList }
						routes={ this.props.routes }
						goToPage={ this.props.goToPage }
						additionalThreatUri={ additionalThreatSlug ? this.props.routes.getUriAllToolsThreat(additionalThreatSlug) : undefined }
						shareURL={ this.shareURL }
						isFromSharing={ this.props.isFromSharing }
						allowFocus={ this.helper.isActive() }
						onClickPrint={ this.onClickPrint }
						onClickToStart={ this.props.onClickToStart }/>
					<FooterMenu
						stringList={ this.props.stringList }
						currentLocation={ SecondaryMenu.LOCATION_ACTION_PLAN }
						style={ FooterMenu.STYLE_LIGHT }
						routes={ this.props.routes }
						goToPage={ this.props.goToPage }
						allowFocus={ this.helper.isActive() }/>
				</div>
			</div>
		);
	},

    renderSecondaryMenu: function() {
		return (
			<SecondaryMenu stringList={ this.props.stringList }
				currentLocation={ SecondaryMenu.LOCATION_ACTION_PLAN }
				availableLanguages={ this.props.availableLanguages }
				selectedLanguage={ this.props.selectedLanguage }
				routes={ this.props.routes }
				goToPage={ this.props.goToPage }
				allowFocus={ this.helper.isActive() }
				useLightStyle={ false }
				className="shared-page"/>
		);
	},

    getThreatsToUse: function(allThreats, tools) {
		// Get a list of threat groups with at least one tool
		const orderedThreats = [];
		allThreats.forEach(threat => {
			if (tools.some(tool => tool.threat.id == threat.id)) {
				orderedThreats.push(threat);
			}
		});
		return orderedThreats;
	},

    getShareURL: function() {
		// Based on the current tools, return a share URL
		return this.props.stringList.get("action-plan-share-url").split("[[hash]]").join(this.savedState.resultsHash);
	},

    getPrintURL: function() {
		// TODO: this is semi-temporary; we might change it to use actual remapped URLs instead
		return "?l=" + this.props.selectedLanguage.id + "#" + this.props.routes.getUriPrintReport(this.savedState.resultsHash);
	},

    adjustHeadPosition: function(neverFixed = false) {
		if (!this.helper.isActive()) neverFixed = true;

		// Adjust all elements that should be glued to the page edges
		const element = this.helper.getElement().querySelector(".special-positioning-glued-parent");
		PositionUtils.positionVerticallyOnParentOrScreen(element, neverFixed, DirectionUtils.isLTR(this.props.stringList));
	},

    checkFixedThreatHeader: function() {
		// Check whether the header should be fixed (for sticky nav bar)
		if (this.headerEl) {
			const scrolledPastHeader = this.helper.getElement().scrollTop > this.headerEl.offsetHeight + this.headerEl.offsetTop;

			if (scrolledPastHeader && !this.state.isThreatMenuFixed) {
				return true;
			} else if (!scrolledPastHeader && this.state.isThreatMenuFixed) {
				return false;
			}
		}
	},

    onScrollingEnded: function(nextThreatId, lastTool, e) {
		this.isScrolling = false;
		this.helper.dispatchOnScrolled();

		if (lastTool && nextThreatId && e) {
			setTimeout( this.refs["subtitle"].setFocus(lastTool, nextThreatId, e), 1);
		}
	},

    /**
	 * Ran when the section becomes the focused section
	 */
    onActivate: function(travelOffset, viaHistoryAPI, fromOverlay) {
		if (!fromOverlay) {
			this.adjustHeadPosition(true);

			const elements = document.querySelectorAll(".special-positioning-glued-parent");
			for (let i = 0; i < elements.length; i++) {
				PositionUtils.resetVerticalPosition(elements[i]);
			}
		}

		// Performs tracking
		if (!this.hasPerformedTracking && this.savedState.toolsToUse.length > 0) {
			this.savedState.toolsToUse.forEach(tool => {
				MiniTracker.trackEvent("tool", "display-action-plan", tool.slug, Math.round(tool.recommendationPoints * 100), true);
			});

			this.hasPerformedTracking = true;
		}

		this.helper.onActivate(travelOffset, viaHistoryAPI, fromOverlay);
	},

    /**
	 * Ran when the section is about to lose focus
	 */
    onDeactivate: function(travelOffset, viaHistoryAPI, toOverlay) {
		this.helper.onDeactivate(travelOffset, viaHistoryAPI, toOverlay);

		if (!toOverlay) {
			this.adjustHeadPosition(true);
			this.setState({
				isThreatMenuFixed: false,
			});
		}
	},

    /**
	 * Returns the color (as a number) that the locator bar should have when opaque
	 */
    getDesiredLocatorBackgroundColor: function() {
		return undefined;
	},

    getScrollPosition() {
		// Needed by the header, to check on the current state of the scrolling
		return this.helper.getScrollPosition(true);
	},

    onChangedListSize: function() {
		this.helper.dispatchOnScrolled();
	},

    // TODO: this is duplicated in AllTools... redo in a more reusable way?
    onScrolledContent: function(scrollY, maxScrollY) {
		const newState = Object.assign({}, this.state);

		this.onPageScrolled.dispatch();
		this.adjustHeadPosition();

		// Decide whether the stickiness/visibility of the threat menu needs to change
		const isThreatMenuFixed = this.checkFixedThreatHeader() && this.helper.isActive();
		if (isThreatMenuFixed !== undefined) {
			newState.isThreatMenuFixed = isThreatMenuFixed;
		}

		// Check which is the current threat

		const toolList = this.refs["toolList"];
		if (toolList) {
			let alignedThreat = undefined;

			if (this.isScrolling) {
				// Scrolling, change to the threat we're navigating to
				alignedThreat = this.getThreatById(this.threatIdToScrollTo);
			} else if (scrollY > maxScrollY) {
				// At the bottom, use the last threat regardless of aligment
				alignedThreat = toolList.getLastThreat();
			} else {
				// Actually use the aligned threat (middle of title)
				const targetY = WindowScrollUtils.getWindowScrollY() + window.innerHeight * 0.35; // Use the top of the screen as the "target" position
				alignedThreat = toolList.getAlignedThreat(targetY);
			}
			if (alignedThreat) {
				if ((alignedThreat.id !== this.lastAlignedThreatId || this.props.stringList.getLanguage().id !== this.lastAlignedLanguageId) && !this.state.isTransitioning) {
					// Find color
					const alignedThreatIndex = this.savedState.threatsToUse.indexOf(alignedThreat);

					if (alignedThreat.id !== this.lastAlignedThreatId || this.props.stringList.getLanguage().id !== this.lastAlignedLanguageId) {
						newState.isTransitioning = true;
						this.changeThreatInfo(alignedThreat);
					}

					newState.backgroundColor = "#" + this.getThreatColorByIndex(this.canChangeGradients ? alignedThreatIndex : -1);
				}
			} else {
				console.log("Error: no aligned threat found."); // eslint-disable-line
			}
		} else {
			this.lastAlignedThreatId = undefined;
			newState.threatSubtitle = "";
			newState.statsSource = "";
			newState.statsName = "";
		}

		newState.scrollPosition = this.getScrollPosition();

		this.setState(newState);
	},

    getThreatById: function(id) {
		return this.savedState.threatsToUse.find((threat) => { return threat.id === id; });
	},

    getThreatColorByIndex: function(index) {
		if (index < 0) {
			// No color
			return SecurityPlannerConstants.Colors.DEFAULT.toString(16);
		} else {
			// Real color
			index = clamp(index, 0, SecurityPlannerConstants.Colors.Threats.length - 1);
			return SecurityPlannerConstants.Colors.Threats[index].toString(16);
		}
	},

    onClickedToShowThreat: function(threatId, e) {
		const toolList = this.refs["toolList"];
		if (!toolList.isThreatVisible(threatId)) {
			toolList.expandList();
		}
		const toolsForThreat = this.props.tools.filter(tool => tool.threat && (tool.threat.id === threatId));
		if (toolsForThreat.length === 1 && this.props.topTool.id === toolsForThreat[0].id) {
			this.scrollToTopTool(threatId, e);
		} else {
			if (e) this.refs["subtitle"].refs["speech-bubble"].focus()
			this.scrollToThreat(threatId, false, e);
		}
	},

    scrollToTopTool: function() {
		if (!this.props.topTool || !this.headerComp) {
			return;
		}

		this.positionToScrollFrom = this.helper.getScrollPosition();
		this.isScrolling = true;
		Fween.use(this.getTopToolScrollPosition, this.setTopToolScrollPosition).from(0).to(1, 0.4, Easing.expoInOut).call(this.onScrollingEnded).play();
	},

    getTopToolScrollPosition: function() {
		return this.toolScrollPosition;
	},

    setTopToolScrollPosition: function(value) {
		this.toolScrollPosition = value;

		const element = ReactDOM.findDOMNode(this.headerComp.refs[this.props.topTool.id]);
		const elementRect = PositionUtils.findElementRect(element, true);
		const scrollRect = PositionUtils.findElementRect(this.helper.getElement(), true);

		const topY = elementRect.top - scrollRect.top + this.helper.getScrollPosition() - this.scrollOffsets[this.state.breakpoint];

		// Update position
		const desiredScrollY = map(this.toolScrollPosition, 0, 1, this.positionToScrollFrom, topY);
		this.helper.setScrollPosition(desiredScrollY);
	},

    scrollToThreat: function(threatId, lastTool, e) {
		this.threatIdToScrollTo = threatId;
		this.positionToScrollFrom = this.helper.getScrollPosition();
		this.isScrolling = true;
		Fween.use(this.getThreatScrollPosition, this.setThreatScrollPosition).from(0).to(1, 0.4, Easing.expoInOut).call(() => this.onScrollingEnded(threatId, lastTool, e)).play();
	},

    getThreatScrollPosition: function() {
		return this.threatScrollPosition;
	},

    setThreatScrollPosition: function(value) {
		this.threatScrollPosition = value;
		// Update position
		const destinationScrollY = this.getThreatTopY(this.threatIdToScrollTo);
		const desiredScrollY = map(this.threatScrollPosition, 0, 1, this.positionToScrollFrom, destinationScrollY);
		this.helper.setScrollPosition(desiredScrollY);
	},

    getThreatTopY: function(threatId) {
		// Find the internal Y of a threat
		const toolList = this.refs["toolList"];
		if (toolList.hasElementForThreat(threatId)) {
			const element = toolList.getElementForThreat(threatId);
			const elementRect = PositionUtils.findElementRect(element, true);
			const scrollRect = PositionUtils.findElementRect(this.helper.getElement(), true);
			return elementRect.top - scrollRect.top + this.helper.getScrollPosition() - this.scrollOffsets[this.state.breakpoint];
		}
		return undefined;
	},

    changeThreatInfo: function(newThreat) {
		window.setTimeout(function() {
			this.lastAlignedThreatId = newThreat.id;
			this.lastAlignedLanguageId = this.props.stringList.getLanguage().id;
			this.refs["title"].setState({ text: newThreat.shortDescription });

			this.setState(Object.assign({}, this.state, {
				isTransitioning: false,
				threatSubtitle: newThreat.stats,
				statsSource: newThreat.statsSource,
				statsName: newThreat.statsName,
			}));
		}.bind(this), 200);
	},

    onResize: function(width, height) { // eslint-disable-line no-unused-vars
		const bp = ResizeUtils.getCurrentBreakpoint();
		if (bp !== this.state.breakpoint) {
			this.setState({
				breakpoint: ResizeUtils.getCurrentBreakpoint(),
			});
		}
		requestAnimationFrame(() => this.helper.dispatchOnScrolled());
	},

    onWheelStats: function(e) {
		const element = document.querySelector(".special-positioning-glued-parent");
		if (element && element.style.position == "fixed") {
			// If using the mousewheel atop the stats bubble, re-inject the scroll
			// This is super ugly, but needed because links on a position:fixed div will always steal the event
			this.helper.setScrollPosition(this.helper.getScrollPosition() + e.deltaY);
		}
	},

    onClickPrint: function() {
		this.printingWindow = window.open(this.getPrintURL(), "_blank");
	},

    onVisibilityChange: function() {
		// Upon coming back from another tab, close printing tab if needed
		// This is needed because Chrome locks JavaScript execution (but not this event)
		// in the original tab until the print dialog is closed in the second tab
		if (document.visibilityState === "visible" && this.printingWindow) {
			this.printingWindow.close();
			this.printingWindow = undefined;
		}
	},
});

export default ReportPage;
