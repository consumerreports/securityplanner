import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";

import ImageContainer from "./../../common/ImageContainer.react";
import ADAUtils from "./../../../vendor/utils/ADAUtils";

class TabHead extends React.Component {
    static propTypes = {
		id: PropTypes.string,
		currentId: PropTypes.string,
		iconSrc: PropTypes.string,
		enabled: PropTypes.bool,
		visible: PropTypes.bool,
		allowFocus: PropTypes.bool,
		onSelect: PropTypes.func,
	};

    render() {
		const isSelected = this.props.id === this.props.currentId;
		const classNames = cx("tab-head", {
			visible: this.props.visible,
			selected: isSelected,
			disabled: !this.props.enabled,
		});

		return (
			<div className={ classNames }
				tabIndex={ this.props.allowFocus ? 0 : -1 }
				role="tab"
				onKeyDown={ ADAUtils.handleKeyboard(this.onClickTab) }
				onClick={ this.onClickTab }
				data-testid={ this.props.dataTestId }>
				<ImageContainer className="icon" src={ this.props.iconSrc } />
				<div className="text">
					{ this.props.children }
				</div>
				<div className="background"/>
			</div>
		);
	}

    onClickTab = () => {
		if (this.props.onSelect) this.props.onSelect(this.props.id);
	};
}

export default TabHead;