import PropTypes from 'prop-types';
import React from "react";

import SecurityPlannerConstants from "./../../../constants/SecurityPlannerConstants";
import SecurityPlannerStore from "./../../../stores/SecurityPlannerStore";
import MiniTracker from "./../../../vendor/tracking/MiniTracker";
import DirectionUtils from "./../../../vendor/utils/DirectionUtils";
import Footer from "./Footer.react";
import Header from "./Header.react";
import ThreatList from "./ThreatList.react";
import TopPriorityTool from "./TopPriorityTool.react";

class PrintReportPage extends React.Component {
    static propTypes = {
		stringList: PropTypes.object,
		threats: PropTypes.array, // Threat[]
		topTool: PropTypes.object, // Tool
		tools: PropTypes.array, // Tool[]
	};

    shareURL = undefined;
    isActive = false;
    hasAttemptedPrint = false;

    UNSAFE_componentWillMount() {
		document.body.style.overflow = "auto";
		document.body.style.background = "#ffffff";
	}

    componentDidMount() {
		MiniTracker.trackEvent("page", "print-action-plan", this.getResultsHash());

		window.addEventListener("load", () => { this.attemptPrint(); });

		setTimeout(() => { this.attemptPrint(); }, 100);
	}

    attemptPrint = () => {
		const isLoaded = document.readyState === "complete";

		if (isLoaded && !this.hasAttemptedPrint) {
			this.hasAttemptedPrint = true;

			setTimeout(() => {
				window.print();
				if (SecurityPlannerConstants.UI.CLOSE_TAB_AFTER_PRINT) {
					// We also need to wait a bit before closing.
					// This is a strange wait - it's just to wait for the dialog to open, since the timeout
					// pauses when the print dialog is open.
					setTimeout(() => { this.closePage(); }, 800);
				}
			}, 20);
		}
	};

    closePage = () => {
		window.close();
	};

    render() {
		// We pick the first tool of the first threat as our "top" recommendation
		const topToolIndex = this.props.tools.findIndex(tool => tool == this.props.topTool);
		const toolsToUse = this.props.tools.slice(0, topToolIndex).concat(this.props.tools.slice(topToolIndex + 1));
		const threatsToUse = this.getThreatsToUse(this.props.threats, toolsToUse);

		return (
			<div className={ "pagePrintReport " + DirectionUtils.getClass(this.props.stringList) }>
				<Header
					stringList={ this.props.stringList }
					toolsHash={ this.getResultsHash() }/>
				<hr/>
				<TopPriorityTool
					stringList={ this.props.stringList }
					tool={ this.props.topTool }/>
				<hr/>
				<ThreatList
					stringList={ this.props.stringList }
					threats={ threatsToUse }
					tools={ toolsToUse }/>
				<hr className="thin"/>
				<Footer
					stringList={ this.props.stringList }/>
			</div>
		);
	}

    getResultsHash = () => {
		// Returns the current state as a hash
		return SecurityPlannerStore.saveState();
	};

    getThreatsToUse = (allThreats, tools) => {
		// Get a list of threat groups with at least one tool
		const orderedThreats = [];
		allThreats.forEach(threat => {
			if (tools.some(tool => tool.threat.id == threat.id)) {
				orderedThreats.push(threat);
			}
		});
		return orderedThreats;
	};

    /**
	 * Ran when the section becomes the focused section
	 */
    onActivate = (travelOffset, viaHistoryAPI, fromOverlay) => { // eslint-disable-line no-unused-vars
		this.isActive = true;
	};

    /**
	 * Ran when the section is about to lose focus
	 */
    onDeactivate = (travelOffset, viaHistoryAPI, toOverlay) => { // eslint-disable-line no-unused-vars
		// Ran when the section becomes inactive
		this.isActive = false;
	};
}

export default PrintReportPage;
