import React from 'react';
import { render, fireEvent } from "@testing-library/react";
import Dropdown from "./../../../src/js/components/common/Dropdown.react";

describe("<Dropdown />", () => {
    test("render a menu trigger and dropdown menu", () => {
        // Arrange
        const dropdownOptions = ["apple", "orange", "banana"];
        const functionOnSelect = jest.fn();
    
        const { getByRole, getByText } = render(
            <Dropdown 
                options={ dropdownOptions }
                onSelectOption={ functionOnSelect }/>
        )

        // Open the dropdown menu
        fireEvent.click(getByRole("composite"));
        expect(getByRole("radiogroup")).toBeTruthy();
        
        dropdownOptions.forEach(dropdownOption => {
            expect(getByText(dropdownOption)).toBeTruthy()
        })

        // Click a dropdown option
        fireEvent.click(getByText("orange"));
        expect(functionOnSelect).toHaveBeenCalledTimes(1)
    });
});