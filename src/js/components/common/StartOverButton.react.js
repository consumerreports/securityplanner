import PropTypes from 'prop-types';
import React from "react";
import Bowser from "bowser";

import ADAUtils from "../../vendor/utils/ADAUtils";
import ResizeUtils from "../../vendor/utils/ResizeUtils";

class StartOverButton extends React.Component {
    static propTypes = {
		className: PropTypes.string,
		onClick: PropTypes.func,
	};

    state = {
        visible: true,
        className: undefined,
        sectionScrolled: undefined,
        currentScrollAmt: undefined,
        colorClassName: undefined,
        breakpoint: ResizeUtils.getCurrentBreakpoint(),
    };

    componentDidMount() {
		window.addEventListener("resize", this.onResize);
	}

    componentWillUnmount() {
		window.removeEventListener("resize", this.onResize);
	}

    shouldComponentUpdate(nextProps, nextState) {
		if (nextState.visible != this.state.visible ||
				nextState.className != this.state.className ||
				nextState.sectionScrolled != this.state.sectionScrolled ||
				nextState.currentScrollAmt != this.state.currentScrollAmt) {
			return true;
		} else {
			return false;
		}
	}

    render() {
		const browserVersion = parseFloat(Bowser.version);

		let buttonColorClass = "";
		if (!!this.state.desiredBackgroundColor && !(Bowser.ios && browserVersion >= 7 && browserVersion < 8)) {
			buttonColorClass = " threat-colors";
		}

		const buttonStyle = {};
		if (this.state.colorClassName === "section-action-plan") {
			let pct = 1 - (this.state.currentScrollAmt / ResizeUtils.getCurrentBreakpointHideDistance());
			pct *= this.state.visible ? 1 : 0;
			if (pct <= 0) {
				pct = 0;
				buttonStyle.display = "none";
			}

			buttonStyle.opacity = pct;
		}

		return (
			<div className={ "common-button-start-over " + (this.state.className || "") + (this.state.visible ? "" : " hidden") + (this.state.sectionScrolled ? " section-scrolled" : "") + " " + buttonColorClass + " " + this.props.className } 
			style={ buttonStyle }
			data-testid="start-over-button">
				<div
					className="wrap-buttons"
					tabIndex={ this.state.visible ? 0 : -1 }
					role="link"
					title={ this.props.stringList.get("ui-startover-caption") }
					aria-label={ this.props.stringList.get("ui-startover-caption") }
					onKeyDown={ ADAUtils.handleKeyboard(this.props.onClick) }
					onClick={ this.props.onClick }>
					<div className="image-dark"/>
					<div className="image-light"/>
				</div>
			</div>
		);
	}

    setStateParameters = (
        visible,
        className,
        sectionScrolled,
        currentScrollAmt,
        desiredBackgroundColor,
        colorClassName,
    ) => {
		if (visible != this.state.visible ||
				sectionScrolled != this.state.sectionScrolled ||
				currentScrollAmt != this.state.currentScrollAmt ||
				desiredBackgroundColor != this.state.desiredBackgroundColor ||
				colorClassName != this.state.colorClassName) {
			this.setState({
				visible: visible,
				className: className,
				sectionScrolled: sectionScrolled,
				currentScrollAmt: currentScrollAmt,
				desiredBackgroundColor: desiredBackgroundColor,
				colorClassName: colorClassName,
			});
		}
	};

    onResize = () => {
		const bp = ResizeUtils.getCurrentBreakpoint();
		if (this.state.breakpoint !== bp) {
			this.setState({
				breakpoint: bp,
			});
		}
	};
}

export default StartOverButton;