import PropTypes from 'prop-types';
import React from "react";
import ReactDOM from 'react-dom';
import createReactClass from 'create-react-class';
import cx from "classnames";

import SecurityPlannerConstants from "./../../../constants/SecurityPlannerConstants";

import PageSectionHelper from "./../../../vendor/utils/PageSectionHelper";
import DirectionUtils from "./../../../vendor/utils/DirectionUtils";
import GoogleFormsUtils from "./../../../vendor/utils/GoogleFormsUtils";

import FooterMenu from "../../common/FooterMenu.react";
import SecondaryMenu from "../../common/SecondaryMenu.react";

import TabHead from "./TabHead.react";
import QuestionList from "./QuestionList.react";
import Results from "./Results.react";

import PageUtils from "./../../../vendor/utils/PageUtils";

const FeedbackPage = createReactClass({
    displayName: 'FeedbackPage',
    helper: undefined,

    propTypes: {
		stringList: PropTypes.object, // StringList
		selectedLanguage: PropTypes.object, // Language
		availableLanguages: PropTypes.arrayOf(PropTypes.object), // Language[]
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
	},

    getInitialState: function() {
		return {
			currentTab: FeedbackPage.TAB_RATE,
			state: FeedbackPage.STATE_ANSWERING,
			submitSuccess: undefined,
			resetAnswers: false,
		};
	},

    UNSAFE_componentWillMount: function() {
		this.helper = new PageSectionHelper(this);
	},

    componentDidMount: function() {
		this.helper.setComponent(this.refs.scroller);
	},

    componentDidUpdate: function() {
		this.helper.setComponent(this.refs.scroller);
	},

    componentWillUnmount: function() {
		this.helper.destroy();
	},

    render: function() {
		const pageClasses = cx(
			"sectionPageHolder",
			"pageFeedback",
			DirectionUtils.getClass(this.props.stringList)
		);

		const isAnswering = this.state.state === FeedbackPage.STATE_ANSWERING;
		const hasSubmitted = this.state.state === FeedbackPage.STATE_SUBMITTED;

		return (
			<div
				className={ pageClasses }
				aria-hidden={ !this.helper.isActive() }
				style={ { height: this.helper.getWindowHeight() } }>
				<div className="content" ref="scroller">
					<SecondaryMenu stringList={ this.props.stringList }
						currentLocation={ SecondaryMenu.LOCATION_FEEDBACK }
						availableLanguages={ this.props.availableLanguages }
						selectedLanguage={ this.props.selectedLanguage }
						routes={ this.props.routes }
						goToPage={ this.props.goToPage }
						allowFocus={ this.helper.isActive() }
						useLightStyle={ false }
						className="secondary-menu"/>
					<div className="middle"  id={ SecondaryMenu.LOCATION_FEEDBACK }>
						<div className={ cx("headline", { visible: !hasSubmitted }) }>
							{ this.props.stringList.get("feedback-general-title") }
						</div>
						<div className={ cx("tabs-head", { visible: !hasSubmitted }) } >
							<TabHead
								dataTestId="feedback-tab-rate"
								key={ FeedbackPage.TAB_RATE }
								id={ FeedbackPage.TAB_RATE }
								currentId={ this.state.currentTab }
								iconSrc={ require("./../../../../images/page-feedback/tab-icon-rate.png") }
								enabled={ isAnswering }
								visible={ !hasSubmitted }
								onSelect={ this.selectTab }
								allowFocus={ this.helper.isActive() }>
								{ this.props.stringList.get("feedback-general-rate-title") }
							</TabHead>
							<TabHead
								dataTestId="feedback-tab-write"
								key={ FeedbackPage.TAB_WRITE }
								id={ FeedbackPage.TAB_WRITE }
								currentId={ this.state.currentTab }
								iconSrc={ require("./../../../../images/page-feedback/tab-icon-write.png") }
								enabled={ isAnswering }
								visible={ !hasSubmitted }
								onSelect={ this.selectTab }
								allowFocus={ this.helper.isActive() }>
								{ this.props.stringList.get("feedback-general-write-title") }
							</TabHead>
						</div>
						<div className="tabs-body">
							<QuestionList
								key={ FeedbackPage.TAB_RATE }
								id={ FeedbackPage.TAB_RATE }
								currentId={ this.state.currentTab }
								stringList={ this.props.stringList }
								questions={ this.getQuestions(FeedbackPage.TAB_RATE) }
								answers={ this.getAnswers(FeedbackPage.TAB_RATE) }
								enabled={ isAnswering }
								visible={ !hasSubmitted }
								allowFocus={ this.helper.isActive() }
								clear={ this.state.resetAnswers }
								onChangedFocusElement={ this.onChangedFocusElement }
								onSubmit={ this.submitTab }/>
							<QuestionList
								key={ FeedbackPage.TAB_WRITE }
								id={ FeedbackPage.TAB_WRITE }
								currentId={ this.state.currentTab }
								stringList={ this.props.stringList }
								questions={ this.getQuestions(FeedbackPage.TAB_WRITE) }
								answers={ this.getAnswers(FeedbackPage.TAB_WRITE) }
								enabled={ isAnswering }
								visible={ !hasSubmitted }
								allowFocus={ this.helper.isActive() }
								clear={ this.state.resetAnswers }
								onChangedFocusElement={ this.onChangedFocusElement }
								onSubmit={ this.submitTab }/>
							<Results
								stringList={ this.props.stringList }
								success={ this.state.submitSuccess }
								visible={ hasSubmitted }
								allowFocus={ this.helper.isActive() }
								onBack={ this.onSubmitCancel }
								onClose={ this.props.onClickClose }/>
						</div>
					</div>
					<FooterMenu
						stringList={ this.props.stringList }
						currentLocation={ SecondaryMenu.LOCATION_FEEDBACK }
						style={ FooterMenu.STYLE_LIGHT_GREY }
						routes={ this.props.routes }
						goToPage={ this.props.goToPage }
						allowFocus={ this.helper.isActive() }/>
				</div>
			</div>
		);
	},

    selectTab: function(tabId) {
		if (this.state.currentTab != tabId) {
			this.setState({
				currentTab: tabId,
			});
		}
	},

    submitTab: function(tabId, questions, answers) {
		this.setState({ state: FeedbackPage.STATE_SUBMITTING });

		// Submit the data using Google Forms
		const formData = this.generateFormData(tabId, questions, answers);
		GoogleFormsUtils.submit(SecurityPlannerConstants.Content.FEEDBACK_GENERAL_FORM_KEY, formData, this.finishSubmit);
	},

    generateFormData(tabId, questions, answers) {
		// Based on answers, generate form data to be submitted
		const fields = SecurityPlannerConstants.Content.FEEDBACK_GENERAL_FORM_QUESTIONS_IDS;

		const data = {};

		// Basic header
		data[fields[0]] = tabId;

		// Question and anwers (very hardcoded)

		// Last 2 fields ALWAYS uses the last answer (which is an object)
		const fi = fields.length - 4;
		const qi = questions.length - 1;
		const qla = answers.length > qi ? answers[qi] : { comment: undefined, contact: false, email: undefined };
		data[fields[fi + 0]] = questions[qi];
		data[fields[fi + 1]] = qla.comment ? qla.comment : "" ;
		data[fields[fi + 2]] = qla.contact ? "Contact allowed:" : "Contact not allowed" ;
		data[fields[fi + 3]] = qla.contact ? qla.email : "" ;

		// Fill the other questions as available
		for (let fi = 1, qi = 0; fi < fields.length - 4 && qi < questions.length - 1; fi += 2, qi++) {
			data[fields[fi]] = questions[qi];
			data[fields[fi + 1]] = (answers.length > qi && answers[qi]) ? answers[qi] : "";
		}

		// data.forEach((value, key) => { console.log(`${key} == ${value}`)});

		return data;
	},

    finishSubmit(success, errorMessage) {
		if (!success) {
			console.warn("Error submitting data. Error message:", errorMessage); // eslint-disable-line
		}
		PageUtils.scrollToPosition(ReactDOM.findDOMNode(this.refs.scroller), 0);
		this.setState({
			state: FeedbackPage.STATE_SUBMITTED,
			submitSuccess: success,
		});
	},

    onSubmitCancel: function() {
		this.setState({
			state: FeedbackPage.STATE_ANSWERING,
		});
	},

    onChangedFocusElement: function(element) {
		PageUtils.scrollToElement(ReactDOM.findDOMNode(this.refs.scroller), element);
	},

    getQuestions(tabId) {
		// Even items in (0..n) are questions
		const form = this.props.stringList.getArray(`feedback-general-${tabId}-questions`);
		return form.filter((val, index) => index % 2 == 0);
	},

    getAnswers(tabId) {
		// Odd items in (0..n) are questions
		const form = this.props.stringList.getArray(`feedback-general-${tabId}-questions`);
		return form.filter((val, index) => index % 2 == 1).map(val => {
			return !val || val == "[]" ? undefined : val.split(",").map(vt => vt.trim());
		});
	},

    /**
	 * Ran when the section becomes the focused section
	 */
    onActivate: function(travelOffset, viaHistoryAPI, fromOverlay) {
		this.helper.onActivate(travelOffset, viaHistoryAPI, fromOverlay);
		this.setState(this.getInitialState());
	},

    /**
	 * Ran when the section is about to lose focus
	 */
    onDeactivate: function(travelOffset, viaHistoryAPI, toOverlay) {
		this.helper.onDeactivate(travelOffset, viaHistoryAPI, toOverlay);
		this.setState({
			resetAnswers: true,
		});
	},

    /**
	 * Returns the color (as a number) that the locator bar should have when opaque
	 */
    getDesiredLocatorBackgroundColor: function() {
		return undefined;
	},
});

FeedbackPage.TAB_RATE = "rate";
FeedbackPage.TAB_WRITE = "write";

FeedbackPage.STATE_ANSWERING = "answering";
FeedbackPage.STATE_SUBMITTING = "submitting";
FeedbackPage.STATE_SUBMITTED = "submitted";

export default FeedbackPage;