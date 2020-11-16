import "./mocks/matchMedia.js";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import ThreatMenuOverlay from "./../../src/js/components/overlays/threat-menu/ThreatMenuOverlay.react";

import StringList from "./../../src/js/vendor/localization/StringList";
jest.mock("./../../src/js/vendor/localization/StringList");

import mockData from "./../mocks/mockData";
const testThreats = [mockData.threatOne, mockData.threatTwo];

import Transport from "./../../src/js/vendor/utils/Transport";
jest.spyOn(Transport, "get").mockImplementation(() => {
	return {
		getState: () => {
			return {
				onClickThreat: jest.fn(),
				backgroundColor: "#000",
				threats: testThreats,
				menuTitle: "Test Menu",
				currentselected: mockData.threatOne.id
			};
		}
	};
});

describe("<ThreatMenuOverlay />", () => {
	// Setup
	const testSL = new StringList();
	const spyOnClickClose = jest.fn();

	test("should respond to user interaction", () => {
		const ref = React.createRef();
		const { getByLabelText, getByText } = render(
			<ThreatMenuOverlay
				stringList={testSL}
				scrollPosition={0}
				transportId="test-id"
				onClickClose={spyOnClickClose}
				ref={ref}
			/>
		);
		ref.current.onActivate();
		const overlayBackground = getByLabelText("Threats overlay");
		const threat = getByText(mockData.threatOne.name);

		// Press escape to close the overlay
		expect(spyOnClickClose).toHaveBeenCalledTimes(0);
		fireEvent.keyDown(overlayBackground, { keyCode: 27 });
		expect(spyOnClickClose).toHaveBeenCalledTimes(1);

		Transport.get.mockClear();

		// Clicking a threat transports the user
		expect(Transport.get).toHaveBeenCalledTimes(0);
		fireEvent.click(threat);
		expect(Transport.get).toHaveBeenCalledTimes(1);

		ref.current.onDeactivate();
	});

	test("should transition onto and off the page", () => {
		jest.spyOn(window, "requestAnimationFrame").mockImplementation(cb => cb());
		jest.useFakeTimers();
		const ref = React.createRef();
		const spyTransition = jest.fn();

		const { container } = render(
			<ThreatMenuOverlay
				stringList={testSL}
				scrollPosition={0}
				transportId={"test-id"}
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
