import PropTypes from 'prop-types';
import React from "react";

import createReactClass from 'create-react-class';

import SecurityPlannerConstants from "./../../constants/SecurityPlannerConstants";
import SecurityPlannerActions from "./../../actions/SecurityPlannerActions";

import ImageContainer from "./../common/ImageContainer.react";

const ToastMessages = createReactClass({
    displayName: 'ToastMessages',
    firstToastElement: undefined,

    propTypes: {
		stringList: PropTypes.object.isRequired, // StringList
		toasts: PropTypes.arrayOf(PropTypes.object).isRequired,
	},

    componentDidUpdate() {
		if (this.firstToastElement) {
			this.focusTimeout = setTimeout(() => {
				this.firstToastElement.focus();
			}, 0);
		}
	},

    componentWillUnmount() {
		clearTimeout(this.focusTimeout);
		this.focusTimeout = null;
	},

    render: function() {
		if (this.props.toasts.length === 0) return null;

		return (
			<div className="common-toasts">
				<div className="toasts">
					{ this.renderToasts() }
				</div>
			</div>
		);
	},

    renderToasts: function() {
		const timeShow = SecurityPlannerConstants.UI.TOAST_TIME_FADE_IN;
		const timeStay = SecurityPlannerConstants.UI.TOAST_TIME_STAY;
		const timeHide = SecurityPlannerConstants.UI.TOAST_TIME_FADE_OUT;
		const toastStyle = {
			animation: `toast-show ${timeShow}s ease-out backwards, toast-hide ${timeHide}s ${timeShow + timeStay}s ease-out forwards`,
			transition: `bottom ${timeShow}s ease-out`,
		};

		return this.props.toasts.map((toast, index, list) => {
			const setRef = index === 0 ? e => this.firstToastElement = e : null;
			return (
				<div
					className={ "toast toast-" + (list.length - index - 1) + (toast.success ? " success" : " error") }
					style={ toastStyle }
					key={ `${toast.text}--${toast.icon}--${toast.time}` }
					tabIndex={ -1 }
					ref={ setRef }>
					<div className="text">
						{ toast.text }
					</div>
					{ this.renderIcon(toast.icon) }
				</div>
			);
		});
	},

    renderIcon: function(iconType) {
		if (iconType === SecurityPlannerActions.TOAST_ICON_CHECK) {
			return (
				<ImageContainer className="icon" src={ require("./../../../images/ui/checkmark-small-white.svg") }/>
			);
		}

		return null;
	},
});

export default ToastMessages;
