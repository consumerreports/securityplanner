import "./mocks/matchMedia.js";
import React from "react";
import SecurityPlannerRoutes from "./../../src/js/routing/SecurityPlannerRoutes";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import ToolOverlay from "./../../src/js/components/overlays/tool/ToolOverlay.react";
import mockData from "./../mocks/mockData";

import StringList from "./../../src/js/vendor/localization/StringList";
jest.mock("./../../src/js/vendor/localization/StringList");

import MiniTracker from "./../../src/js/vendor/tracking/MiniTracker";
jest.spyOn(MiniTracker, "trackEvent");

describe("<ToolOverlay />", () => {
	// Setup
	const testSL = new StringList();
	const testRoutes = new SecurityPlannerRoutes();
	const testGoToPage = jest.fn();

	const spyOnClickClose = jest.fn();

	test("should respond to user interactions", () => {
		const ref = React.createRef();
		const { getByAltText, getByTitle, rerender } = render(
			<ToolOverlay
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
		const closeButton = getByAltText("common-ui-back");
		const feedBackButton = getByTitle("overlay-tool-button-feedback");

		// Pressing the escape key closes the overlay
		expect(spyOnClickClose).toHaveBeenCalledTimes(0);
		fireEvent.keyDown(document.body, {
			key: "Escape",
			keyCode: 27,
			which: 27
		});
		expect(spyOnClickClose).toHaveBeenCalledTimes(1);
		
		spyOnClickClose.mockClear();

		// Click the close button to close the overlay
		expect(spyOnClickClose).toHaveBeenCalledTimes(0);
		fireEvent.click(closeButton);
		expect(spyOnClickClose).toHaveBeenCalledTimes(1);

        // Clicking a the feedback button goes to that page
        expect(MiniTracker.trackEvent).toHaveBeenCalledTimes(0)
        fireEvent.click(feedBackButton)
        expect(MiniTracker.trackEvent).toHaveBeenCalledTimes(1)
        expect(MiniTracker.trackEvent).toHaveBeenCalledWith("tool", "feedback", mockData.toolOne.slug)


		ref.current.onDeactivate();
    });
    
	test("should transition onto and off the page", () => {
		jest.spyOn(window, "requestAnimationFrame").mockImplementation(cb => cb());
		jest.useFakeTimers();
		const ref = React.createRef();
		const spyTransition = jest.fn();

		const { container } = render(
			<ToolOverlay
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
});
