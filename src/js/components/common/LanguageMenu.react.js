import PropTypes from 'prop-types';
import React from "react";
import Bowser from "bowser";
import cx from "classnames";

import ADAUtils from "../../vendor/utils/ADAUtils";
import MiniTracker from "../../vendor/tracking/MiniTracker";
import SecurityPlannerConstants from "./../../constants/SecurityPlannerConstants";

import AppDispatcher from "./../../dispatcher/AppDispatcher";

class LanguageMenu extends React.Component {
    static propTypes = {
		stringList: PropTypes.object, // StringList
		selectedLanguage: PropTypes.object, // Language
		availableLanguages: PropTypes.arrayOf(PropTypes.object), // Language[]
		allowFocus: PropTypes.bool,
	};

    constructor(props) {
        super(props);
        const isTouch = Bowser.ios || Bowser.android;

        this.state = {
			isMenuOpen: false,
			isTouch: isTouch,
		};
    }

    componentWillUnmount() {
		document.body.removeEventListener("click", this.onBodyClick);
	}

    render() {
		const languageClasses = cx({
			"common-language-menu": true,
			["desktop"]: !this.state.isTouch,
			["touch-device"]: this.state.isTouch,
			["is-open"]: this.state.isTouch && this.state.isMenuOpen,
			["is-closed"]: this.state.isTouch && !this.state.isMenuOpen,
			["is-open-by-ada"]: this.state.isMenuOpen,
			["single-language"]: this.props.availableLanguages && Object.keys(this.props.availableLanguages).length === 1,
		});

		const elements = [];

		if (this.props.availableLanguages && this.props.selectedLanguage) {

			// Create list
			// Selected language first
			elements.push(
				<div
					key={ this.props.selectedLanguage.id }
					className="language selected"
					tabIndex={ this.props.allowFocus ? 0 : -1 }
					role="menuitem"
					aria-label={ this.props.stringList.get("common-language-menu-selected") + ' ' + this.props.selectedLanguage.name }
					onKeyDown={ ADAUtils.handleKeyboard(this.toggleMenuOpen) }
					onClick={ this.onClickSelectedLanguage }>
					<a>
						<span className="name">{ this.props.selectedLanguage.name }</span>
					</a>
				</div>
			);

			// All other languages after
			for (const key in this.props.availableLanguages) {
				const language = this.props.availableLanguages[key];
				if (language != this.props.selectedLanguage) {
					const url = SecurityPlannerConstants.UI.ALLOW_HOT_LANGUAGE_SWAP ? undefined : this.props.stringList.get("common-url-home-language").split("[[language]]").join(language.id);
					elements.push(
						<div
							key={ key }
							className="language not-selected"
							tabIndex={ this.state.isMenuOpen && this.props.allowFocus ? 0 : -1 }
							aria-label={ this.props.stringList.get("common-language-menu-available") + ' ' + language.name }
							role="menuitem"
							onKeyDown={ ADAUtils.handleKeyboard(() => this.onClickLanguage(language)) }
							onClick={ () => this.onClickLanguage(language) }>
							<a href={ url }>
								<span className="name">{ language.name }</span>
							</a>
						</div>
					);
				}
			}
		} else {
			// No languages yet
			elements.push(<div key="loading" className="language loading">Loading languages...</div>);
		}

		// Finally, return the elements
		return (
			<div className={ languageClasses } role="menu">
				{ elements }
			</div>
		);
	}

    toggleMenuOpen = () => {
		if (!this.state.isMenuOpen) {
			this.openMenu();
		} else {
			this.closeMenu();
		}
	};

    onClickLanguage = (language) => {
		MiniTracker.trackEvent("language", "change", language.id);

		if (SecurityPlannerConstants.UI.ALLOW_HOT_LANGUAGE_SWAP) {
			AppDispatcher.dispatch({
				actionType: SecurityPlannerConstants.Actions.CHANGE_LANGUAGE,
				languageId: language.id,
				languageDir: language.direction,
			});

			this.closeMenu();
		}
	};

    onClickSelectedLanguage = () => {
		if (this.state.isTouch) {
			this.toggleMenuOpen();
		}
	};

    onBodyClick = (e) => {
		const el = e.target;
		const isLanguage = el.classList.contains("name");

		if (!isLanguage) {
			this.closeMenu();
		}
	};

	handleKeyPress = (event) => {
		if (event.key == "Escape") {
			this.closeMenu();
		}
	}

    openMenu = () => {
		document.body.addEventListener("click", this.onBodyClick);
		document.body.addEventListener("keydown", this.handleKeyPress);
		this.setState({
			isMenuOpen: true,
		});
	};

    closeMenu = () => {
		document.body.removeEventListener("click", this.onBodyClick);
		document.body.removeEventListener("click", this.handleKeyPress);
		this.setState({
			isMenuOpen: false,
		});
	};
}

export default LanguageMenu;