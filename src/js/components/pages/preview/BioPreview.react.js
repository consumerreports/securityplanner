import PropTypes from 'prop-types';
import React from "react";

import Bio from "./../about/Bio.react";

class BioPreview extends React.Component {
    static propTypes = {
		className: PropTypes.string,
		stringList: PropTypes.object,
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		bio: PropTypes.object.isRequired, // Bio
	};

    render() {
		return (
			<div className={ this.props.className }>
				<div className="subtitle">
					Preview
				</div>
				<div className="container pageAbout">
					<Bio
						bio={ this.props.bio }
						routes={ this.props.routes }
						goToPage={ this.props.goToPage }/>
				</div>
			</div>
		);
	}
}

export default BioPreview;
