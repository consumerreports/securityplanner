import "./../mocks/matchMedia.js";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import Locator from "./../../../src/js/components/navigation/Locator.react";

import StringList from "./../../../src/js/vendor/localization/StringList";
jest.mock("./../../../src/js/vendor/localization/StringList");

jest.mock("./../../../src/js/vendor/utils/ResizeUtils", () => {
	return {
		__esModule: true,
		default: {
			getCurrentBreakpoint: () => "medium",
			getCurrentBreakpointHideDistance: jest.fn(() => 80),
			onResize: {
				add: jest.fn(),
				remove: jest.fn()
			}
		}
	};
});

describe("<Locator />", () => {
	// Setup
	const testSL = new StringList();
	const spyOnClickLocation = jest.fn();

	test("should respond to user interaction", () => {
		const ref = React.createRef();
		const { getAllByRole } = render(
			<Locator
				stringList={testSL}
				onClickLocation={spyOnClickLocation}
				ref={ref}
			/>
		);
		ref.current.setStateParameters(
			true, // isVisible,
			4, // numItems,
			1, // minimumNumItems,
			2, // currentItem,
			4, // furthestItem,
			"Test Title", // title,
			"section", // colorClassName,
			false, // siteScrolled,
			false, // sectionScrolled,
			81, // currentScrollAmt,
			"#000" // desiredBackgroundColor,
		);

		const buttons = getAllByRole("link");

		buttons.forEach((button, i) => {
			expect(spyOnClickLocation).toBeCalledTimes(i);
			fireEvent.click(button);
			expect(spyOnClickLocation).toBeCalledTimes(i + 1);
		});
	});

	test("section action plan", () => {
		const ref = React.createRef();
		const { getAllByRole } = render(
			<Locator
				stringList={testSL}
				onClickLocation={spyOnClickLocation}
				ref={ref}
			/>
		);
		ref.current.setStateParameters(
			true, // isVisible,
			4, // numItems,
			1, // minimumNumItems,
			2, // currentItem,
			1, // furthestItem,
			"Test Title", // title,
			"section-action-plan", // colorClassName,
			false, // siteScrolled,
			false, // sectionScrolled,
			81, // currentScrollAmt,
			"#000" // desiredBackgroundColor,
		);
	});
});
