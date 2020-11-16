import PropTypes from 'prop-types';
import React from "react";
import Bowser from "bowser";
import cx from "classnames";

import PageSectionHelper from "./../../../vendor/utils/PageSectionHelper";
import DirectionUtils from "./../../../vendor/utils/DirectionUtils";
import iOSUtils from "./../../../vendor/utils/iOSUtils";

import SecurityPlannerActions from "../../../actions/SecurityPlannerActions";

import SecondaryMenu from "../../common/SecondaryMenu.react";
import FooterMenu from "../../common/FooterMenu.react";

import Body from "./Body.react";
import SponsorsBanner from "./SponsorsBanner.react";

class CoverPage extends React.Component {
	constructor(props) {
		super(props)
		this.helper = new PageSectionHelper(this);
	}
	
    static propTypes = {
		metadata: PropTypes.object, // ContentfulLoader's .metadata
		stringList: PropTypes.object, // StringList
		selectedLanguage: PropTypes.object, // Language
		availableLanguages: PropTypes.arrayOf(PropTypes.object), // Language[]
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
		onClickNext: PropTypes.func,
	};

    componentDidMount() {
		this.helper.setComponent(this.refs.scroller);
	}

    shouldComponentUpdate(nextProps, nextState) { // eslint-disable-line no-unused-vars
		return nextProps.metadata != this.props.metadata ||
			nextProps.stringList != this.props.stringList ||
			nextProps.selectedLanguage != this.props.selectedLanguage ||
			nextProps.availableLanguages != this.props.availableLanguages ||
			nextProps.routes != this.props.routes ||
			nextProps.goToPage != this.props.goToPage ||
			nextProps.onClickNext != this.props.onClickNext;
	}

    componentDidUpdate() {
		this.helper.setComponent(this.refs.scroller);
		this.helper.forceCheck();
		if (this.helper.getElement() && Bowser.ios) {
			// iOS is not re-rendering some elements, so force it
			const elements = this.helper.getElement().querySelectorAll(".button");
			for (let i = 0; i < elements.length; i++) {
				iOSUtils.rerenderElement(elements[i]);
			}
		}
	}

    componentWillUnmount() {
		this.helper.destroy();
	}

    render() {

		const headImgStyle = {
			backgroundImage: "url('" + require("./../../../../images/page-cover/main.png") + "')",
			backgroundRepeat: "no-repeat",
		};

		return (
			<div
				className={ cx("sectionPageHolder", "pageCover", DirectionUtils.getClass(this.props.stringList)) }
				aria-hidden={ !this.helper.isActive() }
				style={ { height: this.helper.getWindowHeight() } }>
				<div
					className="content"
					ref="scroller">
					<div className="inner">
						<SecondaryMenu
							stringList={ this.props.stringList }
							currentLocation={ SecondaryMenu.LOCATION_HOME }
							availableLanguages={ this.props.availableLanguages }
							selectedLanguage={ this.props.selectedLanguage }
							routes={ this.props.routes }
							goToPage={ this.props.goToPage }
							allowFocus={ this.helper.isActive() }
							useLightStyle={ true }
							className="header"
							ref="menu" />
						<div className="middle" id={ SecondaryMenu.LOCATION_HOME }>
							<div className="common-image-container head" style={ headImgStyle }/>
							<Body
								ref={ (r) => { this.body = r; } }
								onClickNext={ this.onClickNext }
								lastModified={ this.props.metadata ? this.props.metadata.updatedAt : null}
								stringList={ this.props.stringList }
								allowFocus={ this.helper.isActive() }/>
						</div>
						<FooterMenu
							stringList={ this.props.stringList }
							currentLocation={ SecondaryMenu.LOCATION_HOME }
							routes={ this.props.routes }
							goToPage={ this.props.goToPage }
							style={ FooterMenu.STYLE_LIGHT }
							allowFocus={ this.helper.isActive() }/>
					</div>
				</div>
			</div>
		);
	}

    // Common events for navigation
    onActivate = (travelOffset, viaHistoryAPI) => {
		// Ran when the section becomes active
		this.helper.onActivate(travelOffset, viaHistoryAPI);
		if (this.body) this.body.onActivate();
	};

    onDeactivate = (travelOffset, viaHistoryAPI) => {
		// Ran when the section becomes inactive
		this.helper.onDeactivate(travelOffset, viaHistoryAPI);
	};

    getDesiredLocatorBackgroundColor = () => {
		// Return the color (as a number) that the locator bar should have when opaque
		return undefined;
	};

    onClickNext = () => {
		SecurityPlannerActions.deselectAllStatements();
		this.refs["menu"].closeMenuDelayed();
		this.props.onClickNext();
	};
}

export default CoverPage;
