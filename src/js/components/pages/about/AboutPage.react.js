import PropTypes from 'prop-types';
import React from "react";
import ReactDOM from 'react-dom';
import * as marked from "marked";

import PageSectionHelper from "./../../../vendor/utils/PageSectionHelper";
import DirectionUtils from "./../../../vendor/utils/DirectionUtils";
import MiniTracker from "./../../../vendor/tracking/MiniTracker";

import ImageContainer from "./../../common/ImageContainer.react";
import SecondaryMenu from "../../common/SecondaryMenu.react";
import FooterMenu from "../../common/FooterMenu.react";

import BioSection from "./BioSection.react";

import MarkdownAnchorLinkReplacer from "./../../../vendor/utils/MarkdownAnchorLinkReplacer";


class AboutPage extends React.Component {
    static propTypes = {
		bios: PropTypes.array, // List of Bio objects
		stringList: PropTypes.object, // StringList
		selectedLanguage: PropTypes.object, // Language
		availableLanguages: PropTypes.arrayOf(PropTypes.object), // Language[]
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
		checkPage: PropTypes.func.isRequired,
	};

    helper = undefined;

    UNSAFE_componentWillMount() {
		this.helper = new PageSectionHelper(this);
		this.markdownAnchorLinkReplacer = new MarkdownAnchorLinkReplacer(this.props.goToPage, this.props.checkPage);
	}

    componentDidMount() {	
		this.markdownAnchorLinkReplacer.replaceDOMLinksWithRoutes(this.description);
		this.helper.setComponent(this.refs.scroller);
	}

    componentDidUpdate() {
		this.helper.setElement(ReactDOM.findDOMNode(this).querySelector(".content"));
	}

    componentWillUnmount() {
		this.helper.destroy();
	}

    render() {
		return (
			<div
				className={ "sectionPageHolder pageAbout " + DirectionUtils.getClass(this.props.stringList) }
				aria-hidden={ !this.helper.isActive() }
				style={ { height: this.helper.getWindowHeight() } }>
				<div className="content">
					<SecondaryMenu
						stringList={ this.props.stringList }
						currentLocation={ SecondaryMenu.LOCATION_ABOUT }
						availableLanguages={ this.props.availableLanguages }
						selectedLanguage={ this.props.selectedLanguage }
						routes={ this.props.routes }
						goToPage={ this.props.goToPage }
						allowFocus={ this.helper.isActive() }
						useLightStyle={ false }
						className="secondary-menu"/>
					<div className="middle" id={ SecondaryMenu.LOCATION_ABOUT }>
						<div className="headline">
							{this.props.stringList.get("about-us-title")}
						</div>
						<div className="section-description">
							<h5 className="section-description-header">{this.props.stringList.get("about-us-description-header")}</h5>
							<div className="section-description-body">
								<div 
								ref={ (c) => this.description = { elConstructor: c } }
								dangerouslySetInnerHTML={ { __html: marked.parse(this.props.stringList.get("about-us-description-body") || "") } } />
							</div>
						</div>
					</div>
					<div className="middle-wrapper">
						<div className="middle">
							<BioSection
								bios={ this.props.bios }
								sectionID={ "peer" }
								stringList={ this.props.stringList }
								routes={ this.props.routes }
								goToPage={ this.props.goToPage }
								allowFocus={ this.helper.isActive() }/>
						</div>
					</div>
					<div className="middle">
						<BioSection
							bios={ this.props.bios }
							sectionID={ "advisor" }
							stringList={ this.props.stringList }
							routes={ this.props.routes }
							goToPage={ this.props.goToPage }
							allowFocus={ this.helper.isActive() }/>
					</div>
					<div className="middle-wrapper">
						<div className="middle">
							<div className="thanksSection">
								<div className="section-description">
									<h5 className="section-description-header">
									{this.props.stringList.get("about-funders-title")}
									</h5>
									<div className="section-description-body">
										<p>{this.props.stringList.get("about-funders-text")}</p>
										<div className="logos">
											{ this.renderLogos("about-us-funder-logos") }
										</div>
									</div>
								</div>
								<div className="section-description">
									<h5 className="section-description-header">
									{this.props.stringList.get("about-supporters-title")}
									</h5>
									<div className="section-description-body">
										<p>{this.props.stringList.get("about-supporters-text")}</p>
										<div className="logos">
											{ this.renderLogos("about-us-inkind-logos") }
										</div>
									</div>
								</div>
								<div className="section-description">
									<h5 className="section-description-header">
										{this.props.stringList.get("about-acknowledgements-title")}
									</h5>
									<div className="section-description-body">
										<p>{this.props.stringList.get("about-acknowledgements-text")}</p>
									</div>
								</div>
							</div>
						</div>
					</div>
					<FooterMenu
						stringList={ this.props.stringList }
						currentLocation={ SecondaryMenu.LOCATION_ABOUT }
						style={ FooterMenu.STYLE_LIGHT }
						routes={ this.props.routes }
						goToPage={ this.props.goToPage }
						allowFocus={ this.helper.isActive() }/>
				</div>
			</div>
		);
	}

    renderLogos = (key) => {
		const logoAssets = this.props.stringList.getAssetArray(key);
		return logoAssets.map((asset, index) => {
			return (
				<a
					key={ index }
					href={ asset.link }
					target="_blank"
					tabIndex={ this.helper.isActive() ? 0 : -1 }
					name={asset.title}
					role="link"
					className="link">
					<ImageContainer
						className="logo"
						description={ asset.title }
						src={ asset.src } />
				</a>
			);
		});
	};

    /**
	 * Ran when the section becomes the focused section
	 */
    onActivate = (travelOffset, viaHistoryAPI, fromOverlay) => {
		this.helper.onActivate(travelOffset, viaHistoryAPI, fromOverlay);
	};

    /**
	 * Ran when the section is about to lose focus
	 */
    onDeactivate = (travelOffset, viaHistoryAPI, toOverlay) => {
		this.helper.onDeactivate(travelOffset, viaHistoryAPI, toOverlay);
	};

    /**
	 * Returns the color (as a number) that the locator bar should have when opaque
	 */
    getDesiredLocatorBackgroundColor = () => {
		return undefined;
	};
}

export default AboutPage;
