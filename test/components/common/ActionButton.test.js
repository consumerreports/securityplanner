import React from "react";
import { render, fireEvent } from "@testing-library/react";

import ActionButton from "./../../../src/js/components/common/ActionButton.react";

describe("<ActionButton />", () => {
  test("creates a text element and an icon", () => {
    // Setup
    const { getByText, getByRole, getByAltText } = render(
      <ActionButton allowFocus={true} className="myClassName">
        Hello!
      </ActionButton>
    );

    // Renders an element with the button role
    expect(getByRole("button")).toBeTruthy();
    // Renders a text element
    expect(getByText("Hello!")).toBeTruthy();
    // Renders an icon
    expect(getByAltText(/icon/)).toBeTruthy();
  });

  test("responds to clicks", () => {
    const clickHandler = jest.fn();

    const { getByTitle } = render(
      <ActionButton allowFocus={true} title={"hello"} onClick={clickHandler}>
        Hello!
      </ActionButton>
    );

    expect(clickHandler).toHaveBeenCalledTimes(0);
    fireEvent.click(getByTitle("hello"));
    expect(clickHandler).toHaveBeenCalledTimes(1);
  });
});
