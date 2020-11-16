import PropTypes from 'prop-types';
import React from "react";

import SecondaryMenu from "../../common/SecondaryMenu.react";

class Header extends React.Component {
    static propTypes = {
		stringList: PropTypes.object, // StringList
		selectedLanguage: PropTypes.object, // Language
		availableLanguages: PropTypes.arrayOf(PropTypes.object), // Language[]
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
		allowFocus: PropTypes.bool,
	};

    render() {
		// Normal header
		return (
			<div className="header">
				<div className="content">
					<SecondaryMenu
						stringList={ this.props.stringList }
						currentLocation={ SecondaryMenu.LOCATION_ALL_TOOLS }
						availableLanguages={ this.props.availableLanguages }
						selectedLanguage={ this.props.selectedLanguage }
						routes={ this.props.routes }
						goToPage={ this.props.goToPage }
						allowFocus={ this.props.allowFocus }
						useLightStyle={ false }
						className="secondary-menu"/>
					<div className="all-tools-wrapper">
						<div className="title">
							{this.props.stringList.get("all-tools-subtitle")}
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Header;