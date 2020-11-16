import PropTypes from 'prop-types';
import React from "react";

import ReactUtils from "./../../../vendor/utils/ReactUtils";

class Header extends React.Component {
    static propTypes = {
		stringList: PropTypes.object,
		toolsHash: PropTypes.string,
	};

    render() {
		return (
			<div className="header">
				<div className="left">
					<div className="title">{ this.props.stringList.get("action-plan-print-header-title") }</div>
					{ this.renderSubtitle() }
				</div>
				<div className="right">
					<div className="link">{ this.props.stringList.get("common-friendly-url") }</div>
				</div>
			</div>
		);
	}

    renderSubtitle = () => {
		const url = this.props.stringList.get("action-plan-share-url").replace("[[hash]]", this.props.toolsHash);
		const template = this.props.stringList.get("action-plan-print-header-subtitle");
		return (
			<div className="subtitle">
				{ ReactUtils.getReplacedNodes(template, "[[url]]",
					<span className="link"> { url } </span>
				) }
			</div>
		);
	};

    renderSignature = () => {
		return (
			<div className="signature">
				<div className="prefix">
					{ this.props.stringList.get("action-plan-print-header-citizen-prefix") }
				</div>
				<div className="logo">
					<img src={ require("./../../../../images/sponsors/citizenlab-grayscale.png") } title="The Citizen Lab"/>
				</div>
				<div className="prefix"/>
				<div className="logo">
					<img src={ require("./../../../../images/sponsors/jigsaw-grayscale.png") } title="Jigsaw"/>
				</div>
			</div>
		);
	};
}

export default Header;
