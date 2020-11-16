import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";

class FormFieldDisclaimer extends React.Component {
    static propTypes = {
		className: PropTypes.string,
		caption: PropTypes.string.isRequired,
		hidden: PropTypes.bool,
	};

    render() {
		const classes = cx(
			"disclaimer",
			{
				hidden: this.props.hidden,
			},
			this.props.className
		);

		return (
			<div className={ classes }>
				{ this.props.caption }
			</div>
		);
	}
}

export default FormFieldDisclaimer;
