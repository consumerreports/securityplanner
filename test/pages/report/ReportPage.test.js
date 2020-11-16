import "./../mocks/matchMedia.js";
import React from "react";

import { render, fireEvent } from "@testing-library/react";

import SecurityPlannerRoutes from "./../../../src/js/routing/SecurityPlannerRoutes";
import ReportPage from "./../../../src/js/components/pages/report/ReportPage.react";
import mockData from "./../../mocks/mockData"
import languages from "./../../mocks/languages";

import StringList from "./../../../src/js/vendor/localization/StringList";
jest.mock("./../../../src/js/vendor/localization/StringList");

import ResizeUtils from "../../../src/js/vendor/utils/ResizeUtils";
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

import WindowScrollUtils from "../../../src/js/vendor/utils/WindowScrollUtils";
jest.mock("../../../src/js/vendor/utils/WindowScrollUtils", () => {
	return {
		__esModule: true,
		default: {
			getWindowScrollY: jest.fn()
		}
	};
});

describe("<ReportPage />", () => {
    // Setup
	const testSL = new StringList();
	const testRoutes = new SecurityPlannerRoutes();
	const testGoToPage = jest.fn();
    const testNavigator = { currentTitle: "Test title", };
    const testTools = [mockData.toolOne, mockData.toolTwo, mockData.toolThree, mockData.toolFour];
    const testThreats = [mockData.threatOne, mockData.threatTwo];

    const spyClickToState = jest.fn();

    test("snapshot", () => {
        const { container } = render(
            <ReportPage
                stringList={testSL}
                selectedLanguage={languages.english}
                availableLanguages={languages.all}
                navigator={testNavigator}
                routes={testRoutes}
                goToPage={testGoToPage}
                onClickToStart={spyClickToState}
                tools={testTools}
                topTool={testTools[0]}
                threats={testThreats}
            />
        );
    })
})