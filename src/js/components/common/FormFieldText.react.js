import React from "react";
import PropTypes from 'prop-types';

import cx from "classnames";

class FormFieldText extends React.Component {
	state = {
		showErrorMessage: false,
		showInvalidEmail: false
	}

    static propTypes = {
		className: PropTypes.string,
		title: PropTypes.string.isRequired,
		placeholder: PropTypes.string.isRequired,
		multiline: PropTypes.bool.isRequired,
		hidden: PropTypes.bool,
		maxLength: PropTypes.number,
		type: PropTypes.string,
		value: PropTypes.string.isRequired,
		allowFocus: PropTypes.bool,
		onChange: PropTypes.func,
		onGotFocus: PropTypes.func,
		onLostFocus: PropTypes.func,
	};

    render() {
		const classes = cx(
			"field",
			{
				["multi-line"]: this.props.multiline,
				["single-line"]: !this.props.multiline,
				hidden: this.props.hidden,
				invalid: this.state.showErrorMessage || this.state.showInvalidEmail && !this.isValid(),
			},
			this.props.className
		);

		return (
			<div className={ classes }>
				<label className="title" htmlFor="comment-text-input">
					{ this.props.title}
				</label>
				{ this.renderField() }
				{ this.state.showErrorMessage ? this.renderErrorMessage() : null }
			</div>
		);
	}

	// SP-Patches Add a field in Contentful to source text for this error message
	renderErrorMessage() {
		return (
			<div className="invalid-input-message" data-testid="email-validation-message">
				<p>{ this.props.errorMessage }</p>
			</div>
		)
	}

    renderField = () => {
		if (this.props.multiline) {
			return (
				<textarea
					className="input"
					maxLength={ this.props.maxLength }
					type={ this.props.type || "text" }
					value={ this.props.value }
					tabIndex={ this.props.allowFocus ? 0 : -1 }
					role="textbox"
					aria-multiline="true"
					onChange={ this.onChange }
					onFocus={ this.onFocus }
					onBlur={ this.onBlur }
					id="comment-text-input"
					data-testid={ this.props.allowFocus ? "current-textarea" : null }
					placeholder={ this.props.placeholder }/>
			);
		} else {
			return (
				<input
					className="input"
					maxLength={ this.props.maxLength }
					type={ this.props.type || "text" }
					value={ this.props.value }
					tabIndex={ this.props.allowFocus ? 0 : -1 }
					role="textbox"
					aria-multiline="false"
					onChange={ this.onChange }
					onFocus={ this.onFocus }
					onBlur={ this.onBlur }
					id="comment-text-input"
					placeholder={ this.props.placeholder }/>
			);
		}
	};

    onChange = (e) => {
		if (this.state.showErrorMessage && this.isValid()) this.setState({ showErrorMessage: false, showInvalidEmail: true })

		const newValue = e.target.value;
		if (this.props.onChange) this.props.onChange(newValue);
	};

    onFocus = () => {
		if (this.props.onGotFocus) this.props.onGotFocus();
	};

    onBlur = () => {
		this.setState({ showErrorMessage: !this.isValid() })
		if (this.props.onLostFocus) this.props.onLostFocus();
	};

    isValid = () => {
		if (this.props.type === "email") {
			const rgx = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
			return rgx.test(this.props.value);
		} else {
			return true;
		}
	};
}

export default FormFieldText;
