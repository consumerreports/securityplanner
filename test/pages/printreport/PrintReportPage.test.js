import "./../mocks/matchMedia.js";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import PrintReportPage from "./../../../src/js/components/pages/printreport/PrintReportPage.react";

import StringList from "./../../../src/js/vendor/localization/StringList";
jest.mock("./../../../src/js/vendor/localization/StringList");

jest.mock("./../../../src/js/constants/SecurityPlannerConstants.js", () => {
	return { UI: { CLOSE_TAB_AFTER_PRINT: true } };
});

jest.spyOn(window, "print").mockImplementation();
jest.spyOn(window, "close").mockImplementation();
jest.useFakeTimers();

import mockData from "./../../mocks/mockData";
const testThreats = [mockData.threatOne, mockData.threatTwo];
const testTools = [
	mockData.toolOne,
	mockData.toolTwo,
	mockData.toolThree,
	mockData.toolFour
];

describe("<PrintReportPage />", () => {
	// Setup
	const testSL = new StringList();

	test("should show a printable page", () => {
		const ref = React.createRef();
		const { container, debug } = render(
			<PrintReportPage
				stringList={testSL}
				threats={testThreats}
				topTool={testTools[0]}
				tools={testTools}
				ref={ref}
			/>
		);
        ref.current.onActivate();

		// Page is printed and the window is closed
        expect(window.print).toBeCalledTimes(0);
        fireEvent.load(window);
		jest.runAllTimers();
		expect(window.print).toBeCalledTimes(1);
		expect(window.close).toBeCalledTimes(1);

		ref.current.onDeactivate();
	});
});
