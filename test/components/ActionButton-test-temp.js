import { expect } from "chai";
import { mount, shallow } from "enzyme";
import React from "react";

import ActionButton from "./../../src/js/components/common/ActionButton.react";

// References:
// https://semaphoreci.com/community/tutorials/testing-react-components-with-enzyme-and-mocha
// https://github.com/airbnb/enzyme/tree/master/docs/api/ShallowWrapper

describe("<ActionButton/>", function() {
	it("should create a text element and an icon", function() {
		// Setup
		const el = shallow(<ActionButton className="myClassName">Hello!</ActionButton>);

		// Test
		expect(el.props().className).to.have.string("myClassName");
		expect(el.containsMatchingElement("Hello!"));
		expect(el.containsMatchingElement(<img/>));
	});

	it("should respond to clicks", function() {
		// Setup
		let tst = 0;
		const f = function() { tst = 1; };
		const el = mount(<ActionButton className="myClassName" onClick={ f }>Hello!</ActionButton>);

		// Test
		expect(tst).to.equal(0);
		el.simulate("click");
		expect(tst).to.equal(1);
	});
});