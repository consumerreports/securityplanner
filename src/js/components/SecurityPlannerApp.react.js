import Bowser from "bowser";
import { clamp, map } from "moremath";
import React, { Component } from "react";

import ReactDOM from 'react-dom';

import { LocationHandler, MiniNavigator } from "./../vendor/routing/MiniNavigator";
import MiniRouter from "./../vendor/routing/MiniRouter";
import Easing from "./../vendor/transitions/Easing";
import Fween from "./../vendor/transitions/Fween";
import ADAUtils from "./../vendor/utils/ADAUtils";
import DirectionUtils from "./../vendor/utils/DirectionUtils";
import SecurityPlannerConstants from "../constants/SecurityPlannerConstants";
import SecurityPlannerRoutes from "../routing/SecurityPlannerRoutes";
import SecurityPlannerStore from "../stores/SecurityPlannerStore";
import MiniTracker from "../vendor/tracking/MiniTracker";
import WindowScrollLocker from "../vendor/utils/WindowScrollLocker";
import StartOverButton from "./common/StartOverButton.react";
import DebugPanel from "./debug/DebugPanel.react";
import LoadingScreen from "./global/LoadingScreen.react";
import ToastMessages from "./global/ToastMessages.react";
import Locator from "./navigation/Locator.react";
import BioOverlay from "./overlays/bio/BioOverlay.react";
import ShareOverlay from "./overlays/share/ShareOverlay.react";
import ThreatMenuOverlay from "./overlays/threat-menu/ThreatMenuOverlay.react";
import ToolFeedbackOverlay from "./overlays/tool-feedback/ToolFeedbackOverlay.react";
import ToolOverlay from "./overlays/tool/ToolOverlay.react";
import ToolsFilterOverlay from "./overlays/tools-filter/ToolsFilterOverlay.react";
import AboutPage from "./pages/about/AboutPage.react";
import PhilosophyPage from "./pages/philosophy/PhilosophyPage.react";
import AllToolsPage from "./pages/alltools/AllToolsPage.react";
import CoverPage from "./pages/cover/CoverPage.react";
import FeedbackPage from "./pages/feedback/FeedbackPage.react";
import InterstitialPage from "./pages/interstitial/InterstitialPage.react";
import PreviewPage from "./pages/preview/PreviewPage.react";
import PrintReportPage from "./pages/printreport/PrintReportPage.react";
import ReportPage from "./pages/report/ReportPage.react";
import StatementsPage from "./pages/statements/StatementsPage.react";
import TermsPage from "./pages/terms/TermsPage.react";
import TermsPrintPage from "./pages/terms/TermsPrintPage.react";
import NoMatchPage from './pages/nomatch/NoMatchPage.react'

class SecurityPlannerApp extends Component {
	constructor(props) {
		super(props);

		this.state = this.getBuildState()

		SecurityPlannerStore.addChangeListener(this.onStoreChanged);

		// ADA Activation
		ADAUtils.init("accessibility-ada-active");

		// Navigator
		this.navigator = new MiniNavigator();
		this.navigator.onLocationChanged.add(this.onNavigatorLocationChanged);

		// Window scrolling
		this.windowScroller = new WindowScrollLocker();

		// Routes
		this.routes = new SecurityPlannerRoutes();

		// Router
		this.router = new MiniRouter();
		this.router.addTemplate(this.routes.getUriCover(), this.getUriCoverContent);
		this.router.addTemplate(this.routes.getUriStatements(), this.getUriStatementsContent);
		this.router.addTemplate(this.routes.getUriInterstitial(), this.getUriInterstitialContent);
		this.router.addTemplate(this.routes.getUriReport(), this.getUriReportContent);
		this.router.addTemplate(this.routes.getUriReportWithHash(), this.getUriReportWithHashContent);
		this.router.addTemplate(this.routes.getUriPrintReport(), this.getUriPrintReportContent);
		this.router.addTemplate(this.routes.getUriAllTools(), this.getUriAllToolsContent);
		this.router.addTemplate(this.routes.getUriAllToolsThreat(), this.getUriAllToolsContent);
		this.router.addTemplate(this.routes.getUriTerms(), this.getUriTermsContent);
		this.router.addTemplate(this.routes.getUriPrintTerms(), this.getUriTermsPrintContent);
		this.router.addTemplate(this.routes.getUriAbout(), this.getUriAboutContent);
		this.router.addTemplate(this.routes.getUriPhilosophy(), this.getUriPhilosophyContent);
		this.router.addTemplate(this.routes.getUriFeedback(), this.getUriFeedbackContent);
		this.router.addTemplate(this.routes.getUriOverlayShare(), this.getUriOverlayShareContent);
		this.router.addTemplate(this.routes.getUriOverlayTool(), this.getUriOverlayToolContent);
		this.router.addTemplate(this.routes.getUriOverlayBio(), this.getUriOverlayBioContent);
		this.router.addTemplate(this.routes.getUriOverlayToolFeedback(), this.getUriOverlayToolFeedbackContent);
		this.router.addTemplate(this.routes.getUriOverlayThreatMenu(), this.getUriOverlayThreatMenuContent);
		this.router.addTemplate(this.routes.getUriOverlayToolsFilter(), this.getUriOverlayToolsFilterContent);
		this.router.addTemplate(this.routes.getUriPreview(), this.getUriPreviewContent);
		
		// 404 Page
		this.router.addTemplate(this.routes.getUriNoMatch(), this.getUriNoMatch)

		// Create a handler to receive the section events
		this.sectionHandler = new LocationHandler();
		this.sectionHandler.onCreated.add(this.onCreatedPage);
		this.sectionHandler.onActivated.add(this.onActivatedPage);
		this.sectionHandler.onDeactivated.add(this.onDeactivatedPage);

		// Capture scrolls
		// document.addEventListener("touchmove", this.onTouchMoveScroll);
		window.addEventListener("scroll", this.onWindowScrollPreventHistoryScroll, true);
		window.addEventListener("scroll", this.onWindowScroll);
		window.addEventListener("resize", this.onWindowResize);
		if (!SecurityPlannerConstants.UI.LOCK_SCROLL) {
			window.addEventListener("wheel", this.onMouseWheel, false);
			window.addEventListener("wheel", this.onMouseWheel, true);
		}
	}
    displayName = 'SecurityPlannerApp'

    // location id
    transitioningFromLocation = undefined

    // element of previous section
    scrollingFromElement = undefined

    // 0-1 of the element's height
    scrollingFromOffset = undefined

    // location id
    transitioningToLocation = undefined

    // element of the new section
    scrollingToElement = undefined

    // 0-1 of the element's height
    scrollingToOffset = undefined

    // 0-1
    scrollPosition = undefined

    hasOpenedFirstPage = false
    desiredScrollY = undefined
    desiredScrollYPhase= undefined
    isAutoScrolling = false
	fixedComponentRefs = []
	
    // MiniRouter: decides what to show based on a uri
    router = undefined

    // SecurityPlannerRouter: generates the harcoded routes needed
    routes = undefined

    prefetchedAssets = false
    windowScroller = undefined
    waitingToCreateLocation = undefined

    componentDidMount() {
		this.componentDidUpdate();
	}

    componentDidUpdate() {
		if (!this.prefetchedAssets) this.prefetchAssets();

		this.updateNavigatorState();

		// Handles scrolling as needed
		// console.log(`LOCATION STATE should be ${this.state.location}, currently it is from ${this.transitioningToLocation}, previously ${this.transitioningFromLocation}`);
		// console.log(` .... history is ${this.navigator.locationHistory}`);
		if (this.state.location && this.state.location !== this.transitioningToLocation) {
			// The current section is not the section that we should have transitioned to, therefore start a new transition
			const lastLocationInfo = this.navigator.hasLocation(this.transitioningToLocation) && this.navigator.getLocationInfo(this.transitioningToLocation);
			const fromOverlay = lastLocationInfo && lastLocationInfo.params && lastLocationInfo.params.isOverlay;
			const toOverlay = this.navigator.currentParams && this.navigator.currentParams.isOverlay;
			// console.log(`Are overlay: ${fromOverlay} -> ${toOverlay}`);
			if ((!fromOverlay && toOverlay) || (fromOverlay && toOverlay && this.navigator.lastPositionTravelOffset > 0)) {
				// From page to overlay, or overlay to new overlay: use special transition to show
				// console.log("  ...is an overlay SHOWING with special transition!");
				this.transitionToLocationWithCustom(this.state.location, this.refs[this.state.location].startTransitionShow);
			} else if ((fromOverlay && !toOverlay) || (fromOverlay && toOverlay && this.navigator.lastPositionTravelOffset < 0)) {
				// From overlay to page, or overlay to old overlay: show special transition to hide, and always remove the overlay
				// console.log("  ...is an overlay HIDING with special transition!");
				this.clearHistoryAfterNavigation = true;
				this.transitionToLocationWithCustom(this.state.location, this.refs[this.transitioningToLocation].startTransitionHide);
			} else {
				// console.log("  ...has to scroll!");
				this.transitionToLocationWithScroll(this.state.location);
			}
		}

		this.decideFirstPage();
	}

    componentWillUnmount() {
		SecurityPlannerStore.removeChangeListener(this.onStoreChanged);
	}

    decideFirstPage = () => {
		// Decides the first page that should open when the app starts
		if (this.state.isDataLoaded && !this.hasOpenedFirstPage) {
			// Get the current location, so we can redirect return visits to certain routes
			// TODO: if we use beauty URLs rather than hashes, this needs to be updated
			const currentLocation = window.location.hash ? window.location.hash.substr(1) : undefined;

			// Try to handle the incoming location using the custom location
			const sectionObject = currentLocation && this.router.handle(currentLocation);
			if (sectionObject && sectionObject.allowAtStart) {
				if (sectionObject.injectAtStart && sectionObject.injectAtStart.length > 0) {
					// Must inject URLs too
					// This is a bit awkward since we just fire all navigations. But it works well.
					sectionObject.injectAtStart.forEach(uri => {
						this.goToPage(uri);
					});
				}
				this.goToPage(currentLocation);
			} else if (window.location.pathname.length > 1 && !window.location.hash || currentLocation === "/404"){
				// Remove unrecognized URL parameters
				window.history.replaceState({}, document.title, "/");
				// Go to 404 Page
				this.goToPage(this.routes.getUriNoMatch());
			} else {
				// Normal start, go to the cover
				this.goToPage(this.routes.getUriCover());
			}
		}
	}

    render() {
		if (this.state.isDataLoaded) {
			this.fixedComponentRefs = [];

			// Create all pages
			const components = [];

			// Render everything currently listed in the locator

			if (this.navigator) {
				this.navigator.locations.forEach(location => {
					const sectionObjectParams = location.params;
					if (sectionObjectParams.render) {
						components.push(sectionObjectParams.render.bind(this)(sectionObjectParams.componentParams));
						this.fixedComponentRefs.push(location.id);
					}
				});
			}

			// console.log("RENDER, page components = ", components);

			// Start over button
			components.push(
				<StartOverButton
					ref="startOver"
					key="startOver"
					stringList={ this.state.stringList }
					onClick={ this.startOver }
					className={ DirectionUtils.getClass(this.state.stringList) }/>
			);

			// Locator
			components.push(
				<Locator key="locator"
					ref="locator"
					stringList={ this.state.stringList }
					onClickLocation={ this.onClickLocatorLocation }/>
			);

			// Toast messages
			components.push(
				<ToastMessages
					key="toasts"
					ref="toasts"
					stringList={ this.state.stringList }
					toasts={ this.state.toasts }/>
			);

			// Debugging views
			if (SecurityPlannerConstants.Parameters.IS_DEBUGGING) {
				components.push(
					<DebugPanel key="debug"
								statements={ this.state.statements }
								tools={ this.state.tools }
								levels={ this.state.levels }
								threats={ this.state.threats }
								recommendedThreats={ this.state.recommendedThreats }
								topRecommendedTool={ this.state.topRecommendedTool }
								recommendedTools={ this.state.recommendedTools }/>
				);
			}

			return (
				<div>
					{components}
				</div>
			);
		} else {
			return (
				<LoadingScreen/>
			);
		}
	}

    // URI flow
    getUriAfterStatements = (levelIndex) => {
		if (this.state.levels[levelIndex].recommendationsNeeded > 0) {
			// Level should have interstitial results next
			return this.routes.getUriInterstitial(levelIndex);
		} else {
			// Level should skip to the next statements page, or maybe the final report
			return this.getUriAfterInterstitial(levelIndex);
		}
	}

    getUriAfterInterstitial = (levelIndex) => {
		if (levelIndex < this.state.levels.length - 1) {
			// Should be followed by another statement page
			return this.routes.getUriStatements(levelIndex + 1);
		} else {
			// Should go to the report
			return this.routes.getUriReportWithHash(SecurityPlannerStore.saveState());
		}
	}

    // URI creators
    getUriCoverContent = (componentParams) => {
		return {
			handler: this.sectionHandler,
			display: false,
			title: undefined,
			browserTitle: this.state.stringList.get("cover-browser-title"),
			allowAtStart: false,
			injectAtStart: undefined,
			prepare: undefined,
			params: {
				isOverlay: false,
				isLocatorVisible: false,
				showStartOverButton: false,
				hideStartOverButtonIfClear: false,
				colorClass: undefined,
				level: undefined,
				componentParams: componentParams,
				render: function() {
					return (
						<CoverPage ref={ this.routes.getUriCover() }
							key={ this.routes.getUriCover() }
							metadata={ this.state.metadata }
							stringList={ this.state.stringList }
							availableLanguages={ this.state.availableLanguages }
							selectedLanguage={ this.state.selectedLanguage }
							routes={ this.routes }
							goToPage={ this.goToPage }
							onClickNext={ () => this.goToPage(this.routes.getUriStatements(0), true, true) }/>
					);
				},
			},
		};
	}

    getUriStatementsContent = (componentParams) => {
		return {
			handler: this.sectionHandler,
			display: true,
			title: this.state.stringList.get("statements-title").replace("[[title]]", this.state.levels[componentParams.id - 1].title),
			browserTitle: this.state.stringList.get("statements-browser-title").replace("[[index]]", componentParams.id),
			allowAtStart: false,
			injectAtStart: undefined,
			prepare: undefined,
			params: {
				isOverlay: false,
				isLocatorVisible: true,
				showStartOverButton: true,
				hideStartOverButtonIfClear: true,
				colorClass: "color-dark",
				level: this.state.levels[componentParams.id - 1],
				componentParams: componentParams,
				render: function(componentParams) {
					const level = this.state.levels[componentParams.id - 1];
					const levelIndex = this.state.levels.indexOf(level);
					return (
						<StatementsPage ref={ this.routes.getUriStatements(levelIndex) }
										key={ this.routes.getUriStatements(levelIndex) }
										stringList={ this.state.stringList }
										onClickNext={ () => this.goToPage(this.getUriAfterStatements(levelIndex), false, true) }
										level={ level }
										navigator={ this.navigator }
										isLastStatementPage={ levelIndex === this.state.levels.length - 1 }/>
					);
				},
			},
		};
	}

    getUriInterstitialContent = (componentParams) => {
		return {
			handler: this.sectionHandler,
			display: false,
			title: this.state.stringList.get("interstitial-title"),
			browserTitle: undefined,
			allowAtStart: false,
			injectAtStart: undefined,
			prepare: undefined,
			params: {
				isOverlay: false,
				isLocatorVisible: true,
				showStartOverButton: true,
				hideStartOverButtonIfClear: false,
				colorClass: "color-light",
				level: this.state.levels[componentParams.id - 1],
				componentParams: componentParams,
				render: function(componentParams) {
					const level = this.state.levels[componentParams.id - 1];
					const levelIndex = this.state.levels.indexOf(level);
					return (
						<InterstitialPage ref={ this.routes.getUriInterstitial(levelIndex) }
							key={ this.routes.getUriInterstitial(levelIndex) }
							stringList={ this.state.stringList }
							routes={ this.routes }
							goToPage={ this.goToPage }
							onClickNext={ () => this.goToPage(this.getUriAfterInterstitial(levelIndex), false, true) }
							tools={ this.state.recommendedTools }
							navigator={ this.navigator }
							level={ level }/>
					);
				},
			},
		};
	}

    getUriReportContent = (componentParams) => {
		return this.getUriReportMixedContent(
			componentParams,
			this.routes.getUriReport(),
			undefined,
			false
		);
	}

    getUriReportWithHashContent = (componentParams) => {
		return this.getUriReportMixedContent(
			componentParams,
			this.routes.getUriReportWithHash(componentParams.hash),
			componentParams.hash,
			this.navigator.locations.length == 0
		);
	}

    getUriReportMixedContent = (componentParams, url, hash, isFromSharing) => {
		return {
			handler: this.sectionHandler,
			display: !isFromSharing,
			title: this.state.stringList.get("action-plan-title"),
			browserTitle: this.state.stringList.get(isFromSharing ? "action-plan-shared-browser-title" : "action-plan-browser-title"),
			allowAtStart: isFromSharing,
			injectAtStart: undefined,
			prepare: function() {
				if (isFromSharing) {
					SecurityPlannerStore.loadState(hash);
				}
			},
			params: {
				isOverlay: false,
				isLocatorVisible: true,
				showStartOverButton: !isFromSharing,
				hideStartOverButtonIfClear: false,
				colorClass: "section-action-plan",
				level: undefined,
				componentParams: componentParams,
				render: function() {
					return (
						<ReportPage
							ref={ url }
							key={ url }
							stringList={ this.state.stringList }
							navigator={ this.navigator }
							routes={ this.routes }
							goToPage={ this.goToPage }
							onClickToStart={ this.startFromReport }
							topTool={ this.state.topRecommendedTool }
							tools={ this.state.recommendedTools }
							threats={ this.state.recommendedThreats }
							isFromSharing={ isFromSharing }
							availableLanguages={ this.state.availableLanguages }
							selectedLanguage={ this.state.selectedLanguage }/>
					);
				},
			},
		};
	}

    getUriPrintReportContent = (componentParams) => {
		return {
			handler: this.sectionHandler,
			display: false,
			title: this.state.stringList.get("action-plan-title"),
			browserTitle: this.state.stringList.get("action-plan-browser-title"),
			allowAtStart: true,
			injectAtStart: [],
			prepare: function() {
				SecurityPlannerStore.loadState(componentParams.hash);
			},
			params: {
				isOverlay: false,
				isLocatorVisible: false,
				showStartOverButton: false,
				hideStartOverButtonIfClear: false,
				colorClass: "section-action-plan",
				level: undefined,
				componentParams: componentParams,
				render: function(componentParams) {
					return (
						<PrintReportPage
							ref={ this.routes.getUriPrintReport(componentParams.hash) }
							key={ this.routes.getUriPrintReport(componentParams.hash) }
							stringList={ this.state.stringList }
							routes={ this.routes }
							goToPage={ this.goToPage }
							navigator={ this.navigator }
							topTool={ this.state.topRecommendedTool }
							tools={ this.state.recommendedTools }
							threats={ this.state.recommendedThreats }
							isFromSharing={ Boolean(componentParams.hash) }
							availableLanguages={ this.state.availableLanguages }
							selectedLanguage={ this.state.selectedLanguage }/>
					);
				},
			},
		};
	}

    getUriAllToolsContent = (componentParams) => {
		return {
			handler: this.sectionHandler,
			display: false,
			title: undefined,
			browserTitle: this.state.stringList.get("all-tools-browser-title"),
			allowAtStart: true,
			injectAtStart: [],
			prepare: undefined,
			params: {
				isOverlay: false,
				isLocatorVisible: false,
				showStartOverButton: false,
				hideStartOverButtonIfClear: false,
				colorClass: "color-dark",
				level: undefined,
				componentParams: componentParams,
				render: function() {
					const startingThreat = componentParams.threatSlug ? this.state.threats.find(threat => threat.slug == componentParams.threatSlug) : undefined;
					return (
						<AllToolsPage
							ref={ startingThreat ? this.routes.getUriAllToolsThreat(componentParams.threatSlug) : this.routes.getUriAllTools() }
							key={ startingThreat ? this.routes.getUriAllToolsThreat(componentParams.threatSlug) : this.routes.getUriAllTools() }
							routes={ this.routes }
							goToPage={ this.goToPage }
							startingThreat={ startingThreat }
							availableLanguages={ this.state.availableLanguages }
							selectedLanguage={ this.state.selectedLanguage }
							stringList={ this.state.stringList }
							threats={ this.state.threats }
							tools={ this.state.tools }/>
					);
				},
			},
		};
	}

    getUriAboutContent = (componentParams) => {
		return {
			handler: this.sectionHandler,
			display: false,
			title: undefined,
			browserTitle: this.state.stringList.get("about-us-browser-title"),
			allowAtStart: true,
			injectAtStart: [],
			prepare: undefined,
			params: {
				isOverlay: false,
				isLocatorVisible: false,
				showStartOverButton: false,
				hideStartOverButtonIfClear: false,
				colorClass: "color-dark",
				level: undefined,
				componentParams: componentParams,
				render: function() {
					return (
						<AboutPage ref={ this.routes.getUriAbout() }
							bios={ this.state.bios }
							key={ this.routes.getUriAbout() }
							stringList={ this.state.stringList }
							routes={ this.routes }
							goToPage={ this.goToPage }
							checkPage={ this.checkPage }
							availableLanguages={ this.state.availableLanguages }
							selectedLanguage={ this.state.selectedLanguage }/>
					);
				},
			},
		};
	}

    getUriPhilosophyContent = (componentParams) => {
		return {
			handler: this.sectionHandler,
			display: false,
			title: undefined,
			browserTitle: this.state.stringList.get("philosophy-browser-title"),
			allowAtStart: true,
			injectAtStart: [],
			prepare: undefined,
			params: {
				isOverlay: false,
				isLocatorVisible: false,
				showStartOverButton: false,
				hideStartOverButtonIfClear: false,
				colorClass: "color-dark",
				level: undefined,
				componentParams: componentParams,
				render: function() {
					return (
						<PhilosophyPage ref={ this.routes.getUriPhilosophy() }
							key={ this.routes.getUriPhilosophy() }
							stringList={ this.state.stringList }
							routes={ this.routes }
							goToPage={ this.goToPage }
							checkPage={ this.checkPage }
							availableLanguages={ this.state.availableLanguages }
							selectedLanguage={ this.state.selectedLanguage }/>
					);
				},
			},
		};
	}

    getUriTermsContent = (componentParams) => {
		return {
			handler: this.sectionHandler,
			display: false,
			title: undefined,
			browserTitle: this.state.stringList.get("terms-browser-title"),
			allowAtStart: true,
			injectAtStart: [],
			params: {
				isOverlay: false,
				isLocatorVisible: false,
				showStartOverButton: false,
				hideStartOverButtonIfClear: false,
				colorClass: "color-dark",
				level: undefined,
				componentParams: componentParams,
				render: function() {
					return (
						<TermsPage ref={ this.routes.getUriTerms() }
							key={ this.routes.getUriTerms() }
							stringList={ this.state.stringList }
							routes={ this.routes }
							goToPage={ this.goToPage }
														checkPage={ this.checkPage }
							availableLanguages={ this.state.availableLanguages }
							selectedLanguage={ this.state.selectedLanguage }/>
					);
				},
			},
		};
	}

    getUriTermsPrintContent = (componentParams) => {
		return {
			handler: this.sectionHandler,
			display: false,
			title: this.state.stringList.get("terms-browser-title"),
			browserTitle: this.state.stringList.get("terms-browser-title"),
			allowAtStart: true,
			injectAtStart: [],
			params: {
				isOverlay: false,
				isLocatorVisible: false,
				showStartOverButton: false,
				hideStartOverButtonIfClear: false,
				colorClass: "section-action-plan",
				level: undefined,
				componentParams: componentParams,
				render: function() {
					return (
						<TermsPrintPage ref={ this.routes.getUriTerms() }
						key={ this.routes.getUriTerms() }
						stringList={ this.state.stringList }
						routes={ this.routes }
						goToPage={ this.goToPage }
						availableLanguages={ this.state.availableLanguages }
						selectedLanguage={ this.state.selectedLanguage }/>
					);
				},
			},
		};
	}

    getUriFeedbackContent = (componentParams) => {
		return {
			handler: this.sectionHandler,
			display: false,
			title: undefined,
			browserTitle: this.state.stringList.get("feedback-general-browser-title"),
			allowAtStart: true,
			injectAtStart: undefined,
			prepare: undefined,
			params: {
				isOverlay: false,
				isLocatorVisible: false,
				showStartOverButton: false,
				hideStartOverButtonIfClear: false,
				colorClass: "color-dark",
				level: undefined,
				componentParams: componentParams,
				render: function() {
					return (
						<FeedbackPage ref={ this.routes.getUriFeedback() }
							key={ this.routes.getUriFeedback() }
							stringList={ this.state.stringList }
							routes={ this.routes }
							goToPage={ this.goToPage }
							onClickClose={ () => this.goBack(true) }
							availableLanguages={ this.state.availableLanguages }
							selectedLanguage={ this.state.selectedLanguage }/>
					);
				},
			},
		};
	}

    getUriOverlayShareContent = (componentParams) => {
		return {
			handler: this.sectionHandler,
			display: false,
			title: undefined,
			browserTitle: this.state.stringList.get("overlay-share-browser-title"),
			allowAtStart: false,
			injectAtStart: undefined,
			params: {
				isOverlay: true,
				isLocatorVisible: undefined,
				showStartOverButton: undefined,
				hideStartOverButtonIfClear: undefined,
				colorClass: undefined,
				level: undefined,
				componentParams: componentParams,
				render: function() {
					return (
						<ShareOverlay
							key={ this.routes.getUriOverlayShare() }
							ref={ this.routes.getUriOverlayShare() }
							scrollPosition={ this.windowScroller.getScrollY() }
							stringList={ this.state.stringList }
							onClickClose={ () => this.goBack(true) }/>
					);
				},
			},
		};
	}

    getUriOverlayToolContent = (componentParams) => {
		const tool = this.state.tools.find(tool => tool.slug == componentParams.toolSlug);
		return {
			handler: this.sectionHandler,
			display: false,
			title: undefined,
			browserTitle: this.state.stringList.get("overlay-tool-browser-title").replace("[[name]]", tool ? tool.name : "?"),
			allowAtStart: true,
			injectAtStart: [ this.routes.getUriAllTools() ],
			prepare: undefined,
			params: {
				isOverlay: true,
				isLocatorVisible: undefined,
				showStartOverButton: undefined,
				hideStartOverButtonIfClear: undefined,
				colorClass: undefined,
				level: undefined,
				componentParams: componentParams,
				render: function() {
					return (
						<ToolOverlay
							key={ this.routes.getUriOverlayTool(componentParams.toolSlug) }
							ref={ this.routes.getUriOverlayTool(componentParams.toolSlug) }
							stringList={ this.state.stringList }
							routes={ this.routes }
							goToPage={ this.goToPage }
							tool={ tool }
							scrollPosition={ this.windowScroller.getScrollY() }
							onClickClose={ () => this.goBack(true) }/>
					);
				},
			},
		};
	}

    getUriOverlayBioContent = (componentParams) => {
		const bio = this.state.bios.find(bio => bio.slug === componentParams.bioSlug);
		return {
			handler: this.sectionHandler,
			display: false,
			title: undefined,
			browserTitle: this.state.stringList.get("overlay-bio-browser-title").replace("[[name]]", bio ? bio.name : "?"),
			allowAtStart: false,
			injectAtStart: undefined,
			prepare: undefined,
			params: {
				isOverlay: true,
				isLocatorVisible: undefined,
				showStartOverButton: undefined,
				hideStartOverButtonIfClear: undefined,
				colorClass: undefined,
				level: undefined,
				componentParams: componentParams,
				render: function() {
					return (
						<BioOverlay
							key={ this.routes.getUriOverlayBio(componentParams.bioSlug) }
							ref={ this.routes.getUriOverlayBio(componentParams.bioSlug) }
							bio={ bio }
							scrollPosition={ this.windowScroller.getScrollY() }
							stringList={ this.state.stringList }
							onClickClose={ () => this.goBack(true) }/>
					);
				},
			},
		};
	}

    getUriOverlayToolFeedbackContent = (componentParams) => {
		const tool = this.state.tools.find(tool => tool.slug == componentParams.toolSlug);
		return {
			handler: this.sectionHandler,
			display: false,
			title: undefined,
			browserTitle: this.state.stringList.get("overlay-toolfeedback-browser-title").replace("[[name]]", tool ? tool.name : "?"),
			allowAtStart: false,
			injectAtStart: undefined,
			prepare: undefined,
			params: {
				isOverlay: true,
				isLocatorVisible: undefined,
				showStartOverButton: undefined,
				hideStartOverButtonIfClear: undefined,
				colorClass: undefined,
				level: undefined,
				componentParams: componentParams,
				render: function() {
					return (
						<ToolFeedbackOverlay
							key={ this.routes.getUriOverlayToolFeedback(componentParams.toolSlug) }
							ref={ this.routes.getUriOverlayToolFeedback(componentParams.toolSlug) }
							stringList={ this.state.stringList }
							routes={ this.routes }
							goToPage={ this.goToPage }
							scrollPosition={ this.windowScroller.getScrollY() }
							tool={ tool }
							onClickClose={ () => this.goBack(true) }/>
					);
				},
			},
		};
	}

    getUriOverlayThreatMenuContent = (componentParams) => {
		return {
			handler: this.sectionHandler,
			display: false,
			title: undefined,
			browserTitle: this.state.stringList.get("overlay-threatmenu-browser-title"),
			allowAtStart: false,
			injectAtStart: undefined,
			prepare: undefined,
			params: {
				isOverlay: true,
				isLocatorVisible: undefined,
				showStartOverButton: undefined,
				hideStartOverButtonIfClear: undefined,
				colorClass: undefined,
				level: undefined,
				componentParams: componentParams,
				render: function() {
					return (
						<ThreatMenuOverlay
							key={ this.routes.getUriOverlayThreatMenu(componentParams.transportId) }
							ref={ this.routes.getUriOverlayThreatMenu(componentParams.transportId) }
							stringList={ this.state.stringList }
							scrollPosition={ this.windowScroller.getScrollY() }
							transportId={ componentParams.transportId }
							onClickClose={ () => this.goBack(true) }/>
					);
				},
			},
		};
	}

    getUriOverlayToolsFilterContent = (componentParams) => {
		return {
			handler: this.sectionHandler,
			display: false,
			title: undefined,
			browserTitle: this.state.stringList.get("overlay-toolsfilter-browser-title"),
			allowAtStart: false,
			injectAtStart: undefined,
			prepare: undefined,
			params: {
				isOverlay: true,
				isLocatorVisible: undefined,
				showStartOverButton: undefined,
				hideStartOverButtonIfClear: undefined,
				colorClass: undefined,
				level: undefined,
				componentParams: componentParams,
				render: function() {
					return (
						<ToolsFilterOverlay
							key={ this.routes.getUriOverlayToolsFilter(componentParams.transportId) }
							ref={ this.routes.getUriOverlayToolsFilter(componentParams.transportId) }
							stringList={ this.state.stringList }
							scrollPosition={ this.windowScroller.getScrollY() }
							transportId={ componentParams.transportId }
							onClickClose={ () => this.goBack(true) }/>
					);
				},
			},
		};
	}

    getUriPreviewContent = (componentParams) => {
		return {
			handler: this.sectionHandler,
			display: false,
			title: undefined,
			browserTitle: "Preview",
			allowAtStart: true,
			injectAtStart: [],
			prepare: undefined,
			params: {
				isOverlay: false,
				isLocatorVisible: false,
				showStartOverButton: false,
				hideStartOverButtonIfClear: false,
				colorClass: undefined,
				level: undefined,
				componentParams: componentParams,
				render: function() {
					const rest = componentParams.rest;
					return (
						<PreviewPage
							key={ this.routes.getUriPreview(rest) }
							ref={ this.routes.getUriPreview(rest) }
							stringList={ this.state.stringList }
							availableLanguages={ this.state.availableLanguages }
							selectedLanguage={ this.state.selectedLanguage }
							routes={ this.routes }
							goToPage={ this.goToPage }
							path={ rest }
							bios={ this.state.bios }
							statements={ this.state.statements }
							tools={ this.state.tools }
							levels={ this.state.levels }
							threats={ this.state.threats }
							topRecommendedTool={ this.state.topRecommendedTool }
							recommendedTools={ this.state.recommendedTools }
							recommendedThreats={ this.state.recommendedThreats }/>
					);
				},
			},
		};
	}

	getUriNoMatch = (componentParams) => {
		return {
			handler: this.sectionHandler,
			display: false,
			title: undefined,
			browserTitle: this.state.stringList.get("cover-browser-title"),
			allowAtStart: false,
			injectAtStart: undefined,
			prepare: undefined,
			params: {
				isOverlay: false,
				isLocatorVisible: false,
				showStartOverButton: false,
				hideStartOverButtonIfClear: false,
				colorClass: undefined,
				level: undefined,
				componentParams: componentParams,
				render: function() {
					return (
						<NoMatchPage ref={ this.routes.getUriNoMatch() }
							key={ this.routes.getUriNoMatch() }
							metadata={ this.state.metadata }
							stringList={ this.state.stringList }
							availableLanguages={ this.state.availableLanguages }
							selectedLanguage={ this.state.selectedLanguage }
							routes={ this.routes }
							goToPage={ this.goToPage }
							onClickNext={ () => {
								// Clears and goes to the cover
								MiniTracker.trackEvent("button", "click", "start-over");
								this.goToPage(this.routes.getUriCover(), false, true);
							} }/>
					);
				},
			},
		};
	}

    goBack = (removeHistoryAfter = false) => {
		// console.log("attempting to go back, remove = ", removeHistoryAfter);
		this.clearHistoryAfterNavigation = removeHistoryAfter;
		this.navigator.goBack();
	}

    goToDisplayedStep = (index) => {
		// Goes to a page that is a "displayed" step of index
		const uri = this.navigator.getDisplayedLocationAt(index);
		this.goToPage(uri);
	}

    goToPage = (uri, removeHistory = false, treatAsExplicit = false) => {
		if (uri === this.state.location) {
			return;
		}

		if (!this.hasOpenedFirstPage) {
			this.hasOpenedFirstPage = true;
		}

		if (removeHistory) {
			this.navigator.removeLocationsAfterCurrent();
		}

		if (this.navigator.hasLocation(uri)) {
			this.navigator.goToLocation(uri, treatAsExplicit);
		} else {
			const sectionObject = this.router.handle(uri);
			if (!sectionObject) {
				console.error(`Error: could not find handler for route [${uri}].`); // eslint-disable-line
			} else if (sectionObject.prepare) {
				sectionObject.prepare.bind(this)();
			}
			this.navigator.addLocation(uri, sectionObject.handler, sectionObject.display, sectionObject.title, sectionObject.browserTitle, sectionObject.params);
			this.navigator.goToLocation(uri);
		}
	}

    checkPage = (uri, removeHistory = false, treatAsExplicit = false) => {
		if (uri === this.state.location) {
			return;
		}

		if (!this.hasOpenedFirstPage) {
			this.hasOpenedFirstPage = true;
		}

		if (removeHistory) {
			this.navigator.removeLocationsAfterCurrent();
		}

		if (this.navigator.hasLocation(uri)) {
			return true;
		} else {
			const sectionObject = this.router.handle(uri);
			if (sectionObject.prepare) {
				sectionObject.prepare.bind(this)();
			}
			return true;
		}
	}

    getBuildState = function() {
		return {
			isDataLoaded: SecurityPlannerStore.hasContent(),
			anyStatementSelected: SecurityPlannerStore.isAnyStatementSelected(),
			availableLanguages: SecurityPlannerStore.getAvailableLanguages(),
			selectedLanguage: SecurityPlannerStore.getSelectedLanguage(),
			metadata: SecurityPlannerStore.getMetadata(),
			stringList: SecurityPlannerStore.getStringList(),
			bios: SecurityPlannerStore.getBios(),
			levels: SecurityPlannerStore.getLevels(),
			location: (this.navigator ? this.navigator.currentLocationId : undefined),
			recommendedThreats: SecurityPlannerStore.getRecommendedThreats(),
			topRecommendedTool: SecurityPlannerStore.getTopRecommendedTool(),
			recommendedTools: SecurityPlannerStore.getRecommendedTools(),
			statements: SecurityPlannerStore.getStatements(),
			threats: SecurityPlannerStore.getThreats(),
			tools: SecurityPlannerStore.getTools(),
			toasts: SecurityPlannerStore.getToasts(),
		};
	}

    updateBuiltState = () => {
		// Update the internal state with a new state built from several different data sources
		this.setState(this.getBuildState());
	}

    prefetchAssets = () => {
		// Prefetches all assets that are likely to be used frequently
		// This helps make the transition to new pages smoother since we won't have a lot to load upfront
		if (this.state.isDataLoaded) {
			// Do it a bit later, to give time for other assets to be queued, layout to be composed, etc
			setTimeout(() => {
				this.state.tools.forEach(tool => {
					if (tool.image) {
						const img = new Image();
						img.src = tool.image;
					}
				});

				this.state.statements.forEach(statement => {
					if (statement.image) {
						const img = new Image();
						img.src = statement.image;
					}
				});
			}, 500);
			this.prefetchedAssets = true;
		}
	}

    startOver = () => {
		// Clears and goes to the cover
		MiniTracker.trackEvent("button", "click", "start-over");
		this.goToPage(this.routes.getUriCover(), false, true);
	}

    startFromReport = () => {
		// location.href = this.state.stringList.get("common-url-home");
		this.goToPage(this.routes.getUriCover(), false, true);
	}

    onStoreChanged = () => {
		this.updateBuiltState();
	}

    onNavigatorLocationChanged = (locationId, locationParams, oldLocationId, oldLocationParams) => { // eslint-disable-line
		// console.log("===> Navigator location changed, id = [" + locationId + "], params =", params, ", position: " + this.navigator.position + " of " + this.navigator.locations.length + "");
		// console.log(`(!) Navigator location changed, id = [${locationId}], position ${this.navigator.position} / ${this.navigator.locations.length}; history = ${this.navigator.locationHistory}`);
		
		// Replace pages we shouldn't track with an anonymized equivalent
		SecurityPlannerConstants.PRIVATE_LOCATION_PATTERNS.map(function(privateLocationPattern) {
			if (locationId.match(privateLocationPattern[0])) {
				locationId = privateLocationPattern[1];
			}
		});
		MiniTracker.trackPage(locationId);

		// Update browser data
		const sectionName = this.navigator.currentBrowserTitle;
		let pageName = "";
		if (sectionName && sectionName.trim()) {
			// Has a name
			pageName = this.state.stringList.get("browser-title-subsection").replace("[[section]]", sectionName);
		} else {
			// No name, use default
			pageName = this.state.stringList.get("browser-title-empty");
		}
		document.title = pageName;

		this.updateBuiltState();
	}

    updateNavigatorState = () => {
		// if (this.isMounted()) {
			// Update start over button
			// Hide or show start over button

			// This is not entirely correct - transitioningFromLocation and transitioningToLocation sometimes lag behind
			const lastLocationInfo = this.navigator.hasLocation(this.transitioningToLocation) && this.navigator.getLocationInfo(this.transitioningToLocation);
			const fromOverlay = lastLocationInfo && lastLocationInfo.params && lastLocationInfo.params.isOverlay;

			const currentRef = this.scrollPosition < 0.5 || fromOverlay ? this.transitioningFromLocation : this.transitioningToLocation;
			const currentRefScroll = !!currentRef && !!this.refs[currentRef] && !!this.refs[currentRef].getScrollPosition ? this.refs[currentRef].getScrollPosition() : 0;
			const currentRefLocatorBackgroundColor = !!currentRef && !!this.refs[currentRef] && !!this.refs[currentRef].getDesiredLocatorBackgroundColor ? this.refs[currentRef].getDesiredLocatorBackgroundColor() : undefined;
			const currentLocationParams = (this.navigator.getLocationInfo(currentRef) || { params:{} }).params; // this.navigator.currentParams

			if (!!this.refs[currentRef] && !!this.refs[currentRef].adjustHeadPosition) {
				this.refs[currentRef].adjustHeadPosition();
			}

			if (this.refs["startOver"]) {
				this.refs["startOver"].setStateParameters(
					this.navigator.hasLocation(this.routes.getUriCover()) && currentLocationParams.showStartOverButton && (!this.state.hideStartOverButtonIfClear || this.state.anyStatementSelected),
					currentLocationParams.colorClass,
					currentRefScroll != 0,
					currentRefScroll,
					currentRefLocatorBackgroundColor,
					currentLocationParams.colorClass
				);
			}

			// Update locator
			if (this.refs["locator"]) {
				// Find the internal scroll position of the current page on focus
				this.refs["locator"].setStateParameters(
					currentLocationParams.isLocatorVisible,
					this.navigator.displayedLocations.length,
					this.state.levels.length + 1,
					this.navigator.displayedPosition,
					this.navigator.furthestDisplayedPosition,
					this.navigator.currentTitle,
					currentLocationParams.colorClass,
					(this.scrollPosition != 0 && this.scrollPosition != 1),
					currentRefScroll != 0,
					currentRefScroll,
					currentRefLocatorBackgroundColor
				);
			}
		// }
	}

    onClickLocatorLocation = (index) => {
		this.goToDisplayedStep(index);
	}

    onCreatedPage = (locationId) => {
		// Add events to a section when it is created
		// Will update later, because it depends on the component actually existing
		this.waitingPageComponentCreation = locationId;
		this.onCreatedPageDelayed();
	}

    onCreatedPageDelayed = () => {
		if (this.waitingPageComponentCreation && !!this.refs[this.waitingPageComponentCreation]) {
			if (this.refs[this.waitingPageComponentCreation].onPageScrolled) {
				this.refs[this.waitingPageComponentCreation].onPageScrolled.add(this.onCurrentPageScrolled);
			}

			this.waitingPageComponentCreation = undefined;
		}

		if (this.waitingPageComponentCreation) window.requestAnimationFrame(this.onCreatedPageDelayed);
	}

    onActivatedPage = (locationId, locationParams, prevLocationId, prevLocationParams) => {
		// Update the section when it is activated
		// Will update later, because it depends on the component actually existing
		this.onActivatedPageDelayed(locationId, locationParams, prevLocationId, prevLocationParams);
	}

    onActivatedPageDelayed = (locationId, locationParams, prevLocationId, prevLocationParams) => {
		if (this.refs[locationId]) {
			this.refs[locationId].onActivate(this.navigator.lastPositionTravelOffset, this.navigator.lastPositionTravelType === MiniNavigator.TRAVEL_TYPE_BROWSER_HISTORY_API, prevLocationParams && prevLocationParams.isOverlay);
		} else {
			window.requestAnimationFrame(() => { this.onActivatedPageDelayed(locationId, locationParams, prevLocationId, prevLocationParams); });
		}
	}

    onDeactivatedPage = (locationId, locationParams, newLocationId, newLocationParams) => {
		// Update the section when it is deactivated
		if (this.refs[locationId]) {
			this.refs[locationId].onDeactivate(this.navigator.lastPositionTravelOffset, this.navigator.lastPositionTravelType === MiniNavigator.TRAVEL_TYPE_BROWSER_HISTORY_API, newLocationParams && newLocationParams.isOverlay);
		}
	}

    transitionToLocationWithScroll = (ref, canScrollToNearestEdge = false) => {
		// Scrolls to a component's DOM container
		const element = this.getElementFromLocationId(ref);
		const wy = this.windowScroller.getScrollY();

		// console.log("scrolling to [" + ref + "], element will be " + element);

		if (element != null) {
			this.transitioningFromLocation = this.transitioningToLocation;
			this.transitioningToLocation = ref;

			this.scrollingFromElement = this.getElementFromLocationId(this.transitioningFromLocation);
			this.scrollingFromOffset = 0;

			this.scrollingToElement = element;
			this.scrollingToOffset = 0;

			if (this.scrollingFromElement) {
				// Normal scroll
				this.scrollingFromOffset = (wy - this.scrollingFromElement.offsetTop) / this.scrollingFromElement.offsetHeight;

				if (canScrollToNearestEdge && this.scrollingFromElement.offsetTop > this.scrollingToElement.offsetTop) {
					// Don't necessarily scroll to the top of the section: instead, focus on the closest edge (e.g. bottom of report)
					this.scrollingToOffset = (this.scrollingToElement.offsetHeight - window.innerHeight) / this.scrollingToElement.offsetHeight;
				}

				if (element.offsetTop != wy) {
					// Need to scroll
					this.isAutoScrolling = true;
					this.setScrollPosition(0);
					this.windowScroller.unlock();
					Fween.use(this.getScrollPosition, this.setScrollPosition).from(0).to(1, 0.5, Easing.expoInOut).call(this.onTransitionScrollEnded).play();
				}
			} else {
				// No previous section exist, assume the new location is the first one
				this.setScrollPosition(1);
			}
		}
	}

    onTransitionScrollEnded = () => {
		this.isAutoScrolling = false;
		this.lockScrollOnCurrentElement();
		this.onLocationTransitionEnded();
	}

    transitionToLocationWithCustom = (ref, transitionFunc) => {
		this.transitioningFromLocation = this.transitioningToLocation;
		this.transitioningToLocation = ref;
		transitionFunc(() => {
			this.onLocationTransitionEnded();
		});
	}

    onLocationTransitionEnded = () => {
		// console.log("ENDED TRANSITION");
		if (this.clearHistoryAfterNavigation) {
			this.clearHistoryAfterNavigation = false;
			this.navigator.removeLocationsAfterCurrent();
			requestAnimationFrame(() => { this.forceUpdate(); });
		}
	}

    lockScrollOnCurrentElement = () => {
		if (SecurityPlannerConstants.UI.LOCK_SCROLL) {
			this.windowScroller.unlock();
			this.updateScrollPosition();
			this.windowScroller.forciblyUpdateScrollY();
			const centerElement = this.getCenterElement();
			if (centerElement) this.windowScroller.lock(centerElement.offsetTop);
			window.requestAnimationFrame(() => {
				// Lock once again, because sometimes it depends on the order of execution
				if (centerElement) this.windowScroller.lock(centerElement.offsetTop);
			});
		} else {
			this.updateScrollPosition();
		}
	}

    getScrollPosition = () => {
		return this.scrollPosition;
	}

    setScrollPosition = (value) => {
		this.scrollPosition = value;
		this.updateScrollPosition();
	}

    updateScrollPosition = () => {
		if (this.scrollingFromElement) {
			const pointTo = this.scrollingToElement.offsetTop + Math.round(this.scrollingToElement.offsetHeight * this.scrollingToOffset);
			if (this.scrollPosition != 1) {
				const pointFrom = this.scrollingFromElement.offsetTop + this.scrollingFromElement.offsetHeight * this.scrollingFromOffset;
				this.windowScroller.setScrollY(Math.round(map(this.scrollPosition, 0, 1, pointFrom, pointTo)));
			} else {
				this.windowScroller.setScrollY(pointTo);
			}
			this.updateNavigatorState();
		}
	}

    getElementFromLocationId = (locationId) => {
		return ReactDOM.findDOMNode(this.refs[locationId]);
	}

    getLocationIdFromElement = (centerElement) => {
		let element = null;
		for (let i = 0; i < this.fixedComponentRefs.length; i++) {
			element = ReactDOM.findDOMNode(this.refs[this.fixedComponentRefs[i]]);
			if (element == centerElement) {
				// Found it
				return this.fixedComponentRefs[i];
			}
		}
		return undefined;
	}

    onCurrentPageScrolled = () => {
		// The internal content of a "page" section has been scrolled
		// console.log("SCROLLED PAGE!");
		this.updateNavigatorState();
	}

    onWindowScrollPreventHistoryScroll = () => {
		// On Safari, sometimes it scrolls to a different position - maybe because of the history API
		// This forces it to the correct location
		if (this.isAutoScrolling) {
			this.updateScrollPosition();
		}
	}

    onWindowScroll = () => {
		if (!this.windowScroller.isLocked()) {
			this.updateNavigatorState();
		}
	}

    onWindowResize = () => {
		// On resize, fixes the current section in the middle again
		if (this.isAutoScrolling) {
			// During a transition, just redraw the current phase
			this.updateScrollPosition();
		} else {
			// End of transition, just redraw and lock
			this.lockScrollOnCurrentElement();

			if (!Bowser.ios && Bowser.safari) {
				if (this.windowResizeTimeoutId) window.clearTimeout(this.windowResizeTimeoutId);
				this.windowResizeTimeoutId = window.setTimeout(this.onWindowResizeFix, 10);
			}
		}
	}

    onWindowResizeFix = () => {
		// Fixes for Safari; needed because setting scroll during the resize even doesn't work every time.
		// The scroll position is set, but never painted.
		// It may also think it's in the right position, hence why we move it up and down a bit before going back to the right position
		this.windowScroller.setWindowScrollY(this.windowScroller.getScrollY() - 1);
		this.windowScroller.setWindowScrollY(this.windowScroller.getScrollY() + 1);
		this.lockScrollOnCurrentElement();
		this.windowResizeTimeoutId = undefined;
	}

    onMouseWheel = (e) => {
		// Find the delta
		if (!this.isAutoScrolling) {
			let numPixels = 0;
			if (e.deltaMode == 0x00) {
				// DOM_DELTA_PIXEL
				numPixels = e.deltaY;
			} else if (e.deltaMode == 0x01) {
				// DOM_DELTA_LINE
				numPixels = Math.round(e.deltaY * 35); // Arbitrary
			} else if (e.deltaMode == 0x02) {
				// DOM_DELTA_PAGE
				numPixels = e.deltaY * window.innerHeight;
			}

			// Finds whether we can actually scroll or not
			const element = e.target;
			const canScrollUp = element.scrollTop <= 0;
			const canScrollDown = element.scrollTop >= element.scrollTop - window.innerHeight;

			// console.log(e.eventPhase, canScrollUp, canScrollDown);

			if ((numPixels < 0 && canScrollUp) || (numPixels > 0 && canScrollDown)) {
				// Can scroll the main site
				let justStartedScrolling = false;

				if (isNaN(this.desiredScrollY)) {
					// Not scrolling, will start
					this.desiredScrollY = this.windowScroller.getScrollY() + numPixels;
					this.desiredScrollYPhase = this.windowScroller.getScrollY();

					justStartedScrolling = true;
				} else {
					// Already scrolling, just update the value
					this.desiredScrollY = this.desiredScrollY + numPixels;
				}

				const documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
				this.desiredScrollY = clamp(this.desiredScrollY, 0, documentHeight - window.innerHeight);
				// console.log(this.desiredScrollY + ", " + this.desiredScrollYPhase + " should be 0 => " + (documentHeight - window.innerHeight));

				if (justStartedScrolling) {
					this.onAnimationFrameUpdateDesiredScrollY();
				}

				e.preventDefault();
			}
		}
	}

    onAnimationFrameUpdateDesiredScrollY = () => {
		// Update value
		this.desiredScrollYPhase = this.desiredScrollYPhase + (this.desiredScrollY - this.windowScroller.getScrollY()) / 6;

		// console.log("Updating to " + Math.round(this.desiredScrollYPhase) + " of " + this.desiredScrollY);

		// Update scroll
		this.windowScroller.setScrollY(Math.round(this.desiredScrollYPhase));

		// Continue animation if not there yet
		if (Math.round(this.desiredScrollYPhase) != this.desiredScrollY) {
			window.requestAnimationFrame(this.onAnimationFrameUpdateDesiredScrollY);
		} else {
			// Stop animating
			this.desiredScrollY = undefined;
		}
	}

    getCenterElement = () => {
		const screenMiddle = this.windowScroller.getScrollY() + (window.innerHeight / 2);
		// console.log("screen middle = " + screenMiddle);
		const elements = document.querySelectorAll(".sectionPageHolder");
		let centerElement = null;
		for (let i = 0; i < elements.length; i++) {
			if (screenMiddle >= elements[i].offsetTop && screenMiddle <= elements[i].offsetTop + elements[i].offsetHeight) {
				// Found
				centerElement = elements[i];
				break;
			}
		}

		return centerElement;
	}
}

export default SecurityPlannerApp;
