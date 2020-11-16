import PropTypes from 'prop-types';
import React from "react";

import ReactDOM from 'react-dom';

import createReactClass from 'create-react-class';

const CircularBar = createReactClass({
    displayName: 'CircularBar',

    propTypes: {
		color: PropTypes.number,
		value: PropTypes.number, // 0-1
	},

    componentDidMount: function() {
		this.redraw();
		window.addEventListener("resize", this.onResize);
		window.addEventListener("orientationchange", this.onOrientationChange);
	},

    componentDidUpdate: function() {
		this.redraw();
	},

    componentWillUnmount: function() {
		window.removeEventListener("resize", this.onResize);
		window.removeEventListener("orientationchange", this.onResize);
	},

    render: function() {
		return (
			<div className="circularBar">
				<canvas />
			</div>
		);
	},

    redraw: function() {
		if (this.isMounted()) {
			const element = ReactDOM.findDOMNode(this);

			if (element) {
				const dimensions = element.parentElement.parentElement.offsetWidth;

				const canvasElement = element.querySelector("canvas");
				canvasElement.width = canvasElement.height = dimensions;

				const context = canvasElement.getContext("2d");

				const radius = dimensions / 2;
				const radiusInside = radius * 0.85;

				context.globalAlpha = 1;

				// Full circle
				context.beginPath();
				context.fillStyle = "#e7e7e7";
				context.arc(radius, radius, radius, 0, Math.PI * 2, false);
				context.arc(radius, radius, radiusInside, Math.PI * 2, 0, true);
				context.fill();

				// Colored circle
				const rotationAngle = - Math.PI * 0.5;
				const startAngle = Math.PI * 2 * (1 - this.props.value);
				context.beginPath();
				context.fillStyle = "#" + this.props.color.toString(16);
				context.arc(radius, radius, radius, rotationAngle, Math.PI * 2 + rotationAngle - startAngle, false);
				context.arc(radius, radius, radiusInside, Math.PI * 2 + rotationAngle - startAngle, rotationAngle, true);
				context.fill();

				// his._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
				// return this._drawBackground();
			} else {
				console.log("no element found"); // eslint-disable-line no-console
			}
		}
	},

    onResize: function() {
		this.redraw();
	},

    onOrientationChange: function() {
		// Dirty, dirty hack because of the way widths are calculated on orientation change.
		window.setTimeout( function() {
			this.onResize();
		}.bind(this), 200);
	},
});

export default CircularBar;