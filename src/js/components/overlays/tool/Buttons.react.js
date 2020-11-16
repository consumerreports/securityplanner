import PropTypes from 'prop-types';
import React from "react";

import DetailsButton from "../../common/DetailsButton.react";

import MiniTracker from "../../../vendor/tracking/MiniTracker";

class Buttons extends React.Component {
    static propTypes = {
		tool: PropTypes.object, // Tool
		stringList: PropTypes.object, // StringList
		allowFocus: PropTypes.bool,
		onClose: PropTypes.func,
	};

    render() {
		// Action buttons
		return (
			<div className="buttons">
				{ this.props.tool.buttons.map(button => {
					return (
						<DetailsButton
							key={ "button-" + button.slug }
							href={ button.url }
							allowFocus={ this.props.allowFocus }
							title={ button.caption }
							onClick={ () => this.trackButtonClick(button.url) }
							icon={ require("./../../../../images/ui/external-link.png") }>
							{ button.caption }
						</DetailsButton>
					);
				}) }
			</div>
		);
	}

    trackButtonClick = (url) => {
		MiniTracker.trackEvent("tool", "follow-link", this.props.tool.slug);
		MiniTracker.trackEvent("external-link", "follow", url);
	};
}

export default Buttons;