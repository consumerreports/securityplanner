import PropTypes from 'prop-types';
import React from "react";

class SecondaryResources extends React.Component {
    static propTypes = {
		resourceList: PropTypes.array, // ResourceLink[]
		stringList: PropTypes.object, // StringList
		allowFocus: PropTypes.bool,
	};

    render() {
		return (
			<div className="resources">
				<h3 className="headline">
					{this.props.stringList.get("overlay-tool-resources-title")}
				</h3>
				<ul className="resource-list">
					{this.props.resourceList.map((resource, i) => {
						return (
							<li key={ i }>
								<div className="resource-list-item">
									<a
										className="resource-link"
										href={ resource.url }
										tabIndex={ this.props.allowFocus ? 0 : -1 }
										role="link"
										target="_blank">
										<span>{resource.caption}</span>
									</a>
									<div className="resource-source">
										{resource.source}
									</div>
								</div>
							</li>
						);
					})}
				</ul>
			</div>
		);
	}
}

export default SecondaryResources;
