import PropTypes from 'prop-types';
import React from "react";

import ReactDOM from 'react-dom';

import MiniTracker from "../../../vendor/tracking/MiniTracker";
import DirectionUtils from "./../../../vendor/utils/DirectionUtils";
import ADAUtils from "./../../../vendor/utils/ADAUtils";

import ActionButton from "../../common/ActionButton.react";
import DetailsButton from "../../common/DetailsButton.react";

class FooterShare extends React.Component {
    static propTypes = {
		stringList: PropTypes.object, // StringList
		shareURL: PropTypes.string,
		isFromSharing: PropTypes.bool,
		allowFocus: PropTypes.bool,
		onClickPrint: PropTypes.func,
		onClickToStart: PropTypes.func,
	};

    state = {
        copiedShareURLToClipboard: false,
    };

    render() {
		return (
			<div className={ "footer-share " + DirectionUtils.getClass(this.props.stringList) }>
				<p className="title">{this.props.stringList.get("action-plan-footer-title")}</p>
				<div className="link-wrapper">
					<a
						className="link"
						ref="action-plan-link"
						tabIndex={ this.props.allowFocus ? 0 : -1 }
						href={ this.props.shareURL }
						role="button"
						onKeyDown={ ADAUtils.handleKeyboard((e) => this.copyComponentText(e, "action-plan-link")) }
						onClick={ (e) => this.copyComponentText(e, "action-plan-link") }>
						{ this.props.shareURL }
					</a>
				</div>
				<p className={ "copy-mark" + (this.state.copiedShareURLToClipboard ? "" : " hidden") }>
					{this.props.stringList.get("action-plan-footer-copied")}
					<img src={ require("./../../../../images/ui/checkmark-small-green.svg") } alt=""/>
				</p>
				{ this.props.onClickPrint ?
					<DetailsButton
						className="common-button-details-transparent-dark print-recommendations"
						allowFocus={ this.props.allowFocus }
						title={ this.props.stringList.get("action-plan-footer-print") }
						onClick={ () => this.props.onClickPrint() }>
						{ this.props.stringList.get("action-plan-footer-print") }
					</DetailsButton>
				:
					null
				}
			</div>
		);
	}

    copyComponentText = (event, ref) => {
		const element = ReactDOM.findDOMNode(this.refs[ref]);
		if (element) {
			// Selects everything
			const range = document.createRange();
			range.selectNodeContents(element);

			const selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(range);

			const canCopy = document.queryCommandSupported && document.queryCommandSupported("copy") && document.queryCommandEnabled("copy");

			// Tries to copy
			let success = false;

			if (canCopy) {
				// Use execCommand as expected
				try {
					success = document.execCommand("copy");
				} catch (err) {
					success = false;
				}
			}

			if (!success) {
				if (window.clipboardData) {
					// MSIE
					window.clipboardData.setData("Text", this.shareURL);
					success = true;
				} else {
					// Cannot copy, just select
					element.setSelectionRange(0, 99999);
				}
			}

			if (success) {
				window.getSelection().removeAllRanges();
			}

			if (success) {
				MiniTracker.trackEvent("button", "click", "copy-url");
				event.preventDefault();
			} else {
				MiniTracker.trackEvent("button", "click", "selected-url");
			}

			this.setState(Object.assign({}, this.state, { copiedShareURLToClipboard:success }));
		}
	};

    start = () => {
		MiniTracker.trackEvent("button", "click", "start");
		this.props.onClickToStart();
	};
}

export default FooterShare;