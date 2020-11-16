import PropTypes from 'prop-types';
import React from "react";
import ReactDOM from 'react-dom';
import createReactClass from 'create-react-class';
import cx from "classnames";

import PageUtils from "./../../vendor/utils/PageUtils";
import ADAUtils from "./../../vendor/utils/ADAUtils";

import ImageContainer from "./ImageContainer.react";

const Dropdown = createReactClass({
    displayName: 'Dropdown',
    uuid: undefined,

    propTypes: {
		activeOption: PropTypes.number,
		isActive: PropTypes.bool,
		label: PropTypes.string,
		options: PropTypes.array.isRequired,
		allowFocus: PropTypes.bool,
		onSelectOption: PropTypes.func.isRequired,
	},

    getInitialState: function() {
		return {
			isMenuOpen: false,
		};
	},

    UNSAFE_componentWillMount: function() {
		this.listener = (e) => this.handleDocumentClick(e);
		window.addEventListener(PageUtils.isTouchDevice() ? "touchend" : "click", this.listener);
		document.addEventListener("keydown", this.handleKeyPress);
		this.uuid = `__label_id__${Date.now()}__${Math.round(Math.random() * 100000)}_`;
	},

    componentWillUnmount: function() {
		window.removeEventListener(PageUtils.isTouchDevice() ? "touchend" : "click", this.listener);
		document.removeEventListener("keydown", this.handleKeyPress);
	},

    render() {
		const triggerClasses = cx({
			"dropdown-trigger": true,
			"has-updated": this.props.isActive,
		});

		const triangle = this.props.isActive ? require("./../../../images/ui/triangle-down-white.svg") : require("./../../../images/ui/triangle-down-black.svg");

		return (
			<div className="dropdown">
				<div
					className={ triggerClasses }
					tabIndex={ this.props.allowFocus ? 0 : -1 }
					role="composite"
					aria-expanded={ this.state.isMenuOpen }
					aria-label={ `${ this.props.label }, ${ this.props.options[this.props.activeOption] }` }
					onKeyDown={ ADAUtils.handleKeyboard(this.toggleMenu) }
					onClick={ this.toggleMenu }
					ref={ e => this.triggerElement = e }>
					<div className="label">
						{ this.props.label }
					</div>
					<ImageContainer className="icon" src={ triangle }/>
				</div>
				{ this.state.isMenuOpen ? this.renderDropdownMenu() : null }
			</div>
		);
	},

    renderDropdownMenu: function() {
		return (
			<div className="dropdown-menu">
				<ul
					className="dropdown-option-list"
					role="radiogroup"
					aria-label={ this.props.label }>
					{ this.props.options.map((option, i) => {
						const isOptionActive = this.props.activeOption === i;

						const listItemClasses = cx({
							"dropdown-option-list-item": true,
							"is-active": isOptionActive,
						});

						return (
							<li className={ listItemClasses } key={ i }>
								<button
									className="option-name"
									tabIndex={ this.props.allowFocus ? 0 : -1 }
									onKeyDown={ ADAUtils.handleKeyboard(e => this.onClickOption(i, e)) }
									onClick={ () => this.onClickOption(i) }
									role="radio"
									aria-label={`${ this.props.label }, ${ option }`}
									aria-checked={ isOptionActive }>
									{ option }
								</button>
								<span className="checkmark">
									<ImageContainer className="icon" src={ require("./../../../images/ui/checkmark-small-black.svg") }/>
								</span>
							</li>
						);
					}) }
				</ul>
			</div>
		);
	},

    onClickOption: function(i, e) {
		this.toggleMenu();
		this.props.onSelectOption(i, e);
	},

    toggleMenu: function() {
		this.setState({
			isMenuOpen: !this.state.isMenuOpen,
		});
	},

	handleKeyPress: function(event) {
		if (this.state.isMenuOpen && event.key == "Escape") {
			this.setState({
				isMenuOpen: false,
			})
		}
	},

    handleDocumentClick: function(e) {
		if (this.state.isMenuOpen && !ReactDOM.findDOMNode(this).contains(e.target)) {
			this.setState({
				isMenuOpen: false,
			});
		}
	},
});

export default Dropdown;
