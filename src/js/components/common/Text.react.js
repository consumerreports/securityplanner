import PropTypes from 'prop-types';
import React from "react";

import ReactUtils from "../../vendor/utils/ReactUtils";

class Text extends React.Component {
    static propTypes = {
		className: PropTypes.string,
	};

    state = {
        text: undefined,
    };

    shouldComponentUpdate(nextProps, nextState) {
		if (nextState.text != this.state.text) {
			return true;
		} else {
			return false;
		}
	}

    render() {
		if (!!this.state.text && this.state.text.indexOf("<em>") > -1) {
			// HTML Text
			return (
				<div className={ this.props.className }>
					{ ReactUtils.getReplacedTags(this.state.text, "em", function(innerText) { return <em  data-testid="text-em">{innerText}</em>; }) }
				</div>
			);
		} else {
			// Normal text
			return (
				<div className={ this.props.className } data-testid="text">{this.state.text}</div>
			);
		}
	}
}

export default Text;