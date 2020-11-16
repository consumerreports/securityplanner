import PropTypes from 'prop-types';
import React from "react";

import Threat from "./Threat.react";

class ThreatList extends React.Component {
    static propTypes = {
		stringList: PropTypes.object,
		threats: PropTypes.array, // Threat[]
		tools: PropTypes.array, // Tool[]
	};

    render() {
		return (
			<div className="threat-list">
				{ this.renderThreats() }
			</div>
		);
	}

    renderThreats = () => {
		const components = [];
		this.props.threats.forEach((threat, index) => {
			if (index > 0) components.push(
				<hr key={ "hr-" + index }/>
			);
			components.push(
				this.renderThreat(threat, index)
			);
		});
		return components;
	};

    renderThreat = (threat, index) => {
		return (
			<Threat
				key={ "threat-" + index }
				stringList={ this.props.stringList }
				threat={ threat }
				tools={ this.props.tools.filter((tool) => tool.threat == threat) } />
		);
	};
}

export default ThreatList;
