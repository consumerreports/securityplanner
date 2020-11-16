import PropTypes from 'prop-types';
import React from "react";

import cx from "classnames";

class FormFieldCheckbox extends React.Component {
    static propTypes = {
		className: PropTypes.string,
		caption: PropTypes.string.isRequired,
		hidden: PropTypes.bool,
		name: PropTypes.string,
		checked: PropTypes.bool.isRequired,
		allowFocus: PropTypes.bool,
		onChange: PropTypes.func,
	};

    uuid = undefined;

    UNSAFE_componentWillMount() {
		this.uuid = `__label_id__${Date.now()}__${Math.round(Math.random() * 100000)}_`;
	}

    render() {
		const classes = cx(
			"checkbox",
			{
				hidden: this.props.hidden,
			},
			this.props.className
		);

		return (
			<div className={ classes }>
				<input
					type="checkbox"
					className="input"
					role="checkbox"
					name={ this.props.name }
					value={ this.props.name }
					tabIndex={ this.props.allowFocus ? 0 : -1 }
					checked={ this.props.checked }
					aria-checked={ this.props.checked }
					aria-labelledby={ this.uuid }
					onChange={ this.onChange }/>
				<span
					id={ this.uuid }
					className="caption"
					onClick={ this.onChange }>
					{ this.props.caption }
				</span>
			</div>
		);
	}

    onChange = (e) => { // eslint-disable-line no-unused-vars
		const newValue = !this.props.checked; // e.target.checked;
		if (this.props.onChange) this.props.onChange(newValue);
	};
}

export default FormFieldCheckbox;
