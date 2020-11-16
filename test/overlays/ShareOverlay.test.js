import "./mocks/matchMedia.js";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import ShareOverlay from "./../../src/js/components/overlays/share/ShareOverlay.react";

import StringList from "./../../src/js/vendor/localization/StringList";
jest.mock("./../../src/js/vendor/localization/StringList");

jest.mock("./../../src/js/vendor/utils/ResizeUtils", () => {
	return {
		__esModule: true,
		default: {
			onResize: { add: jest.fn(), remove: jest.fn() }
		}
	};
});

import MultiSharer from "./../../src/js/vendor/sharing/MultiSharer";
jest.spyOn(MultiSharer, "share");
import MiniTracker from "./../../src/js/vendor/tracking/MiniTracker";
jest.spyOn(MiniTracker, "trackEvent");


jest.spyOn(window, "open").mockImplementation();

describe("<ShareOverlay />", () => {
	// Setup
	const testSL = new StringList();
	const spyOnClickClose = jest.fn();

	test("should respond to user interactions", () => {
		const ref = React.createRef();
		const { getByLabelText, getByTestId, getByAltText } = render(
			<ShareOverlay
				scrollPosition={0}
				stringList={testSL}
				onClickClose={spyOnClickClose}
				ref={ref}
			/>
		);
		ref.current.onActivate();
		const background = getByLabelText(/sharing-message/i);
		const backgroundOverlay = getByTestId("share-overlay-background");
		const menu = getByLabelText(/Share options/i);

		// Click the background overlay to close
		expect(spyOnClickClose).toHaveBeenCalledTimes(0);
		fireEvent.click(backgroundOverlay);
		expect(spyOnClickClose).toHaveBeenCalledTimes(1);

		spyOnClickClose.mockClear();

		// Press escape to close
		expect(spyOnClickClose).toHaveBeenCalledTimes(0);
		fireEvent.keyDown(background, { keyCode: 27 });
		expect(spyOnClickClose).toHaveBeenCalledTimes(1);

		spyOnClickClose.mockClear();

		// Press escape to close
		expect(spyOnClickClose).toHaveBeenCalledTimes(0);
		fireEvent.keyDown(menu, { keyCode: 27 });
		expect(spyOnClickClose).toHaveBeenCalledTimes(1);

		// Click on a share link
		const email = getByAltText("Share via Email");
		const twitter = getByAltText("Share via Twitter");
		const gplus = getByAltText("Share via Google Plus");
		const fb = getByAltText("Share via Facebook");
		expect(MultiSharer.share).toHaveBeenCalledTimes(0);

		fireEvent.click(email);
		expect(MiniTracker.trackEvent).toHaveBeenCalledTimes(1);
		fireEvent.click(twitter);
		expect(MultiSharer.share).toHaveBeenCalledTimes(1);
		fireEvent.click(gplus);
		expect(MultiSharer.share).toHaveBeenCalledTimes(2);
		fireEvent.click(fb);
		expect(MultiSharer.share).toHaveBeenCalledTimes(3);

		ref.current.onDeactivate();
	});

	test("should transition onto and off the page", () => {
		jest.spyOn(window, "requestAnimationFrame").mockImplementation(cb => cb());
		jest.useFakeTimers();
		const ref = React.createRef();
		const spyTransition = jest.fn();

		const { container } = render(
			<ShareOverlay
				scrollPosition={0}
				stringList={testSL}
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
