import PropTypes from 'prop-types';
import React from "react";

import Tool from "./Tool.react";

class Threat extends React.Component {
    static propTypes = {
		stringList: PropTypes.object,
		threat: PropTypes.object, // Threat
		tools: PropTypes.array, // Tool[]
	};

    render() {
		return (
			<div className="threat">
				<div className="title">
					{ this.props.threat.shortDescription }
				</div>
				<div className="tools">
					{ this.renderTools() }
				</div>
			</div>
		);
	}

    renderTools = () => {
		return this.props.tools.map((tool, index) => {
			return (
				<Tool
					key={ index }
					stringList={ this.props.stringList }
					tool={ tool }/>
			);
		});
	};
}

export default Threat;
