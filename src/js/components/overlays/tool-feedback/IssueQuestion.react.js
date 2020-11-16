import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";

import SecurityPlannerConstants from "./../../../constants/SecurityPlannerConstants";

import DetailsButton from "./../../common/DetailsButton.react";
import FormFieldText from "./../../common/FormFieldText.react";
import FormFieldCheckbox from "./../../common/FormFieldCheckbox.react";
import FormFieldDisclaimer from "./../../common/FormFieldDisclaimer.react";

import GoogleFormsUtils from "./../../../vendor/utils/GoogleFormsUtils";
import ClickTouchHandler from "./../../../vendor/utils/ClickTouchHandler.js";

class IssueQuestion extends React.Component {
    static propTypes = {
		className: PropTypes.string,
		stringList: PropTypes.object.isRequired, // StringList
		tool: PropTypes.object.isRequired, // Tool
		allowFocus: PropTypes.bool,
		onSuccess: PropTypes.func.isRequired,
		onError: PropTypes.func.isRequired,
	};

    state = {
        answer: undefined,
        problem: "",
        contact: false,
        email: "",
        hasAnswer: false,
        isValid: false,
        isSubmitting: false,
        isEditingText: false,
    };

    uuid = undefined;

    UNSAFE_componentWillMount() {
		this.uuid = `__label_id__${Date.now()}__${Math.round(Math.random() * 100000)}_`;
	}

    componentDidUpdate() {
		this.updateValidityState();
	}

    render() {
		const classNames = cx(this.props.className, {
			"editing-text": this.state.isEditingText,
		});

		return (
			<div className={ classNames }>
				<div className="caption">
					{ this.props.stringList.get("overlay-toolfeedback-question") }
				</div>
				<div className="answers">
					{ this.renderAnswers() }
				</div>
				<div className="common-form">
					<FormFieldText
						title={ this.props.stringList.get("overlay-toolfeedback-field-problem-title") }
						maxLength={ 500 }
						placeholder={ this.props.stringList.get("overlay-toolfeedback-field-problem-placeholder") }
						errorMessage={ this.props.stringList.get("common-feedback-email-error") }
						multiline={ true }
						value={ this.state.problem }
						allowFocus={ this.props.allowFocus }
						onChange={ this.onChangedFieldProblem }
						onGotFocus={ this.onQuestionGotFocus }
						onLostFocus={ this.onQuestionLostFocus }/>
					<FormFieldCheckbox
						caption={ this.props.stringList.get("common-feedback-field-contact-title") }
						name="contact"
						checked={ this.state.contact }
						allowFocus={ this.props.allowFocus }
						onChange={ this.onChangedFieldContact }/>
					<FormFieldText
						ref={ (r) => { this.fieldEmail = r; } }
						title={ this.props.stringList.get("common-feedback-field-email-title") }
						errorMessage={ this.props.stringList.get("common-feedback-email-error") }
						maxLength={ 256 }
						placeholder={ this.props.stringList.get("common-feedback-field-email-placeholder") }
						type="email"
						hidden={ !this.state.contact }
						multiline={ false }
						value={ this.state.email }
						allowFocus={ this.props.allowFocus }
						onChange={ this.onChangedFieldEmail }
						onGotFocus={ this.onQuestionGotFocus }
						onLostFocus={ this.onQuestionLostFocus }/>
					<FormFieldDisclaimer
						caption={ this.props.stringList.get("common-feedback-field-email-disclaimer") }
						hidden={ !this.state.contact }/>
				</div>
				<div className="footer">
					<DetailsButton
						allowFocus={ this.props.allowFocus }
						className={ cx("common-button-details-like-action", "button-submit", { disabled: !this.canSubmit() }) }
						title={ this.props.stringList.get("overlay-toolfeedback-button-submit") }
						onClick={ this.onClickSubmit }>
						{ this.props.stringList.get("overlay-toolfeedback-button-submit") }
					</DetailsButton>
				</div>
			</div>
		);
	}

    renderAnswers = () => {
		return this.getAnswers().map((answer, index) => {
			const touchHandler = new ClickTouchHandler(() => { this.onSelectAnswer(answer); }, true);
			const isSelected = this.state.answer === answer;
			const labelId = this.uuid + "_" + index;
			return (
				<div
					className="answer"
					key={ index }
					tabIndex={ this.props.allowFocus ? 0 : -1 }
					role="radio"
					aria-checked={ isSelected }
					aria-labelledby={ labelId }
					onKeyDown={ touchHandler.handler }
					onClick={ touchHandler.handler }
					onTouchStart={ touchHandler.handler }
					onTouchMove={ touchHandler.handler }
					onTouchEnd={ touchHandler.handler }
					onTouchCancel={ touchHandler.handler }>
					<div className={ "selector " + (isSelected ? "selected" : "") }>
						<div className="inner"/>
					</div>
					<div className="caption">
						<span id={ labelId }>{ answer }</span>
					</div>
				</div>
			);
		});
	};

    getAnswers = () => {
		return this.props.stringList.getArray("overlay-toolfeedback-answers");
	};

    onSelectAnswer = (answer) => {
		this.setState({ answer: answer });
	};

    onChangedFieldProblem = (newValue) => {
		this.setState({ problem: newValue });
	};

    onChangedFieldContact = (newValue) => {
		this.setState({ contact: newValue });
	};

    onChangedFieldEmail = (newValue) => {
		this.setState({ email: newValue });
	};

    onQuestionGotFocus = () => {
		this.setState({ isEditingText: true });
	};

    onQuestionLostFocus = () => {
		this.setState({ isEditingText: false });
	};

    updateValidityState = () => {
		const hasAnswer = Boolean(this.state.answer);
		const isValid = !this.state.contact || this.fieldEmail.isValid();

		if (hasAnswer != this.state.hasAnswer || isValid != this.state.isValid) {
			this.setState({
				hasAnswer: hasAnswer,
				isValid: isValid,
			});
		}
	};

    canSubmit = () => {
		return this.state.hasAnswer && this.state.isValid && !this.state.isSubmitting;
	};

    onClickSubmit = () => {
		if (this.canSubmit()) {
			this.setState({ isSubmitting: true });
			const formData = this.generateFormData();
			GoogleFormsUtils.submit(SecurityPlannerConstants.Content.FEEDBACK_ISSUE_FORM_KEY, formData, this.finishSubmit);
		}
	};

    generateFormData = () => {
		// Based on answers, generate form data to be submitted
		const fields = SecurityPlannerConstants.Content.FEEDBACK_ISSUE_FORM_QUESTIONS_IDS;

		const data = {};
		data[fields[0]] = this.props.tool.slug;
		data[fields[1]] = "(" + (this.getAnswers().indexOf(this.state.answer) + 1) + ") " + this.state.answer;
		data[fields[2]] = this.state.problem;
		data[fields[3]] = this.state.contact ? "Yes" : "No";
		data[fields[4]] = this.state.contact ? this.state.email : "";
		return data;
	};

    finishSubmit = (success, errorMessage) => {
		if (!success) {
			console.warn("Error submitting data. Error message:", errorMessage); // eslint-disable-line
			setTimeout(() => {
				this.setState({ isSubmitting: false });
			}, this.getErrorDisableSubmitTime() * 1000);
			if (this.props.onError) this.props.onError();
		} else {
			if (this.props.onSuccess) this.props.onSuccess();
		}
	};

    getErrorDisableSubmitTime = () => {
		return SecurityPlannerConstants.UI.TOAST_TIME_STAY + SecurityPlannerConstants.UI.TOAST_TIME_FADE_IN + SecurityPlannerConstants.UI.TOAST_TIME_FADE_OUT;
	};
}

export default IssueQuestion;
