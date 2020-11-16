import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";

import ImageContainer from "../../common/ImageContainer.react";

import ADAUtils from "./../../../vendor/utils/ADAUtils";
import PageSectionHelper from "./../../../vendor/utils/PageSectionHelper";
import DirectionUtils from "./../../../vendor/utils/DirectionUtils";
import Transport from "./../../../vendor/utils/Transport";

class ToolsFilterOverlay extends React.Component {
    static propTypes = {
		stringList: PropTypes.object,
		scrollPosition: PropTypes.number,
		transportId: PropTypes.string,
		onClickClose: PropTypes.func,
	};

    helper = undefined;

    UNSAFE_componentWillMount() {
		this.helper = new PageSectionHelper(this);
	}

    componentDidMount() {
		this.helper.setComponent(this.refs.scroller);
		document.addEventListener("keydown", this.handleKeyPress);
	}

    componentDidUpdate() {
		this.helper.setComponent(this.refs.scroller);
		this.helper.forceCheck();
	}

    componentWillUnmount() {
		this.helper.destroy();
	}

    render() {
		const classes = cx({
			"overlay": true,
			"overlayToolsFilter": true,
			"hidden": !this.state.visible,
			"showing": this.state.showing,
			"hiding": this.state.hiding,
		}, DirectionUtils.getClass(this.props.stringList));

		const headerClasses = cx({
			"header": true,
			"has-updated": this.state.currentHasUpdatedFilter,
		});

		const gState = this.getFilterState();

		return (
			<div
				className={ classes }
				aria-hidden={ !this.helper.isActive() }
				style={ { height: this.helper.getWindowHeight() } }>
				<div className="cover"/>
				<div className="mask">
					<div className="background background-dark show-fading-full"/>
					<div
						className="content show-sliding-up-full"
						ref="scroller"
						style={ { backgroundColor: gState.backgroundColor } }>
						<div
							className="wrapper"
							style={ { minHeight: this.helper.getMinScrollableHeight() } }>
							<div className={ headerClasses }>
								{ this.state.currentHasUpdatedFilter ?
									<button
										className="header-button header-button--done"
										tabIndex={ this.helper.isActive() ? 0 : -1 }
										role="button"
										onKeyDown={ ADAUtils.handleKeyboard(this.onClickDefault) }
										onClick={ this.onClickDefault }>
										<span>{ gState.buttonLabels.default }</span>
									</button> : null }
								<button
									className="header-button header-button--done"
									tabIndex={ this.helper.isActive() ? 0 : -1 }
									role="button"
									onKeyDown={ ADAUtils.handleKeyboard(this.close) }
									onClick={ this.close }>
									<span>{ this.state.currentHasUpdatedFilter ? gState.buttonLabels.apply : gState.buttonLabels.done }</span>
								</button>
							</div>
							<div className="body">
								{ Object.keys(gState.filterCategories).map((key, i) => {
									return this.renderFilter(key, i);
								}) }
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

    renderFilter = (filterType, index) => {
		const filterObj = this.getFilterState().filterCategories[filterType];

		return (
			<div className="filter-category" key={ index }>
				<div className="filter-category-name">
					{ filterObj.title }
				</div>
				<ul
					className="filter-list"
					role="radiogroup"
					aria-label={ filterObj.title }>
					{ filterObj.filters.map((filter, i) => {
						const isFilterActive = this.state.currentActiveFilter[filterType] === i;

						const checkmarkClasses = cx({
							"checkmark": true,
							"is-active": isFilterActive,
						});

						return (
							<li className="filter-list-item" key={ i }>
								<span className={ checkmarkClasses }>
									<ImageContainer className="icon" src={ require("./../../../../images/ui/checkmark-small-black.svg") }/>
								</span>
								<button
									className="filter-name"
									aria-label={ filter }
									tabIndex={ this.helper.isActive() ? 0 : -1 }
									role="radio"
									aria-checked={ isFilterActive }
									onKeyDown={ ADAUtils.handleKeyboard(() => this.onClickFilter(filterType, i)) }
									onClick={ () => this.onClickFilter(filterType, i) }>
									<span>{ filter }</span>
								</button>
							</li>
						);
					}) }
				</ul>
			</div>
		);
	};

    getFilterState = () => {
		return Transport.get(this.props.transportId).getState();
	};

    /**
	 * Ran when the section becomes the focused section
	 */
    onActivate = (travelOffset, viaHistoryAPI) => {
		this.helper.onActivate(travelOffset, viaHistoryAPI);
	};

    /**
	 * Ran when the section is about to lose focus
	 */
    onDeactivate = (travelOffset, viaHistoryAPI) => {
		this.helper.onDeactivate(travelOffset, viaHistoryAPI);
	};

    onClickFilter = (filterType, index) => {
		if (index === this.state.currentActiveFilter[filterType]) return;

		const newActiveFilter = Object.assign({}, this.state.currentActiveFilter);
		newActiveFilter[filterType] = index;

		this.setState({
			currentActiveFilter: newActiveFilter,
			currentHasUpdatedFilter: true,
			hasChanged: true,
		});
	};

    onResize = (dimensions) => {
		this.setState({
			windowHeight: dimensions.height,
		});
	};

    startTransitionShow = (callback) => {
		this.setState({ visible:false, showing:true, hiding:false });

		requestAnimationFrame(callback);

		setTimeout(() => {
			if (this.state.showing) {
				this.setState({ visible:true, showing:false, hiding:false });

				document.body.style.top = `-${this.props.scrollPosition}px`;
				document.body.style.marginTop = `${this.props.scrollPosition}px`;
				document.body.style.height = `${window.innerHeight}px`;
				document.body.style.overflow = "hidden";
			}
		}, 830);
	};

    startTransitionHide = (callback) => {
		this.setState({ visible:true, showing:false, hiding:true });

		document.body.style.top = "";
		document.body.style.marginTop = "";
		document.body.style.height = "";
		document.body.style.overflow = "";

		setTimeout(() => {
			callback();
		}, 330);

		if (this.state.hasChanged) this.getFilterState().onUpdateActiveFilter(this.state.currentActiveFilter);
	};

    onClickDefault = () => {
		this.setState({
			currentActiveFilter: {
				cost: 0,
				effort: 0,
			},
			currentHasUpdatedFilter: false,
			hasChanged: true,
		});
	};

    close = () => {
		document.removeEventListener("keydown", this.handleKeyPress);
		if (this.props.onClickClose) this.props.onClickClose();
	};

    handleKeyPress = (event) => {
		if (event.key == "Escape") {
			this.close();
		}
	};

    state = {
        currentActiveFilter: this.getFilterState().activeFilter,
        currentHasUpdatedFilter: this.getFilterState().hasUpdatedFilter,
        hiding: false,
        showing: false,
        visible: false,
        hasChanged: false,
    };
}

export default ToolsFilterOverlay;
