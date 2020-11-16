import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";

import ImageContainer from "./../../common/ImageContainer.react";
import DetailsButton from "./../../common/DetailsButton.react";

class Results extends React.Component {
    static propTypes = {
		stringList: PropTypes.object, // StringList
		success: PropTypes.bool,
		visible: PropTypes.bool,
		allowFocus: PropTypes.bool,
		onClose: PropTypes.func,
	};

    render() {
		const classNamesBody = cx("tab-body", {
			visible: this.props.visible,
		});

		const classNamesResults = cx("results", {
			success: this.props.success,
			error: !this.props.success,
		});

		const message = this.props.stringList.get(this.props.success ? "feedback-general-results-success-message" : "feedback-general-results-error-message");
		const buttonCaption = this.props.stringList.get(this.props.success ? "feedback-general-results-button-close" : "feedback-general-results-button-back");
		const onButtonClick = this.props.success ? this.props.onClose : this.props.onBack;

		return (
			<div className={ classNamesBody } style={ { overflow: "visible" } }>
				<div className={ classNamesResults }>
					<div className="message">
						{ message }
					</div>
					<DetailsButton
						className="common-button-details-like-action button-close"
						allowFocus={ this.props.allowFocus && this.props.visible }
						onClick={ onButtonClick }>
						{ buttonCaption }
					</DetailsButton>
					<ImageContainer className="check" src={ require("./../../../../images/page-feedback/check-large.png") }/>
				</div>
			</div>
		);
	}
}

export default Results;