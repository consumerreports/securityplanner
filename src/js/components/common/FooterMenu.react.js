import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";

import ADAUtils from "../../vendor/utils/ADAUtils";
import MiniTracker from "../../vendor/tracking/MiniTracker";
import DirectionUtils from "./../../vendor/utils/DirectionUtils";

import SecondaryMenu from "./SecondaryMenu.react";

class FooterMenu extends React.Component {
    static propTypes = {
		currentLocation: PropTypes.string,
		stringList: PropTypes.object, // StringList
		style: PropTypes.string,
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
		allowFocus: PropTypes.bool,
	};

    render() {
		const commonMenuClasses = cx(
			"common-footer-menu",
			"common-footer-menu--" + this.props.style,
			DirectionUtils.getClass(this.props.stringList)
		);
		const imageIsDark = this.props.style !== FooterMenu.STYLE_DARK;

		// Finally, return the elements
		return (
			<div className={ commonMenuClasses }>
				<div className="container">
					<div className="logo powered">
						<div className="prefix">{ this.props.stringList.get("menu-logos-citizen-prefix") }</div>
						<a
							tabIndex={ this.props.allowFocus ? 0 : -1 }
							target="_blank"
							href={ this.props.stringList.get("common-citizenlab-url") }>
							<img src={ this.getCitizenlabLogo(imageIsDark) }
								width="84"
								style={ { paddingBottom: "4px" } }
								title="The Citizen Lab"/>
						</a>
					</div>

					<div className="logo licensed">
						<a
							tabIndex={ this.props.allowFocus ? 0 : -1 }
							target="_blank"
							href={ this.props.stringList.get("common-creative-commons-url") }>
							{ this.props.stringList.get("menu-logos-creative-commons-prefix") }
						</a>
					</div>

					<nav className="navigation" role="menu">
						<div className="group">
							{ this.renderNavigationItem("menu-home-caption", SecondaryMenu.LOCATION_HOME, this.showHome) }
							{ this.renderNavigationItem("menu-about-caption", SecondaryMenu.LOCATION_ABOUT, this.showAbout) }
							{ this.renderNavigationItem("menu-alltools-caption", SecondaryMenu.LOCATION_ALL_TOOLS, this.showAllTools) }
						</div>
						<div className="group">
							{ this.renderNavigationItem("menu-terms-caption", SecondaryMenu.LOCATION_TERMS, this.showTerms) }
							{ this.renderNavigationItem("menu-feedback-caption", SecondaryMenu.LOCATION_FEEDBACK, this.showFeedback) }
						</div>
					</nav>
					<div className="logo created">
						<a
							href={ this.props.stringList.get("common-jigsaw-url") }
							target="_blank"
							tabIndex={ this.props.allowFocus ? 0 : -1 }>
							<img
								src={ this.getJigsawLogo(imageIsDark) }
								width="94"
								alt="Jigsaw"
								title="Jigsaw"/>
						</a>
					</div>
				</div>
			</div>
		);
	}

    getCitizenlabLogo = (isDark) => {
		if (isDark) {
			return require("./../../../images/sponsors/citizenlab-footer-dark.png");
		} else {
			return require("./../../../images/sponsors/citizenlab-footer-light.png");
		}
	};

    getJigsawLogo = (isDark) => {
		if (isDark) {
			return require("./../../../images/sponsors/jigsaw-footer-dark.png");
		} else {
			return require("./../../../images/sponsors/jigsaw-footer-light.png");
		}
	};

    renderNavigationItem = (captionId, location, func) => {
		const isCurrentLocation = this.props.currentLocation === location;
		return (
			<div className={ "item" + (isCurrentLocation ? " item--active" : "") }>
				<a
					href="#"
					tabIndex={ this.props.allowFocus && !isCurrentLocation ? 0 : -1 }
					role="menuitem"
					onKeyDown={ ADAUtils.handleKeyboard(func) }
					onClick={ func }>
					{ this.props.stringList.get(captionId) }
				</a>
			</div>
		);
	};

    showAbout = (e) => {
		MiniTracker.trackEvent("button", "click", "who-we-are");
		this.props.goToPage(this.props.routes.getUriAbout(), true, true);
		e.preventDefault();
	};

    showAllTools = (e) => {
		MiniTracker.trackEvent("button", "click", "all-recommendations");
		this.props.goToPage(this.props.routes.getUriAllTools(), true, true);
		e.preventDefault();
	};

    showHome = (e) => {
		MiniTracker.trackEvent("button", "click", "home");
		this.props.goToPage(this.props.routes.getUriCover(), true, true);
		e.preventDefault();
	};

    showTerms = (e) => {
		MiniTracker.trackEvent("button", "click", "terms-and-conditions");
		this.props.goToPage(this.props.routes.getUriTerms(), true, true);
		e.preventDefault();
	};

    showFeedback = (e) => {
		MiniTracker.trackEvent("button", "click", "feedback");
		this.props.goToPage(this.props.routes.getUriFeedback(), true, true);
		e.preventDefault();
	};
}

FooterMenu.STYLE_LIGHT = "light";
FooterMenu.STYLE_LIGHT_GREY = "lightgrey";
FooterMenu.STYLE_DARK = "dark";

export default FooterMenu;