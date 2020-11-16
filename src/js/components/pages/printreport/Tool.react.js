import PropTypes from 'prop-types';
import React from "react";

import ReactUtils from "./../../../vendor/utils/ReactUtils";
import DirectionUtils from "./../../../vendor/utils/DirectionUtils";

class Tool extends React.Component {
    static propTypes = {
		stringList: PropTypes.object,
		tool: PropTypes.object, // Tool
	};

    render() {
		return (
			<div className={ "tool " + DirectionUtils.getClass(this.props.stringList) }>
				<div className="checkbox"/>
				<div className="title">
					{ this.props.tool.name }
				</div>
				<div className="description">
					{ this.props.tool.shortDescription }
				</div>
				<div className="cost">
					{ this.renderCost() }
				</div>
				<div className={ "link " + DirectionUtils.getClass(this.props.stringList) }>
					{ this.renderLink() }
				</div>
			</div>
		);
	}

    renderCost = () => {
		const isToolFree = !this.props.tool.price || !this.props.tool.price.trim();

		return ReactUtils.getReplacedNodes(
			this.props.stringList.get("action-plan-print-tool-cost"),
			"[[price]]",
			<span className="price"> { isToolFree ? this.props.stringList.get("tool-label-free") : this.props.tool.price } </span>
		);
	};

    renderLink = () => {
		if (this.props.tool.buttons) {
			return this.props.tool.buttons.map((button, index) => {
				return (
					<div key={ "link-" + index }>
						<a href={ button.url }>
							{ this.getCleanLink(button.url) }
						</a>
					</div>
				);
			});
		} else {
			return null;
		}
	};

    getCleanLink = (url) => {
		return url.replace(/^http(s|):\/\//, "").replace(/\/$/, "");
	};
}

export default Tool;
