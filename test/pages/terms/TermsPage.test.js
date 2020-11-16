import "./../mocks/matchMedia.js";
import React from "react";

import { render, fireEvent } from "@testing-library/react";

import SecurityPlannerRoutes from "./../../../src/js/routing/SecurityPlannerRoutes";
import TermsPage from "./../../../src/js/components/pages/terms/TermsPage.react";
import languages from "./../../mocks/languages";

import StringList from "./../../../src/js/vendor/localization/StringList";
jest.mock("./../../../src/js/vendor/localization/StringList");

jest.mock("./../../../src/js/vendor/utils/MarkdownAnchorLinkReplacer");

const mockFween = { use: jest.fn() };
jest.mock("./../../../src/js/vendor/transitions/Fween", () => mockFween);

describe("<TermsPage />", () => {
	// Setup
	const testSL = new StringList();
	const testRoutes = new SecurityPlannerRoutes();
	const testCheckPage = jest.fn();
	const testGoToPage = jest.fn();

	// console.log(Fween)
	// const spyFweenUse = jest.spyOn(Fween, 'use')

	test("should respond to user interaction", () => {
		const ref = React.createRef();
		const { getByTestId, debug } = render(
			<TermsPage
				stringList={testSL}
				selectedLanguage={languages.english}
				availableLanguages={languages.all}
				routes={testRoutes}
				goToPage={testGoToPage}
				checkPage={testCheckPage}
				ref={ref}
			/>
		);

		ref.current.onActivate();
		const tableOfContentsItem = getByTestId("terms-section-introduction");

		fireEvent.click(tableOfContentsItem);

		// Turns out this component doesn't trigger the onClick on the anchor elements

		ref.current.onDeactivate();
	});
});
