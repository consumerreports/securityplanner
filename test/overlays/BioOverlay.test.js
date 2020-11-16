import "./mocks/matchMedia.js";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import BioOverlay from "./../../src/js/components/overlays/bio/BioOverlay.react";

import StringList from "./../../src/js/vendor/localization/StringList";
jest.mock("./../../src/js/vendor/localization/StringList");

describe("<BioOverlay />", () => {
	// Setup
	const testSL = new StringList();
	const testBio = {
		image: "http://example-image.com/",
		name: "John Doe",
		organization: "Test Organization",
		description: "Description of John Doe"
	};

	const spyOnClickClose = jest.fn();

	test("should respond to user interaction", () => {
		const ref = React.createRef();
		const { getByText } = render(
			<BioOverlay
				stringList={testSL}
				bio={testBio}
				scrollPosition={0}
				onClickClose={spyOnClickClose}
				ref={ref}
			/>
		);
		ref.current.onActivate();
		const closeButton = getByText("common-ui-back");

		expect(spyOnClickClose).toHaveBeenCalledTimes(0);
		fireEvent.click(closeButton);
		expect(spyOnClickClose).toHaveBeenCalledTimes(1);
		ref.current.onDeactivate();
	});

	test("should transition onto and off the page", () => {
		jest.spyOn(window, "requestAnimationFrame").mockImplementation(cb => cb());
		jest.useFakeTimers();

		const ref = React.createRef();
		const spyTransition = jest.fn();
		const { container } = render(
			<BioOverlay
				stringList={testSL}
				bio={testBio}
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
        expect(container.firstChild).toHaveClass('hiding');
	});
});
