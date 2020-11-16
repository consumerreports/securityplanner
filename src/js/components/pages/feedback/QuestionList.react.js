import PropTypes from 'prop-types';
import React from "react";
import ReactDOM from 'react-dom';
import createReactClass from 'create-react-class';
import cx from "classnames";

import RateQuestion from "./RateQuestion.react";
import WriteQuestion from "./WriteQuestion.react";

const QuestionList = createReactClass({
    displayName: 'QuestionList',
    answersExist: undefined,
    answersValid: undefined,
    questionComponents: undefined,

    propTypes: {
		id: PropTypes.string,
		currentId: PropTypes.string,
		stringList: PropTypes.object, // StringList
		questions: PropTypes.array, // string[]
		answers: PropTypes.array, // array of string arrays with possible options; empty = form field
		enabled: PropTypes.bool,
		visible: PropTypes.bool,
		allowFocus: PropTypes.bool,
		clear: PropTypes.bool,
		onSubmit: PropTypes.func,
		onChangedFocusElement: PropTypes.func,
	},

    getInitialState: function() {
		this.questionComponents = [];

		return {
			answers: [],
			currentQuestion: 0,
			needToScrollToQuestion: true,
			hasAnswer: false,
			isValid: false,
			isEditingText: false,
			hasChangedAnything: false,
		};
	},

    componentDidUpdate: function() {
		if (this.state.needToScrollToQuestion) {
			this.setState({ needToScrollToQuestion: false });
			if (this.props.onChangedFocusElement && this.props.id === this.props.currentId) this.props.onChangedFocusElement(ReactDOM.findDOMNode(this.questionComponents[this.state.currentQuestion]));
		}

		if (this.props.clear && this.state.hasChangedAnything) {
			this.setState(this.getInitialState());
		}
	},

    render: function() {
		const isCurrentList = this.props.id === this.props.currentId && this.props.visible;
		const classNames = cx("tab-body", {
			"visible": isCurrentList,
			"disabled": isCurrentList && !this.props.enabled,
			"editing-text": this.state.isEditingText,
		});

		return (
			<div className={ classNames }>
				{ this.renderQuestions(isCurrentList) }
			</div>
		);
	},

    renderQuestions: function(isCurrentList) {
		return this.props.questions.map((caption, index, list) => {
			if (this.props.answers[index]) {
				return this.renderRateQuestion(isCurrentList, caption, index, list.length, this.props.answers[index]);
			} else {
				return this.renderWriteQuestion(isCurrentList, caption, index, list.length);
			}
		});
	},

    renderRateQuestion: function(isCurrentList, caption, index, numQuestions, answers) {
		const isLast = index === this.props.questions.length - 1;
		const isExpanded = index === this.state.currentQuestion;

		return (
			<RateQuestion
				key={ index }
				index={ index }
				ref={ (r) => this.questionComponents[index] = r }
				numQuestions={ numQuestions }
				caption={ caption }
				answers={ answers }
				stringList={ this.props.stringList }
				hasDivider={ !isExpanded || !isLast }
				isExpanded={ isExpanded }
				allowFocus={ isCurrentList && this.props.allowFocus }
				onRequestExpand={ this.onRequestedExpandQuestion }
				onChange={ this.onChangedQuestionValue }
				onUpdateValidity={ this.onUpdatedQuestionValidity }
				onSkip={ this.onSkippedQuestion }
				value={ this.getQuestionValue(index) }/>
		);
	},

    renderWriteQuestion: function(isCurrentList, caption, index, numQuestions) {
		const isLast = index === this.props.questions.length - 1;
		const isExpanded = index === this.state.currentQuestion;

		return (
			<WriteQuestion
				key={ index }
				index={ index }
				ref={ (r) => this.questionComponents[index] = r }
				numQuestions={ numQuestions }
				caption={ caption }
				stringList={ this.props.stringList }
				hasDivider={ !isExpanded || !isLast }
				isExpanded={ isExpanded }
				allowFocus={ isCurrentList && this.props.allowFocus }
				onRequestExpand={ this.onRequestedExpandQuestion }
				onChange={ this.onChangedQuestionValue }
				onGotFocus={ this.onQuestionGotFocus }
				onLostFocus={ this.onQuestionLostFocus }
				onUpdateValidity={ this.onUpdatedQuestionValidity }
				canSubmit={ this.canSubmit() }
				onSubmit={ this.onClickSubmit }
				value={ this.getQuestionValue(index) }/>
		);
	},

    getQuestionValue: function(index) {
		return this.state && this.state.answers && this.state.answers.length > index ? this.state.answers[index] : undefined;
	},

    onRequestedExpandQuestion: function(index) {
		this.setCurrentQuestion(index);
	},

    onChangedQuestionValue: function(index, value) {
		this.setQuestionValue(index, value);
	},

    onUpdatedQuestionValidity: function(index, hasAnswer, isValid) {
		if (!this.answersExist) this.answersExist = [];
		if (!this.answersValid) this.answersValid = [];
		this.answersExist[index] = hasAnswer;
		this.answersValid[index] = isValid;

		this.updateValidityState();
	},

    onSkippedQuestion: function(index) {
		this.setCurrentQuestion(index + 1);
	},

    onQuestionGotFocus: function() {
		this.setState({ isEditingText: true });
	},

    onQuestionLostFocus: function() {
		this.setState({ isEditingText: false });
	},

    onClickSubmit: function() {
		if (this.props.onSubmit && this.canSubmit()) this.props.onSubmit(this.props.id, this.props.questions, this.state.answers);
	},

    updateValidityState: function() {
		const hasAnswer = this.answersExist.some(hasAnswer => Boolean(hasAnswer));
		const isValid = this.answersValid.every(isValid => Boolean(isValid));

		if (hasAnswer !== this.state.hasAnswer || isValid !== this.state.isValid) {
			this.setState({
				hasAnswer: hasAnswer,
				isValid: isValid,
			});
		}
	},

    canSubmit: function() {
		return this.state.hasAnswer && this.state.isValid;
	},

    setCurrentQuestion: function(index) {
		if (index >= 0 && index < this.props.questions.length) {
			this.setState({
				currentQuestion: index,
				needToScrollToQuestion: true,
			});
		}
	},

    setQuestionValue: function(index, value) {
		if (index >= 0 && index < this.props.questions.length) {
			const answers = this.state.answers.concat();
			if (answers.length < index) answers.length = index;
			answers[index] = value;
			this.setState({
				hasChangedAnything: true,
				answers: answers,
			});
		}
	},
});

export default QuestionList;