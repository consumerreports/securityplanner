import "./../mocks/matchMedia.js";
import React from "react";

import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import SecurityPlannerRoutes from "./../../../src/js/routing/SecurityPlannerRoutes";
import AllToolsPage from "./../../../src/js/components/pages/alltools/AllToolsPage.react";
import mockData from "./../../mocks/mockData";
import languages from "./../../mocks/languages";

import StringList from "./../../../src/js/vendor/localization/StringList";
jest.mock("./../../../src/js/vendor/localization/StringList");

jest.mock("./../../../src/js/vendor/utils/ResizeUtils", () => {
	return {
		__esModule: true,
		default: {
			getCurrentBreakpoint: jest.fn(),
			getCurrentBreakpointHideDistance: jest.fn(() => 80),
			onResize: {
				add: jest.fn(),
				remove: jest.fn()
			}
		}
	};
});

describe("<AllToolsPage />", () => {
	// Setup
	const testSL = new StringList();
	const testRoutes = new SecurityPlannerRoutes();
	const testGoToPage = jest.fn();
	const testTools = [
		mockData.toolOne,
		mockData.toolTwo,
		mockData.toolThree,
		mockData.toolFour
	];
	const testThreats = [mockData.threatOne, mockData.threatTwo];

	test("responds to user interactions", () => {
		jest.useFakeTimers();
		const ref = React.createRef();
		const { getByLabelText, getByTestId } = render(
			<AllToolsPage
				stringList={testSL}
				selectedLanguage={languages.english}
				availableLanguages={languages.all}
				routes={testRoutes}
				goToPage={testGoToPage}
				threats={testThreats}
				tools={testTools}
				ref={ref}
			/>
		);
        ref.current.onActivate();
        jest.runOnlyPendingTimers();
        // const threatMenuItem = getByLabelText(/all-tools-navigation-title, Threat One/i);
        // const threatGroup = getByTestId("all-tools-tool-list");
        
		ref.current.onDeactivate();
        jest.runOnlyPendingTimers();
	});
});
