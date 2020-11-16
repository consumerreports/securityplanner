import React from "react";
import { render } from "@testing-library/react";
import { toHaveTextContent } from "@testing-library/jest-dom";
import Text from "./../../../src/js/components/common/Text.react";

describe("<Text />", () => {
    test("should render the given text", () => {
        const ref = React.createRef();
        const { getByTestId } = render(<Text ref={ref} />);

        // Set initial string
		ref.current.setState({ text: "Test string." });
        expect(getByTestId("text")).toHaveTextContent("Test string.");
        
        // Set the same string
		ref.current.setState({ text: "Test string." });
        expect(getByTestId("text")).toHaveTextContent("Test string.");

        // Set to an empty string
		ref.current.setState({ text: "" });
        expect(getByTestId("text")).toHaveTextContent("");
    });

    test("should render an em tag", () => {
        const ref = React.createRef();
        const { getByTestId } = render(<Text ref={ref} />);
		ref.current.setState({ text: "<em>Text</em>" });
		expect(getByTestId("text-em")).toHaveTextContent("Text");
	});
});
