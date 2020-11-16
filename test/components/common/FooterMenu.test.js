import React from "react";
import { render, fireEvent, getAllByRole } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import FooterMenu from "./../../../src/js/components/common/FooterMenu.react";
import SecurityPlannerRoutes from "./../../../src/js/routing/SecurityPlannerRoutes";

import StringList from "./../../../src/js/vendor/localization/StringList";
jest.mock("./../../../src/js/vendor/localization/StringList");

describe("<FooterMenu />", () => {
    
    const routes = new SecurityPlannerRoutes();
    const stringList = new StringList();
    
    const mockGoToPage = jest.fn();

    test("clicked menu links should call Go To Page", () => {

		// Arrange
		const { getAllByRole, debug } = render(
			<FooterMenu
                currentLocation="home"
                stringList={stringList}
                style="light"
                routes={routes}
                goToPage={mockGoToPage}
                allowFocus={true}
			/>
        );
        
        const menuitems = getAllByRole("menuitem");
        
        menuitems.forEach(menuitem => {
			fireEvent.click(menuitem);
        });
        
        expect(mockGoToPage).toHaveBeenCalledTimes( menuitems.length );

	});

});