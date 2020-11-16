import PropTypes from 'prop-types';
import React from "react";

import ImageContainer from "./../../common/ImageContainer.react";

class SponsorsBanner extends React.Component {
    static propTypes = {
		stringList: PropTypes.object, // StringList
		allowFocus: PropTypes.bool,
	};

    render() {
		return (
			<div className="sponsors-banner">
				<div className="title">
					{ this.props.stringList.get("cover-sponsors-title") }
				</div>
				{ this.renderLogos() }
			</div>
		);
	}

    renderLogos = () => {
		const logoAssets = this.props.stringList.getAssetArray("cover-sponsors-list");
		const logos = logoAssets.map((asset, index) => {
			return (
				<a
					key={ index }
					href={ asset.link }
					tabIndex={ this.props.allowFocus ? 0 : -1 }
					role="link"
					target="_blank"
					className="link">
					<ImageContainer
						className="logo"
						description={ asset.title }
						src={ asset.src } />
				</a>
			);
		});

		return (
			<div className="logos">
				{ logos }
			</div>
		);
	};
}

export default SponsorsBanner;