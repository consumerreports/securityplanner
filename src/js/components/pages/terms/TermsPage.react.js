import PropTypes from 'prop-types';
import React from "react";
import createReactClass from 'create-react-class';
import cx from "classnames";
import { map } from "moremath";
import SimpleSignal from "simplesignal";

import PageSectionHelper from "./../../../vendor/utils/PageSectionHelper";
import DirectionUtils from "./../../../vendor/utils/DirectionUtils";
import ResizeUtils from "./../../../vendor/utils/ResizeUtils";
import * as marked from "marked";
import MiniTracker from "./../../../vendor/tracking/MiniTracker";

import Easing from "./../../../vendor/transitions/Easing";
import Fween from "./../../../vendor/transitions/Fween";
import PositionUtils from "./../../../vendor/utils/PositionUtils";

import FooterMenu from "../../common/FooterMenu.react";
import SecondaryMenu from "../../common/SecondaryMenu.react";
import Header from "./Header.react";
import MarkdownAnchorLinkReplacer from "./../../../vendor/utils/MarkdownAnchorLinkReplacer";
import ADAUtils from "../../../vendor/utils/ADAUtils";

const TermsPage = createReactClass({
    displayName: 'TermsPage',
    termsSections: [],
    helper: undefined,
    onPageScrolled: new SimpleSignal(),

    propTypes: {
		stringList: PropTypes.object, // StringList
		selectedLanguage: PropTypes.object, // Language
		availableLanguages: PropTypes.arrayOf(PropTypes.object), // Language[]
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
		checkPage: PropTypes.func.isRequired,
	},

    getInitialState: function() {
		return {
			breakpoint: ResizeUtils.getCurrentBreakpoint(),
			scrollPosition: 0,
		};
	},

    UNSAFE_componentWillMount: function() {
		this.helper = new PageSectionHelper(this);
		document.addEventListener("visibilitychange", this.onVisibilityChange);
		this.scrollOffsets = {
			"tiny": 40,
			"small": 40,
			"medium": 40,
			"large": 40,
		};
		this.markdownAnchorLinkReplacer = new MarkdownAnchorLinkReplacer(this.props.goToPage, this.props.checkPage);
	},

    componentDidMount: function() {
		this.helper.setComponent(this.refs.scroller);
		this.helper.onScrolled.add(this.onScrolledContent);
		this.helper.onResized.add(this.onResize);
		
		/*
		 * Define a list of intra-app links that are found in the parsed Markdown content for the terms
		 * Associate those links with navigational function calls that the link behaviour will be replaced with.	 
	 	*/
		const linkReplacements = [
			{
				href: "terms-section-privacy",
				replacementFunction: () => { this.onClickedToShowSection("terms-section-privacy"); },
			},
		];

		// Replace linkReplacements items in each terms section with corresponding nav functions.
		this.termsSections.map(function(section) {
			// this.replaceAppLinks(section);
			this.markdownAnchorLinkReplacer.replaceDOMLinksWithRoutes(section, linkReplacements);
		}.bind(this));
	},

    componentDidUpdate: function() {
		this.helper.setComponent(this.refs.scroller);
	},

    componentWillUnmount: function() {
		this.helper.destroy();
		document.removeEventListener("visibilitychange", this.onVisibilityChange);
	},

    render: function() {
		const pageClasses = cx(
			"sectionPageHolder",
			"pageTerms",
			DirectionUtils.getClass(this.props.stringList)
		);

		this.termsTOCID = "terms-toc";

		const termsContent = [
			{
				id: "terms-section-introduction",
				title: this.props.stringList.get("terms-section-introduction-title"),
				text: marked.parse(this.props.stringList.get("terms-section-introduction") || ""),
			},
			{
				id: "terms-section-relying",
				title: this.props.stringList.get("terms-section-relying-title"),
				text: marked.parse(this.props.stringList.get("terms-section-relying") || ""),
			},
			{
				id: "terms-section-using",
				title: this.props.stringList.get("terms-section-using-title"),
				text: marked.parse(this.props.stringList.get("terms-section-using") || ""),
			},
			{
				id: "terms-section-privacy",
				title: this.props.stringList.get("terms-section-privacy-title"),
				text: marked.parse(this.props.stringList.get("terms-section-privacy") || ""),
			},
			{
				id: "terms-section-intellectualproperty",
				title: this.props.stringList.get("terms-section-intellectualproperty-title"),
				text: marked.parse(this.props.stringList.get("terms-section-intellectualproperty") || ""),
			},
			{
				id: "terms-section-interpretation",
				title: this.props.stringList.get("terms-section-interpretation-title"),
				text: marked.parse(this.props.stringList.get("terms-section-interpretation") || ""),
			},
		];

		const tableOfContentsElCollection = this.generateTableOfContentsElCollection(termsContent);
		const termsSectionElCollection = this.generateTermsSectionElCollection(termsContent);

		return (
			<div
				className={ pageClasses }
				style={ { height: this.helper.getWindowHeight() } }>
				<div
					className="content"
					ref="scroller">
					<SecondaryMenu
						stringList={ this.props.stringList }
						currentLocation={ SecondaryMenu.LOCATION_TERMS }
						availableLanguages={ this.props.availableLanguages }
						selectedLanguage={ this.props.selectedLanguage }
						routes={ this.props.routes }
						goToPage={ this.props.goToPage }
						allowFocus={ this.helper.isActive() }
						useLightStyle={ false }
						onClickPrint={ this.onClickPrint }
						className="secondary-menu"/>
					<div className="middle" id={ SecondaryMenu.LOCATION_TERMS }>
						<div className="headline-container">
							<div className="headline">
								{ this.props.stringList.get("terms-title") }
							</div>
							<Header stringList={ this.props.stringList }
							title={ this.title }
							ref={ (r) => this.headerComp = r }						
							onClickedPrint={ this.helper.isActive() ? this.onClickPrint : null }
							allowFocus={ this.helper.isActive() }
							routes={ this.props.routes }
							goToPage={ this.props.goToPage } />
						</div>
						<div className="terms">
							<h5 className="last-updated">
								{ this.props.stringList.get("terms-last-update") }
							</h5>
							<div className="terms-content">
								<div className="terms-toc">
									<h2 id={ this.termsTOCID } ref={ (c) => this.termsSections.push({ id: this.termsTOCID, elConstructor: c }) }>
										{ this.props.stringList.get("terms-toc-title") }
									</h2>
									<ol>
										{ tableOfContentsElCollection }
									</ol>
								</div>
								<div>
								{ termsSectionElCollection }
								</div>
							</div>
						</div>
					</div>
					<FooterMenu
						stringList={ this.props.stringList }
						currentLocation={ SecondaryMenu.LOCATION_TERMS }
						style={ FooterMenu.STYLE_LIGHT }
						routes={ this.props.routes }
						goToPage={ this.props.goToPage }
						onClickPrint={ this.onClickPrint }
						allowFocus={ this.helper.isActive() }/>
				</div>
			</div>
		);
	},

    /**
	 * Ran when the section becomes the focused section
	 */
    onActivate: function(travelOffset, viaHistoryAPI, fromOverlay) {
		this.helper.onActivate(travelOffset, viaHistoryAPI, fromOverlay);
	},

    /**
	 * Ran when the section is about to lose focus
	 */
    onDeactivate: function(travelOffset, viaHistoryAPI, toOverlay) { // eslint-disable-line no-unused-vars
		this.helper.onDeactivate(travelOffset, viaHistoryAPI, toOverlay);
	},

    onScrolledContent: function(scrollY, maxScrollY) {
		this.onPageScrolled.dispatch();
	},

    // showFeedback: function(e) {
	// 	MiniTracker.trackEvent("button", "click", "feedback");
	// 	this.props.goToPage(this.props.routes.getUriFeedback(), true, true);
	// 	e.preventDefault();
	// },

    onClickedToShowSection: function(sectionId) {
		this.scrollToSection(sectionId);
	},

    scrollToSection: function(sectionId) {
		this.sectionIdToScrollTo = sectionId;
		this.positionToScrollFrom = this.helper.getScrollPosition();
		this.isScrolling = true;
		Fween.use(this.getSectionScrollPosition, this.setSectionScrollPosition).from(0).to(1, 0.4, Easing.expoInOut).call(this.onScrollingEnded).play();
	},

    getSectionScrollPosition: function() {
		return this.sectionScrollPosition;
	},

    setSectionScrollPosition: function(value) {
		this.sectionScrollPosition = value;
		// Update position
		const destinationScrollY = this.getSectionTopY(this.sectionIdToScrollTo);
		const desiredScrollY = map(this.sectionScrollPosition, 0, 1, this.positionToScrollFrom, destinationScrollY);
		this.helper.setScrollPosition(desiredScrollY);
	},

    findSectionById: function(section) {
		return section.id === this.sectionIdToScrollTo;
	},

    getSectionTopY: function() {
		// Find the internal Y of a section
		const section = this.termsSections.find(this.findSectionById, this);
		const el = section && section.elConstructor;
		if (el) {
			const elementRect = PositionUtils.findElementRect(el, true);
			const scrollRect = PositionUtils.findElementRect(this.helper.getElement(), true);
			return elementRect.top - scrollRect.top + this.helper.getScrollPosition() - this.scrollOffsets[this.state.breakpoint];
		}
		return undefined;
	},

    getPrintURL: function() {
		// TODO: this is semi-temporary; we might change it to use actual remapped URLs instead
		return "?l=" + this.props.selectedLanguage.id + "#" + this.props.routes.getUriPrintTerms();
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

    onResize: function(width, height) { // eslint-disable-line no-unused-vars
		const bp = ResizeUtils.getCurrentBreakpoint();
		if (bp !== this.state.breakpoint) {
			this.setState({
				breakpoint: ResizeUtils.getCurrentBreakpoint(),
			});
		}
		requestAnimationFrame(() => this.helper.dispatchOnScrolled());
	},

    onScrollingEnded: function() {
		this.isScrolling = false;
		this.helper.dispatchOnScrolled();
	},

    /**
	 * Render sections of the TOC
	 */
    generateTableOfContentsElCollection: function(termsContent) {
		return termsContent.map(function(section) {
			return this.generateTableOfContentsEl(section);
		}.bind(this));
	},

    generateTableOfContentsEl: function(section) {
		return (
			<li key={section.id}>
				<a 
					tabIndex={ "0" }
					title={ section.title }
					aria-label={ section.title }
					href={ "#" + section.id }
					data-testid={ section.id }
					onKeyDown={ ADAUtils.handleKeyboard(() => { this.onClickedToShowSection(section.id); }) }
					onClick={ ADAUtils.handleKeyboard(() => { this.onClickedToShowSection(section.id); }) }>{ section.title }</a>
			</li>
		);
	},

    /**
	 * Render sections of the terms
	 */
    generateTermsSectionElCollection: function(termsContent) {
		return termsContent.map(function(section, i) {
			const sectionNumber = i + 1;
			return this.generateTermsSectionEl(section, sectionNumber);
		}.bind(this));
	},

    generateTermsSectionEl: function(section, sectionNumber) {
		return (
			<section
				ref={ (c) => this.termsSections.push({ id: section.id, elConstructor: c }) } 
				key={sectionNumber}>
				<h2 id={ section.id }>
					<a 
					tabIndex={ "0" }
					title={ section.title }
					aria-label={ section.title }
					onKeyDown={ ADAUtils.handleKeyboard(() => { this.onClickedToShowSection(this.termsTOCID); }) }
					onClick={ ADAUtils.handleKeyboard(() => { this.onClickedToShowSection(this.termsTOCID); }) }>
						{ sectionNumber + ". " + section.title }
					</a>
				</h2>
				<div 
					dangerouslySetInnerHTML={ { __html: section.text } } />
			</section>
		);
	},
});

export default TermsPage;
