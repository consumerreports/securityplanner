import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";
import * as marked from "marked";

import ImageContainer from "../../common/ImageContainer.react";
import DetailsButton from "../../common/DetailsButton.react";

import ADAUtils from "./../../../vendor/utils/ADAUtils";
import PageSectionHelper from "./../../../vendor/utils/PageSectionHelper";
import DirectionUtils from "./../../../vendor/utils/DirectionUtils";
import MiniTracker from "../../../vendor/tracking/MiniTracker";

import ReviewList from "./ReviewList.react";
import SecondaryResources from "./SecondaryResources.react";

class ToolOverlay extends React.Component {
    static propTypes = {
		stringList: PropTypes.object, // StringList
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
		tool: PropTypes.object, // Tool
		scrollPosition: PropTypes.number,
		onClickClose: PropTypes.func,
	};

    state = {
        visible: false,
        showing: false,
        hiding: false,
    };

    helper = undefined;

    UNSAFE_componentWillMount() {
		this.helper = new PageSectionHelper(this);
	}

    componentDidMount() {
		this.helper.setComponent(this.refs.scroller);
		document.addEventListener("keydown", this.handleKeyPress);
	}

    componentDidUpdate() {
		this.helper.setComponent(this.refs.scroller);
		this.helper.forceCheck();
	}

    componentWillUnmount() {
		this.helper.destroy();
	}

    render() {
		const classes = cx({
			"overlay": true,
			"overlayTool": true,
			"hidden": !this.state.visible,
			"showing": this.state.showing,
			"hiding": this.state.hiding,
			"no-reviews": this.props.tool.reviews.length === 0,
		}, DirectionUtils.getClass(this.props.stringList));

		const description = this.props.tool.longDescription;
		const importance = this.props.tool.whyItsImportant;
		const hasResources = this.props.tool.resources.length > 0;

		return (
			<div
				className={ classes }
				aria-hidden={ !this.helper.isActive() }
				style={ { height: this.helper.getWindowHeight() } }>
				<div className="cover"/>
				<div className="mask mask-cropping mask-fading">
					<div className="background"/>
					<div className="image show-fading show-sliding-right">
						<ImageContainer
							src={ this.props.tool.image }
							className="image-inside"
							description={ this.props.tool.name }/>
					</div>
					<div className="content show-fading" ref="scroller">
						<div
							className="wrapper"
							style={ { minHeight: this.helper.getMinScrollableHeight() } }>
							<div
								className="close"
								tabIndex={ this.helper.isActive() ? 0 : -1 }
								role="button"
								onKeyDown={ ADAUtils.handleKeyboard(this.close) }
								onClick={ this.close }>
								<img
									className="show-fading"
									src={ require("./../../../../images/ui/blue-back-arrow.svg") }
									alt={ this.props.stringList.get("common-ui-back") }/> { this.props.stringList.get("common-ui-back") }
							</div>
							<div className="body show-sliding-left">
								<div className="title">{this.props.tool.name}</div>
								<div className="subtitle">{this.props.tool.overlayDescription}</div>
								<h3 className="subtitle-large">{ this.props.stringList.get("overlay-tool-next-steps") }</h3>
								<div className="description" dangerouslySetInnerHTML= { { __html: marked.parse(description || "") } } />
								<hr className="divider" />
								<h3 className="subtitle-large">{ this.props.stringList.get("overlay-tool-why-important") }</h3>
								<div className="importance" dangerouslySetInnerHTML= { { __html: marked.parse(importance || "") } } />
								<ReviewList
									routes={ this.props.routes }
									goToPage={ this.props.goToPage }
									stringList={ this.props.stringList }
									tool={ this.props.tool }
									allowFocus={ this.helper.isActive() }/>
								{ hasResources ?
									<SecondaryResources
										resourceList={ this.props.tool.resources }
										stringList={ this.props.stringList }
										allowFocus={ this.helper.isActive() }/>
								:
									null
								}
								<div className="trust-box">
								<p dangerouslySetInnerHTML= { { __html: marked.parse(this.props.stringList.get("overlay-tool-trust-us") || "") } } />
								</div>
								<div className="feedback">
									<DetailsButton
										className="common-button-details-transparent-dark"
										allowFocus={ this.helper.isActive() }
										title={ this.props.stringList.get("overlay-tool-button-feedback") }
										onClick={ this.onClickFeedback }>
										{ this.props.stringList.get("overlay-tool-button-feedback") }
									</DetailsButton>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

    /**
	 * Ran when the section becomes the focused section
	 */
    onActivate = (travelOffset, viaHistoryAPI) => {
		this.helper.onActivate(travelOffset, viaHistoryAPI);
	};

    /**
	 * Ran when the section is about to lose focus
	 */
    onDeactivate = (travelOffset, viaHistoryAPI) => {
		this.helper.onDeactivate(travelOffset, viaHistoryAPI);
	};

    startTransitionShow = (callback) => {
		this.setState({ visible:false, showing:true, hiding:false });

		requestAnimationFrame(callback);

		setTimeout(() => {
			if (this.state.showing) {
				this.setState({ visible:true, showing:false, hiding:false });

				document.body.style.top = `-${this.props.scrollPosition}px`;
				document.body.style.marginTop = `${this.props.scrollPosition}px`;
				document.body.style.height = `${window.innerHeight}px`;
				document.body.style.overflow = "hidden";
			}
		}, 830);
	};

    startTransitionHide = (callback) => {
		this.setState({ visible:true, showing:false, hiding:true });

		document.body.style.top = "";
		document.body.style.marginTop = "";
		document.body.style.height = "";
		document.body.style.overflow = "";

		setTimeout(() => {
			callback();
		}, 330);
	};

    close = () => {
		document.removeEventListener("keydown", this.handleKeyPress);
		if (this.props.onClickClose) this.props.onClickClose();
	};

    onClickFeedback = () => {
		MiniTracker.trackEvent("tool", "feedback", this.props.tool.slug);
		this.props.goToPage(this.props.routes.getUriOverlayToolFeedback(this.props.tool.slug), true, true);
	};

    handleKeyPress = (event) => {
		if (event.key == "Escape") {
			this.close();
		}
	};
}

export default ToolOverlay;
