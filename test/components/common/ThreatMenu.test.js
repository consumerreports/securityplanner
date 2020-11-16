import React from "react";
import SecurityPlannerRoutes from "./../../../src/js/routing/SecurityPlannerRoutes";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import ThreatMenu from "./../../../src/js/components/common/ThreatMenu.react";
import mockThreats from "./../mocks/mockThreats";

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

describe("<ThreatMenu />", () => {
	// Setup
	const initialActiveFiter = { cost: 0, effort: 0 };
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

	const stringList = new StringList();
	const routes = new SecurityPlannerRoutes();

	const spyOnClickThreat = jest.fn();
	const spyOnClickPrint = jest.fn();
	const spyOnUpdateActiveFilter = jest.fn();
	const goToPage = jest.fn();

	beforeEach(jest.clearAllMocks);

	test("should respond to user interactions - desktop", () => {
		// Arrange
		ResizeUtils.getCurrentBreakpoint.mockImplementation(() => "medium");
		const { getByTestId, getByText } = render(
			<ThreatMenu
				activeFilter={initialActiveFiter}
				backgroundColor="#000"
				currentActiveThreatId={"test-id"}
				filterCategories={filterCategories}
				hasActiveFilter={false}
				isFixed={true}
				onClickThreat={spyOnClickThreat}
				onClickPrint={spyOnClickPrint}
				onUpdateActiveFilter={spyOnUpdateActiveFilter}
				isVisible={true}
				isFixed={false}
				stringList={stringList}
				routes={routes}
				threatList={mockThreats}
				goToPage={goToPage}
			/>
		);
		const printButton = getByTestId("threat-menu-print-button");
		const threatButton = getByText("Browsing");

		// Print button fires an event handler
		expect(spyOnClickPrint).toHaveBeenCalledTimes(0);
		// Act
		fireEvent.click(printButton);
		// Assert
		expect(spyOnClickPrint).toHaveBeenCalledTimes(1);

		// Threat names respond to user interaction
		expect(spyOnClickThreat).toHaveBeenCalledTimes(0);
		// Act
		fireEvent.click(threatButton);
		// Assert
		expect(spyOnClickThreat).toHaveBeenCalledTimes(1);

		spyOnClickThreat.mockClear();
		expect(spyOnClickThreat).toHaveBeenCalledTimes(0);
		// Act
		fireEvent.keyDown(threatButton, { keyCode: 32 });
		// Assert
		expect(spyOnClickThreat).toHaveBeenCalledTimes(1);
	});

	test("should respond to user interactions - small screens", () => {
		// Arrange
		ResizeUtils.getCurrentBreakpoint.mockImplementation(() => "small");
		const { getByText } = render(
			<ThreatMenu
				menuTitle="The Threat Menu"
				activeFilter={initialActiveFiter}
				backgroundColor="#000"
				currentActiveThreatId={"t2s4dInIbbycwu4kaQUYKq2"}
				filterCategories={filterCategories}
				hasActiveFilter={false}
				isFixed={true}
				onClickThreat={spyOnClickThreat}
				onClickPrint={spyOnClickPrint}
				onUpdateActiveFilter={spyOnUpdateActiveFilter}
				isVisible={true}
				isFixed={false}
				stringList={stringList}
				routes={routes}
				threatList={mockThreats}
				goToPage={goToPage}
			/>
		);
		const threatMenuTrigger = getByText("The Threat Menu");

		// Responds to clicks and enter key
		expect(goToPage).toHaveBeenCalledTimes(0);
		// Act
		fireEvent.click(threatMenuTrigger);
		// Assert
		expect(goToPage).toHaveBeenCalledTimes(1);

		goToPage.mockClear();

		expect(goToPage).toHaveBeenCalledTimes(0);
		// Act
		fireEvent.keyDown(threatMenuTrigger, { keyCode: 32 });
		// Assert
		expect(goToPage).toHaveBeenCalledTimes(1);
	});

	test("renders a dropdown when more threats are supplied than what can be shown on one line", () => {
		// Arrange
		ResizeUtils.getCurrentBreakpoint.mockImplementation(() => "medium");
		// Adding more threats to the threat list
		const moreThreats = [...mockThreats];
		mockThreats.forEach(threat => {
			const newThreat = { ...threat };
			newThreat.id = Math.round(Math.random() * 100000);
			moreThreats.push(newThreat);
		});

		const {
			getByLabelText,
			getAllByLabelText,
			getAllByRole,
			rerender,
			debug
		} = render(
			<ThreatMenu
				menuTitle="The Threat Menu"
				activeFilter={initialActiveFiter}
				backgroundColor="#000"
				currentActiveThreatId={"t2s4dInIbbycwu4kaQUYKq2"}
				filterCategories={filterCategories}
				hasActiveFilter={false}
				isFixed={true}
				onClickThreat={spyOnClickThreat}
				onClickPrint={spyOnClickPrint}
				onUpdateActiveFilter={spyOnUpdateActiveFilter}
				isVisible={true}
				isFixed={false}
				stringList={stringList}
				routes={routes}
				threatList={mockThreats}
				goToPage={goToPage}
			/>
		);
		rerender(
			<ThreatMenu
				menuTitle="The Threat Menu"
				activeFilter={initialActiveFiter}
				backgroundColor="#000"
				currentActiveThreatId={"t2s4dInIbbycwu4kaQUYKq2"}
				filterCategories={filterCategories}
				hasActiveFilter={false}
				isFixed={true}
				onClickThreat={spyOnClickThreat}
				onClickPrint={spyOnClickPrint}
				onUpdateActiveFilter={spyOnUpdateActiveFilter}
				isVisible={true}
				isFixed={false}
				stringList={stringList}
				routes={routes}
				threatList={moreThreats}
				allowFocus={true}
				goToPage={goToPage}
			/>
		);
		const dropdown = getByLabelText(/The Threat Menu/i);

		// Dropdown trigger should open when clicked and closed when a menu item is selected
		expect(spyOnClickThreat).toHaveBeenCalledTimes(0);
		const dropDownMenu = getAllByLabelText(/The Threat Menu/i).forEach(
			menuItem => menuItem.getAttribute("role") === "radiogroup"
		);
		expect(dropDownMenu).toBeUndefined;
		// Act
		fireEvent.click(dropdown);
		// Asset
		expect(dropDownMenu).toBeDefined;
		//Act
		const option = getAllByRole("radio")[1];
		fireEvent.click(option);
		// Assert
		expect(spyOnClickThreat).toHaveBeenCalledTimes(1);
		expect(dropDownMenu).toBeUndefined;
	});

	test("should handle filter changes", () => {
		ResizeUtils.getCurrentBreakpoint.mockImplementation(() => "medium");
		// Arrange
		const { rerender, getByLabelText, queryByLabelText, debug } = render(
			<ThreatMenu
				activeFilter={initialActiveFiter}
				backgroundColor="#000"
				currentActiveThreatId={"2s4dInIbbycwu4kaQUYKq2"}
				filterCategories={filterCategories}
				hasActiveFilter={true}
				isVisible={true}
				stringList={stringList}
				onUpdateActiveFilter={spyOnUpdateActiveFilter}
				routes={routes}
				threatList={new Array()}
				goToPage={goToPage}
			/>
		);
		const filterDropdownOne = getByLabelText(/cost/i);

		// Fires a filter change when an option is clicked in the "cost" dropdown
		expect(spyOnUpdateActiveFilter).toHaveBeenCalledTimes(0);
		expect(queryByLabelText(/cost, free/i)).toBeNull();
		fireEvent.click(filterDropdownOne);
		const option = queryByLabelText(/cost, free/i);
		fireEvent.click(option);
		expect(spyOnUpdateActiveFilter).toHaveBeenCalledTimes(1);
		expect(queryByLabelText(/cost, free/i)).toBeNull();

		spyOnUpdateActiveFilter.mockClear();

		// New active threat filter and threat id passed down on rerender
		const newActiveFilter = { cost: 1, effort: 2 };
		rerender(
			<ThreatMenu
				activeFilter={newActiveFilter}
				backgroundColor="#000"
				currentActiveThreatId={"2s4dInIbbycwu4kaQUYKq2"}
				filterCategories={filterCategories}
				hasActiveFilter={true}
				stringList={stringList}
				onUpdateActiveFilter={spyOnUpdateActiveFilter}
				routes={routes}
				threatList={mockThreats}
				goToPage={goToPage}
			/>
		);
		const filterTwoDropdown = getByLabelText(/effort, advanced/i);

		// Fires a filter change when an option is clicked in the "effort" dropdown
		expect(spyOnUpdateActiveFilter).toHaveBeenCalledTimes(0);
		expect(queryByLabelText(/cost, quick/i)).toBeNull();
		fireEvent.click(filterTwoDropdown);
		const effortOption = queryByLabelText(/effort, quick/i);
		fireEvent.click(effortOption);
		expect(spyOnUpdateActiveFilter).toHaveBeenCalledTimes(1);
		expect(queryByLabelText(/cost, quick/i)).toBeNull();
	});

	test("renders a filter dropdown on small breakpoints", () => {
		// Arrange
		ResizeUtils.getCurrentBreakpoint.mockImplementation(() => "small");
		const { getByText } = render(
			<ThreatMenu
				activeFilter={initialActiveFiter}
				backgroundColor="#000"
				currentActiveThreatId={"2s4dInIbbycwu4kaQUYKq2"}
				filterCategories={filterCategories}
				hasActiveFilter={true}
				stringList={stringList}
				onUpdateActiveFilter={spyOnUpdateActiveFilter}
				routes={routes}
				threatList={mockThreats}
				goToPage={goToPage}
			/>
		);
		const filterTrigger = getByText(/all-tools-filter-title/i);

		// Filter trigger responds to user interaction
		expect(goToPage).toHaveBeenCalledTimes(0);
		fireEvent.click(filterTrigger);
		expect(goToPage).toHaveBeenCalledTimes(1);
	});
});
