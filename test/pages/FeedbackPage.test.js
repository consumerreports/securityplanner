import "./mocks/matchMedia.js";
import React from "react";

import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import SecurityPlannerRoutes from "./../../src/js/routing/SecurityPlannerRoutes";
import FeedbackPage from "./../../src/js/components/pages/feedback/FeedbackPage.react";
import Language from "../../src/js/stores/data/Language.js";

import StringList from "./../../src/js/vendor/localization/StringList";
jest.mock("./../../src/js/vendor/localization/StringList");

// Mocking the feedback question data
const stringList = new StringList();
stringList.getArray.mockImplementation(type => {
	return type === "feedback-general-rate-questions"
		? [
				"How easy were the questions to understand?",
				"Not easy, Somewhat easy, Very easy",
				"How relevant were the questions to you?",
				"Not very, Somewhat, Very",
				"Were the recommendations in the action plan easy to understand?",
				"Not easy, Somewhat easy, Very easy",
				"Were the recommendations in the action plan relevant to you?",
				"Not very, Somewhat, Very",
				"Would you recommend Security Planner to your family and friends?",
				"No, Maybe, Yes",
				"Any comments or suggestions?",
				"[]"
		  ]
		: ["Any comments or suggestions?"];
});

describe("FeedbackPage", () => {
	// Setup
	Date.now = jest.fn(() => 1482363367071); // mocking Date.now for uuid
	Math.random = jest.fn(() => 1); // mocking Math.random for uuid
	const routes = new SecurityPlannerRoutes();
	const goToPage = jest.fn();

	const language = Object.assign(new Language(), {
		id: "en-US",
		name: "English",
		direction: "ltr",
		default: true,
		enabled: true
	});

	test("tabs navigate between two feedback forms", () => {
		// Arrange
		const ref = React.createRef();
		const { getByTestId, getByRole } = render(
			<FeedbackPage
				routes={routes}
				stringList={stringList}
				goToPage={goToPage}
				availableLanguages={[language]}
				selectedLanguage={language}
				ref={ref}
			/>
		);
		ref.current.onActivate(1, false);

		// Act
		fireEvent.click(getByTestId("feedback-tab-write"));
		getByTestId("current-textarea").value = "This is a test comment.";
	});
});
