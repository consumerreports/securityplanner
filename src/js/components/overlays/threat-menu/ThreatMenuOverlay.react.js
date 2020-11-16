import PropTypes from 'prop-types';
import React from "react";
import ReactDOM from 'react-dom';
import cx from "classnames";

import ImageContainer from "../../common/ImageContainer.react";

import ADAUtils from "./../../../vendor/utils/ADAUtils";
import PageSectionHelper from "./../../../vendor/utils/PageSectionHelper";
import DirectionUtils from "./../../../vendor/utils/DirectionUtils";
import Transport from "./../../../vendor/utils/Transport";

class ThreatMenuOverlay extends React.Component {
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
		stringList: PropTypes.object,
		scrollPosition: PropTypes.number,
		transportId: PropTypes.string,
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
			"overlayThreatMenu": true,
			"hidden": !this.state.visible,
			"showing": this.state.showing,
			"hiding": this.state.hiding,
		}, DirectionUtils.getClass(this.props.stringList));

		const gState = Transport.get(this.props.transportId).getState();

		return (
			<div
				className={ classes }
				aria-hidden={ !this.helper.isActive() }
				style={ { height: this.helper.getWindowHeight() } }
				aria-label={"Threats overlay"}
				onKeyDown={ ADAUtils.handleOverlay(this.close) }>
				<div className="cover"/>
				<div className="mask">
					<div className="background background-dark show-fading-full"/>
					<div
						className="close small right"
						tabIndex={ this.helper.isActive() ? 0 : -1 }
						role="button"
						onKeyDown={ ADAUtils.handleKeyboard(this.close) }
						onClick={ this.close }>
						<span className="sr-only">{ this.props.stringList.get("common-ui-back") }</span>
						<img
							className="show-fading"
							src={ require("./../../../../images/ui/hamburger-close-dark.svg") }
							alt=""/>
					</div>
					<div
						className="content show-sliding-up-full"
						ref="scroller"
						style={ { backgroundColor: gState.backgroundColor } }>
						<div
							className="wrapper"
							style={ { minHeight: this.helper.getMinScrollableHeight() } }>
							<div className="body">
								<div className="header">
									<h5>{ gState.menuTitle }</h5>
								</div>
								<ul className="threat-list">
									{ gState.threats.map((threat, i) => {

										const checkmarkClasses = cx({
											"checkmark": true,
											"is-active": gState.currentSelectedThreat === threat.id,
										});
										// const threatItemClasses = cx({
										// 	"" : true,
										// 	"threat-list-item-selected" : gState.currentSelectedThreat === threat.id
										// })
										return (
											<li className="threat-list-item" key={ i }>
												<span className={ checkmarkClasses }>
													<ImageContainer className="icon" src={ require("./../../../../images/ui/checkmark-small-black.svg") }/>
												</span>
												<button
													className="threat-name"
													tabIndex={ this.helper.isActive() ? 0 : -1 }
													role="button"
													onKeyDown={ ADAUtils.handleKeyboard(() => this.onClickThreat(threat.id)) }
													onClick={ () => this.onClickThreat(threat.id) }>
													<span>{ threat.name }</span>
												</button>
											</li>
										);
									}) }
								</ul>
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
		this.changeZIndex();
		this.setState({ visible:false, showing:true, hiding:false });

		requestAnimationFrame(callback);

		setTimeout(() => {
			if (this.state.showing) {
				this.changeZIndex();
				this.setState({ visible:true, showing:false, hiding:false });

				document.body.style.top = `-${this.props.scrollPosition}px`;
				document.body.style.marginTop = `${this.props.scrollPosition}px`;
				document.body.style.height = `${window.innerHeight}px`;
				document.body.style.overflow = "hidden";
			}
		}, 830);
	};

    startTransitionHide = (callback) => {
		this.changeZIndex();
		this.setState({ visible:true, showing:false, hiding:true });

		document.body.style.top = "";
		document.body.style.marginTop = "";
		document.body.style.height = "";
		document.body.style.overflow = "";

		setTimeout(() => {
			callback();
		}, 330);
	};

    changeZIndex = () => {
		// Change the z-index of the main element by 1
		// This makes no sense and shouldn't be needed, but it's used to prevent a strange bug in iOS where dragging the overlay makes it disappear
		const element = ReactDOM.findDOMNode(this);
		if (element) {
			const oldIndex = element.style.zIndex ? parseInt(element.style.zIndex, 10) : 2000;
			element.style.zIndex = oldIndex + 1;
		}
	};

    onClickThreat = (index) => {
		this.close();
		Transport.get(this.props.transportId).getState().onClickThreat(index);
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

export default ThreatMenuOverlay;
