import PropTypes from 'prop-types';
import React from "react";
import createReactClass from 'create-react-class';
import cx from "classnames";

import DetailsButton from "./../../common/DetailsButton.react";
import FormFieldText from "./../../common/FormFieldText.react";
import FormFieldCheckbox from "./../../common/FormFieldCheckbox.react";
import FormFieldDisclaimer from "./../../common/FormFieldDisclaimer.react";

import ADAUtils from "./../../../vendor/utils/ADAUtils";

const WriteQuestion = createReactClass({
    displayName: 'WriteQuestion',
    prevValue: {},

    propTypes: {
		index: PropTypes.number,
		numQuestions: PropTypes.number,
		caption: PropTypes.string,
		stringList: PropTypes.object, // StringList
		hasDivider: PropTypes.bool,
		isExpanded: PropTypes.bool,
		allowFocus: PropTypes.bool,
		onRequestExpand: PropTypes.func, // index
		onChange: PropTypes.func, // index, value
		onGotFocus: PropTypes.func,
		onLostFocus: PropTypes.func,
		canSubmit: PropTypes.bool,
		onSubmit: PropTypes.func,
		value: PropTypes.object, // { comment: string, contact: boolean, email: string }
	},

    componentDidUpdate: function() {
		const newValue = {
			comment: this.getComment(),
			contact: this.getContact(),
			email: this.getEmail(),
		};

		if (newValue.comment !== this.prevValue.comment || newValue.contact !== this.prevValue.contact || newValue.email !== this.prevValue.email) {
			if (this.props.onUpdateValidity) {
				this.props.onUpdateValidity(this.props.index, this.hasAnswer(), this.isValid());
			}
			this.prevValue = newValue;
		}
	},

    render: function() {
		const classNames = cx("question", "write", {
			expanded: this.props.isExpanded,
			["is-single"]: this.props.numQuestions === 1,
		});

		return (
			<div className={ classNames }>
				<div
					className="header"
					tabIndex={ this.props.allowFocus && !this.props.isExpanded ? 0 : -1 }
					role="button"
					onKeyDown={ ADAUtils.handleKeyboard(this.onClickTab) }
					onClick={ this.onClickTab }>
					<div className="number">
						{ (this.props.index + 1) + "." }
					</div>
					<div className="caption">
						<span>{ this.props.caption }</span>
					</div>
				</div>
				<div className={ cx("collapsible-body-outer", { expanded: this.props.isExpanded }) }>
					<div className="collapsible-body-inner">
						<div className="common-form">
							<FormFieldText
								title={ this.props.stringList.get("feedback-general-both-comments-field-comments-title") }
								maxLength={ 500 }
								placeholder={ this.props.stringList.get("feedback-general-both-comments-field-comments-placeholder") }
								multiline={ true }
								value={ this.getComment() }
								allowFocus={ this.props.isExpanded && this.props.allowFocus }
								onChange={ this.onChangedFieldComment }
								onGotFocus={ this.props.onGotFocus }
								onLostFocus={ this.props.onLostFocus }/>
							<FormFieldCheckbox
								caption={ this.props.stringList.get("common-feedback-field-contact-title") }
								name="contact"
								checked={ this.getContact() }
								allowFocus={ this.props.isExpanded && this.props.allowFocus }
								onChange={ this.onChangedFieldContact }/>
							<FormFieldText
								ref={ (r) => { this.fieldEmail = r; } }
								title={ this.props.stringList.get("common-feedback-field-email-title") }
								errorMessage={ this.props.stringList.get("common-feedback-email-error") }
								maxLength={ 256 }
								placeholder={ this.props.stringList.get("common-feedback-field-email-placeholder") }
								type="email"
								hidden={ !this.getContact() }
								multiline={ false }
								value={ this.getEmail() }
								allowFocus={ this.props.isExpanded && this.props.allowFocus }
								onChange={ this.onChangedFieldEmail }
								onGotFocus={ this.props.onGotFocus }
								onLostFocus={ this.props.onLostFocus }/>
							<FormFieldDisclaimer
								caption={ this.props.stringList.get("common-feedback-field-email-disclaimer") }
								hidden={ !this.getContact() }/>
						</div>
						<div className="footer">
							<DetailsButton
								allowFocus={ this.props.isExpanded && this.props.allowFocus }
								className={ cx("common-button-details-like-action", "button-submit", { disabled: !this.props.canSubmit }) }
								title={ this.props.stringList.get("feedback-general-both-button-submit") }
								dataTestId={ this.props.isExpanded ? "write-feedback-submit" : null }
								onClick={ this.onClickSubmit }>
								{ this.props.stringList.get("feedback-general-both-button-submit") }
							</DetailsButton>
						</div>
					</div>
				</div>
				<div className={ cx("divider", { visible: this.props.hasDivider }) }/>
			</div>
		);
	},

    onClickTab: function() {
		if (this.props.onRequestExpand) this.props.onRequestExpand(this.props.index);
	},

    onClickCard: function(value) {
		if (this.props.onChange) {
			this.props.onChange(this.props.index, value);
			setTimeout(() => this.onClickSkip(), 800);
		}
	},

    onClickSubmit: function() {
		if (this.props.onSubmit) this.props.onSubmit();
	},

    getComment: function() {
		return this.props.value ? this.props.value.comment : "";
	},

    getContact: function() {
		return Boolean(this.props.value && this.props.value.contact);
	},

    getEmail: function() {
		return this.props.value ? this.props.value.email : "";
	},

    hasAnswer() {
		return Boolean(this.getComment());
	},

    isValid: function() {
		return (!this.getContact() || this.fieldEmail.isValid());
	},

    onChangedFieldContact: function(newValue) {
		this.setValue({ contact: newValue });
	},

    onChangedFieldComment: function(newValue) {
		this.setValue({ comment: newValue });
	},

    onChangedFieldEmail: function(newValue) {
		this.setValue({ email: newValue });
	},

    setValue: function(changes) {
		if (this.props.onChange) {
			const oldValue = this.props.value ? this.props.value : {
				comment: "",
				contact: false,
				email: "",
			};
			const newValue = Object.assign({}, oldValue, changes);
			this.props.onChange(this.props.index, newValue);
		}
	},
});

export default WriteQuestion;