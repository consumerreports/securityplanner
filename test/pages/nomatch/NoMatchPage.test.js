import "./../mocks/matchMedia.js";
import React from "react";

import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import SecurityPlannerRoutes from "./../../../src/js/routing/SecurityPlannerRoutes";
import NoMatchPage from "./../../../src/js/components/pages/nomatch/NoMatchPage.react";
import languages from "./../../mocks/languages";

import StringList from "./../../../src/js/vendor/localization/StringList";
jest.mock("./../../../src/js/vendor/localization/StringList");

describe("<NoMatchPage />", () => {
    // Setup
	const testSL = new StringList();
	const testRoutes = new SecurityPlannerRoutes();
    const testGoToPage = jest.fn();
    
    test("snapshot", () => {
        const ref = React.createRef();
        const { container } = render(
            <NoMatchPage
                stringList={testSL}
                routes={testRoutes}
                goToPage={testGoToPage}
                ref={ref}
            />
        );
        ref.current.onActivate();

        ref.current.onDeactivate();
    })
})