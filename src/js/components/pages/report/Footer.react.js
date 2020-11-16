import PropTypes from 'prop-types';
import React from "react";

import FooterShare from "./FooterShare.react";
import FooterDisclaimer from "./FooterDisclaimer.react";

class Footer extends React.Component {
    static propTypes = {
		stringList: PropTypes.object, // StringList
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
		additionalThreatUri: PropTypes.string,
		shareURL: PropTypes.string,
		isFromSharing: PropTypes.bool,
		allowFocus: PropTypes.bool,
		onClickPrint: PropTypes.func,
		onClickToStart: PropTypes.func,
	};

    render() {
		// Finally, return the elements
		return (
			<div className="footer">
				<div className="wrapper">
					<FooterShare { ...this.props } />
					<FooterDisclaimer
						stringList={ this.props.stringList }
						routes={ this.props.routes }
						goToPage={ this.props.goToPage }
						allowFocus={ this.props.allowFocus }
						additionalThreatUri={ this.props.additionalThreatUri }/>
				</div>
			</div>
		);
	}
}

export default Footer;