import "../mocks/matchMedia.js";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { toBeVisible } from "@testing-library/jest-dom";
import StartOverButton from "./../../../src/js/components/common/StartOverButton.react";

import ResizeUtils from "../../../src/js/vendor/utils/ResizeUtils";
import StringList from "../../../src/js/vendor/localization/StringList";

jest.mock("../../../src/js/vendor/utils/ResizeUtils", () => {
	return {
		__esModule: true,
		default: {
			getCurrentBreakpoint: jest.fn(() => "medium"),
			getCurrentBreakpointHideDistance: jest.fn(() => 80),
		}
	};
});
jest.mock("../../../src/js/vendor/localization/StringList");

describe("<StartOverButton />", () => {
	const testSL = new StringList();
	const onClickFunc = jest.fn();
	beforeEach(() => {
		StringList.mockClear();
	});

	test("responds to clicks", () => {
		const ref = React.createRef();
		const refParams = [true, "color-dark", true, 79, undefined, "color-dark"];
		const { getByRole } = render(
			<StartOverButton stringList={testSL} onClick={onClickFunc} ref={ref} />
		);
		ref.current.setStateParameters(...refParams);
		fireEvent.click(getByRole("link"));
		expect(onClickFunc).toBeCalledTimes(1);
	});

	test("respond to window events", () => {
		const ref = React.createRef();
		const refParams = [
			true,
			"section-action-plan",
			true,
			81,
			undefined,
			"section-action-plan"
		];
		const newParams = [true, "color-dark", true, 79, undefined, "color-dark"];

		const { getByTestId } = render(
			<StartOverButton stringList={testSL} onClick={onClickFunc} ref={ref} />
		);

		// Scroll startover button out of view
		ref.current.setStateParameters(...refParams);
		expect(getByTestId("start-over-button")).not.toBeVisible();

		// Scroll startover button into view
		ref.current.setStateParameters(...newParams);
		expect(getByTestId("start-over-button")).toBeVisible();

		// Change the viewport to 500px.
		global.innerWidth = 500;
		// Trigger the window resize event.
		global.dispatchEvent(new Event("resize"));
		expect(ResizeUtils.getCurrentBreakpoint).toHaveBeenCalledTimes(3);
	});
});
