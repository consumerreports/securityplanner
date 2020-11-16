import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";

import LanguageMenu from "./LanguageMenu.react";

import ADAUtils from "../../vendor/utils/ADAUtils";
import MiniTracker from "../../vendor/tracking/MiniTracker";
import DirectionUtils from "./../../vendor/utils/DirectionUtils";
import ResizeUtils from "../../vendor/utils/ResizeUtils";

class SecondaryMenu extends React.Component {
    static propTypes = {
		currentLocation: PropTypes.string,
		stringList: PropTypes.object, // StringList
		className: PropTypes.string,
		allowFocus: PropTypes.bool,
		useLightStyle: PropTypes.bool,
		selectedLanguage: PropTypes.object, // Language
		availableLanguages: PropTypes.arrayOf(PropTypes.object), // Language[]
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
	};

    getShouldMenuOpen = () => {
		// These pages have a different default state for the menu
		return this.props.currentLocation !== SecondaryMenu.LOCATION_HOME && this.props.currentLocation !== SecondaryMenu.LOCATION_ACTION_PLAN && this.props.currentLocation !== SecondaryMenu.LOCATION_NOMATCH;
	};

    componentDidMount() {
		window.addEventListener("resize", this.onResize);
	}

    componentWillUnmount() {
		window.removeEventListener("resize", this.onResize);
	}

    render() {
		const isTiny = this.state.breakpoint === "tiny";

		// Items
		const linksMenuItems = [];

		// Menu/close button
		if (isTiny) {
			linksMenuItems.push(
				<div
					className="menu"
					key="menu-button"
					onClick={ this.handleMenuToggle }>
					<a href="#">
						<span className="sr-only">{ this.state.isMenuOpen ? "close menu" : "open menu" }</span>
						{ this.state.isMenuOpen ?
							<img src={ this.props.useLightStyle ? require("./../../../images/ui/hamburger-close.svg") : require("./../../../images/ui/hamburger-close-dark.svg") } alt=""/>
						:
							<img src={ this.props.useLightStyle ? require("./../../../images/ui/hamburger.svg") : require("./../../../images/ui/hamburger-dark.svg") } alt=""/>
						}
					</a>
				</div>
			);
			if (!this.state.isMenuOpen) {
				linksMenuItems.push(this.renderBrand(false));
			}
		}

		// Home, about, all-tools links
		if (this.state.isMenuOpen || !isTiny) {
			linksMenuItems.push(
				<ul className="link-group link-group--info" key="info">
					<li className={ "link" + (this.props.currentLocation === SecondaryMenu.LOCATION_HOME ? " link--active" : "") }>
						<a
							href="#"
							tabIndex={ !this.props.allowFocus || this.props.currentLocation === SecondaryMenu.LOCATION_HOME ? -1 : 0 }
							role="menuitem"
							title={ this.props.stringList.get("menu-home-caption") }
							aria-label={ this.props.stringList.get("menu-home-caption") }
							onKeyDown={ ADAUtils.handleKeyboard(this.showHome) }
							onClick={ this.showHome }>
							{ this.props.stringList.get("menu-home-caption") }
						</a>
					</li>
					<li className={ "link" + (this.props.currentLocation === SecondaryMenu.LOCATION_ABOUT ? " link--active" : "") }>
						<a
							href="#"
							tabIndex={ !this.props.allowFocus || this.props.currentLocation === SecondaryMenu.LOCATION_ABOUT ? -1 : 0 }
							role="menuitem"
							title={ this.props.stringList.get("menu-about-caption") }
							aria-label={ this.props.stringList.get("menu-about-caption") }
							onKeyDown={ ADAUtils.handleKeyboard(this.showAbout) }
							onClick={ this.showAbout }>
							{ this.props.stringList.get("menu-about-caption") }
						</a>
					</li>
					<li className={ "link" + (this.props.currentLocation === SecondaryMenu.LOCATION_ALL_TOOLS ? " link--active" : "") }>
						<a
							href="#"
							tabIndex={ !this.props.allowFocus || this.props.currentLocation === SecondaryMenu.LOCATION_ALL_TOOLS ? -1 : 0 }
							role="menuitem"
							title={ this.props.stringList.get("menu-alltools-caption") }
							aria-label={ this.props.stringList.get("menu-alltools-caption") }
							onKeyDown={ ADAUtils.handleKeyboard(this.showAllTools) }
							onClick={ this.showAllTools }>
							{ this.props.stringList.get("menu-alltools-caption") }
						</a>
					</li>
				</ul>
			);
		}

		// Share link & Language Menu
		if (!this.state.isMenuOpen || !isTiny) {
			linksMenuItems.push(
				<ul className="link-group link-group--options" key="options">
					<li
						className="share"
						tabIndex={ this.props.allowFocus ? 0 : -1 }
						role="button"
						title={ this.props.stringList.get("menu-share-caption") }
						aria-label={ this.props.stringList.get("menu-share-caption") }
						onKeyDown={ ADAUtils.handleKeyboard(this.showShare) }
						onClick={ this.showShare }>
						<img alt="" src={ this.props.useLightStyle ? require("./../../../images/ui/icon-share-light.svg") : require("./../../../images/ui/icon-share-dark.svg") }/>
					</li>
					<LanguageMenu
						stringList={ this.props.stringList }
						availableLanguages={ this.props.availableLanguages }
						selectedLanguage={ this.props.selectedLanguage }
						allowFocus={ this.props.allowFocus }/>
				</ul>
			);
		}

		const commonMenuClasses = cx({
			"common-secondary-menu": true,
			"common-secondary-menu--dark": !this.props.useLightStyle,
			"common-secondary-menu--open": this.state.isMenuOpen,
		}, DirectionUtils.getClass(this.props.stringList), this.props.className);
		
		const commonMenuContainerClasses = cx({
			"common-secondary-menu-container": true,
			"common-secondary-menu-container--dark": !this.props.useLightStyle,
		}, DirectionUtils.getClass(this.props.stringList), this.props.className);

		// Finally, return the elements
		return (
			<div className={ commonMenuContainerClasses }>
				<a href={`#${this.props.currentLocation}`} className="skip-link">Skip to main content</a>
				<div className="menu-inner">
					{ this.renderBrand(isTiny) }
					<nav className={ commonMenuClasses } role="menu">
						{ linksMenuItems}
					</nav>
				</div>
			</div>
		);
	}

    renderBrand = (hide) => {
		if (hide) {
			return;
		}

		return (
					<div
						className="branding"
						onClick={ this.showHome }
						aria-label={ this.props.stringList.get("browser-title-empty") }
						onKeyDown={ ADAUtils.handleKeyboard(this.showHome) }
						key="branding"
						tabIndex={ !this.props.allowFocus || this.props.currentLocation === SecondaryMenu.LOCATION_HOME ? -1 : 0 }
					>
						<div className="brand-layout">
							{/* <img className="logo" src={ this.props.useLightStyle ? require("./../../../images/ui/sp-circle-logo-dark.svg") : require("./../../../images/ui/sp-circle-logo-light.svg") }  */}
							<img className="logo" src={ require("./../../../images/ui/sp-circle-logo-light.svg") } 
							alt="Security Planner Logo"/>
							<div className="text">
								{ this.props.stringList.get("browser-title-empty") }
								<div className="publisher">{ this.props.stringList.get("publisher") }</div>
							</div>
						</div>
					</div>
		);
	};

    showShare = (e) => {
		MiniTracker.trackEvent("button", "click", "share");
		this.props.goToPage(this.props.routes.getUriOverlayShare(), true, true);
		e.preventDefault();
	};

    showAbout = (e) => {
		this.closeMenuDelayed();

		MiniTracker.trackEvent("button", "click", "who-we-are");
		this.props.goToPage(this.props.routes.getUriAbout(), true, true);
		e.preventDefault();
	};

    showAllTools = (e) => {
		this.closeMenuDelayed();

		MiniTracker.trackEvent("button", "click", "all-recommendations");
		this.props.goToPage(this.props.routes.getUriAllTools(), true, true);
		e.preventDefault();
	};

    showHome = (e) => {
		this.closeMenuDelayed();

		MiniTracker.trackEvent("button", "click", "home");
		this.props.goToPage(this.props.routes.getUriCover(), true, true);
		e.preventDefault();
	};

    handleMenuToggle = (e) => {
		e.preventDefault();

		this.setState({
			isMenuOpen: !this.state.isMenuOpen,
		});
	};

    closeMenuDelayed = () => {
		// Sort of hacky - we want to close the menu when we click the link, but we don't want to see it.
		setTimeout( function() {
			this.setState({
				isMenuOpen: this.getShouldMenuOpen(),
			});
		}.bind(this), 500);
	};

    onResize = () => {
		this.setState({
			breakpoint: ResizeUtils.getCurrentBreakpoint(),
		});
	};

    state = {
        breakpoint: ResizeUtils.getCurrentBreakpoint(), // string
        isMenuOpen: this.getShouldMenuOpen(), // bool
    };
}

SecondaryMenu.LOCATION_HOME = "home";
SecondaryMenu.LOCATION_ABOUT = "about";
SecondaryMenu.LOCATION_ALL_TOOLS = "all-tools";
SecondaryMenu.LOCATION_ACTION_PLAN = "action-plan";
SecondaryMenu.LOCATION_TERMS = "terms";
SecondaryMenu.LOCATION_FEEDBACK = "feedback";
SecondaryMenu.LOCATION_NOMATCH = "no-match"
SecondaryMenu.LOCATION_PHILOSOPHY = "philosophy"

export default SecondaryMenu;
