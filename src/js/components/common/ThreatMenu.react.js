import PropTypes from 'prop-types';
import React from "react";
import ReactDOM from 'react-dom';
import cx from "classnames";

import Transport from "./../../vendor/utils/Transport";
import ADAUtils from "./../../vendor/utils/ADAUtils";

import ResizeUtils from "./../../vendor/utils/ResizeUtils";
import DirectionUtils from "./../../vendor/utils/DirectionUtils";

import Dropdown from "./Dropdown.react";
import ImageContainer from "./ImageContainer.react";


class ThreatMenu extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			activeThreatIndex: 0,
			shouldShowMenuTrigger: false,
			menuDropdownOptionSelected: false
		}
		
		ResizeUtils.onResize.add(this.onResize);
	}
    static propTypes = {
		activeFilter: PropTypes.shape({
			cost: PropTypes.number,
			effort: PropTypes.number,
		}).isRequired,
		backgroundColor: PropTypes.string,
		currentActiveThreatId: PropTypes.string,
		filterCategories: PropTypes.shape({
			cost: PropTypes.object,
			effort: PropTypes.object,
		}),
		hasUpdatedFilter: PropTypes.bool,
		isFixed: PropTypes.bool,
		isVisible: PropTypes.bool,
		menuTitle: PropTypes.string,
		onClickThreat: PropTypes.func,
		onClickPrint: PropTypes.func,
		onUpdateActiveFilter: PropTypes.func,
		stringList: PropTypes.object,
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
		threatList: PropTypes.array, // Threat
		allowFocus: PropTypes.bool,
	};

	threatMenuTitle = "";
    wrapperPadding = 64; // 32px x 2

    shouldComponentUpdate(nextProps, nextState) {
		return nextProps.activeFilter.cost != this.props.activeFilter.cost ||
			nextProps.activeFilter.effort != this.props.activeFilter.effort ||
			nextProps.backgroundColor != this.props.backgroundColor ||
			nextProps.currentActiveThreatId != this.props.currentActiveThreatId ||
				(nextProps.filterCategories != this.props.filterCategories &&
					(nextProps.filterCategories == undefined ||
					this.props.filterCategories == undefined ||
					nextProps.filterCategories.cost != this.props.filterCategories.cost ||
					nextProps.filterCategories.effort != this.props.filterCategories.effort)) ||
			nextProps.hasUpdatedFilter != this.props.hasUpdatedFilter ||
			nextProps.isFixed != this.props.isFixed ||
			nextProps.isVisible != this.props.isVisible ||
			nextProps.menuTitle != this.props.menuTitle ||
			nextProps.onClickThreat != this.props.onClickThreat ||
			nextProps.onClickPrint != this.props.onClickPrint ||
			nextProps.onUpdateActiveFilter != this.props.onUpdateActiveFilter ||
			nextProps.stringList != this.props.stringList ||
			nextProps.threatList != this.props.threatList ||
			nextProps.allowFocus != this.props.allowFocus ||
			nextState.activeThreatIndex != this.state.activeThreatIndex ||
			nextState.shouldShowMenuTrigger != this.state.shouldShowMenuTrigger;
	}

    componentDidUpdate() {
		const newState = {};

		this.threatListEl = ReactDOM.findDOMNode(this.threatListComp);
		this.wrapperEl = ReactDOM.findDOMNode(this.wrapperComp);
		this.filterDropdownEl = ReactDOM.findDOMNode(this.filterDropdownComp);
		this.printButtonEl = ReactDOM.findDOMNode(this.printButtonComp);

		this.threatListWidth = this.threatListEl ? this.threatListEl.offsetWidth : 0;

		if (this.checkThreatNameWidth()) {
			newState.shouldShowMenuTrigger = true;
		}

		newState.activeThreatIndex = this.getActiveThreatIndex(this.props);

		this.setState(newState);
	}

    UNSAFE_componentWillReceiveProps(nextProps) {
		if (this.props.currentActiveThreatId !== nextProps.currentActiveThreatId) {
			this.setState({
				activeThreatIndex: this.getActiveThreatIndex(nextProps),
			});
		}
	}

    componentWillUnmount() {
		ResizeUtils.onResize.remove(this.onResize);
	}

    render() {
		const bp = ResizeUtils.getCurrentBreakpoint();
		const isTinyOrSmallBreakpoint = bp === "tiny" || bp === "small";

		if (this.props.isFixed && this.props.threatList[this.state.activeThreatIndex] !== undefined) {
			this.threatMenuTitle = this.props.menuTitle + ": " + this.props.threatList[this.state.activeThreatIndex].name;
		} else {
			this.threatMenuTitle = this.props.menuTitle;
		}

		const menuClasses = cx({
			"common-threat-menu": true,
			"is-fixed": this.props.isFixed,
			"is-hidden": !this.props.isVisible,
		});

		return (
			<div
				className={ menuClasses }
				style={ { backgroundColor: this.props.backgroundColor } }>
				<div className="wrapper" ref={ (r) => this.wrapperComp = r }>
					{ isTinyOrSmallBreakpoint || this.state.shouldShowMenuTrigger ? this.renderMenu(isTinyOrSmallBreakpoint) : this.renderThreatNames() }
					{ this.props.onClickPrint ? this.renderPrintButton() : null }
					{ this.props.onUpdateActiveFilter ?
						isTinyOrSmallBreakpoint ? this.renderFilterTrigger() : this.renderFilterDropdowns()
						: null }
				</div>
				<div className="bottom-line"/>
			</div>
		);
	}

	renderMenu = (isTinyOrSmallBreakpoint) => isTinyOrSmallBreakpoint ? this.renderMenuTrigger() : this.renderMenuDropdown();

	// Renders a menu dropdown instead of a trigger when the length of the names exceeds the max width of the menu container
	renderMenuDropdown = () => {
		return (
			<div className={ "threat-menu-trigger " + DirectionUtils.getClass(this.props.stringList) }
				ref={ (r) => this.menuDropdownComp = r }
				style={ this.props.threatList.length === 0 ? { visibility: "hidden" } : undefined}>
				<Dropdown
					activeOption={ this.state.activeThreatIndex }
					isActive={ this.state.menuDropdownOptionSelected }
					label={ this.threatMenuTitle }
					options={ this.props.threatList.map( threat => threat.name ) }
					allowFocus={ this.props.allowFocus }
					onSelectOption={ (selectedIndex) => this.selectCategoryDropdown(selectedIndex) }/>
			</div>
		);
	}

    renderMenuTrigger = () => {
		const style = {};
		const visible = this.props.threatList.length > 0;
		if (!visible) style.visibility = "hidden";

		return (
			<div className={ "threat-menu-trigger " + DirectionUtils.getClass(this.props.stringList) }
				style={ style }
				tabIndex={ visible && this.props.isVisible && this.props.allowFocus ? 0 : -1 }
				aria-label={ this.props.menuTitle }
				role="button"
				onKeyDown={ ADAUtils.handleKeyboard(this.showThreatOverlay) }
				onClick={ this.showThreatOverlay }>
				<div className="title">{ this.threatMenuTitle }</div>
				<ImageContainer className="icon" src={ require("./../../../images/ui/icon-arrow-down-black.svg") }/>
			</div>
		);
	};

    renderThreatNames = () => {
		return (
			<nav className={ "threat-menu-names " + DirectionUtils.getClass(this.props.stringList)}>
				<ul className="threat-list" ref={ (r) => this.threatListComp = r }>
					{ this.props.threatList.map((threat, i) => {
						const threatClasses = cx({
							"threat-list-item": true,
							"is-active": i === this.state.activeThreatIndex,
						});

						return (
							<li className={ threatClasses } key={ i }>
								<button
									className="name"
									tabIndex={ this.props.isVisible && this.props.allowFocus ? 0 : -1 }
									role="button"
									data-slug={ threat.slug }
									aria-label={ this.props.menuLabel + ', ' + threat.name }
									onKeyDown={ ADAUtils.handleKeyboard(e => this.props.onClickThreat(threat.id, e)) }
									onClick={ e => this.props.onClickThreat(threat.id, e) }>
									{ threat.name }
								</button>
							</li>
						);
					}) }
				</ul>
			</nav>
		);
	};

    renderPrintButton = () => {
		return (
			<div className="print-button"
				ref={ (r) => this.printButtonComp = r }
				tabIndex={ this.props.isVisible && this.props.allowFocus ? 0 : -1 }
				role="button"
				onKeyDown={ ADAUtils.handleKeyboard(this.props.onClickPrint) }
				onClick={ this.props.onClickPrint }>
				<ImageContainer 
					className="icon" 
					src={ require("./../../../images/ui/print-dark.svg") }
					dataTestId="threat-menu-print-button"/>
			</div>
		);
	};

    renderFilterTrigger = () => {
		const filterClasses = cx({
			"filter-trigger": true,
			"is-active": this.props.hasUpdatedFilter,
		});

		return (
			<button className={ filterClasses } onClick={ this.showFilterOverlay }>
				<div className="name">
					{ this.props.stringList.get("all-tools-filter-title") }
				</div>
			</button>
		);
	};

    renderFilterDropdowns = () => {
		return (
			<div className="filter-dropdown-wrapper" ref={ (r) => this.filterDropdownComp = r }>
				<Dropdown
					activeOption={ this.props.activeFilter.cost }
					isActive={ this.props.activeFilter.cost !== 0 }
					label={ this.props.filterCategories.cost.title }
					options={ this.props.filterCategories.cost.filters }
					allowFocus={ this.props.allowFocus }
					onSelectOption={ (selectedIndex) => this.selectFilterDropdown("cost", selectedIndex) }/>
				<Dropdown
					activeOption={ this.props.activeFilter.effort }
					isActive={ this.props.activeFilter.effort !== 0 }
					label={ this.props.filterCategories.effort.title }
					options={ this.props.filterCategories.effort.filters }
					allowFocus={ this.props.allowFocus }
					onSelectOption={ (selectedIndex) => this.selectFilterDropdown("effort", selectedIndex) }/>
			</div>
		);
	};

    showThreatOverlay = () => {
		Transport.get(ThreatMenu.ID_OVERLAY_THREAT_TRANSPORT).setState({
			backgroundColor: this.props.backgroundColor,
			menuTitle: this.props.menuTitle,
			onClickThreat: this.props.onClickThreat,
			threats: this.props.threatList,
			currentSelectedThreat: this.props.threatList[this.state.activeThreatIndex].id,
		});
		this.props.goToPage(this.props.routes.getUriOverlayThreatMenu(ThreatMenu.ID_OVERLAY_THREAT_TRANSPORT), true, true);
	};

    showFilterOverlay = () => {
		Transport.get(ThreatMenu.ID_OVERLAY_TOOL_TRANSPORT).setState({
			activeFilter: this.props.activeFilter,
			backgroundColor: this.props.backgroundColor,
			buttonLabels: {
				"done": this.props.stringList.get("all-tools-filter-done"),
				"default": this.props.stringList.get("all-tools-filter-default"),
				"apply": this.props.stringList.get("all-tools-filter-apply"),
			},
			filterCategories: this.props.filterCategories,
			hasUpdatedFilter: this.props.hasUpdatedFilter,
			onUpdateActiveFilter: this.props.onUpdateActiveFilter,
		});
		this.props.goToPage(this.props.routes.getUriOverlayToolsFilter(ThreatMenu.ID_OVERLAY_TOOL_TRANSPORT), true, true);
	};

    onResize = () => {
		if (this.checkThreatNameWidth() && !this.state.shouldShowMenuTrigger) {
			this.setState({
				shouldShowMenuTrigger: true,
			});
		} else if (!this.checkThreatNameWidth() && this.state.shouldShowMenuTrigger) {
			this.setState({
				shouldShowMenuTrigger: false,
			});
		}
	};

    checkThreatNameWidth = () => {
		const allowedSize = this.wrapperEl.offsetWidth - this.wrapperPadding - (this.filterDropdownEl ? this.filterDropdownEl.offsetWidth : 0) - (this.printButtonEl ? this.printButtonEl.offsetWidth + 10 : 0);
		return this.threatListWidth > allowedSize;
	};

    getActiveThreatIndex = (props) => {
		for (let i = 0; i < props.threatList.length; i++) {
			if (props.currentActiveThreatId === props.threatList[i].id) {
				return i;
			}
		}
	};

    selectFilterDropdown = (filterType, selectedIndex) => {
		const newFilters = Object.assign({}, this.props.activeFilter);
		newFilters[filterType] = selectedIndex;

		this.props.onUpdateActiveFilter(newFilters);
	};

	selectCategoryDropdown = (threatIndex) => {
		this.setState({ menuDropdownOptionSelected: true })
		this.props.onClickThreat(this.props.threatList[threatIndex].id)
	}
}

ThreatMenu.ID_OVERLAY_THREAT_TRANSPORT = "threat-overlay";
ThreatMenu.ID_OVERLAY_TOOL_TRANSPORT = "filter-overlay";

export default ThreatMenu;
