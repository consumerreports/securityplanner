import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";

import ImageContainer from "./../../common/ImageContainer.react";
import ADAUtils from "./../../../vendor/utils/ADAUtils";

class RateQuestion extends React.Component {
    static propTypes = {
		index: PropTypes.number,
		numQuestions: PropTypes.number,
		caption: PropTypes.string,
		answers: PropTypes.array, // string[] with every possible value
		stringList: PropTypes.object, // StringList
		hasDivider: PropTypes.bool,
		isExpanded: PropTypes.bool,
		allowFocus: PropTypes.bool,
		onRequestExpand: PropTypes.func, // index
		onChange: PropTypes.func, // index, value
		onUpdateValidity: PropTypes.func, // index, hasAnswer, isValid
		onSkip: PropTypes.func, // index
		value: PropTypes.string, // current value
	};

    intervalId = undefined;
    prevValue = undefined;

    componentDidUpdate() {
		if (this.props.value !== this.prevValue) {
			if (this.props.onUpdateValidity) {
				this.props.onUpdateValidity(this.props.index, this.hasAnswer(), this.isValid());
			}
			this.prevValue = this.props.value;
		}
	}

    render() {
		const classNames = cx("question", "rate", {
			expanded: this.props.isExpanded,
			["is-single"]: this.props.numQuestions === 1,
			["is-answered"]: this.hasAnswer() && !this.hasSkipped(),
		});

		return (
			<div className={ classNames }>
				<div
					className="header"
					tabIndex={ this.props.allowFocus && !this.props.isExpanded ? 0 : -1 }
					role="button"
					onKeyDown={ ADAUtils.handleKeyboard(this.onClickTab) }
					onClick={ this.onClickTab }>
					<div className="number">
						{ (this.props.index + 1) + "." }
					</div>
					<div className="caption">
						<span>{ this.props.caption }</span>
						<span>{ this.renderAnswerKey() }</span>
					</div>
					<ImageContainer className="check" src={ require("./../../../../images/page-feedback/check-small.png") }/>
				</div>
				<div className={ cx("collapsible-body-outer", { expanded: this.props.isExpanded }) }>
					<div className="collapsible-body-inner">
						<div className="cards">
							{ this.renderCard(this.props.answers[0], RateQuestion.VALUE_NEGATIVE, RateQuestion.COLOR_NEGATIVE) }
							{ this.renderCard(this.props.answers[1], RateQuestion.VALUE_NEUTRAL,  RateQuestion.COLOR_NEUTRAL) }
							{ this.renderCard(this.props.answers[2], RateQuestion.VALUE_POSITIVE, RateQuestion.COLOR_POSITIVE) }
						</div>
						<div className="footer">
							<div
								className="skip"
								tabIndex={ this.props.isExpanded && this.props.allowFocus ? 0 : -1 }
								role="select"
								onKeyDown={ ADAUtils.handleKeyboard(this.onClickSkip) }
								onClick={ this.onClickSkip }>
								<span>
									{ this.props.stringList.get("feedback-general-rate-answer-skip") }
								</span>
							</div>
						</div>
					</div>
				</div>
				<div className={ cx("divider", { visible: this.props.hasDivider }) }/>
			</div>
		);
	}

    renderCard = (caption, value, backgroundColor) => {
		const selectorStyle = {
			backgroundColor: "#" + backgroundColor.toString(16),
		};
		const cardClassNames = cx({
			card: true,
			selected: this.props.value === value,
		});
		const imgStyleColor = {
			backgroundRepeat: "no-repeat",
			backgroundImage: this.getCardURL(value),
		};
		const imgStyleWhite = {
			backgroundRepeat: "no-repeat",
			backgroundImage: this.getCardURL(value, true),
		};

		return (
			<div
				className={ cardClassNames }
				tabIndex={ this.props.isExpanded && this.props.allowFocus ? 0 : -1 }
				role="select"
				onKeyDown={ ADAUtils.handleKeyboard(() => this.onClickCard(value)) }
				onClick={ () => this.onClickCard(value) }>
				<div className="selector" style={ selectorStyle }/>
				<div
					className="common-image-container image color"
					style={ imgStyleColor }
					title={ caption }/>
				<div
					className="common-image-container image white"
					style={ imgStyleWhite }
					title={ caption }/>
				<div className="caption">
					{ caption }
				</div>
				<div className="check"/>
				<div className="background"/>
			</div>
		);
	};

    getCardURL = (value, isWhite = false) => {
		// A bit manual, since we have to require() the asset
		let url = undefined;
		if (isWhite) {
			switch (value) {
				case RateQuestion.VALUE_NEGATIVE:
					url = require("./../../../../images/page-feedback/rate-icon-negative-white.png");
					break;
				case RateQuestion.VALUE_NEUTRAL:
					url = require("./../../../../images/page-feedback/rate-icon-neutral-white.png");
					break;
				case RateQuestion.VALUE_POSITIVE:
					url = require("./../../../../images/page-feedback/rate-icon-positive-white.png");
					break;
			}
		} else {
			switch (value) {
				case RateQuestion.VALUE_NEGATIVE:
					url = require("./../../../../images/page-feedback/rate-icon-negative.png");
					break;
				case RateQuestion.VALUE_NEUTRAL:
					url = require("./../../../../images/page-feedback/rate-icon-neutral.png");
					break;
				case RateQuestion.VALUE_POSITIVE:
					url = require("./../../../../images/page-feedback/rate-icon-positive.png");
					break;
			}
		}
		return "url('" + url + "')";
	};

    renderAnswerKey = () => {
		if (this.hasAnswer()) {
			let answerCaption = undefined;
			let answerColor = undefined;

			if (this.props.value === RateQuestion.VALUE_NEGATIVE) {
				answerCaption = this.props.answers[0];
				answerColor = RateQuestion.COLOR_NEGATIVE;
			} else if (this.props.value === RateQuestion.VALUE_NEUTRAL) {
				answerCaption = this.props.answers[1];
				answerColor = RateQuestion.COLOR_NEUTRAL;
			} else if (this.props.value === RateQuestion.VALUE_POSITIVE) {
				answerCaption = this.props.answers[2];
				answerColor = RateQuestion.COLOR_POSITIVE;
			} else if (this.props.value === RateQuestion.VALUE_SKIPPED) {
				answerCaption = this.props.stringList.get("feedback-general-both-answer-skipped");
				answerColor = undefined;
			}

			return (
				<span className="answer" style={ { color: (answerColor ? "#" + answerColor.toString(16) : "inherit") } }>
					{ " " + answerCaption }
				</span>
			);
		} else {
			return undefined;
		}
	};

    hasAnswer = () => {
		return this.props.value !== undefined;
	};

    isValid = () => {
		return true;
	};

    hasSkipped = () => {
		return this.props.value === RateQuestion.VALUE_SKIPPED;
	};

    goToNext = () => {
		if (this.props.onSkip) this.props.onSkip(this.props.index);
	};

    onClickTab = () => {
		if (this.props.onRequestExpand) this.props.onRequestExpand(this.props.index);
	};

    onClickCard = (value) => {
		if (this.props.onChange) {
			this.props.onChange(this.props.index, value);
			if (this.intervalId != undefined) clearInterval(this.intervalId);
			this.intervalId = setTimeout(() => this.goToNext(), 700);
		}
	};

    onClickSkip = () => {
		if (this.props.onChange) this.props.onChange(this.props.index, RateQuestion.VALUE_SKIPPED);
		this.goToNext();
	};
}

RateQuestion.VALUE_SKIPPED = "";
RateQuestion.VALUE_NEGATIVE = "negative";
RateQuestion.VALUE_NEUTRAL = "neutral";
RateQuestion.VALUE_POSITIVE = "positive";

RateQuestion.COLOR_NEGATIVE = 0xe54d42;
RateQuestion.COLOR_NEUTRAL = 0x3a99d8;
RateQuestion.COLOR_POSITIVE = 0x29bb9c;

export default RateQuestion;