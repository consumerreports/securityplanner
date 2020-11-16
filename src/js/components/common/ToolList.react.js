import PropTypes from 'prop-types';
import React from "react";

import ReactDOM from 'react-dom';

import ADAUtils from "./../../vendor/utils/ADAUtils";
import ArrayUtils from "../../vendor/utils/ArrayUtils";
import PositionUtils from "../../vendor/utils/PositionUtils";
import ReactUtils from "../../vendor/utils/ReactUtils";
import StringUtils from "../../vendor/utils/StringUtils";
import ActionButton from "./ActionButton.react";
import DetailsButton from "./DetailsButton.react";
import Tool from "./Tool.react";

class ToolList extends React.Component {
    static propTypes = {
		stringList: PropTypes.object,
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
		tools: PropTypes.array.isRequired, // Tool[], already ordered
		topTool: PropTypes.object, // Tool
		threats: PropTypes.array.isRequired, // Threat[], already ordered
		sizeFirstTool: PropTypes.string,
		sizeOtherTools: PropTypes.string,
		maxVisibleThreats: PropTypes.number,
		maxVisibleToolsPerThreat: PropTypes.number,
		allowFocus: PropTypes.bool,
		onChangedListSize: PropTypes.func,
		tabSequence: PropTypes.func,
	};

    state = {
        expandedList: false,
        expandedThreats: [], // Array of strings with the ids of all threats currently expanded
    };

    currentToolsHash = undefined; // String
    currentThreatsHash = undefined; // String
    currentExpandedList = undefined; // Like expandedList
    currentExpandedThreats = undefined; // Like expandedThreats

    shouldComponentUpdate(nextProps, nextState) {
		// Decide whether to update or not - needed to avoid some expensive re-rendering
		return (
			this.props.stringList != nextProps.stringList ||
			this.props.routes != nextProps.routes ||
			this.props.goToPage != nextProps.goToPage ||
			this.currentToolsHash != ArrayUtils.getArrayFieldUniqueIndex(nextProps.tools, "id") ||
			this.currentThreatsHash != ArrayUtils.getArrayFieldUniqueIndex(nextProps.threats, "id") ||
			this.currentExpandedList != nextState.expandedList ||
			!ArrayUtils.equal(this.currentExpandedThreats, nextState.expandedThreats) ||
			this.props.sizeFirstTool != nextProps.sizeFirstTool ||
			this.props.sizeOtherTools != nextProps.sizeOtherTools ||
			this.props.maxVisibleThreats != nextProps.maxVisibleThreats ||
			this.props.maxVisibleToolsPerThreat != nextProps.maxVisibleToolsPerThreat ||
			this.props.allowFocus != nextProps.allowFocus ||
			this.props.onChangedListSize != nextProps.onChangedListSize
		);
	}

    componentDidUpdate() {
		if (this.props.onChangedListSize) this.props.onChangedListSize();
	}

    render() {
		// Create snapshot hashes, to avoid unnecessary rendering later
		this.currentToolsHash = ArrayUtils.getArrayFieldUniqueIndex(this.props.tools, "id");
		this.currentThreatsHash = ArrayUtils.getArrayFieldUniqueIndex(this.props.threats, "id");
		this.currentExpandedList = this.state.expandedList;
		this.currentExpandedThreats = this.state.expandedThreats.concat();

		const groups = []; // Each group contains a list of tools that belong to a specific threat

		// If there's more threat groups than allowed, show a "more" button
		let listNeedsExpansionButton = false;

		// List of threats that are not displayed, in case there's more threat groups than allowed (will also show a "more" button later)
		const hiddenThreatNames = [];

		this.props.threats.forEach((threat, threatIndex) => {
			const group = [];

			// If there's more tools in this threat group than allowed, and the threat group is still collapsed, show a "more" button
			let groupNeedsExpansionButton = false;
			let lastVisibleToolRef = undefined;

			// Now, runs over the list of tools and adds all tools with the same threat id
			const toolsForGroup = this.props.tools.filter((tool) => tool.threat.id == threat.id);

			toolsForGroup.forEach((tool, toolIndex) => {
				// Same threat, use this tool
				groupNeedsExpansionButton = groupNeedsExpansionButton || (!!this.props.maxVisibleToolsPerThreat && group.length > this.props.maxVisibleToolsPerThreat - 1 && this.state.expandedThreats.indexOf(threat.id) < 0);
				if (!groupNeedsExpansionButton) lastVisibleToolRef = tool.id;

				// Get the next threat Id if there is one
				const nextThreatId = threatIndex < this.props.threats.length - 1 ? this.props.threats[threatIndex + 1].id : null;

				// We want to exclude top tool because it is no longer displayed with the other tools, but rather separately. SPDEV-4
				if (tool !== this.props.topTool || this.props.tools.length === 1) {
					group.push(
						<Tool stringList={ this.props.stringList }
							tool={ tool }
							key={ tool.id }
							ref={ tool.id }
							isTopTool={ false }
							className={ groupNeedsExpansionButton ? "hidden" : "" }
							size={ group.length == 0 ? this.props.sizeFirstTool : this.props.sizeOtherTools }
							routes={ this.props.routes }
							goToPage={ this.props.goToPage }
							changeTabSequence={ this.props.tabSequence && toolIndex === toolsForGroup.length - 1 && nextThreatId ? e => this.props.tabSequence(nextThreatId, tool, e) : null }
							allowFocus={ this.props.allowFocus }/>
					);
				}
			});

			if (toolsForGroup.length > 0 && group.length > 0) {
				// Add title
				group.unshift(
					<div key={ threat.id + "-title" } className="title">{ threat.shortDescription }</div>
				);

				if (groupNeedsExpansionButton) {
					const groupHasTopTool = (toolsForGroup.indexOf(this.props.topTool) > -1);
					const topToolSubtraction = groupHasTopTool ? 1 : 0;
					const buttonCaption = StringUtils.getCountText(toolsForGroup.length - this.props.maxVisibleToolsPerThreat - topToolSubtraction, "[[number]]", "", this.props.stringList.get("action-plan-more-tools-single"), this.props.stringList.get("action-plan-more-tools-multiple"));
					const nextThreatId = threatIndex < this.props.threats.length - 1 ? this.props.threats[threatIndex + 1].id : null;

					group.push(
						<DetailsButton
							className="common-button-details-transparent"
							key="more"
							icon={ require("./../../../images/ui/icon-arrow-down-black.svg") }
							allowFocus={ this.props.allowFocus }
							title={ buttonCaption }
							onClick={ () => this.expandThreat(threat.id, lastVisibleToolRef) }
							changeTabSequence={ this.props.tabSequence ? e => this.props.tabSequence(nextThreatId, toolsForGroup[toolsForGroup.length - 1], e) : null }>
							{ buttonCaption }
						</DetailsButton>
					);
				}

				listNeedsExpansionButton = listNeedsExpansionButton || (!!this.props.maxVisibleThreats && threatIndex >= this.props.maxVisibleThreats && !this.state.expandedList);

				// If hidden, add to the caption of the "more.." dialog
				if (listNeedsExpansionButton) hiddenThreatNames.push(threat.name);

				groups.push(
					<div className={ "group" + (listNeedsExpansionButton ? " hidden" : "") }
						key={ threat.id }
						ref={ threat.id }>
						{group}
					</div>
				);
			}
		});

		if (listNeedsExpansionButton) {
			const threatList = ReactUtils.getReplacedList(
				hiddenThreatNames,
				function(index, innerText) {
					return <em key={ "item-" + index }>{ innerText }</em>;
				},
				this.props.stringList.get("common-list-divider"),
				this.props.stringList.get("common-list-divider-end-single"),
				this.props.stringList.get("common-list-divider-end-multiple")
			);

			groups.push(
				<div className="box-more-tools" key="more-tools">
					<div className="title">
						{ this.props.stringList.get("action-plan-more-threats-title") }
					</div>
					<div className="body">
						{ ReactUtils.getReplacedNodes(this.props.stringList.get("action-plan-more-threats-body"), "[[threats]]", threatList) }
					</div>
					<ActionButton
						allowFocus={ this.props.allowFocus }
						title={ this.props.stringList.get("action-plan-more-threats-button") }
						onClick={ this.expandList }>
						{ this.props.stringList.get("action-plan-more-threats-button") }
					</ActionButton>
				</div>
			);
		}

		return (
			<div className="common-tool-list" data-testid={this.props.dataTestId + '-tool-list'}>
				{groups}
			</div>
		);
	}

    expandList = () => {
		// Allows other threats to be displayed
		this.setState(Object.assign({}, this.state, { expandedList:true }));
	};

    isExpanded = () => {
		return this.state.expandedList;
	};

    expandThreat = (threatId, lastVisibleToolRef) => {
		// Add a specific threat to the allowed threat list, so its tools are always listed
		if (ADAUtils.isActivated) {
			// Setting the state would cause the currently focused button to disappear,
			// so the next focus would be on an item AFTER the newly created items
			// Instead, we set the focus to the last visible tool first, and only then change the state
			const toolComponent = this.refs[lastVisibleToolRef];
			if (toolComponent) {
				const toolElement = ReactDOM.findDOMNode(toolComponent).querySelector(".common-button-details");
				if (toolElement) toolElement.focus();
			}
		}
		this.setState(Object.assign({}, this.state, { expandedThreats:this.state.expandedThreats.concat(threatId) }));
	};

    hasElementForThreat = (threatId) => {
		return Boolean(this.refs[threatId]);
	};

    isThreatVisible = (threatId) => {
		// Whether a given threat is visible (as opposed to hidden because it's past the max number of visible threats)
		if (this.hasElementForThreat(threatId)) {
			if (this.isExpanded()) {
				// Expanded, so it should be visible, no need to search
				return true;
			} else {
				// Need to check where in the list this threat is
				return this.getThreatIndexById(threatId) < this.props.maxVisibleThreats;
			}
		}

		return false;
	};

    getThreatIndexById = (threatId) => {
		for (let i = 0; i < this.props.threats.length; i++) {
			if (this.props.threats[i].id == threatId) return i;
		}
		return undefined;
	};

    hasElementForTool = (toolId) => {
		return !!this.refs[toolId];
	};

    getElementForThreat = (threatId) => {
		return this.hasElementForThreat(threatId) ? ReactDOM.findDOMNode(this.refs[threatId]) : undefined;
	};

    getElementForTool = (toolId) => {
		return this.hasElementForTool(toolId) ? ReactDOM.findDOMNode(this.refs[toolId]) : undefined;
	};

    getAlignedThreat = (targetWindowY) => {
		// Helper function to find which threat group is aligned with a screen position
		// Goes through all threat elements to see which one is aligned
		// This is used by AllToolsPage and ReportPage
		// TODO: too many calls to PositionUtils.findElementRect, batch them first to avoid successive calls?
		let alignedThreat = undefined;
		let alignedThreatDistance = NaN;
		for (let i = 0; i < this.props.threats.length; i++) {
			if (this.hasElementForThreat(this.props.threats[i].id)) {
				// Has a threat, see if it's the focused one
				const threatElement = this.getElementForThreat(this.props.threats[i].id);
				const threatElementRect = PositionUtils.findElementRect(threatElement);

				// If within the range, just use it
				if (threatElementRect.y <= targetWindowY && threatElementRect.y + threatElementRect.height >= targetWindowY) {
					// Found one that is located inside the rect, so always use it
					alignedThreat = this.props.threats[i];
					break;
				}

				// Otherwise, use whatever's closest for now
				const threatDistance = Math.abs(targetWindowY < threatElementRect.y ? threatElementRect.y - targetWindowY : targetWindowY - threatElementRect.y - threatElementRect.height);
				if (alignedThreat == undefined || threatDistance < alignedThreatDistance) {
					alignedThreatDistance = threatDistance;
					alignedThreat = this.props.threats[i];
				}
			}
		}

		return alignedThreat;
	};

    getLastThreat = () => {
		// Finds the last visible threat
		let lastThreat = null;
		this.props.threats.forEach(threat => {
			if (this.hasElementForThreat(threat.id)) {
				lastThreat = threat;
			}
		});
		return lastThreat;
	};
}

export default ToolList;
