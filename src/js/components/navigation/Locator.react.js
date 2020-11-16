import PropTypes from 'prop-types';
import React from "react";
import Bowser from "bowser";
import cx from "classnames";

import ADAUtils from "../../vendor/utils/ADAUtils";
import ReactUtils from "../../vendor/utils/ReactUtils";
import ResizeUtils from "../../vendor/utils/ResizeUtils";
import DirectionUtils from "./../../vendor/utils/DirectionUtils";

import ImageContainer from "../common/ImageContainer.react";

class Locator extends React.Component {
    static propTypes = {
		stringList: PropTypes.object, // StringList
		onClickLocation: PropTypes.func,
	};

    state = {
        isVisible: undefined,								// Boolean: whether it should be visible or not
        numItems: undefined,								// Int: actual number of items in the navigation stack
        minimumNumItems: undefined,							// Int: minimum number of items to show in the navigation stack
        currentItem: undefined,								// Int: current position in the navigation stack
        furthestItem: undefined,							// Int: furthest position reached in the navigation stack
        title: undefined,									// String: title that should be rendered on top
        colorClassName: undefined,							// String: className to add to the component
        siteScrolled: undefined,							// Boolean: whether the site is scrolled (and not aligned with the section/page)
        sectionScrolled: undefined,							// Boolean: whether the section/page is scrolled (and not at the top)
        currentScrollAmt: undefined,						// Number: amount that the user has scroll down the page (in px)
        desiredBackgroundColor: undefined,					// Number: desired color (as an int) that should be used as the background, when opaque
        breakpoint: ResizeUtils.getCurrentBreakpoint(),
    };

    componentDidMount() {
		window.addEventListener("resize", this.onResize);
	}

    componentWillUnmount() {
		window.removeEventListener("resize", this.onResize);
	}

    render() {
		const browserVersion = parseFloat(Bowser.version);
		const checkMarkWhite = <ImageContainer className="icon icon-s" src={ require("./../../../images/ui/security-planner-logo-white.svg") }/>;
		const checkMarkBlack = <ImageContainer className="icon icon-s" src={ require("./../../../images/ui/security-planner-logo-black.svg") }/>;
		let checkMarkComponentInstance = checkMarkBlack;
		// Defines styles
		const barStyle = {};
		let barColorClass = "";
		if (this.state.desiredBackgroundColor && !(Bowser.ios && browserVersion >= 7 && browserVersion < 8)) {
			barStyle.backgroundColor = "#" + this.state.desiredBackgroundColor;
			barColorClass = "threat-colors";
		}

		if (this.state.colorClassName === "section-action-plan") {
			let pct = 1 - (this.state.currentScrollAmt / ResizeUtils.getCurrentBreakpointHideDistance());
			if (pct <= 0) {
				pct = 0;
				barStyle.display = "none";
			}
			barStyle.opacity = pct;
		}

		// Creates all items
		const items = [];
		const loopLength = Math.max(this.state.numItems, this.state.minimumNumItems);

		for (let i = 0; i < loopLength; i++) {
			let className = "";
			const isSelected = i === this.state.currentItem;
			let canFocus = false;
			let title = undefined;

			if (isSelected) {
				if (i === 0) {
					className += " first"
				} else {
					className += " selected"
				}
			} else {
				if (this.state.currentItem > i + 1) {
					canFocus = i === 0 && !isSelected;
					className += " passed";
				} else if (this.state.currentItem > i) {
					canFocus = i === 0 && !isSelected;
					title = "Go Back";
					className += " before before-" + Math.abs(this.state.currentItem - i);
				} else {
					canFocus = false;
					className += " after after-" + Math.abs(this.state.currentItem - i);

					if (i > this.state.furthestItem) {
						className += " disabled";
					} else {
						title = "Go to Statements page " + (i + 1);
					}
				}
			}

			if ( className.indexOf("disabled") === -1 ) {
				checkMarkComponentInstance = checkMarkWhite;
			} else {
				checkMarkComponentInstance = checkMarkBlack;
			}

			items.push(
				<div
					key={ i }
					className={ "location" + className }
					tabIndex={ canFocus ? 0 : -1 }
					aria-hidden={ !canFocus }
					role="link"
					title={ title }
					aria-label={ title }
					onKeyDown={ ADAUtils.handleKeyboard(() => this.onClickLocation(i)) }
					onClick={ () => this.onClickLocation(i) }>
					<div className="circle">
						<div className="text">
							{ (i + 1 === loopLength) ? checkMarkComponentInstance : i + 1 }
						</div>
					</div>
				</div>
			);
		}

		const simpleTitle = this.state.title ? this.state.title.replace(/<(|\/)em>/g, "") : "";
		const title = this.state.title ?
			ReactUtils.getReplacedTags(this.state.title, "em", function(innerText) {
				return <em>{ innerText }</em>;
			}) : undefined;

		items.push(
			<div key="title" className="title spaced-1">
				<div
					key="text"
					role="heading"
					title={ simpleTitle }
					aria-label={ simpleTitle }>
					{title}
				</div>
			</div>
		);

		const isHidden = !this.state.isVisible || this.state.currentItem < 0;

		const classNames = cx({
			locator: true,
			[DirectionUtils.getClass(this.props.stringList)]: true,
			hidden: isHidden,
			["section-scrolled"]: this.state.sectionScrolled,

		}, this.state.colorClassName, barColorClass);

		// Finally, writes everything
		return (
			<div
				className={ classNames }
				aria-hidden={ isHidden }
				style={ barStyle }>
				{ items }
			</div>
		);
	}

    setStateParameters = (
        isVisible,
        numItems,
        minimumNumItems,
        currentItem,
        furthestItem,
        title,
        colorClassName,
        siteScrolled,
        sectionScrolled,
        currentScrollAmt,
        desiredBackgroundColor,
    ) => {
		if (isVisible != this.state.isVisible ||
				numItems != this.state.numItems ||
				minimumNumItems != this.state.minimumNumItems ||
				currentItem != this.state.currentItem ||
				title != this.state.title ||
				colorClassName != this.state.colorClassName ||
				siteScrolled != this.state.siteScrolled ||
				sectionScrolled != this.state.sectionScrolled ||
				currentScrollAmt != this.state.currentScrollAmt ||
				desiredBackgroundColor != this.state.desiredBackgroundColor) {
			this.setState({
				isVisible: isVisible,
				numItems: numItems,
				minimumNumItems: minimumNumItems,
				currentItem: currentItem,
				furthestItem: furthestItem,
				title: title,
				colorClassName: colorClassName,
				siteScrolled: siteScrolled,
				sectionScrolled: sectionScrolled,
				currentScrollAmt: currentScrollAmt,
				desiredBackgroundColor: desiredBackgroundColor,
			});
		}
	};

    onClickLocation = (index) => {
		if (this.props.onClickLocation) this.props.onClickLocation(index);
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

export default Locator;
