import PropTypes from 'prop-types';
import React from "react";
import ReactDOM from 'react-dom';
import * as marked from "marked";

import PageSectionHelper from "./../../../vendor/utils/PageSectionHelper";
import DirectionUtils from "./../../../vendor/utils/DirectionUtils";

import SecondaryMenu from "../../common/SecondaryMenu.react";
import FooterMenu from "../../common/FooterMenu.react";

import MarkdownAnchorLinkReplacer from "./../../../vendor/utils/MarkdownAnchorLinkReplacer";

class PhilosophyPage extends React.Component {
    static propTypes = {
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
		this.helper.setElement(ReactDOM.findDOMNode(this).querySelector(".content"));
		this.markdownAnchorLinkReplacer.replaceDOMLinksWithRoutes(this.description);
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
				className={ "sectionPageHolder page-philosophy " + DirectionUtils.getClass(this.props.stringList) }
				aria-hidden={ !this.helper.isActive() }
				style={ { height: this.helper.getWindowHeight() } }>
				<div className="content">
					<SecondaryMenu
						stringList={ this.props.stringList }
						currentLocation={ SecondaryMenu.LOCATION_PHILOSOPHY }
						availableLanguages={ this.props.availableLanguages }
						selectedLanguage={ this.props.selectedLanguage }
						routes={ this.props.routes }
						goToPage={ this.props.goToPage }
						allowFocus={ this.helper.isActive() }
						useLightStyle={ false }
						className="secondary-menu"/>
					<div className="middle" id={ SecondaryMenu.LOCATION_PHILOSOPHY }>
						<div className="headline">
                            {this.props.stringList.get("philosophy-title")}
						</div>
						<div className="philosophy-description" 
							ref={ (c) => this.description = { elConstructor: c } }
							dangerouslySetInnerHTML={ { __html: marked.parse(this.props.stringList.get("philosophy-body") || "") } }/>
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

export default PhilosophyPage;
