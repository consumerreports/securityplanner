import PropTypes from 'prop-types';
import React from "react";

import Bio from "./Bio.react";

class BioSection extends React.Component {
    static propTypes = {
		bios: PropTypes.array, // List of Bio objects
		stringList: PropTypes.object, // StringList
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
		sectionID: PropTypes.string,
		allowFocus: PropTypes.bool,
	};

    render() {
		const filteredBios = this.props.bios.filter(bio => bio.sectionID === this.props.sectionID);

		return (
			<div className="bioSection">
				<div className="section-description">
					<h5 className="section-description-header">
						{this.props.stringList.get(`about-us-${this.props.sectionID}-header`)}
					</h5>
					<p className="section-description-body">
						{this.props.stringList.get(`about-us-${this.props.sectionID}-body`)}
					</p>
				</div>
				<div className="content">
					<ul className="bio-list">
						{filteredBios.map((bio, i) => {
							return (
								<li key={ i }>
									<Bio
										bio={ bio }
										routes={ this.props.routes }
										goToPage={ this.props.goToPage }
										allowFocus={ this.props.allowFocus }/>
								</li>
							);
						})}
					</ul>
				</div>
			</div>
		);
	}
}

export default BioSection;