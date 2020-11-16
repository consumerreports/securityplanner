import PropTypes from 'prop-types';
import React from "react";

import FooterDisclaimer from "./../report/FooterDisclaimer.react";

class Footer extends React.Component {
    static propTypes = {
		stringList: PropTypes.object, // StringList
		routes: PropTypes.object, // SecurityPlannerRoutes
		goToPage: PropTypes.func,
		scrollToAThreat: PropTypes.func,
	};

    render() {
		// Finally, return the elements
		return (
			<div className="footer">
				<div className="wrapper">
					<FooterDisclaimer
						stringList={ this.props.stringList }
						routes={ this.props.routes }
						goToPage={ this.props.goToPage }
						additionalThreatUri={ null }
						scrollToAThreat={this.props.scrollToAThreat}/>
				</div>
			</div>
		);
	}
}

export default Footer;
