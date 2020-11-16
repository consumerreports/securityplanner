require("core-js/shim");
require("babel-core/register")({
	presets: ['es2015', 'react']
});

var jsdom = require("jsdom").jsdom;

var exposedProperties = ["window", "navigator", "document"];

global.document = jsdom("");
global.window = document.defaultView;
Object.keys(document.defaultView).forEach((property) => {
	if (typeof global[property] === "undefined") {
		exposedProperties.push(property);
		global[property] = document.defaultView[property];
	}
});

global.navigator = {
	userAgent: "node.js"
};

documentRef = document;