import PropTypes from 'prop-types';
import React from "react";
import ClickTouchHandler from "./../../vendor/utils/ClickTouchHandler.js";

class ActionButton extends React.Component {
    static propTypes = {
		onClick: PropTypes.func,
		className: PropTypes.string,
		allowFocus: PropTypes.bool,
		title: PropTypes.string,
	};
		
    componentWillUnmount() {
		this.touchHandler.dispose();
	}

    render() {
		this.touchHandler = new ClickTouchHandler(this.onClickSelf, true);

		return (
			<div
				className={ "common-button-action" + (this.props.className ? " " + this.props.className : "") }
				tabIndex={ this.props.allowFocus ? 0 : -1 }
				aria-hidden={ !this.props.allowFocus }
				role="button"
				title={ this.props.title }
				aria-label={ this.props.title }
				onKeyDown={ this.touchHandler.handler }
				onClick={ this.touchHandler.handler }
				onTouchStart={ this.touchHandler.handler }
				onTouchMove={ this.touchHandler.handler }
				onTouchEnd={ this.touchHandler.handler }
				onTouchCancel={ this.touchHandler.handler }>
				<div className="text">{this.props.children}</div>
				<div className="icon"><img src={ require("./../../../images/ui/icon-button-arrow-down.svg") } alt="Arrow down icon"/></div>
			</div>
		);
	}

    onClickSelf = (e) => {
		e.preventDefault();
		if (this.props.onClick) {
			this.props.onClick(e);
		}
	};
}

export default ActionButton;