import PropTypes from 'prop-types';
import React from "react";

import Tool from "../../common/Tool.react";

class ToolList extends React.Component {
    static propTypes = {
		stringList: PropTypes.object,
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
		tools: PropTypes.array.isRequired, // Tool
		recommendationLevel: PropTypes.string, // Level id
	};

    render() {
		const toolNodes = [];

		this.props.tools.forEach(tool => {
			if (!this.props.recommendationLevel || tool.recommendationLevel == this.props.recommendationLevel) {
				toolNodes.push(
					<Tool stringList={ this.props.stringList }
						tool={ tool }
						key={ tool.id }
						size="medium"
						routes={ this.props.routes }
						goToPage={ this.props.goToPage }/>
				);
			}
		});

		return (
			<div className="tools">
				{toolNodes}
			</div>
		);
	}
}

export default ToolList;