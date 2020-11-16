import PropTypes from 'prop-types';
import React from "react";

import Tool from "./../../common/Tool.react";
import { default as PrintedTool } from "./../printreport/Tool.react";

class ToolPreview extends React.Component {
    static propTypes = {
		className: PropTypes.string,
		stringList: PropTypes.object,
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		tool: PropTypes.object.isRequired, // Tool
	};

    render() {
		return (
			<div className={ this.props.className }>
				<div className="subtitle">
					Printed (Printable Action Plan)
				</div>
				<div className="container container-printed-tool previewContent-print-tool">
					<PrintedTool
						stringList={ this.props.stringList }
						tool={ this.props.tool }/>
				</div>
				<div className="subtitle">
					Small (All Recommendations)
				</div>
				<div className="container container-all-tools">
					<Tool
						stringList={ this.props.stringList }
						tool={ this.props.tool }
						size={ "small" }
						routes={ this.props.routes }
						goToPage={ this.props.goToPage }/>
				</div>
				<div className="subtitle">
					Medium (All Recommendations, Action Plan)
				</div>
				<div className="container container-all-tools">
					<Tool
						stringList={ this.props.stringList }
						tool={ this.props.tool }
						size={ "medium" }
						routes={ this.props.routes }
						goToPage={ this.props.goToPage }/>
				</div>
				<div className="subtitle">
					Large (All Recommendations, Action Plan)
				</div>
				<div className="container container-all-tools">
					<Tool
						stringList={ this.props.stringList }
						tool={ this.props.tool }
						size={ "large" }
						routes={ this.props.routes }
						goToPage={ this.props.goToPage }/>
				</div>
			</div>
		);
	}
}

export default ToolPreview;
