import "core-js/shim";
import "requestidlecallback";
import "whatwg-fetch";

import React from "react";
import ReactDOM from 'react-dom';
import Bowser from "bowser";
import Modernizr from "modernizr";

import SecurityPlannerApp from "./components/SecurityPlannerApp.react";
import SecurityPlannerConstants from "./constants/SecurityPlannerConstants";
import ValidationApp from "./components/debug/ValidationApp.react";

const browserVersion = parseFloat(Bowser.version);



let supportedBrowser = false;
const browserTestResults = Object.entries(Modernizr);
for (const browserTestResult of browserTestResults) {
	if (browserTestResult[1]) {
supportedBrowser = true;
	} else {
supportedBrowser = false;
		break;
	}
}
console.log(`Supported browser? ${supportedBrowser}`);

if (SecurityPlannerConstants.Parameters.IS_VALIDATING) {
	ReactDOM.render(
		<ValidationApp />,
		document.getElementById("app-container")
	);
	// console.log("Validation initialized."); // eslint-disable-line
} else if (supportedBrowser || SecurityPlannerConstants.Parameters.SKIP_BROWSER_CHECK) {
	// Modern browser, start

	// Add needed CSSs
	if (Bowser.msie) document.body.classList.add("platform-browser-msie");
	if (Bowser.msedge) document.body.classList.add("platform-browser-msedge");
	if (Bowser.safari) document.body.classList.add("platform-browser-safari");
	if (Bowser.chrome) document.body.classList.add("platform-browser-chrome");
	if (Bowser.firefox) document.body.classList.add("platform-browser-firefox");
	if (Bowser.android) document.body.classList.add("platform-os-android");
	if (Bowser.iphone) document.body.classList.add("platform-device-iphone");
	if (Bowser.ios) document.body.classList.add("platform-os-ios");
	if (Bowser.ios && browserVersion >= 7 && browserVersion < 8) document.body.classList.add("platform-os-ios-7");

	// Render
	ReactDOM.render(
		<SecurityPlannerApp />,
		document.getElementById("app-container")
	);
	// console.log("App initialized. Be safe out there."); // eslint-disable-line
} else {
	// Old browsers
	location.href = "legacy.html";
}