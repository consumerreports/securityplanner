import PropTypes from 'prop-types';
import React from "react";
import ReactDOM from 'react-dom';
import createReactClass from 'create-react-class';
import SimpleSignal from "simplesignal";
import { map } from "moremath";

import PositionUtils from "../../../vendor/utils/PositionUtils";
import ResizeUtils from "../../../vendor/utils/ResizeUtils";
import WindowScrollUtils from "../../../vendor/utils/WindowScrollUtils";
import DirectionUtils from "./../../../vendor/utils/DirectionUtils";

import Header from "./Header.react";
import Footer from "./Footer.react";
import SpeechBubble from "./../../common/SpeechBubble.react";

import SecondaryMenu from "../../common/SecondaryMenu.react";
import FooterMenu from "../../common/FooterMenu.react";
import DetailsButton from "../../common/DetailsButton.react";
import Text from "../../common/Text.react";
import ThreatMenu from "../../common/ThreatMenu.react";
import ToolList from "./../../common/ToolList.react";

import PageSectionHelper from "./../../../vendor/utils/PageSectionHelper";
import MiniTracker from "../../../vendor/tracking/MiniTracker";
import Fween from "../../../vendor/transitions/Fween";
import Easing from "../../../vendor/transitions/Easing";

const AllToolsPage = createReactClass({
    displayName: 'AllToolsPage',
    hasPerformedTracking: false,
    lastAlignedThreatId: undefined,
    lastAlignedLanguageId: undefined,
    onPageScrolled: new SimpleSignal(),
    toolsToUse: undefined,
    threatsToUse: undefined,
    isScrolling: false,
    threatScrollPosition: undefined,
    threatIdToScrollTo: undefined,
    positionToScrollFrom: undefined,
    helper: undefined,

    propTypes: {
		stringList: PropTypes.object,
		selectedLanguage: PropTypes.object, // Language
		availableLanguages: PropTypes.arrayOf(PropTypes.object), // Language[]
		currentLocation: PropTypes.string,
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
		startingThreat: PropTypes.object,
		threats: PropTypes.array, // Threat
		tools: PropTypes.array, // Tool
	},

    getInitialState: function() {
		return {
			activeFilter: {
				cost: 0,
				effort: 0,
			},
			breakpoint: ResizeUtils.getCurrentBreakpoint(),
			hasUpdatedFilter: false,
			isThreatMenuFixed: false,
			isTransitioning: false,
			threatSubtitle: "",
			statsName: "",
			statsSource: "#",
		};
	},

    UNSAFE_componentWillUpdate: function(nextProps, nextState) {
		const filterCategories = this.getFilterCategories();

		const filteredTools = nextProps.tools.filter(tool => {
			const effortFilter = filterCategories.effort.filters[nextState.activeFilter.effort];

			return effortFilter === tool.label || nextState.activeFilter.effort === 0;
		}).filter(tool => {
			const costFilter = filterCategories.cost.filters[nextState.activeFilter.cost];
			const isToolFree = !tool.price || !tool.price.trim();

			if (costFilter === this.props.stringList.get("all-tools-filter-cost-free")) {
				return isToolFree;
			} else if (costFilter === this.props.stringList.get("all-tools-filter-cost-paid")) {
				return !isToolFree;
			} else {
				return true;
			}
		});

		this.toolsToUse = filteredTools;
		this.updateThreatList();
	},

    UNSAFE_componentWillMount: function() {
		this.helper = new PageSectionHelper(this);
		this.toolsToUse = this.props.tools;
		this.updateThreatList();

		this.scrollOffsets = {
			"tiny": 80,
			"small": 80,
			"medium": 80,
			"large": 80,
		};
	},

    componentDidMount: function() {
		this.helper.setComponent(this);
		this.helper.onScrolled.add(this.onScrolledContent);
		this.helper.onResized.add(this.onResize);
		this.helper.dispatchOnScrolled();

		this.headerEl = ReactDOM.findDOMNode(this.headerComp);
		this.forceHeadAdjustInterval = setInterval(this.tick, 3000);
	},

    tick: function() {
		this.adjustHeadPosition();
	},

    shouldComponentUpdate: function(nextProps, nextState) {
		return nextProps.selectedLanguage != this.props.selectedLanguage ||
			nextProps.availableLanguages != this.props.availableLanguages ||
			nextProps.currentLocation != this.props.currentLocation ||
			nextProps.routes != this.props.routes ||
			nextProps.goToPage != this.props.goToPage ||
			nextProps.stringList != this.props.stringList ||
			nextProps.threats != this.props.threats ||
			nextProps.tools != this.props.tools ||
			nextState.activeFilter.cost != this.state.activeFilter.cost ||
			nextState.activeFilter.effort != this.state.activeFilter.effort ||
			nextState.hasUpdatedFilter != this.state.hasUpdatedFilter ||
			nextState.breakpoint != this.state.breakpoint ||
			nextState.hasUpdatedFilter != this.state.hasUpdatedFilter ||
			nextState.isThreatMenuFixed != this.state.isThreatMenuFixed ||
			nextState.isTransitioning != this.state.isTransitioning ||
			nextState.statsName != this.state.statsName ||
			nextState.statsSource != this.state.statsSource ||
			nextState.threatSubtitle != this.state.threatSubtitle;
	},

    componentDidUpdate: function() {
		this.helper.setComponent(this);
		this.helper.dispatchOnScrolled();
	},

    componentWillUnmount: function() {
		this.helper.destroy();
		clearInterval(this.forceHeadAdjustInterval);
	},

    render: function() {
		this.hasPerformedTracking = false;
		this.updateThreatList();

		return (
			<div
				className={ "sectionPageHolder pageAllTools " + DirectionUtils.getClass(this.props.stringList) + (this.state.isTransitioning ? " changing" : "") }
				aria-hidden={ !this.helper.isActive() }
				style={ { height: this.helper.getWindowHeight() } }>
				<Header
					routes={ this.props.routes }
					goToPage={ this.props.goToPage }
					availableLanguages={ this.props.availableLanguages }
					selectedLanguage={ this.props.selectedLanguage }
					ref={ (r) => this.headerComp = r }
					stringList={ this.props.stringList }
					allowFocus={ this.helper.isActive() }/>
				<div className="content">
					<ThreatMenu
						activeFilter={ this.state.activeFilter }
						backgroundColor="#669999"
						currentActiveThreatId={ this.lastAlignedThreatId }
						filterCategories={ this.getFilterCategories() }
						hasUpdatedFilter={ this.state.hasUpdatedFilter }
						isFixed={ this.state.isThreatMenuFixed }
						isVisible={ true }
						menuTitle={ this.props.stringList.get("all-tools-navigation-title") }
						onClickThreat={ this.onClickThreat }
						onUpdateActiveFilter={ this.updateActiveFilter }
						stringList={ this.props.stringList }
						routes={ this.props.routes }
						goToPage={ this.props.goToPage }
						threatList={ this.threatsToUse }
						allowFocus={ this.helper.isActive() }/>
					<div className="middle" ref="middle" id={ SecondaryMenu.LOCATION_ALL_TOOLS }>
						{ this.toolsToUse.length > 0 ? this.renderSidebar() : null }
						{ this.toolsToUse.length > 0 ? this.renderBody() : this.renderNoMatchingTools() }
					</div>
					<Footer
						stringList={ this.props.stringList }
						routes={ this.props.routes }
						goToPage={ this.props.goToPage }
						scrollToAThreat={this.scrollToThreat}/>
					<FooterMenu
						stringList={ this.props.stringList }
						currentLocation={ SecondaryMenu.LOCATION_ALL_TOOLS }
						style={ FooterMenu.STYLE_LIGHT }
						routes={ this.props.routes }
						goToPage={ this.props.goToPage }
						allowFocus={ this.helper.isActive() }/>
				</div>
			</div>
		);
	},

    renderSidebar: function() {
		return (
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
										threats={ this.threatsToUse }
										classNameStats={ DirectionUtils.getClass(this.props.stringList) }
										statsName={ this.state.statsName }/> }
							<div className="head"/>
						</div>
					</div>
				</div>
			</div>
		);
	},

    renderBody: function() {
		return (
			<div className="body">
				<ToolList
					ref="toolList"
					stringList={ this.props.stringList }
					routes={ this.props.routes }
					goToPage={ this.props.goToPage }
					tools={ this.toolsToUse }
					threats={ this.threatsToUse }
					sizeFirstTool="medium"
					sizeOtherTools="small"
					dataTestId="all-tools"
					tabSequence={ (nextThreatID, currentTool, e) => nextThreatID ? this.scrollToThreat(nextThreatID, currentTool, e) : null }
					allowFocus={ this.helper.isActive() }/>
			</div>
		);
	},

    renderNoMatchingTools: function() {
		return (
			<div className="no-tools">
				<div className="title">
					{ this.props.stringList.get("all-tools-no-results") }
				</div>
				<DetailsButton
					className="common-button-details-transparent clear-filters"
					allowFocus={ this.helper.isActive() }
					title={ this.props.stringList.get("all-tools-clear-filters") }
					onClick={ () => this.resetActiveFilter() }>
					{ this.props.stringList.get("all-tools-clear-filters") }
				</DetailsButton>
			</div>
		);
	},

    adjustHeadPosition: function(neverFixed = false) {
		if (!this.helper.isActive()) neverFixed = true;

		// Adjust all elements that should be glued to the page edges
		const element = this.helper.getElement().querySelector(".special-positioning-glued-parent");
		if (element) PositionUtils.positionVerticallyOnParentOrScreen(element, neverFixed, DirectionUtils.isLTR(this.props.stringList));
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

    onClickThreat: function(threatId, e) {
		const toolList = this.refs["toolList"];
		if (!toolList.isThreatVisible(threatId)) {
			toolList.expandList();
		}

		if (e) this.refs["subtitle"].refs["speech-bubble"].focus()

		this.scrollToThreat(threatId, false, e);
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
		const destinationScrollY = this.getThreatTopY(this.threatIdToScrollTo) - (this.threatIdToScrollTo ? this.scrollOffsets[this.state.breakpoint] : 0);
		const desiredScrollY = map(this.threatScrollPosition, 0, 1, this.positionToScrollFrom, destinationScrollY);
		this.helper.setScrollPosition(desiredScrollY);
	},

    getThreatTopY: function(threatId) {
		// Find the internal Y of a threat
		if (!threatId) {
			// No threat, just find the top
			const element = ReactDOM.findDOMNode(this.refs["middle"]);
			const elementRect = PositionUtils.findElementRect(element, true);
			const scrollRect = PositionUtils.findElementRect(this.helper.getElement(), true);
			return elementRect.top - scrollRect.top + this.helper.getScrollPosition();
		} else {
			// Actual threat, get top from ToolList
			const toolList = this.refs["toolList"];
			if (toolList.hasElementForThreat(threatId)) {
				const element = toolList.getElementForThreat(threatId);
				const elementRect = PositionUtils.findElementRect(element, true);
				const scrollRect = PositionUtils.findElementRect(this.helper.getElement(), true);
				return elementRect.top - scrollRect.top + this.helper.getScrollPosition();
			}
			return undefined;
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
		if (!this.hasPerformedTracking && this.toolsToUse.length > 0) {
			this.toolsToUse.forEach(tool => {
				MiniTracker.trackEvent("tool", "display-all-tools", tool.slug, 100, true);
			});

			this.hasPerformedTracking = true;
		}

		// Jumps to threat if needed
		if (travelOffset > 0 && this.props.startingThreat) {
			setTimeout(() => {
				this.scrollToThreat(this.props.startingThreat.id);
			}, 100);
		}

		this.helper.onActivate(travelOffset, viaHistoryAPI, fromOverlay);
	},

    /**
	 * Ran when the section is about to lose focus
	 */
    onDeactivate: function(travelOffset, viaHistoryAPI, toOverlay) { // eslint-disable-line no-unused-vars
		this.helper.onDeactivate(travelOffset, viaHistoryAPI);

		if (!toOverlay) {
			this.adjustHeadPosition(true);
			this.setState({
				isThreatMenuFixed: false,
			});

			// Reset filters after leaving
			setTimeout(() => { this.resetActiveFilter(); }, 520);
		}
	},

    /**
	 * Returns the color (as a number) that the locator bar should have when opaque
	 */
    getDesiredLocatorBackgroundColor: function() {
		return undefined;
	},

    // TODO: this is simply duplicated from Report... redo in a more reusable way?
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
					newState.isTransitioning = true;
					this.changeThreatInfo(alignedThreat);
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

		this.setState(newState);
	},

    getThreatById: function(id) {
		return this.props.threats.find((threat) => { return threat.id === id; });
	},

    changeThreatInfo: function(newThreat) {
		window.setTimeout(function() {
			this.lastAlignedThreatId = newThreat.id;
			this.lastAlignedLanguageId = this.props.stringList.getLanguage().id;
			this.refs["title"].setState({ text: newThreat.shortDescription });

			this.setState({
				isTransitioning: false,
				threatSubtitle: newThreat.stats,
				statsSource: newThreat.statsSource,
				statsName: newThreat.statsName,
			});
		}.bind(this), 200);
	},

    onResize: function(width, height) { // eslint-disable-line no-unused-vars
		const bp = ResizeUtils.getCurrentBreakpoint();
		if (bp !== this.state.breakpoint) {
			this.setState({
				breakpoint: ResizeUtils.getCurrentBreakpoint(),
			});
		}
	},

    onWheelStats: function(e) {
		const element = document.querySelector(".special-positioning-glued-parent");
		if (element && element.style.position == "fixed") {
			// If using the mousewheel atop the stats bubble, re-inject the scroll
			// This is super ugly, but needed because links on a position:fixed div will always steal the event
			this.helper.setScrollPosition(this.helper.getScrollPosition() + e.deltaY);
		}
	},

    getFilterCategories: function() {
		return {
			"cost": {
				title: this.props.stringList.get("all-tools-filter-cost-title"),
				filters: [
					this.props.stringList.get("all-tools-filter-any"),
					this.props.stringList.get("all-tools-filter-cost-free"),
					this.props.stringList.get("all-tools-filter-cost-paid"),
				],
			},
			"effort": {
				title: this.props.stringList.get("all-tools-filter-effort-title"),
				filters: [
					this.props.stringList.get("all-tools-filter-any"),
					...this.getToolEffortCategoryList(this.props.tools),
				],
			},
		};
	},

    getToolEffortCategoryList: function(tools) {
		return tools.map(tool => tool.label)
			.filter((v, i, a) => a.indexOf(v) === i && v.length);
	},

    resetActiveFilter: function() {
		this.updateActiveFilter({ cost: 0, effort: 0 });
	},

    updateActiveFilter: function(activeFilter) {
		this.setState({
			activeFilter: activeFilter,
			hasUpdatedFilter: !this.checkIfDefaultFilters(activeFilter),
		});

		setTimeout(() => {
			if (this.state.isThreatMenuFixed) {
				// Need to scroll
				if (this.threatsToUse.length > 0) {
					// Has threats, scroll to the first
					this.scrollToThreat(this.threatsToUse[0].id);
				} else {
					// No threats, scroll to the top of the container
					this.scrollToThreat(undefined);
				}
			}
		}, 30);
	},

    updateThreatList() {
		this.threatsToUse = this.toolsToUse.map(tool => tool.threat)
			.filter((v, i, a) => a.indexOf(v) === i)
			.sort((a, b) => {
				if (a.isAdditionalHelp) return 1;
				if (b.isAdditionalHelp) return -1;
				return 0;
			});
	},

    checkIfDefaultFilters: function(activeFilter) {
		// We need to check if filters are at the default values (0)
		const areDefaultFilters = Object.keys(activeFilter).every(key => {
			if (activeFilter.hasOwnProperty(key)) {
				return activeFilter[key] === 0;
			} else {
				return false;
			}
		});

		return areDefaultFilters;
	},
});

export default AllToolsPage;
