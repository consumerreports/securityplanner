import PropTypes from 'prop-types';
import React from "react";

import ImageContainer from "./../../common/ImageContainer.react";
import MarkdownUtils from "./../../../vendor/utils/MarkdownUtils";
import DirectionUtils from "./../../../vendor/utils/DirectionUtils";
import Transport from "./../../../vendor/utils/Transport";

class FooterDisclaimer extends React.Component {
    static propTypes = {
		stringList: PropTypes.object, // StringList
		routes: PropTypes.object, // SecurityPlannerRoutes
		goToPage: PropTypes.func,
		allowFocus: PropTypes.bool,
		additionalThreatUri: PropTypes.string,
		scrollToAThreat: PropTypes.func,
	};

    render() {
		return (
			<div className={ "common-footer-disclaimer " + DirectionUtils.getClass(this.props.stringList) }>
				<div className="header">
					<ImageContainer className="icon" src={ require("./../../../../images/ui/icon-disclaimer.svg") }/>
					<h5>{ this.props.stringList.get("action-plan-disclaimer-title") }</h5>
				</div>
				<div className="content">
					<p className="description">
						{ this.props.stringList.get("action-plan-disclaimer-description") }
					</p>
					<p className="link">
						{ this.props.additionalThreatUri ?
							this.renderLink(this.props.stringList.get("action-plan-disclaimer-link"))
						:
							MarkdownUtils.parseURLPure(
								this.props.stringList.get("action-plan-disclaimer-linkless"),
								undefined,
								undefined,
								this.onClickConnectWithSpecialists,
								this.urlFilter)
						}
					</p>
				</div>
			</div>
		);
	}

    renderLink = (message) => {
		return MarkdownUtils.parseURLPure(message, undefined, undefined, this.onClickAdditionalTools, this.urlFilter);
	};

    urlFilter = (url) => {
		return url === "{{internal-link}}" ? "#" : url;
	};

    onClickConnectWithSpecialists = (e) => {
		e.preventDefault();
		const connectWithSpecialistsId = "2BDCsBgU3iS8q44SA6GwcA"
		this.props.scrollToAThreat("2BDCsBgU3iS8q44SA6GwcA")
	};

    onClickAdditionalTools = (e) => {
		if (this.props.goToPage && this.props.additionalThreatUri) this.props.goToPage(this.props.additionalThreatUri, true, true);
		e.preventDefault();
	};
}

export default FooterDisclaimer;
