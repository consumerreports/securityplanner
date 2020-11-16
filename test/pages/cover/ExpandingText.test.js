import React from 'react';
import "../mocks/matchMedia.js";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent } from "@testing-library/react";
import ExpandingText from "./../../../src/js/components/pages/cover/ExpandingText.react";

import ResizeUtils from "./../../../src/js/vendor/utils/ResizeUtils";

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

describe("<ExpandingText />", () => {

    // Setup
    const caption = "Caption String";
    const breakpoint = jest.fn();
    const onExpanded = jest.fn();
    const children = "test";

    test("should expand without click if breakpoint returns medium", () => {

        const ref = React.createRef();
        
        ResizeUtils.getCurrentBreakpoint.mockImplementation(() => "medium");

        const { getByTestId, queryByText } = render(
            <ExpandingText 
                caption = {caption}
                children = {children}
                onKeyDown = {onExpanded}
                onClick = {onExpanded} />
        )

        // expects button to be expanded (children showing)
        expect(queryByText("test")).toBeInTheDocument();

    });

    test("should expand with click if breakpoint returns tiny", () => {

        const ref = React.createRef();

        ResizeUtils.getCurrentBreakpoint.mockImplementation(() => "tiny");

        const { getByTestId, queryByText } = render(
            <ExpandingText 
                caption = {caption}
                children = {children}
                onKeyDown = {onExpanded}
                onClick = {onExpanded} 
                ref={ref}/>
        )

        expect(queryByText("Caption String")).toBeInTheDocument();

        const button = getByTestId("expandingText");
        fireEvent.click(button);

        expect(queryByText("test")).toBeInTheDocument();

        ref.current.contract();
        expect(queryByText("test")).not.toBeInTheDocument();

    });

});