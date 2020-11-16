import React from "react";
import SecurityPlannerRoutes from "./../../../src/js/routing/SecurityPlannerRoutes";
import { render, fireEvent } from "@testing-library/react";
import ToolList from "./../../../src/js/components/common/ToolList.react";
import mockData from "./../../mocks/mockData"

import StringList from "./../../../src/js/vendor/localization/StringList";
jest.mock("./../../../src/js/vendor/localization/StringList");

jest.mock("./../../../src/js/vendor/utils/ADAUtils.js", () => {
	return {
        __esModule: true,
        default: {
            handleKeyboard: jest.fn(),
            isActivated: true
        },
	};
});

describe("<ToolList />", () => {
	const routes = new SecurityPlannerRoutes();
	const stringList = new StringList();


	const mockGoToPage = jest.fn();

	beforeEach(StringList.mockClear);

	test("renders a list of tool components", () => {
		const mockTools = [mockData.toolOne, mockData.toolTwo, mockData.toolThree, mockData.toolFour];
		const mockThreats = [mockData.threatOne, mockData.threatTwo];
		const { getByTitle } = render(
			<ToolList
				goToPage={mockGoToPage}
				routes={routes}
				tools={mockTools}
				threats={mockThreats}
				stringList={stringList}
			/>
		);

		// Click on the first threat
		fireEvent.click(getByTitle(mockData.toolOne.headline));
		expect(mockGoToPage).toHaveBeenCalledTimes(1);
		expect(mockGoToPage).toHaveBeenCalledWith(
			routes.getUriOverlayTool(mockData.toolOne.slug),
			true,
			true
		);
	});

	test("updates when given more tools", () => {
		const { debug, rerender, getByTitle } = render(
			<ToolList
				goToPage={mockGoToPage}
				routes={routes}
				tools={[mockData.toolOne, mockData.toolTwo]}
				threats={[mockData.threatOne]}
				stringList={stringList}
			/>
		);

		rerender(
			<ToolList
				goToPage={mockGoToPage}
				routes={routes}
				tools={[mockData.toolOne, mockData.toolTwo, mockData.toolThree]}
				threats={[mockData.threatOne, mockData.threatTwo]}
				stringList={stringList}
			/>
		);
	});

	test("collapses when given a max threat count", () => {
		const ref = React.createRef();

		const { getByTitle, getAllByTitle } = render(
			<ToolList
				goToPage={mockGoToPage}
				routes={routes}
				tools={[mockData.toolOne, mockData.toolTwo, mockData.toolThree, mockData.toolFour]}
				threats={[mockData.threatOne, mockData.threatTwo]}
				stringList={stringList}
				maxVisibleThreats={1}
				maxVisibleToolsPerThreat={1}
				ref={ref}
			/>
		);

		getAllByTitle("action-plan-more-tools-single").forEach(detailsButton => {
			fireEvent.click(detailsButton);
		});

		// Click the expand list button
		fireEvent.click(getByTitle("action-plan-more-threats-button"));
	});
});