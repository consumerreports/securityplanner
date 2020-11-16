import { clamp } from "moremath";
import PropTypes from 'prop-types';
import React from "react";

import SecurityPlannerConstants from "./../../../constants/SecurityPlannerConstants";
import DirectionUtils from "./../../../vendor/utils/DirectionUtils";
import ReactUtils from "./../../../vendor/utils/ReactUtils";
import ImageContainer from "./../../common/ImageContainer.react";
import ADAUtils from "../../../vendor/utils/ADAUtils";

class Header extends React.Component {
    static propTypes = {
		stringList: PropTypes.object, // StringList
		title: PropTypes.string,
		onClickedPrint: PropTypes.func,
	};

    componentWillUnmount() {
		clearTimeout(this.focusTimeout);
		this.focusTimeout = null;
	}

    render() {
		// Finally, render the elements
		return (
			<div className="header no-padding-top-when-shared">
				{ this.props.onClickedPrint ? this.renderPrintButton() : null }
			</div>
		);
	}

    renderTitle = () => {
		const title = this.props.title ? ReactUtils.getReplacedTags(this.props.title, "em", function(innerText) { return <em>{innerText}</em>; }) : undefined;

		return (
			<div key="title" className="common-section-title">
				<div key="text">{title}</div>
			</div>
		);
	};

    renderPrintButton = () => {
		return (
			<div className={ "print-button " + DirectionUtils.getClass(this.props.stringList) }
				onClick={ this.props.onClickedPrint }
				tabIndex={ "0" }
				title={ this.props.stringList.get("print-button-label") }
				aria-label={ this.props.stringList.get("print-button-label") }
				onKeyDown={ ADAUtils.handleKeyboard(() => { this.props.onClickedPrint(); }) }
			>
				<ImageContainer className="icon dark"
					src={ require("./../../../../images/ui/print-dark.svg") }/>
			</div>
		);
	};
}

export default Header;
