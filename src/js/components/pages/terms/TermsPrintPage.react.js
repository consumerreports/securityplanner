import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";

import SecurityPlannerStore from "./../../../stores/SecurityPlannerStore";
import DirectionUtils from "./../../../vendor/utils/DirectionUtils";
import SecurityPlannerConstants from "./../../../constants/SecurityPlannerConstants";
import MiniTracker from "./../../../vendor/tracking/MiniTracker";
import * as marked from "marked";

class TermsPrintPage extends React.Component {
    static propTypes = {
		stringList: PropTypes.object, // StringList
		selectedLanguage: PropTypes.object, // Language
		availableLanguages: PropTypes.arrayOf(PropTypes.object), // Language[]
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
	};

    shareURL = undefined;
    isActive = false;
    hasAttemptedPrint = false;

    UNSAFE_componentWillMount() {
		document.body.style.overflow = "auto";
		document.body.style.background = "#ffffff";
	}

    componentDidMount() {
		MiniTracker.trackEvent("page", "print-terms", this.getResultsHash());
		window.addEventListener("load", () => { this.attemptPrint(); });
		setTimeout(() => { this.attemptPrint(); }, 100);
	}

    componentWillUnmount() {
		this.helper.destroy();
	}

    attemptPrint = () => {
		const isLoaded = document.readyState === "complete";

		if (isLoaded && !this.hasAttemptedPrint) {
			this.hasAttemptedPrint = true;

			setTimeout(() => {
				window.print();
				if (SecurityPlannerConstants.UI.CLOSE_TAB_AFTER_PRINT) {
					// We also need to wait a bit before closing.
					// This is a strange wait - it's just to wait for the dialog to open, since the timeout
					// pauses when the print dialog is open.
					setTimeout(() => { this.closePage(); }, 800);
				}
			}, 20);
		}
	};

    closePage = () => {
		window.close();
	};

    render() {
		const pageClasses = cx(
			"pagePrintTerms",
			DirectionUtils.getClass(this.props.stringList)
		);

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
				className={ pageClasses }>
				<div
					className="content">
					<div className="middle">
						<h1>
							{ this.props.stringList.get("terms-title") }
						</h1>
						<div className="terms">
							<h5 className="last-updated">
								{ this.props.stringList.get("terms-last-update") }
							</h5>
							<div className="terms-content">
								<div className="terms-toc">
									<h2 id={ this.termsTOCID }>
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
				</div>
			</div>
		);
	}

    /**
	 * Ran when the section becomes the focused section
	 */
    onActivate = (travelOffset, viaHistoryAPI, fromOverlay) => {
		this.helper.onActivate(travelOffset, viaHistoryAPI, fromOverlay);
	};

    /**
	 * Ran when the section is about to lose focus
	 */
    onDeactivate = (travelOffset, viaHistoryAPI, toOverlay) => { // eslint-disable-line no-unused-vars
		this.helper.onDeactivate(travelOffset, viaHistoryAPI, toOverlay);
	};

    renderParagraphs = (list) => {
		return list.map((paragraph, index) => {
			return (
				<p key={ index }>
					{paragraph}
				</p>
			);
		});
	};

    /**
	 * Returns the color (as a number) that the locator bar should have when opaque
	 */
    getDesiredLocatorBackgroundColor = () => {
		return undefined;
	};

    getResultsHash = () => {
		// Returns the current state as a hash
		return SecurityPlannerStore.saveState();
	};

    /**
	 * Render sections of the TOC
	 */
    generateTableOfContentsElCollection = (termsContent) => {
		return termsContent.map(function(section) {
			return this.generateTableOfContentsEl(section);
		}.bind(this));
	};

    generateTableOfContentsEl = (section) => {
		return (
			<li>
				<a href={ "#" + section.id }>{ section.title }</a>
			</li>
		);
	};

    /**
	 * Render sections of the terms
	 */
    generateTermsSectionElCollection = (termsContent) => {
		return termsContent.map(function(section, i) {
			const sectionNumber = i + 1;
			return this.generateTermsSectionEl(section, sectionNumber);
		}.bind(this));
	};

    generateTermsSectionEl = (section, sectionNumber) => {
		return (
			<section>
				<h2 id={ section.id }>
					{ sectionNumber + ". " + section.title }
				</h2>
				<div 
					dangerouslySetInnerHTML={ { __html: section.text } } />
			</section>
		);
	};
}

export default TermsPrintPage;