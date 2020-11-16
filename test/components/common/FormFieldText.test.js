import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import FormFieldText from "./../../../src/js/components/common/FormFieldText.react";

describe("<FormFieldText />", () => {
	// Setup
	const spyOnChange = jest.fn();
	const spyOnGotFocus = jest.fn();
	const spyOnLostFocus = jest.fn();

	// Tests
	test("should respond to user input", () => {
		// Arrange
		const { getByPlaceholderText, debug } = render(
			<FormFieldText
				title="Text Area"
				placeholder="Enter your message here."
				multiline={true}
				value=""
				allowFocus={true}
				onChange={spyOnChange}
				onGotFocus={spyOnGotFocus}
				onLostFocus={spyOnLostFocus}
			/>
		);

		const textarea = getByPlaceholderText("Enter your message here.");
		expect(textarea.value).toBe("");

		// Act
		// Trigger an event on focus
		expect(spyOnGotFocus).toHaveBeenCalledTimes(0);
		fireEvent.focus(textarea);
		// Assert
		expect(spyOnGotFocus).toHaveBeenCalledTimes(1);

		// Triggers an event on blur
		expect(spyOnLostFocus).toHaveBeenCalledTimes(0);
		fireEvent.blur(textarea);
		expect(spyOnLostFocus).toHaveBeenCalledTimes(1);

		// Trigger an event on change
		expect(spyOnChange).toHaveBeenCalledTimes(0);
		fireEvent.change(textarea, { target: { value: "New textarea value" } });
		expect(spyOnChange).toHaveBeenCalledWith("New textarea value");
	});

	test("should validate email input", () => {
		const { queryByTestId, getByPlaceholderText, rerender, getByTestId } = render(
			<FormFieldText
				title="Email Input"
				placeholder="Please enter your email"
				type="email"
				value="email"
				multiline={false}
				onBlur={spyOnLostFocus}
			/>
		);
		const input = getByPlaceholderText("Please enter your email");

		fireEvent.blur(input);
		const error = getByTestId("email-validation-message");
		expect(error).toBeVisible();

		// Give it a valid email address
		rerender(
			<FormFieldText
				title="Email Input"
				placeholder="Please enter your email"
				type="email"
				value="email@gmail.com"
				multiline={false}
				onBlur={spyOnLostFocus}
			/>
		);
        fireEvent.change(input, { target: { value: "email" } });
        const noError = queryByTestId("email-validation-message");
        expect(noError).toBeFalsy();
	});
});
