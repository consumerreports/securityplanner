import PropTypes from 'prop-types';
import React from "react";
import ClickTouchHandler from "./../../vendor/utils/ClickTouchHandler.js";
import ADAUtils from "./../../vendor/utils/ADAUtils";

import ImageContainer from "./ImageContainer.react";

class DetailsButton extends React.Component {
    static propTypes = {
		onClick: PropTypes.func,
		className: PropTypes.string,
		icon: PropTypes.string,
		href: PropTypes.string,
		allowFocus: PropTypes.bool,
		title: PropTypes.string,
	};

    componentWillUnmount() {
		this.touchHandler.dispose();
	}

    render() {
		this.touchHandler = new ClickTouchHandler(this.onClickSelf, !this.props.href);

		if (this.props.href) {
			return (
				<a
					href={ this.props.href }
					target={ this.props.href ? "_blank" : undefined }
					className={ "common-button-details" + (this.props.className ? " " + this.props.className : "") }
					tabIndex={ this.props.allowFocus ? 0 : -1 }
					role="button"
					title={ this.props.title }
					data-testid="common-button-details"
					aria-label={ this.props.title }
					onKeyDown={ this.touchHandler.handler }
					onClick={ this.touchHandler.handler }
					onTouchStart={ this.touchHandler.handler }
					onTouchMove={ this.touchHandler.handler }
					onTouchEnd={ this.touchHandler.handler }
					onTouchCancel={ this.touchHandler.handler }>
					<div>
						{ this.props.children }
						{ this.props.icon ? <ImageContainer src={ this.props.icon } className="icon"/> : null }
					</div>
				</a>
			);
		} else {
			return (
				<button
					className={ "common-button-details" + (this.props.className ? " " + this.props.className : "") }
					tabIndex={ this.props.allowFocus ? 0 : -1 }
					role="button"
					title={ this.props.title }
					onKeyDown={ this.props.changeTabSequence ? ADAUtils.handleKeyboard(this.onClickSelf, false, this.handleTabSequence) :  this.touchHandler.handler }
					onClick={ this.touchHandler.handler }
					onTouchStart={ this.touchHandler.handler }
					onTouchMove={ this.touchHandler.handler }
					onTouchEnd={ this.touchHandler.handler }
					onTouchCancel={ this.touchHandler.handler }
					data-testid={ this.props.dataTestId }>
					<div>
						{ this.props.children }
						{ this.props.icon ? <ImageContainer src={ this.props.icon } className="icon"/> : null }
					</div>
				</button>
			);
		}
	}

	handleTabSequence = (e) => {
		if (!e.shiftKey) {
			this.props.changeTabSequence(e);
			e.preventDefault();
		}
	}

    onClickSelf = (e) => {
		if (this.props.onClick) {
			return this.props.onClick(e);
		}
	};
}

export default DetailsButton;
