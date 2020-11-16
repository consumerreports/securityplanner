import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Header from "./../../../src/js/components/pages/terms/Header.react";
import StringList from "./../../../src/js/vendor/localization/StringList";
jest.mock("./../../../src/js/vendor/localization/StringList");

describe("<Header />", () => {
    //Setup
    const testSL = new StringList();
    const onClickTest = jest.fn();
    beforeEach(() => {
		StringList.mockClear();
	});
    //Test
    test("responds to clicks", () => {
        //Arrange
        const ref = React.createRef();
		const { getByTitle, debug } = render(
			<Header stringList={testSL} onClickedPrint={onClickTest} ref={ref} />
        );
        //Act
        fireEvent.click(getByTitle('print-button-label'));
        //Assert
		expect(onClickTest).toBeCalledTimes(1);
	});
});
