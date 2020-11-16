import React from "react";
import { render, fireEvent} from "@testing-library/react";
import DetailsButton from "./../../../src/js/components/common/DetailsButton.react";
import ImageContainer from "./../../../src/js/components/common/ImageContainer.react"
jest.mock("./../../../src/js/components/common/ImageContainer.react", () => () => 'mock-icon')

describe("<DetailsButton />", () => {
    const testLink = "http://hello.com/"
    const text = "Hello"
    const icon = "test-image.jpg"

    test("creates a link with text", () => {
        const { getByText, getByRole } = render(
            <DetailsButton href={testLink}>
                {text}
            </DetailsButton>)

        // Renders an element with the button role
        expect(getByRole('button')).toBeTruthy()
        // Renders a text element
        expect(getByText(text)).toBeTruthy()
    })

    test("calls the ImageContainer component when passed an icon prop", () => {
        const { getByText } = render(
        <DetailsButton href={testLink} icon={icon}/>
        )
        // Renders an icon
        expect(getByText('mock-icon')).toBeTruthy();
    })

    test("responds to click", () => {
        const clickHandler = jest.fn();
        const { getByTitle } = render(
            <DetailsButton title="hello" onClick={clickHandler} />
        )

        expect(clickHandler).toHaveBeenCalledTimes(0)
        fireEvent.click(getByTitle("hello"))
        expect(clickHandler).toHaveBeenCalledTimes(1)
    })
})