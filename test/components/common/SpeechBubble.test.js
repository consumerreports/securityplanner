import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import SpeechBubble from "./../../../src/js/components/common/SpeechBubble.react";
import mockData from "./../../mocks/mockData";

describe("<SpeechBubble />", () => {
	// Setup
	const tools = [
		mockData.toolOne,
		mockData.toolTwo,
		mockData.toolThree,
		mockData.toolFour
	];

	// Mocking ref objects passed to the component
	// Spying on the .focus() method
	const onTabMock = jest.fn();
	const onTabMockWithShift = jest.fn();
	const toolList = { refs: {} };
	for (let i = 0; i < tools.length - 1; i++) {
		const innerMethods = {
			button: {
				focus: onTabMockWithShift
			}
		};

		const innerDOMMethods = [
			"placeholder",
			{
				getElementsBtClassName: arg => [{ focus: onTabMock }]
			}
		];
		toolList.refs[tools[i].id] = {
            refs: innerMethods,
            children: innerDOMMethods
        };

	}

	const threats = [mockData.threatOne, mockData.threatTwo];
	const subtitle = "example subtitle";
	const statsName = "example stat name";

	beforeEach(jest.clearAllMocks);

	test("renders a link that responds to tab keypresses", () => {
		// Arrange
		const ref = React.createRef();
		const { container } = render(
			<SpeechBubble
				toolList={toolList}
				threats={threats}
				currentActiveThreatId={threats[1].id}
				link="example.com"
				subtitle={subtitle}
				statsName={statsName}
				ref={ref}
			/>
		);
		const element = container.querySelector(".subtitle");
		expect(element.textContent).toContain(subtitle);
		expect(element.textContent).toContain(statsName);

		// Act - Function used to change the tab sequence to focus on the speech bubble
		expect(element).not.toHaveFocus();
		ref.current.setFocus(mockData.toolThree, threats[1].id);
		// Assert - Anchor Element now has focus
		expect(element).toHaveFocus();

		// Act - Keypress for Tab + ShiftKey
		expect(onTabMockWithShift).toHaveBeenCalledTimes(0);
		fireEvent.keyDown(element, { key: "Tab", keyCode: 9, shiftKey: true });
		// Assert - The function to go back in the tab order is fired
		expect(onTabMockWithShift).toHaveBeenCalledTimes(1);
	});

	test("renders a div that responds to tab keypresses", () => {
		// Arrange
		const ref = React.createRef();
		const { container } = render(
			<SpeechBubble
				toolList={toolList}
				threats={threats}
				currentActiveThreatId={threats[0].id}
				subtitle={subtitle}
				tabIndex={-1}
				ref={ref}
			/>
		);
		const element = container.querySelector(".subtitle");
		expect(element.textContent).toContain(subtitle);

		// Act - Function used to change the tab sequence to focus on the speech bubble
		expect(element).not.toHaveFocus();
		ref.current.setFocus("", "");
		// Assert - Anchor Element now has focus
		expect(element).toHaveFocus();

		// Act - Keypress for Tab without ShiftKey
		// fireEvent.keyDown(element, { key: "Tab", keyCode: 9 });
		// expect(onTab)
	});
});
