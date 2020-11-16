import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";

import ADAUtils from "./../../../vendor/utils/ADAUtils";
import PageSectionHelper from "./../../../vendor/utils/PageSectionHelper";
import MarkdownUtils from "./../../../vendor/utils/MarkdownUtils";
import DirectionUtils from "./../../../vendor/utils/DirectionUtils";

class BioOverlay extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			visible: false,
			showing: false,
			hiding: false,
		}

		this.helper = new PageSectionHelper(this);
	}
    static propTypes = {
		stringList: PropTypes.object, // StringList
		bio: PropTypes.object.isRequired,
		scrollPosition: PropTypes.number,
		onClickClose: PropTypes.func,
	};

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
			"overlayBio": true,
			"hidden": !this.state.visible,
			"showing": this.state.showing,
			"hiding": this.state.hiding,
		}, DirectionUtils.getClass(this.props.stringList));

		const descriptionParagraphs = this.props.bio.description.split("\n");

		return (
			<div
				className={ classes }
				aria-hidden={ !this.helper.isActive() }
				style={ { height: this.helper.getWindowHeight() } }>
				<div className="cover" />
				<div className="mask mask-cropping mask-fading">
					<div className="background"/>
					<div className="content show-fading" ref="scroller">
						<div
							className="wrapper"
							style={ { minHeight: this.helper.getMinScrollableHeight() } }>
							<div
								className="close"
								tabIndex={ this.helper.isActive() ? 0 : -1 }
								onKeyDown={ ADAUtils.handleKeyboard(this.close) }
								onClick={ this.close }>
								<img
									className="show-fading"
									src={ require("./../../../../images/ui/blue-back-arrow.svg") }
									alt={ this.props.stringList.get("common-ui-back") }/>
									{ this.props.stringList.get("common-ui-back") }
							</div>
							<div className="body show-sliding-left">
								<div className="img-wrapper">
									<img src={ this.props.bio.image } 
										alt={ this.props.bio.name } />
								</div>
								<div className="name">{this.props.bio.name}</div>
								<div className="organization">{this.props.bio.organization}</div>
								<hr className="divider" />
								<div className="description">
									{descriptionParagraphs.map((text, i) => {
										return (
											<p key={ i }>
												{ MarkdownUtils.parseURL(text) }
											</p>
										);
									})}
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

    handleKeyPress = (event) => {
		if (event.key == "Escape") {
			this.close();
		}
	};
}

export default BioOverlay;
