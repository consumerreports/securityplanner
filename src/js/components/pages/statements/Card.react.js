import PropTypes from 'prop-types';
import React from "react";

import ClickTouchHandler from "./../../../vendor/utils/ClickTouchHandler.js";

class Card extends React.Component {
    static propTypes = {
		onClick: PropTypes.func,
		className: PropTypes.string,
		text: PropTypes.string,
		isSelected: PropTypes.bool,
		image: PropTypes.string,
		isEmpty: PropTypes.bool,
		allowFocus: PropTypes.bool,
		backgroundColor: PropTypes.number,
	};

    UNSAFE_componentWillMount() {
		this.touchHandler = new ClickTouchHandler(this.props.onClick, true);
	}

    componentWillUnmount() {
		this.touchHandler.dispose();
	}

    render() {
		if (this.props.isEmpty) {
			return (
				<div className={ this.props.className + " is-disabled" }/>
			);
		} else {
			const selectorStyle = { backgroundColor: "#" + (this.props.backgroundColor ? this.props.backgroundColor.toString(16) : "333333") };

			const imgStyle = {
				backgroundRepeat: "no-repeat",
				backgroundImage: "url(" + this.props.image + ")",
			};

			return (
				<div
					className={ this.props.className + (this.props.isSelected ? " is-selected" : "") }
					tabIndex={ this.props.allowFocus ? 0 : -1 }
					role="checkbox"
					title={ this.props.text }
					aria-label={ this.props.text }
					aria-checked={ this.props.isSelected }
					onKeyDown={ this.touchHandler.handler }
					onClick={ this.touchHandler.handler }
					onTouchStart={ this.touchHandler.handler }
					onTouchMove={ this.touchHandler.handler }
					onTouchEnd={ this.touchHandler.handler }
					onTouchCancel={ this.touchHandler.handler }>
					<div className="selector" style={ selectorStyle }/>
					<div
						className="common-image-container image"
						style={ imgStyle }
						title={ this.props.text }/>
					<div className="caption">
						{ this.props.text }
					</div>
					<div className="check"/>
				</div>
			);
		}
	}
}

export default Card;
