import PropTypes from 'prop-types';
import React from "react";

import Tool from "./Tool.react";

class TopPriorityTool extends React.Component {
    static propTypes = {
		stringList: PropTypes.object,
		tool: PropTypes.object, // Tool
	};

    render() {
		return (
			<div className="top-priority">
				<div className="column-title">
					<span className="title">{ this.props.stringList.get("action-plan-print-top-title") }</span>
				</div>
				<div className="column-tool-image">
					<img className="image" src={ this.props.tool.image } alt=""/>
				</div>
				<div className="column-tool-info">
					<Tool stringList={ this.props.stringList } tool={ this.props.tool }/>
				</div>
			</div>
		);
	}
}

export default TopPriorityTool;
