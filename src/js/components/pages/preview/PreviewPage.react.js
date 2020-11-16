import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";

import DirectionUtils from "./../../../vendor/utils/DirectionUtils";
import MiniRouter from "./../../../vendor/routing/MiniRouter";

import PreviewRoutes from "./../../../routing/PreviewRoutes";

import LanguageMenu from "./../../common/LanguageMenu.react";

import ToolPreview from "./ToolPreview.react";
import BioPreview from "./BioPreview.react";
import EffectsPreview from "./EffectsPreview.react";

class PreviewPage extends React.Component {
    static propTypes = {
		stringList: PropTypes.object,
		selectedLanguage: PropTypes.object, // Language
		availableLanguages: PropTypes.arrayOf(PropTypes.object), // Language[]
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
		path: PropTypes.string, // E.g /aa/asd
		bios: PropTypes.array, // List of Bio objects
		statements: PropTypes.array.isRequired, // Statement[]
		tools: PropTypes.array.isRequired, // Tool[]
		levels: PropTypes.array.isRequired, // Level[]
		threats: PropTypes.array.isRequired, // Threat[]
		topRecommendedTool: PropTypes.object, // Tool[]
		recommendedTools: PropTypes.array, // Tool
		recommendedThreats: PropTypes.array, // Threat[]
	};

    router = undefined;
    routes = undefined;

    UNSAFE_componentWillMount() {
		this.routes = new PreviewRoutes();

		this.router = new MiniRouter();
		this.router.addTemplate(this.routes.getUriTool(), this.getUriToolContent);
		this.router.addTemplate(this.routes.getUriBio(), this.getUriBioContent);
		this.router.addTemplate(this.routes.getUriEffects(), this.getUriEffectsContent);
	}

    render() {
		return (
			<div
				className={ cx("sectionPageHolder", "pagePreview", DirectionUtils.getClass(this.props.stringList)) }>
				<LanguageMenu stringList={ this.props.stringList }
					availableLanguages={ this.props.availableLanguages }
					selectedLanguage={ this.props.selectedLanguage }/>
				<div className="container">
					{ this.renderRoute() }
				</div>
			</div>
		);
	}

    renderRoute = () => {
		const component = this.router.handle(this.props.path);
		if (component) {
			return component;
		} else {
			return (<div>NOT FOUND</div>);
		}
	};

    // Handlers
    getUriToolContent = (componentParams) => {
		// A tool
		const tool = this.props.tools.find(tool => tool.slug === componentParams.toolSlug || tool.id === componentParams.toolSlug);
		if (!tool) return null;

		return (
			<div className="content">
				<div className="title">
					{ `Preview for tool "${tool.name}"` }
				</div>
				<hr/>
				<ToolPreview
					className="body body-tool"
					stringList={ this.props.stringList }
					routes={ this.props.routes }
					goToPage={ this.props.goToPage }
					tool={ tool }/>
			</div>
		);
	};

    getUriBioContent = (componentParams) => {
		// A bio
		const bio = this.props.bios.find(bio => bio.slug === componentParams.bioSlug || bio.id === componentParams.bioSlug);
		if (!bio) return null;

		return (
			<div className="content">
				<div className="title">
					{ `Preview for bio "${bio.name}"` }
				</div>
				<hr/>
				<BioPreview
					className="body body-bio"
					stringList={ this.props.stringList }
					routes={ this.props.routes }
					goToPage={ this.props.goToPage }
					bio={ bio }/>
			</div>
		);
	};

    getUriEffectsContent = (componentParams) => { // eslint-disable-line no-unused-vars
		// Preview of tool/statement relationships
		return (
			<div className="content">
				<div className="title">
					{ "Tool/Statement Effects" }
				</div>
				<hr/>
				<EffectsPreview
					className="body body-effects"
					stringList={ this.props.stringList }
					routes={ this.props.routes }
					goToPage={ this.props.goToPage }
					statements={ this.props.statements }
					tools={ this.props.tools }
					levels={ this.props.levels }
					threats={ this.props.threats }
					topRecommendedTool={ this.props.topRecommendedTool }
					recommendedTools={ this.props.recommendedTools }
					recommendedThreats={ this.props.recommendedThreats }/>
			</div>
		);
	};

    /**
	 * Ran when the section becomes the focused section
	 */
    onActivate = (travelOffset, viaHistoryAPI, fromOverlay) => { // eslint-disable-line no-unused-vars
	};

    /**
	 * Ran when the section is about to lose focus
	 */
    onDeactivate = (travelOffset, viaHistoryAPI, toOverlay) => { // eslint-disable-line no-unused-vars
	};

    /**
	 * Returns the color (as a number) that the locator bar should have when opaque
	 */
    getDesiredLocatorBackgroundColor = () => {
		return undefined;
	};
}

export default PreviewPage;
