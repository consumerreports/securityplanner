import React from "react";
import Card from "../../../src/js/components/pages/statements/Card.react";

import { render, fireEvent, getByRole } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

describe("<Card />", () => {

    jest.useFakeTimers();

    test("renders element that handles multiple different types of events", () => {
        const eventHandler = jest.fn();
        
        const { getByRole, debug } = render(
            <Card 
                onKeyDown={ eventHandler }
                onClick={ eventHandler }
                onTouchStart={ eventHandler }
                onTouchMove={ eventHandler }
                onTouchEnd={ eventHandler }
                onTouchCancel={ eventHandler }
            />
        );

        const card = getByRole("checkbox");

        expect(eventHandler).toHaveBeenCalledTimes( 0 );
        
        //Hitting enter fires handlers
        fireEvent.keyDown( card, { key: 'Enter', keyCode: 13 } );
        jest.runAllTimers();
        expect(eventHandler).toHaveBeenCalledTimes( 1 );

        //Clicking fires handler
        fireEvent.click( card );
        jest.runAllTimers();
        expect(eventHandler).toHaveBeenCalledTimes( 2 );
        
        //Complete touch interaction fires handler
        fireEvent.touchStart( card );
        fireEvent.touchMove( card );
        fireEvent.touchEnd( card );
        jest.runAllTimers();
        expect(eventHandler).toHaveBeenCalledTimes( 3 );

        //Cancelled touch interaction does NOT fire handler
        fireEvent.touchStart( card );
        fireEvent.touchCancel( card );
        jest.runAllTimers();
        expect(eventHandler).toHaveBeenCalledTimes( 3 );

        //Cancelled touch interaction (with move) does NOT call handler
        fireEvent.touchStart( card );
        fireEvent.touchMove( card );
        fireEvent.touchCancel( card );
        jest.runAllTimers();
        expect(eventHandler).toHaveBeenCalledTimes( 3 );

        //Multiple rapid clicks only fires handler once
        fireEvent.click( card );
        fireEvent.click( card );
        fireEvent.click( card );
        fireEvent.click( card );
        expect(eventHandler).toHaveBeenCalledTimes( 4 );


    });

});