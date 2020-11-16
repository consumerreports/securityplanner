import "./../mocks/matchMedia.js";
import React from "react";

import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import SecurityPlannerRoutes from "./../../../src/js/routing/SecurityPlannerRoutes";
import AboutPage from "./../../../src/js/components/pages/about/AboutPage.react"
import languages from "./../../mocks/languages";

import StringList from "./../../../src/js/vendor/localization/StringList";
jest.mock("./../../../src/js/vendor/localization/StringList");

jest.mock("./../../../src/js/vendor/utils/MarkdownAnchorLinkReplacer");

describe("<AboutPage />", () => {
    // Setup
	const testSL = new StringList();
	const testRoutes = new SecurityPlannerRoutes();
    const testCheckPage = jest.fn();
    const testGoToPage = jest.fn();

    const testBios = [
        {
            sectionID:"peer",
            image: "http://example-image.com/",
            name: "John Doe",
            organization: "John's Organization",
            description: "Description of John Doe",
            label: "Happy"
        },
        {
            sectionID:"advisor",
            image: "http://example-image.com/",
            name: "Jane Doe",
            organization: "Jane's Organization",
            description: "Description of Jane Doe"
        }
    ]
    
    test("renders links with logos", () => {
        const ref = React.createRef();
        const { getAllByRole } = render(
            <AboutPage 
                bios={testBios}
                stringList={testSL}
                selectedLanguage={languages.english}
                availableLanguages={languages.all}
                routes={testRoutes}
                goToPage={testGoToPage}
                checkPage={testCheckPage}
                ref={ref}
            />
        );
        ref.current.onActivate();
        getAllByRole("link", { name:"example asset" }).forEach(link => {
            expect(link.firstChild.getAttribute("src")).toBeDefined();
        });
        ref.current.onDeactivate();
    })
})