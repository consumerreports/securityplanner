import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";

import ActionButton from "./../../common/ActionButton.react";
import ExpandingText from "./ExpandingText.react";

class Body extends React.Component {
    static propTypes = {
		onClickNext: PropTypes.func,
		lastModified: PropTypes.object,
		stringList: PropTypes.object, // StringList
		allowFocus: PropTypes.bool,
	};

    state = {
        isExpanded: false,
    };

    render() {
		return (
			<div className={ cx("body", this.state.isExpanded ? "expanded" : "not-expanded") }>
				<div className="title">
					{ this.props.stringList.get("cover-title") }
				</div>
				<div className="hr-wrapper">
					<hr className="hr"/>
				</div>
				<div className="subtitle">
					<ExpandingText
						ref={ (r) => { this.subtitle = r; } }
						caption={ this.props.stringList.get("cover-read-more") }
						allowFocus={ this.props.allowFocus }
						onExpanded={ this.onExpandedSubtitle } >
						{ this.props.stringList.get("cover-subtitle") }
					</ExpandingText>
				</div>
				<div className="button-wrapper">
					<ActionButton
						key="button"
						className="button"
						allowFocus={ this.props.allowFocus }
						title={ this.props.stringList.get("cover-button-go-caption") }
						onClick={ this.props.onClickNext }>
						{ this.props.stringList.get("cover-button-go-caption") }
					</ActionButton>
				</div>
				<div className="meta">
					{ this.props.stringList.get("cover-last-modified").replace("[[date]]", this.getFormattedDate(this.props.lastModified)) }
				</div>
			</div>
		);
	}

    getFormattedDate = () => {
		// Use hardcoded date formatting because browsers are too inconsistent (namely Safari doesn't support "short" and "narrow" months)
		const day = this.props.lastModified || new Date();
		const template = this.props.stringList.get("common-formatting-datetime-dmy");
		const months = this.props.stringList.getArray("common-formatting-datetime-months-short");
		return template
			.replace("d", day.getDate())
			.replace("y", day.getFullYear())
			// We have to replace `m` last, because `m` may insert a `y` (think `May`), which causes previous replacement to be borked.
			.replace("m", months[day.getMonth()]);
	};

    onExpandedSubtitle = (isExpanded) => {
		this.setState({
			isExpanded: isExpanded,
		});
	};

    onActivate = () => {
		if (this.subtitle) this.subtitle.contract();
	};
}

export default Body;
