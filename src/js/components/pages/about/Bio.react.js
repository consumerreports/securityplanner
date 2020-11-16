import PropTypes from 'prop-types';
import React from "react";

import ReactDOM from 'react-dom';

import createReactClass from 'create-react-class';

import ADAUtils from "./../../../vendor/utils/ADAUtils";
import PageUtils from "./../../../vendor/utils/PageUtils";

const Bio = createReactClass({
    displayName: 'Bio',

    // Pre-calculated duotone gradient color range
    duotoneGradient: null,

    propTypes: {
		bio: PropTypes.object, // Bio object
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
		allowFocus: PropTypes.bool,
	},

    componentDidMount() {
		this.createDuotoneImage(this.originalImage);
	},

    render() {
		const {
			name,
			organization,
			image,
			label,
		} = this.props.bio;

		return (
			<button
				className={ "bio" + (PageUtils.isTouchDevice() ? " mobile" : " desktop") }
				tabIndex={ this.props.allowFocus ? 0 : -1 }
				title={ name }
				aria-label={ name }
				role="link"
				onKeyDown={ ADAUtils.handleKeyboard(this.showOverlay) }
				onClick={ this.showOverlay }>
				<div className="image-wrapper">
					<img className="original-image"
						src={ image }
						alt={ name }
						ref={ (n) => this.originalImage = n }/>
					<div className="processed-image"
						data-testid="bio-canvas-container"
						ref={ (n) => this.canvasContainer = n }>
						<canvas/>
					</div>
					{ label ?
						<div className="label">{ label }</div> : null }
				</div>
				<div className="content">
					<div className="name">{ name }</div>
					<div className="organization">{ organization }</div>
				</div>
			</button>
		);
	},

    showOverlay() {
		this.props.goToPage(this.props.routes.getUriOverlayBio(this.props.bio.slug), true, true);
	},

    createDuotoneImage(image) {
		const original = new Image();
		original.crossOrigin = "";
		original.src = image.src;

		original.onload = function() {
			const gradientImage = new Image();
			gradientImage.src = require("./../../../../images/bio/gradient.png");
			// Two-step process: first get the gradient map image.
			// Second, apply the gradient image as an overlay.
			// Use this result as our original image source.
			gradientImage.onload = function() {
				window.requestIdleCallback(() => {
					if (this.canvasContainer) {
						const duotoneCanvas = this.getDuotoneCanvas(original);
						this.addGradientOverlay(duotoneCanvas, gradientImage);
						ReactDOM.findDOMNode(this).className += " loaded";
					}
				});
			}.bind(this);
		}.bind(this);
	},

    /**
	 * Given an original rgb image, return a canvas element containing a duotone version of it
	 */
    getDuotoneCanvas(image) {
		const canvas = this.canvasContainer.querySelector("canvas");
		canvas.width = image.width;
		canvas.height = image.height;
		const ctx = canvas.getContext("2d");

		// Draw the image on the canvas
		canvas.width = image.width;
		canvas.height = image.height;
		ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const pixels = imageData.data;

		// Get the greyscale value for each pixel, and map to the corresponding gradient value.
		const gradientColors = this.getDuotoneGradient();
		const l = pixels.length;

		// Calculate luminosity values for every pixel based on each channel's relative chromaticity
		// See: https://en.wikipedia.org/wiki/Luma_(video)
		for (let i = 0; i < l; i += 4) {
			const avg = 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2] | 0;
			const src = gradientColors[avg];
			pixels[i] = src[0];
			pixels[i + 1] = src[1];
			pixels[i + 2] = src[2];
		}

		ctx.putImageData(imageData, 0, 0);

		return canvas;
	},

    /**
	 * Creates an array of colors to be used as the duotone range
	 */
    getDuotoneGradient() {
		if (!Bio.duotoneGradient) {
			// Start and end RGB colors, already decomposed into RGB
			const start = [23, 33, 49];
			const end = [204, 255, 255];

			const gradientColors = [];
			const range = [end[0] - start[0], end[1] - start[1], end[2] - start[2]];
			let f = NaN;
			for (let i = 0; i < 256; i++) {
				f = i / 255;
				gradientColors[i] = [
					start[0] + (range[0] * f) | 0,
					start[1] + (range[1] * f) | 0,
					start[2] + (range[2] * f) | 0,
				];
			}

			Bio.duotoneGradient = gradientColors;
		}

		return Bio.duotoneGradient;
	},

    /**
	 * Draws the gradient on top of the duotone image, using an "overlay" blending mode
	 */
    addGradientOverlay(duotoneCanvas, gradientImage) {
		const ctx = duotoneCanvas.getContext("2d");
		const desiredBlendingMode = "overlay";
		ctx.globalCompositeOperation = desiredBlendingMode;
		// Skip blending if the desired mode is not supported (e.g. IE11)
		if (ctx.globalCompositeOperation == desiredBlendingMode) {
			ctx.drawImage(gradientImage, 0, 0, duotoneCanvas.width, duotoneCanvas.height);
		}
		return duotoneCanvas;
	},
});

export default Bio;
