import PropTypes from 'prop-types';
import React from "react";

class Footer extends React.Component {
    static propTypes = {
		stringList: PropTypes.object,
		toolsHash: PropTypes.string,
	};

    render() {
		return (
			<div className="footer">
				<div className="prefix">
					{ this.props.stringList.get("action-plan-print-header-citizen-prefix") }
				</div>
				<div className="logo">
					<img src={ require("./../../../../images/sponsors/citizenlab-grayscale.png") } alt="The Citizen Lab"/>
				</div>
				<div className="prefix"/>
				<div className="logo">
					<img src={ require("./../../../../images/sponsors/jigsaw-grayscale.png") } alt="Jigsaw"/>
				</div>
			</div>
		);
	}
}

export default Footer;
