import { clamp } from "moremath";
import PropTypes from 'prop-types';
import React from "react";

import createReactClass from 'create-react-class';

import SecurityPlannerConstants from "./../../../constants/SecurityPlannerConstants";
import ADAUtils from "./../../../vendor/utils/ADAUtils";
import DirectionUtils from "./../../../vendor/utils/DirectionUtils";
import ReactUtils from "./../../../vendor/utils/ReactUtils";
import ResizeUtils from "./../../../vendor/utils/ResizeUtils";
import ImageContainer from "./../../common/ImageContainer.react";
import Tool from "./../../common/Tool.react";

const Header = createReactClass({
    displayName: 'Header',
    headerInfoElement: undefined,

    propTypes: {
		stringList: PropTypes.object, // StringList
		title: PropTypes.string,
		numTools: PropTypes.number,
		threatList: PropTypes.array, // Threat
		scrolledAmount: PropTypes.number,
		isFromSharing: PropTypes.bool,
		onClickedThreat: PropTypes.func,
		onClickedPrint: PropTypes.func,
		allowFocus: PropTypes.bool,
		topTool: PropTypes.object, // Tool
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
	},

    componentDidMount() {
		// Hack with timeout to focus element in IE
		this.focusTimeout = setTimeout(() => {
			this.headerInfoElement.focus();
		}, 0);
	},

    componentWillUnmount: function() {
		clearTimeout(this.focusTimeout);
		this.focusTimeout = null;
	},

    render: function() {
		// Finally, render the elements
		return (
			<div className="header no-padding-top-when-shared">
				<div className="content">
				{ this.props.isFromSharing ? null : this.renderTitle() }
					<div
						className="info"
						tabIndex={ -1 }
						ref={ e => this.headerInfoElement = e }>
						{/* { this.renderTitle() } */}
						<ImageContainer className="threat-girl" src={ require("./../../../../images/page-report/bottom.png") }/>
						<div className="threats">{this.getThreatText()}</div>
					</div>
					{ this.props.numTools > 1 ? this.renderTopTool() : null }
				</div>
				{ this.props.onClickedPrint ? this.renderPrintButton() : null }
			</div>
		);
	},

    renderTopTool: function() {
		return (
			<div className="top-tool-box">
				<Tool stringList={ this.props.stringList }
					tool={ this.props.topTool }
					key={ this.props.topTool.id }
					ref={ this.props.topTool.id }
					isTopTool={ this.props.topTool === this.props.topTool }
					className={ "" }
					size={ "medium" }
					routes={ this.props.routes }
					goToPage={ this.props.goToPage }
					allowFocus={ this.props.allowFocus }/>
			</div>
		);
	},

    renderTitle: function() {
		const title = this.props.title ? ReactUtils.getReplacedTags(this.props.title, "em", function(innerText) { return <em>{innerText}</em>; }) : undefined;

		return (
			<div key="title" className="common-section-title">
				<div key="text">{title}</div>
			</div>
		);
	},

    getThreatText: function() {
		// Compose the title
		let titleStringId = "";
		if (this.props.isFromSharing) {
			// Action plan from sharing
			titleStringId = this.props.numTools > 1 ? "action-plan-shared-subtitle-multiple" : "action-plan-shared-subtitle-single";
		} else {
			// Action plan from going through all steps
			titleStringId = this.props.numTools > 1 ? "action-plan-subtitle-multiple" : "action-plan-subtitle-single";
		}

		const threatList = this.getThreatList();

		return ReactUtils.getReplacedNodes(this.props.stringList.get(titleStringId).replace("[[tools]]", this.props.numTools), "[[threats]]", threatList);
	},

    getThreatList: function() {
		// This mimics StringUtils.getListedText(), but for React and with varying colors per item

		// Sort with the "additional threat" at the end
		const threatList = this.props.threatList.concat().sort((a, b) => {
			if (a.isAdditionalHelp) return 1;
			if (b.isAdditionalHelp) return -1;
			return 0;
		});

		// Finally, create the list
		return ReactUtils.getReplacedList(
			threatList,
			(index, threat) => {
				return (
					<em
						key={ "item-" + index }
						tabIndex={ this.props.allowFocus ? 0 : -1 }
						role="link"
						style={ { color: this.getThreatColor(threat) } }
						onKeyDown={ ADAUtils.handleKeyboard(() => this.onClickedThreat(threat)) }
						onClick={ () => this.onClickedThreat(threat) }>
						{ threat.name }
					</em>
				);
			},
			this.props.stringList.get("common-list-divider"),
			this.props.stringList.get("common-list-divider-end-single"),
			this.props.stringList.get("common-list-divider-end-multiple")
		);
	},

    getThreatColor: function(threat) {
		let index = this.props.threatList.indexOf(threat);
		index = clamp(index, 0, SecurityPlannerConstants.Colors.Threats.length - 1);
		return "#" + SecurityPlannerConstants.Colors.Threats[index].toString(16);
	},

    renderPrintButton: function() {
		const hiddenUIStyle = {};
		let pct = 1 - (this.props.scrolledAmount / ResizeUtils.getCurrentBreakpointHideDistance());
		if (pct <= 0) {
			pct = 0;
			hiddenUIStyle.display = "none";
		}
		hiddenUIStyle.opacity = pct;

		return (
			<div className="floating-wrapper">
				<div className={ "print-button " + DirectionUtils.getClass(this.props.stringList) }
					onClick={ this.props.onClickedPrint }
					style={ hiddenUIStyle }>
					<ImageContainer className="icon dark"
						src={ require("./../../../../images/ui/print-dark.svg") }/>
					<ImageContainer className="icon light"
						src={ require("./../../../../images/ui/print-white.svg") }/>
				</div>
			</div>
		);
	},

    onClickedThreat: function(threat) {
		if (this.props.onClickedThreat) {
			this.props.onClickedThreat(threat.id);
		}
	},
});

export default Header;
