import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import Bio from "./../../../src/js/components/pages/about/Bio.react";
import SecurityPlannerRoutes from "./../../../src/js/routing/SecurityPlannerRoutes";

describe("<Bio />", () => {
	// Setup
	const testRoutes = new SecurityPlannerRoutes();
	const testBio = {
		sectionID: "advisor",
		image: "http://example-image.com/",
		name: "Jane Doe",
		organization: "Jane's Organization",
		description: "Description of Jane Doe"
	};

	const spyGoToPage = jest.fn();

	test("should respond to user interaction", () => {
		const ref = React.createRef();
		const { getByLabelText } = render(
			<Bio
				bio={testBio}
				routes={testRoutes}
				goToPage={spyGoToPage}
				allowFocus={true}
				ref={ref}
			/>
		);
        const bio = getByLabelText(testBio.name);

		// Clicking on the bio takes you to the bio overlay
		expect(spyGoToPage).toHaveBeenCalledTimes(0);
		fireEvent.click(bio);
		expect(spyGoToPage).toHaveBeenCalledTimes(1);
		expect(spyGoToPage).toHaveBeenCalledWith(
			testRoutes.getUriOverlayBio(testBio.slug),
			true,
			true
        );
	});
});
