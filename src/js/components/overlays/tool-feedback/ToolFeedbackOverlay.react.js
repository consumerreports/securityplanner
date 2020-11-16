import PropTypes from 'prop-types';
import React from "react";
import createReactClass from 'create-react-class';
import cx from "classnames";

import ADAUtils from "./../../../vendor/utils/ADAUtils";
import PageSectionHelper from "./../../../vendor/utils/PageSectionHelper";
import DirectionUtils from "./../../../vendor/utils/DirectionUtils";
import WindowScrollUtils from "./../../../vendor/utils/WindowScrollUtils";

import SecurityPlannerActions from "./../../../actions/SecurityPlannerActions";

import IssueQuestion from "./IssueQuestion.react";

const ToolFeedbackOverlay = createReactClass({
    displayName: 'ToolFeedbackOverlay',
    helper: undefined,

    propTypes: {
		stringList: PropTypes.object, // StringList
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
		tool: PropTypes.object, // Tool
		scrollPosition: PropTypes.number,
		onClickClose: PropTypes.func,
	},

    getInitialState: function() {
		return {
			visible: false,
			showing: false,
			hiding: false,
		};
	},

    UNSAFE_componentWillMount: function() {
		this.helper = new PageSectionHelper(this);
	},

    componentDidMount: function() {
		this.helper.setComponent(this.refs.scroller);

		// Hack with timeout to focus element in IE
		this.focusTimeout = setTimeout(() => {
			this.titleElement.focus();
		}, 0);
	},

    componentDidUpdate: function() {
		this.helper.setComponent(this.refs.scroller);
		this.helper.forceCheck();
	},

    componentWillUnmount: function() {
		this.helper.destroy();

		clearTimeout(this.focusTimeout);
		this.focusTimeout = null;
	},

    render: function() {
		const classes = cx({
			"overlay-simple": true,
			"overlayToolFeedback": true,
			"hidden": !this.state.visible,
			"showing": this.state.showing,
			"hiding": this.state.hiding,
		}, DirectionUtils.getClass(this.props.stringList));

		// TODO: this is better because it causes overlays to be position:absolute rather than the faulty fixed
		// TODO: maybe make other overlays behave like this?
		const scrollY = WindowScrollUtils.getWindowScrollY(true);
		const style = {
			height: this.helper.getWindowHeight(),
			top: `${scrollY}px`,
			position: "absolute",
		};

		// This is the only overlay that needs this however.
		requestAnimationFrame(() => {
			if (WindowScrollUtils.getWindowScrollY(true) !== scrollY) {
				this.forceUpdate();
			}
		});

		return (
			<div
				className={ classes }
				aria-hidden={ !this.helper.isActive() }
				style={ style }>
				<div className="background cover"/>
				<div className="content" ref="scroller">
					<div
						className="wrapper"
						style={ { minHeight: this.helper.getMinScrollableHeight() } }>
						<div
							className="close"
							tabIndex={ this.helper.isActive() ? 0 : -1 }
							role="button"
							onKeyDown={ ADAUtils.handleKeyboard(this.close) }
							onClick={ this.close }>
							<img
								className="show-fading"
								src={ require("./../../../../images/ui/blue-back-arrow.svg") }
								alt=""/>
							{ this.props.stringList.get("common-ui-back") }
						</div>
						<div className="body">
							<div
								className="title accessibility-element-yellow"
								tabIndex={ -1 }
								aria-label={ this.props.stringList.get("overlay-toolfeedback-title") }
								ref={ e => this.titleElement = e }>
								{ this.props.stringList.get("overlay-toolfeedback-title") }
							</div>
							<IssueQuestion
								className="question"
								stringList={ this.props.stringList }
								tool={ this.props.tool }
								allowFocus={ this.helper.isActive() }
								onSuccess={ this.onSubmitSuccess }
								onError={ this.onSubmitError }/>
						</div>
					</div>
				</div>
			</div>
		);
	},

    /**
	 * Ran when the section becomes the focused section
	 */
    onActivate: function(travelOffset, viaHistoryAPI) {
		this.helper.onActivate(travelOffset, viaHistoryAPI);
	},

    /**
	 * Ran when the section is about to lose focus
	 */
    onDeactivate: function(travelOffset, viaHistoryAPI) {
		this.helper.onDeactivate(travelOffset, viaHistoryAPI);
	},

    startTransitionShow: function(callback) {
		this.setState({ visible:false, showing:true, hiding:false });

		requestAnimationFrame(callback);

		setTimeout(() => {
			if (this.state.showing) {
				this.setState({ visible:true, showing:false, hiding:false });

				document.body.style.top = `-${this.props.scrollPosition}px`;
				document.body.style.marginTop = `${this.props.scrollPosition}px`;
				document.body.style.height = `${window.innerHeight}px`;
				document.body.style.overflow = "hidden";
			}
		}, 630);
	},

    startTransitionHide: function(callback) {
		this.setState({ visible:true, showing:false, hiding:true });

		document.body.style.top = "";
		document.body.style.marginTop = "";
		document.body.style.height = "";
		document.body.style.overflow = "";

		setTimeout(() => {
			callback();
		}, 630);
	},

    close: function() {
		if (this.props.onClickClose) this.props.onClickClose();
	},

    onQuestionGotFocus: function() {
		this.setState({ isEditingText: true });
	},

    onQuestionLostFocus: function() {
		this.setState({ isEditingText: false });
	},

    onSubmitSuccess: function() {
		SecurityPlannerActions.showToastNotification(this.props.stringList.get("overlay-toolfeedback-results-success-message"), true, SecurityPlannerActions.TOAST_ICON_CHECK);
		this.close();
	},

    onSubmitError: function() {
		SecurityPlannerActions.showToastNotification(this.props.stringList.get("overlay-toolfeedback-results-error-message"), false);
	},
});

export default ToolFeedbackOverlay;
