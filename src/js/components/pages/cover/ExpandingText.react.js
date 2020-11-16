import PropTypes from 'prop-types';
import React from "react";

import ADAUtils from "./../../../vendor/utils/ADAUtils";
import ResizeUtils from "./../../../vendor/utils/ResizeUtils";
import ImageContainer from "./../../common/ImageContainer.react";

class ExpandingText extends React.Component {

  static propTypes = {
		caption: PropTypes.string,
		allowFocus: PropTypes.bool,
		onExpanded: PropTypes.func,
	};

	state = {
			breakpoint: ResizeUtils.getCurrentBreakpoint(), // string
			isExpanded: false,
	};

  componentDidMount() {
		window.addEventListener("resize", this.onResize);
	}

  componentWillUnmount() {
		window.removeEventListener("resize", this.onResize);
	}

  render() {
		const isTiny = this.state.breakpoint === "tiny";

		if (this.state.isExpanded || !isTiny) {
			return (
				<div
					className="expanding-text expanded"
					data-testid="expandingText"
					tabIndex={ -1 }>
					{ this.props.children }
				</div>
			)
		} else {
			return (
				<div
					className="expanding-text not-expanded"
					tabIndex={ this.props.allowFocus ? 0 : -1 }
					role="button"
					data-testid="expandingText"
					onKeyDown={ ADAUtils.handleKeyboard(this.onClickExpand) }
					onClick={ this.onClickExpand }>
					{ this.props.caption }
					<ImageContainer className="icon" src={ require("./../../../../images/ui/icon-arrow-down-white.svg") }/>
				</div>
			);
		}
	}

  onResize = () => {
		this.setState({
			breakpoint: ResizeUtils.getCurrentBreakpoint(),
		});
	};

	onClickExpand = () => {
			this.setState({
				isExpanded: true,
			});

			if (this.props.onExpanded) {
				this.props.onExpanded(true);
			}
	};

  contract = () => {
		this.setState({
			isExpanded: false,
		});
	};
}

export default ExpandingText;