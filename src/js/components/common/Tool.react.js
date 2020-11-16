import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";

import ADAUtils from "./../../vendor/utils/ADAUtils";

import ImageContainer from "./ImageContainer.react";
import DetailsButton from "./DetailsButton.react";

class Tool extends React.Component {
    static propTypes = {
		stringList: PropTypes.object,
		tool: PropTypes.object.isRequired,
		isTopTool: PropTypes.bool,
		size: PropTypes.string,
		className: PropTypes.string,
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
		allowFocus: PropTypes.bool,
		changeTabSequence: PropTypes.func,
	};

    shouldComponentUpdate(nextProps) {
		return nextProps.stringList != this.props.stringList ||
			nextProps.tool.id != this.props.tool.id ||
			nextProps.isTopTool != this.props.isTopTool ||
			nextProps.size != this.props.size ||
			nextProps.className != this.props.className ||
			nextProps.routes != this.props.routes ||
			nextProps.goToPage != this.props.goToPage ||
			nextProps.allowFocus != this.props.allowFocus;
	}

    render() {
		const hasAttributes = this.props.tool.price || this.props.tool.label;
		const isToolFree = !this.props.tool.price || !this.props.tool.price.trim() || this.props.tool.price === "Free"  || this.props.tool.price === this.props.stringList.get("tool-label-free");
		const classes = cx({
			"common-tool-box": true,
			["common-tool-box-" + this.props.size]: Boolean(this.props.size),
			[this.props.className]: true,
			"top-tool": this.props.isTopTool,
			"non-top-tool": !this.props.isTopTool,
		});

		const hasButton = this.props.size !== "small";

		const freeTag = isToolFree ? <div className="free-banner">{ this.props.stringList.get("tool-label-free").toUpperCase() }</div> : "";
		const effortTag = this.props.tool.label ? <div className="effort-banner">{ this.props.tool.label.toUpperCase() }</div> : "";

		// prepping entry for tools with the price "Variable"
		const toolPrice = this.props.tool.price === "Variable" ? this.props.stringList.get("tool-label-variable") : this.props.tool.price;

		return (
			<div className={ classes }
				tabIndex={ this.props.allowFocus && !hasButton ? 0 : -1 }
				role="button"
				onKeyDown={ this.props.changeTabSequence ? ADAUtils.handleKeyboard(this.showOverlay, false, this.handleTabSequence) : ADAUtils.handleKeyboard(this.showOverlay) }
				onClick={ this.showOverlay }
				title={ this.props.tool.headline }
				ref="button">
				{ freeTag }
				{ effortTag }
				<ImageContainer
					className="image"
					src={ this.props.tool.image }
					description={ this.props.tool.name }/>
				<div className="top-tool-banner">
					<div>
						<img className="icon" alt="" src={ require("./../../../images/ui/icon-star.png") }/>
						<div className="caption">
							{ this.props.stringList.get("tool-banner-top-tool") }
						</div>
						<div className="subcaption">
							{ this.props.stringList.get("tool-banner-top-tool-subcaption") }
						</div>
					</div>
				</div>
				<div className="text-padding-flex"/>
				<div className="text">
					<div className="details">
						<div className="title-headline">{this.props.tool.headline}</div>
						<div className="title-name">{this.props.tool.name}</div>
						<div className="description">
							{this.props.tool.shortDescription}
							{/*
								******* Remove comments to re-enable "Learn more" on small tool cards *******
							<span className="inline-more">{this.props.stringList.get("interstitial-tool-inline-more")}</span>
							*/}
						</div>
					</div>
					{ hasAttributes ?
						<div className="attributes">
							<div className={ "attribute-item " + (isToolFree ? "hideable" : "") }>
								<span className="attribute-label">{ this.props.stringList.get("tool-label-cost") }</span>
								<span className="attribute-data">{ isToolFree ? this.props.stringList.get("tool-label-free") : toolPrice }</span>
							</div>
							{ this.props.tool.label ?
								<div className="attribute-item hideable">
									<span className="attribute-label">{ this.props.stringList.get("tool-label-effort") }</span>
									<span className="attribute-data">{ this.props.tool.label }</span>
								</div> : null }
						</div> : null }
					<div className="button-more">
						<DetailsButton
							allowFocus={ this.props.allowFocus }
							title={ this.props.stringList.get("tool-button-more") }
							onClick={ this.showOverlay }>
							{ this.props.stringList.get("tool-button-more") }
						</DetailsButton>
					</div>
				</div>
			</div>
		);
	}

	handleTabSequence = e => {
		if (!e.shiftKey) {
			this.props.changeTabSequence(e);
			e.preventDefault();
		}
	}

    showOverlay = () => {
		if (this.props.goToPage && this.props.routes) this.props.goToPage(this.props.routes.getUriOverlayTool(this.props.tool.slug), true, true);
	};
}

export default Tool;
