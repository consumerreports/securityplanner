import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import LanguageMenu from "./../../../src/js/components/common/LanguageMenu.react";

import StringList from "./../../../src/js/vendor/localization/StringList";
jest.mock("./../../../src/js/vendor/localization/StringList");
import MiniTracker from "../../../src/js/vendor/tracking/MiniTracker";
jest.mock("../../../src/js/vendor/tracking/MiniTracker");

const spyMinitracker = jest.fn();
MiniTracker.trackEvent.mockImplementation(spyMinitracker);

describe("<LanguageMenu />", () => {
	// Setup
	const stringList = new StringList();
	const english = {
		id: "en-US",
		name: "English"
	};
	const french = {
		id: "ar-001",
		name: "Arabic",
		enabled: true
	};
	const arabic = {
		id: "fr-CA",
		name: "French",
		enabled: true
	};
    const languages = [english, french, arabic];

    beforeEach(jest.clearAllMocks);

	test("should be able to select a language", () => {
		const { getByLabelText, getAllByLabelText } = render(
			<LanguageMenu
				stringList={stringList}
				selectedLanguage={english}
				availableLanguages={languages}
                allowFocus={true}
			/>
		);
        const selectedLanuage = getByLabelText(/common-language-menu-selected/i);
        const otherLanguages = getAllByLabelText(/common-language-menu-available/i);
        otherLanguages.forEach(language => {
            expect(language.tabIndex).toBe(-1);
        });

        // Opening the language menu lets the user interact with the available languages
        fireEvent.keyDown(selectedLanuage, { keyCode: 32 });
        otherLanguages.forEach(language => {
            expect(language.tabIndex).toBe(0);
        });

        // Clicking an available language closes the menu and fires a function to signal a language change
        expect(spyMinitracker).toHaveBeenCalledTimes(0);
        fireEvent.click(otherLanguages[0]);
        otherLanguages.forEach(language => {
            expect(language.tabIndex).toBe(-1);
        });
        expect(spyMinitracker).toHaveBeenCalledTimes(1);
        expect(spyMinitracker).toHaveBeenCalledWith("language", "change", french.id);
    });

    test("should be able to open and close the menu", () => {
		const { getByLabelText, getAllByLabelText, container } = render(
			<LanguageMenu
				stringList={stringList}
				selectedLanguage={english}
				availableLanguages={languages}
				allowFocus={true}
			/>
        );
        const selectedLanuage = getByLabelText(/common-language-menu-selected/i);
        const otherLanguages = getAllByLabelText(/common-language-menu-available/i);
        otherLanguages.forEach(language => {
            expect(language.tabIndex).toBe(-1);
        });
        fireEvent.keyDown(selectedLanuage, { keyCode: 32 });
        otherLanguages.forEach(language => {
            expect(language.tabIndex).toBe(0);
        });

        // Selecting the already selected language will close the menu but not change the language
        fireEvent.keyDown(selectedLanuage, { keyCode: 32 });
        otherLanguages.forEach(language => {
            expect(language.tabIndex).toBe(-1);
        });
        expect(spyMinitracker).toHaveBeenCalledTimes(0);
    })
    
    test("should show a loading state when there are no available languages", () => {
        const { getByText, debug } = render(
            <LanguageMenu />
        );
        expect(getByText(/loading languages/i)).toBeTruthy();
    })
});
