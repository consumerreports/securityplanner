import "./../mocks/matchMedia.js";
import React from "react";

import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import SecurityPlannerRoutes from "./../../../src/js/routing/SecurityPlannerRoutes";
import CoverPage from "./../../../src/js/components/pages/cover/CoverPage.react";
import languages from "./../../mocks/languages";

import StringList from "./../../../src/js/vendor/localization/StringList";
jest.mock("./../../../src/js/vendor/localization/StringList");

Date.now = jest.fn(() => 1482363367071);

describe("<CoverPage />", () => {
	// Setup
	const testSL = new StringList();
	const testRoutes = new SecurityPlannerRoutes();
	const testGoToPage = jest.fn();

	const spyOnClickNext = jest.fn();

    
	test("should respond to user interaction", () => {
		const ref = React.createRef();
		const { getByTitle } = render(
			<CoverPage
				stringList={testSL}
				selectedLanguage={languages.english}
				availableLanguages={languages.all}
				routes={testRoutes}
				goToPage={testGoToPage}
				onClickNext={spyOnClickNext}
				ref={ref}
			/>
		);
		ref.current.onActivate();
		const nextButton = getByTitle(/cover-button-go-caption/i);

		expect(spyOnClickNext).toHaveBeenCalledTimes(0);
		fireEvent.click(nextButton);
		expect(spyOnClickNext).toHaveBeenCalledTimes(1);
	});

	test("snapshot", () => {
		const ref = React.createRef();
		const { container, rerender } = render(
			<CoverPage
				stringList={testSL}
				selectedLanguage={languages.french}
				availableLanguages={languages.all}
				routes={testRoutes}
				goToPage={testGoToPage}
				onClickNext={spyOnClickNext}
				ref={ref}
			/>
		);
		rerender(
			<CoverPage
				stringList={testSL}
				selectedLanguage={languages.english}
				availableLanguages={languages.all}
				routes={testRoutes}
				goToPage={testGoToPage}
				onClickNext={spyOnClickNext}
				ref={ref}
			/>
		);
		ref.current.onActivate();

		// Write snapshot test here
	});
});
