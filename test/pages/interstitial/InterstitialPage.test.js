import "./../mocks/matchMedia.js";
import React from "react";

import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import SecurityPlannerRoutes from "./../../../src/js/routing/SecurityPlannerRoutes";
import InterstitialPage from "./../../../src/js/components/pages/interstitial/InterstitialPage.react";
import languages from "./../../mocks/languages";

import mockData from "./../../mocks/mockData";
import StringList from "./../../../src/js/vendor/localization/StringList";
jest.mock("./../../../src/js/vendor/localization/StringList");

jest.mock("bowser", () => {
    return {  ios: true }
});

describe("<InterstitialPage />", () => {
	// Setup
	const testSL = new StringList();
	const testRoutes = new SecurityPlannerRoutes();
    const testGoToPage = jest.fn();
    const testNavigator = { currentTitle: "Test title" }
    const testTools = [ mockData.toolOne, mockData.toolTwo, mockData.toolThree, mockData.toolFour ];

    const spyOnClickNext = jest.fn();

	test("snapshot", () => {
        const ref = React.createRef();

		const { getByTestId } = render(
			<InterstitialPage
				stringList={testSL}
				selectedLanguage={languages.english}
				availableLanguages={languages.all}
				routes={testRoutes}
                goToPage={testGoToPage}
                navigator={testNavigator}
                onClickNext={spyOnClickNext}
                tools={testTools}
                level={{ id: "" }}
				ref={ref}
			/>
        );
        ref.current.onActivate();

        // Rendered element sticks to the top of the page
        const interstitialScrollContainer = getByTestId(/interstitial-scroll-container/i);
        expect(interstitialScrollContainer.scrollTop).toBeGreaterThanOrEqual(-1);
        expect(interstitialScrollContainer.scrollTop).toBeLessThanOrEqual(1);
        // Scroll up
        fireEvent.scroll(interstitialScrollContainer, { target: { scrollTop: -100 } });
        expect(interstitialScrollContainer.scrollTop).toBeGreaterThanOrEqual(-1);
        expect(interstitialScrollContainer.scrollTop).toBeLessThanOrEqual(1);
        // Scroll down
        fireEvent.scroll(interstitialScrollContainer, { target: { scrollTop: 100 } });
        expect(interstitialScrollContainer.scrollTop).toBeGreaterThanOrEqual(-1);
        expect(interstitialScrollContainer.scrollTop).toBeLessThanOrEqual(1);

        ref.current.onDeactivate();
	});
});
