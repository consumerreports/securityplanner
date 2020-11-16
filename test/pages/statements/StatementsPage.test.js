import "./../mocks/matchMedia.js";
import React from "react";

import { render, fireEvent } from "@testing-library/react";

import SecurityPlannerRoutes from "./../../../src/js/routing/SecurityPlannerRoutes";
import StatementsPage from "./../../../src/js/components/pages/statements/StatementsPage.react";
import Statement from "./../../../src/js/stores/data/Statement";

import StringList from "./../../../src/js/vendor/localization/StringList";
jest.mock("./../../../src/js/vendor/localization/StringList");

describe("<StatementsPage />", () => {
	// Setup
	const testSL = new StringList();
	const testRoutes = new SecurityPlannerRoutes();
	const testGoToPage = jest.fn();
	const testNavigator = {
		currentTitle: "Test title",
		removeLocationsAfterCurrent: jest.fn()
	};

	const testStatements = [];
	const numbersMap = ["one", "two", "three", "four", "five"];
	for (let i = 0; i < 5; i++) {
		const newStatement = Object.assign(new Statement(), {
			id: i,
			slug: "statement-" + numbersMap[i],
			text: numbersMap[i],
			image: `example.com/image-${i}.jpg`,
			isRequired: false,
			level: ""
		});
		testStatements.push(newStatement);
	}

	const testLevel = {
		id: "",
		title: "Test Title",
		slug: "test-slug",
		statements: testStatements,
		answersRequired: 5
	};

	const spyOnClickNext = jest.fn();

	test("snapshot", () => {
		const ref = React.createRef();

		const { container } = render(
			<StatementsPage
				stringList={testSL}
				routes={testRoutes}
				goToPage={testGoToPage}
				navigator={testNavigator}
				onClickNext={spyOnClickNext}
				level={testLevel}
				ref={ref}
			/>
		);
		ref.current.onActivate();

		ref.current.onDeactivate();
	});
});
