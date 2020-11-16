import "./mocks/matchMedia.js";
import React from "react";
import SecurityPlannerRoutes from "./../../src/js/routing/SecurityPlannerRoutes";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import ToolFeedbackOverlay from "./../../src/js/components/overlays/tool-feedback/ToolFeedbackOverlay.react"
import mockData from "./../mocks/mockData";

import StringList from "./../../src/js/vendor/localization/StringList";
jest.mock("./../../src/js/vendor/localization/StringList");

describe("<ToolFeedbackOverlay />", () => {
	// Setup
	const testSL = new StringList();
	const testRoutes = new SecurityPlannerRoutes();
	const testGoToPage = jest.fn();

    const spyOnClickClose = jest.fn();
    
	test("should respond to user interactions", () => {
		const ref = React.createRef();
		const { getByText, getByTitle, debug } = render(
			<ToolFeedbackOverlay
				stringList={testSL}
				routes={testRoutes}
				goToPage={testGoToPage}
				tool={mockData.toolOne}
				scrollPosition={0}
				onClickClose={spyOnClickClose}
				ref={ref}
			/>
        );
        ref.current.onActivate();
        const backButton = getByText("common-ui-back");

        // Clicking the back button closes the overlay
        expect(spyOnClickClose).toHaveBeenCalledTimes(0);
        fireEvent.click(backButton);
        expect(spyOnClickClose).toHaveBeenCalledTimes(1);

        ref.current.onDeactivate();
    });

	test("should transition onto and off the page", () => {
		jest.spyOn(window, "requestAnimationFrame").mockImplementation(cb => cb());
		jest.useFakeTimers();
		const ref = React.createRef();
		const spyTransition = jest.fn();

		const { container } = render(
			<ToolFeedbackOverlay
				stringList={testSL}
				routes={testRoutes}
				goToPage={testGoToPage}
				tool={mockData.toolOne}
				scrollPosition={0}
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
})