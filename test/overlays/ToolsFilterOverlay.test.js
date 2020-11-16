import "./mocks/matchMedia.js";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import ToolsFilterOverlay from "./../../src/js/components/overlays/tools-filter/ToolsFilterOverlay.react";

import StringList from "./../../src/js/vendor/localization/StringList";
jest.mock("./../../src/js/vendor/localization/StringList");

const initialActiveFilter = { cost: 1, effort: 1 };
const filterCategories = {
	cost: {
		title: "Cost",
		filters: ["Any", "Free", "Paid"]
	},
	effort: {
		title: "Effort",
		filters: ["Any", "Quick", "Advanced"]
	}
};

import Transport from "./../../src/js/vendor/utils/Transport";
jest.spyOn(Transport, "get").mockImplementation(() => {
	return {
		getState: () => {
			return {
				filterCategories: filterCategories,
				backgroundColor: "#000",
				buttonLabels: {
					default: "Filter button default",
					apply: "Filter button apply",
					done: "Filter button done"
				},
				onUpdateActiveFilter: jest.fn(),
				activeFilter: initialActiveFilter,
				hasUpdatedFilter: true
			};
		}
	};
});

describe("<ToolsFilterOverlay />", () => {
	// Setup
	const testSL = new StringList();
	const spyOnClickClose = jest.fn();

	test("should respond to user interactions", () => {
		const ref = React.createRef();
		const { getByText, getByLabelText, getAllByLabelText } = render(
			<ToolsFilterOverlay
				stringList={testSL}
				scrollPosition={0}
				transportId="test-id"
				onClickClose={spyOnClickClose}
				ref={ref}
			/>
		);
		ref.current.onActivate();
		const filterType = getByText(/Filter button apply/i);
		const selectedFilter = getByLabelText(/Quick/i);
		const filter = getByLabelText(/Advanced/i);

		// Closes the overlay when the filter label is clicked
		expect(spyOnClickClose).toHaveBeenCalledTimes(0);
		fireEvent.click(filterType);
		expect(spyOnClickClose).toHaveBeenCalledTimes(1);

		// Clicking on a filter changes the active filter in state
		expect(selectedFilter.getAttribute("aria-checked")).toBe("true");
		expect(filter.getAttribute("aria-checked")).toBe("false");
		fireEvent.click(filter);
		expect(selectedFilter.getAttribute("aria-checked")).toBe("false");
		expect(filter.getAttribute("aria-checked")).toBe("true");

		// Clicking on the default button resets the filters
		const defaultButton = getByText(/Filter button default/i);
		const defaultFilters = getAllByLabelText(/Any/i);
		defaultFilters.forEach(filter => {
			expect(filter.getAttribute("aria-checked")).toBe("false");
		});
		fireEvent.click(defaultButton);
		defaultFilters.forEach(filter => {
			expect(filter.getAttribute("aria-checked")).toBe("true");
		});

		ref.current.onDeactivate();
	});

	test("should transition onto and off the page", () => {
		jest.spyOn(window, "requestAnimationFrame").mockImplementation(cb => cb());
		jest.useFakeTimers();
		const ref = React.createRef();
		const spyTransition = jest.fn();

		const { container } = render(
			<ToolsFilterOverlay
				stringList={testSL}
				scrollPosition={0}
				transportId="test-id"
				onClickClose={spyOnClickClose}
				ref={ref}
			/>
		);
		ref.current.onActivate();
		// Runs animation to apear onto the page
		expect(spyTransition).toHaveBeenCalledTimes(0);
		expect(container.firstChild).toHaveClass("hidden");
		// Act
		ref.current.startTransitionShow(spyTransition);
		// Gradually fading in
		expect(container.firstChild).toHaveClass("showing");
		jest.runAllTimers();
		// Assert
		expect(spyTransition).toHaveBeenCalledTimes(1);
		expect(container.firstChild).not.toHaveClass("hidden");
		expect(container.firstChild).not.toHaveClass("showing");

		spyTransition.mockClear();

		// Runs animation to disappear off the page
		expect(spyTransition).toHaveBeenCalledTimes(0);
		// Act
		ref.current.startTransitionHide(spyTransition);
		jest.runAllTimers();
		// Assert
		expect(spyTransition).toHaveBeenCalledTimes(1);
		expect(container.firstChild).toHaveClass("hiding");
	});
});
