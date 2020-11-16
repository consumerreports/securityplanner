import PropTypes from 'prop-types';
import React from "react";

class ImageContainer extends React.Component {
    static propTypes = {
		className: PropTypes.string,
		style: PropTypes.object,
		src: PropTypes.string.isRequired,
		description: PropTypes.string,
	};

    getStyle = () => {
		return Object.assign({}, this.props.style || {}, {
			backgroundRepeat: "no-repeat",
			backgroundPosition: "center",
			backgroundImage: "url(" + this.props.src + ")",
		});
	};

    render() {
		return (
			<div
				className={ "common-image-container " + (this.props.className || "") }
				style={ this.getStyle() }
				title={ this.props.description ? this.props.description : "" }
				data-testid={ this.props.dataTestId || null }/>
		);
	}
}

export default ImageContainer;
