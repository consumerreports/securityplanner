import "./../mocks/matchMedia.js";
import React from "react";

import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import SecurityPlannerRoutes from "./../../../src/js/routing/SecurityPlannerRoutes";
import PhilosophyPage from "./../../../src/js/components/pages/philosophy/PhilosophyPage.react";
import languages from "./../../mocks/languages";

import StringList from "./../../../src/js/vendor/localization/StringList";
jest.mock("./../../../src/js/vendor/localization/StringList");

jest.mock("./../../../src/js/vendor/utils/MarkdownAnchorLinkReplacer");

describe("<PhilisophyPage />", () => {
	// Setup
	const ref = React.createRef();
	const testSL = new StringList();
	const testRoutes = new SecurityPlannerRoutes();
	const testGoToPage = jest.fn();
	const testCheckPage = jest.fn();

	test("snapshot", () => {
		const { container, debug } = render(
			<PhilosophyPage
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
		ref.current.onDeactivate();
	});
});
