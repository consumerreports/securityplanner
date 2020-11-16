// Usage, setup:
// 1. npm install

// Usage, running:
// 1. npm run dev
// 2. npm run test-ux

// Drivers
require("chromedriver");

// Selenium
const webdriver = require("selenium-webdriver");
const expect = require("chai").expect;

const By = webdriver.By;
const until = webdriver.until;
const driver = new webdriver.Builder()
	.forBrowser("chrome")
	.build();

driver.manage().window().setSize(1400, 900);
driver.manage().window().maximize();

// Start

function waitUntilDisplayed(locator) {
	return function() {
		return driver.wait(until.elementLocated(locator), 4000)
      .then(() => {
	return driver.findElement(locator).isDisplayed();
}).then(v => {
	return v;
});
	};
}

function wait(s) {
	return function() {
		driver.sleep(s * 1000);
	};
}

describe("Home page", function() {
	this.timeout(10000);
	const coverPageQuery = By.css(".pageCover");
	let button = null;

	it("should exist and have a button", function(done) {
		driver.get("http://localhost:8080/index.html");
		driver.wait(until.elementLocated(coverPageQuery), 4000);
		button = driver.findElement(coverPageQuery).findElement(By.css(".body .common-button-action.button"))
			.then(() => {
				expect(button).to.exist;
				done();
			})
			.catch(error => done(error));
		expect(button).to.exist;
	});
});

describe("Statement results", function() {
	this.timeout(20000);
	const coverPageQuery = By.css(".pageCover");

	const nextStep = function(level, statementsToSelect) {
		const stepSelector = `.pageStatements-level-${ level }`;
		// Select statement and continue
		driver.wait(waitUntilDisplayed(By.css(stepSelector)), 4000);
		driver.wait(waitUntilDisplayed(By.css(`${ stepSelector } .statement-0`)), 4000).then(wait(0.5));

		// Select statements
		statementsToSelect.forEach(statementIndex => {
			driver.findElement(By.css(`${ stepSelector } .statement-${ statementIndex }`)).click();
		});

		driver.wait(waitUntilDisplayed(By.css(`${ stepSelector } .footer .button-next`)), 4000).then(wait(0.5));
		driver.findElement(By.css(`${ stepSelector } .footer .button-next`)).click();
	};

	let toolsCountOne = null;
	let toolsCountTwo = null;

	it("should get different results for different selections", function(done) {
		// Start
		driver.get("http://localhost:8080/index.html");

		// Open statements
		driver.wait(until.elementLocated(coverPageQuery), 4000);
		driver.findElement(coverPageQuery).findElement(By.css(".body .common-button-action.button")).click();

		// Select statements
		nextStep(1, [0, 1]);
		nextStep(2, [0, 1]);
		nextStep(3, [0, 1]);

		// Asserts
		driver.wait(until.elementLocated(By.css(".pageReport")), 4000).then(wait(0.2));
		driver.findElements(By.css(".pageReport .content .middle .body .common-tool-box")).then(tools => {
			expect(tools.length).to.be.above(1);
			toolsCountOne = tools.length;
		});

		// Start over
		driver.findElement(By.css(".common-button-start-over .wrap-buttons")).click();
		driver.wait(until.elementLocated(coverPageQuery), 4000).then(wait(0.5));
		driver.findElement(coverPageQuery).findElement(By.css(".body .common-button-action.button")).click();

		// Select new statements
		nextStep(1, [2]);
		nextStep(2, [2]);
		nextStep(3, [2]);

		// Asserts
		driver.wait(until.elementLocated(By.css(".pageReport")), 4000).then(wait(0.2));
		driver.findElements(By.css(".pageReport .content .middle .body .common-tool-box")).then(tools => {
			expect(tools.length).to.be.above(1);
			toolsCountTwo = tools.length;
			expect(toolsCountTwo).to.not.equal(toolsCountOne);
			done();
		});
	});
});

describe("Statements", function() {
	this.timeout(20000);
	const coverPageQuery = By.css(".pageCover");

	const statementCounts = [];

	const goBackAndSelectOtherStatement = function(indexToDeselect, indexToSelect, done = null) {
		driver.findElement(By.css(".locator .before-1")).click();
		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-1")), 4000);
		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-1 .statement-0")), 4000).then(wait(0.5));
		driver.findElement(By.css(`.pageStatements-level-1 .statement-${ indexToDeselect }`)).click();
		driver.findElement(By.css(`.pageStatements-level-1 .statement-${ indexToSelect }`)).click();
		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-1 .footer .button-next")), 4000).then(wait(0.5));
		driver.findElement(By.css(".pageStatements-level-1 .footer .button-next")).click();

		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-2")), 4000);
		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-2 .statement-0")), 4000).then(wait(0.5));

		driver.findElements(By.css(".pageStatements-level-2 .statement")).then(found => {
			// Check that there is at least one statement in the second step
			expect(found.length).to.be.at.least(1);

			if (!statementCounts.includes(found.length)) {
				statementCounts.push(found.length);
			}

			if (done) {
				// Check that at least two combinations give different options at step two
				expect(statementCounts.length).to.be.at.least(2);
				done();
			}
		});
	};

	it("should get different options at the second step", function(done) {
		// Start
		driver.get("http://localhost:8080/index.html");

		// Open statements
		driver.wait(until.elementLocated(coverPageQuery), 4000);
		driver.findElement(coverPageQuery).findElement(By.css(".body .common-button-action.button")).click();

		// Select statement and continue
		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-1")), 4000);
		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-1 .statement-0")), 4000).then(wait(0.5));
		driver.findElement(By.css(".pageStatements-level-1 .statement-0")).click();
		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-1 .footer .button-next")), 4000).then(wait(0.5));
		driver.findElement(By.css(".pageStatements-level-1 .footer .button-next")).click();

		// Select statement and continue
		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-2")), 4000);
		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-2 .statement-0")), 4000).then(wait(0.5));
		driver.findElements(By.css(".pageStatements-level-2 .statement")).then(found => {
			// Check that there is at least one statement in the second step
			expect(found.length).to.be.at.least(1);

			statementCounts.push(found.length);
		});

		// Go back and select next statement
		goBackAndSelectOtherStatement(0, 1);

		// Go back and select next statement
		goBackAndSelectOtherStatement(1, 2);

		// Go back and select next statement
		goBackAndSelectOtherStatement(2, 3);

		// Go back and select next statement
		goBackAndSelectOtherStatement(3, 4, done);
	});

	it("should deselect other options when `none` is selected", function(done) {
		// Start
		driver.get("http://localhost:8080/index.html");

		// Open statements
		driver.wait(until.elementLocated(coverPageQuery), 4000);
		driver.findElement(coverPageQuery).findElement(By.css(".body .common-button-action.button")).click();

		// Select statement and continue
		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-1")), 4000);
		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-1 .statement-0")), 4000).then(wait(0.5));
		driver.findElement(By.css(".pageStatements-level-1 .statement-0")).click();
		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-1 .footer .button-next")), 4000).then(wait(0.5));
		driver.findElement(By.css(".pageStatements-level-1 .footer .button-next")).click();

		// Select statement and continue
		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-2")), 4000);
		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-2 .statement-0")), 4000).then(wait(0.5));
		driver.findElement(By.css(".pageStatements-level-2 .statement-0")).click();
		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-2 .footer .button-next")), 4000).then(wait(0.5));
		driver.findElement(By.css(".pageStatements-level-2 .footer .button-next")).click();

		// Select statement and continue
		driver.wait(until.elementLocated(By.css(".pageStatements-level-3")), 4000);
		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-3 .statement-0")), 4000).then(wait(0.5));
		driver.findElement(By.css(".pageStatements-level-3 .statement-0")).click();
		driver.findElement(By.css(".pageStatements-level-3 .statement-1")).click();
		driver.findElement(By.css(".pageStatements-level-3 .statement-2")).click();
    // The `none` option is currently index 5. If this changes in the future and breaks this test, we should make a smart index detection
		driver.findElement(By.css(".pageStatements-level-3 .statement-5")).click();
		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-3 .footer .button-next")), 4000).then(wait(0.5));

		driver.findElements(By.css(".pageStatements-level-3 .is-selected")).then(found => {
			expect(found.length).to.equal(1);
			driver.findElement(By.css(".pageStatements-level-3 .statement-5")).click();
			return driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-3 .footer .button-next")), 4000).then(wait(0.5));
		}).then(() => {
			return driver.findElements(By.css(".pageStatements-level-3 .is-selected"));
		}).then(found => {
			expect(found.length).to.equal(3);
			done();
		});
	});
});

describe("All recommendations, report issue", function() {
	this.timeout(10000);
	const coverPageQuery = By.css(".pageCover");

	it("should report issue", function(done) {
		driver.get("http://localhost:8080/index.html");
		driver.wait(until.elementLocated(coverPageQuery), 4000);

		// Click on the "All Recommendations" link
		driver.findElement(coverPageQuery).findElement(By.css(".link-group--info .link:nth-child(3) a")).click();
		driver.wait(waitUntilDisplayed(By.css(".pageAllTools")), 4000).then(wait(0.5));

		// Click on the first tool "Learn more"
		driver.findElement(By.css(".pageAllTools .content .middle .body .common-tool-box:nth-child(2) .common-button-details")).click();
		driver.wait(waitUntilDisplayed(By.css(".overlayTool.overlay")), 4000).then(wait(0.5));

		// Check if modal has opened
		driver.findElements(By.css(".overlayTool.overlay")).then(found => {
			expect(found.length).to.equal(1);
		});

		// Select first radio
		driver.findElement(By.css(".overlayTool.overlay .body .feedback .common-button-details")).click();
		driver.wait(waitUntilDisplayed(By.css(".overlay-simple.overlayToolFeedback")), 4000).then(wait(0.5));
		driver.findElement(By.css(".overlay-simple.overlayToolFeedback .answers .answer:nth-child(1)")).click();

		// Fill in dummy text
		driver.findElement(By.css(".overlay-simple.overlayToolFeedback .common-form .field.multi-line textarea")).sendKeys("Help!");

		// Submit, waits a bit longer for form to submit
		driver.findElement(By.css(".overlay-simple.overlayToolFeedback .footer .common-button-details-like-action.button-submit")).click().then(wait(3)).then(() => {
			// Check if overlay is removed
			driver.findElements(By.css(".overlay-simple.overlayToolFeedback")).then(found => {
				expect(found.length).to.equal(0);

				// Check if notification is displayed
				driver.findElements(By.css(".common-toasts .toasts .toast.success")).then(found => {
					expect(found.length).to.equal(1);
					done();
				});
			});
		});
	});
});

describe("Feedback", function() {
	this.timeout(15000);
	const coverPageQuery = By.css(".pageCover");

	it("should submit the feedback", function(done) {
		// Start
		driver.get("http://localhost:8080/index.html");

		// Open statements
		driver.wait(until.elementLocated(coverPageQuery), 4000);
		driver.findElement(coverPageQuery).findElement(By.css(".common-footer-menu .navigation .group:nth-child(2) .item:nth-child(2) a")).click();

		// Answer the first question
		driver.wait(waitUntilDisplayed(By.css(".pageFeedback")), 4000);
		driver.wait(waitUntilDisplayed(By.css(".pageFeedback .tabs-body .question.expanded")), 4000).then(wait(0.3));
		driver.findElement(By.css(".pageFeedback .tabs-body .question.expanded .cards .card:nth-child(3)")).click().then(wait(0.5));

		// Answer the second question
		driver.wait(waitUntilDisplayed(By.css(".pageFeedback .tabs-body .question.expanded")), 4000).then(wait(0.3));
		driver.findElement(By.css(".pageFeedback .tabs-body .question.expanded .cards .card:nth-child(3)")).click().then(wait(0.5));

		// Answer the third question
		driver.wait(waitUntilDisplayed(By.css(".pageFeedback .tabs-body .question.expanded")), 4000).then(wait(0.3));
		driver.findElement(By.css(".pageFeedback .tabs-body .question.expanded .cards .card:nth-child(3)")).click().then(wait(0.5));

		// Answer the fourth question
		driver.wait(waitUntilDisplayed(By.css(".pageFeedback .tabs-body .question.expanded")), 4000).then(wait(0.3));
		driver.findElement(By.css(".pageFeedback .tabs-body .question.expanded .cards .card:nth-child(3)")).click().then(wait(0.5));

		// Answer the fifth question
		driver.wait(waitUntilDisplayed(By.css(".pageFeedback .tabs-body .question.expanded")), 4000).then(wait(0.3));
		driver.findElement(By.css(".pageFeedback .tabs-body .question.expanded .cards .card:nth-child(3)")).click().then(wait(0.5));

		// Submit feedback
		driver.wait(waitUntilDisplayed(By.css(".pageFeedback .common-button-details-like-action.button-submit")), 4000).then(wait(0.5));
		driver.findElement(By.css(".pageFeedback .common-button-details-like-action.button-submit")).click().then(wait(1));

		// Check if thank you page has loaded
		driver.wait(waitUntilDisplayed(By.css(".pageFeedback .results.success")), 4000).then(wait(1));
		driver.findElements(By.css(".pageFeedback .results.success .button-close")).then(found => {
			expect(found.length).to.equal(1);
			done();
		});
	});
});

describe("Who we are, bio modal", function() {
	this.timeout(10000);
	const coverPageQuery = By.css(".pageCover");

	it("should open 'who we are' page, open and close bio modal", function(done) {
		driver.get("http://localhost:8080/index.html");
		driver.wait(until.elementLocated(coverPageQuery), 4000);

		// Click on the "Who we are" link
		driver.findElement(coverPageQuery).findElement(By.css(".link-group--info .link:nth-child(2) a")).click();
		driver.wait(waitUntilDisplayed(By.css(".pageAbout")), 4000).then(wait(0.5));

		// Click on the first bio
		driver.findElement(By.css(".pageAbout .content .bio-list li:nth-child(1) .bio")).click();
		driver.wait(waitUntilDisplayed(By.css(".overlayBio.overlay")), 4000).then(wait(0.5));

		// Check if modal has opened
		driver.findElements(By.css(".overlayBio.overlay")).then(found => {
			expect(found.length).to.equal(1);
		});

		// Close the modal
		driver.findElement(By.css(".overlayBio.overlay .close")).click().then(wait(0.5)).then(() => {
			driver.findElements(By.css(".overlayBio.overlay")).then(found => {
				// Check if overlay is removed
				expect(found.length).to.equal(0);
				done();
			});
		});
	});
});

describe("Philosophy page", function() {
	this.timeout(10000);
	const coverPageQuery = By.css(".pageCover");

	it("Should open the 'who we are' page, and from there, open the philosophy page", function(done) {
		driver.get("http://localhost:8080/index.html");
		driver.wait(until.elementLocated(coverPageQuery), 4000);

		// Click on the "Who we are" link
		driver.findElement(coverPageQuery).findElement(By.css(".link-group--info .link:nth-child(2) a")).click();
		driver.wait(waitUntilDisplayed(By.css(".pageAbout")), 4000).then(wait(0.5));

		// Click on the philosophy link
		driver.findElement(By.css(".pageAbout .section-description-body a[title='Philosophy']")).click().then(found => {
			// Check if philosophy page has opened
			driver.findElement(By.css(".page-philosophy")).then(found => {
				// Ensure there's content in the philosophy
				found.findElements(By.css('.philosophy-description p')).then(found => {
					expect(found.length).to.be.above(0);
					found[0].getAttribute('innerText').then(result => {
						expect(result).to.not.equal("{NOT_FOUND}");
						done();
					});
				});
			});
		});		
	});
});

describe("All recommendations, tool details", function() {
	this.timeout(10000);
	const coverPageQuery = By.css(".pageCover");

	it("should open and close tool modal", function(done) {
		driver.get("http://localhost:8080/index.html");
		driver.wait(until.elementLocated(coverPageQuery), 4000);

		// Click on the "All Recommendations" link
		driver.findElement(coverPageQuery).findElement(By.css(".link-group--info .link:nth-child(3) a")).click();
		driver.wait(waitUntilDisplayed(By.css(".pageAllTools")), 4000).then(wait(0.5));

		// Click on the first tool "Learn more"
		driver.findElement(By.css(".pageAllTools .content .middle .body .common-tool-box:nth-child(2) .common-button-details")).click();
		driver.wait(waitUntilDisplayed(By.css(".overlayTool.overlay")), 4000).then(wait(0.5));

		// Check if modal has opened
		driver.findElements(By.css(".overlayTool.overlay")).then(found => {
			expect(found.length).to.equal(1);
		});

		// Close the modal
		driver.findElement(By.css(".overlayTool.overlay .close")).click().then(wait(0.5)).then(() => {
			driver.findElements(By.css(".overlayTool.overlay")).then(found => {
				// Check if overlay is removed
				expect(found.length).to.equal(0);
				done();
			});
		});
	});
});

describe("Share modal", function() {
	this.timeout(10000);
	const coverPageQuery = By.css(".pageCover");

	it("should open and close share modal", function(done) {
		// Start
		driver.get("http://localhost:8080/index.html");

		// Open statements
		driver.wait(until.elementLocated(coverPageQuery), 4000);

		// Click on the share button
		driver.findElement(coverPageQuery).findElement(By.css(".common-secondary-menu .share")).click();
		driver.wait(waitUntilDisplayed(By.css(".overlayShare.overlay")), 4000).then(wait(0.5));

		// Check if modal has opened
		driver.findElements(By.css(".overlayShare.overlay")).then(found => {
			expect(found.length).to.equal(1);
		});

		// Click on the overlay to close it
		driver.findElement(By.css(".overlayShare.overlay")).click().then(wait(0.5)).then(() => {
			driver.findElements(By.css(".overlayShare.overlay")).then(found => {
				// Check if overlay is removed
				expect(found.length).to.equal(0);
				done();
			});
		});
	});
});

// SKIPPING DUE TO SPDEV-25
describe.skip("Switch language", function() {
	this.timeout(10000);
	const coverPageQuery = By.css(".pageCover");

	it("should change language to arabic", function(done) {
		// Start
		driver.get("http://localhost:8080/index.html");

		// Open statements
		driver.wait(until.elementLocated(coverPageQuery), 4000);

		// Click to change the language
		const arabicButton = driver.findElement(coverPageQuery).findElement(By.css(".common-language-menu .language.not-selected"));
		expect(arabicButton).to.exist;

		const arabicCharsRegex = /[\u0600-\u06FF]/;

		arabicButton.click().then(wait(0.5)).then(() => {
			// Find the title text and check if it is in Arabic
			driver.findElement(coverPageQuery).findElement(By.css(".body .title")).then(titleText => {
				titleText.getText().then(text => {
					expect(text).to.match(arabicCharsRegex);
				});
			});

			// Find the subtitle text and check if it is in Arabic
			driver.findElement(coverPageQuery).findElement(By.css(".body .subtitle .expanding-text")).then(subtitleText => {
				subtitleText.getText().then(text => {
					expect(text).to.match(arabicCharsRegex);
				});
			});

			// Find the button text and check if it is in Arabic
			driver.findElement(coverPageQuery).findElement(By.css(".body .common-button-action.button .text")).then(buttonText => {
				buttonText.getText().then(text => {
					expect(text).to.match(arabicCharsRegex);
					done();
				});
			});
		});
	});
});

describe("All recommendations", function() {
	this.timeout(10000);
	const coverPageQuery = By.css(".pageCover");

	it("should list and filter all recommendations", function(done) {
		driver.get("http://localhost:8080/index.html");
		driver.wait(until.elementLocated(coverPageQuery), 4000);

		// Click on the "All Recommendations" link
		driver.findElement(coverPageQuery).findElement(By.css(".link-group--info .link:nth-child(3) a")).click();
		driver.wait(waitUntilDisplayed(By.css(".pageAllTools")), 4000);

		let toolsCount = null;
		let freeToolsCount = null;
		let paidToolsCount = null;

		// Make sure there is 43 tools
		driver.findElements(By.css(".pageAllTools .content .middle .body .common-tool-box")).then(tools => {
			expect(tools.length).to.be.at.least(10);
			toolsCount = tools.length;
		});

		driver.findElements(By.css(".pageAllTools .filter-trigger")).then(found => {
			// On smaller screen, filters are in modal
			if (found.length === 1) {
				driver.wait(waitUntilDisplayed(By.css(".pageAllTools")), 4000).then(wait(1));
				found[0].click().then(wait(0.5));

				// Set cost filter to "Paid"
				driver.findElement(By.css(".filter-category:nth-child(1) .filter-list .filter-list-item:nth-child(3) .filter-name")).click().then(wait(0.5));
				driver.findElement(By.css(".overlayToolsFilter.overlay .header-button--done:nth-child(2)")).click().then(wait(0.5));

				driver.findElements(By.css(".pageAllTools .content .middle .body .common-tool-box")).then(tools => {
					paidToolsCount = tools.length;
				});

				found[0].click().then(wait(0.5));

				// Set cost filter to "Free"
				driver.findElement(By.css(".filter-category:nth-child(1) .filter-list .filter-list-item:nth-child(2) .filter-name")).click().then(wait(0.5));
				driver.findElement(By.css(".overlayToolsFilter.overlay .header-button--done:nth-child(2)")).click().then(wait(0.5));

				// Make sure there is at least 3 tools with one filter on
				driver.findElements(By.css(".pageAllTools .content .middle .body .common-tool-box")).then(tools => {
					freeToolsCount = tools.length;

					// Make sure there is at least 3 free tools
					expect(tools.length).to.be.at.least(3);

					// Make sure that filtered tools match total tool count
					expect(toolsCount).to.equal(paidToolsCount + freeToolsCount);
				});

				// Set effort filter to "Quick and Easy"
				found[0].click().then(wait(0.5));

				// Set cost filter to "Free"
				driver.findElement(By.css(".filter-category:nth-child(2) .filter-list .filter-list-item:nth-child(2) .filter-name")).click().then(wait(0.5));
				driver.findElement(By.css(".overlayToolsFilter.overlay .header-button--done:nth-child(2)")).click().then(wait(0.5));

				// Make sure there is 10 tools with both filters on
				driver.findElements(By.css(".pageAllTools .content .middle .body .common-tool-box")).then(tools => {
					expect(tools.length).to.be.at.least(3);
					done();
				});
			} else {
				// On larger screen, filters are dropdowns

				driver.wait(waitUntilDisplayed(By.css(".pageAllTools .filter-dropdown-wrapper .dropdown:nth-child(1)")), 4000).then(wait(0.5));

				// Set cost filter to "Paid"
				driver.findElement(By.css(".pageAllTools .filter-dropdown-wrapper .dropdown:nth-child(1) .dropdown-trigger")).click();
				driver.findElement(By.css(".pageAllTools .filter-dropdown-wrapper .dropdown:nth-child(1) .dropdown-option-list .dropdown-option-list-item:nth-child(3) button")).click();

				driver.findElements(By.css(".pageAllTools .content .middle .body .common-tool-box")).then(tools => {
					paidToolsCount = tools.length;
				});

				// Set cost filter to "Free"
				driver.findElement(By.css(".pageAllTools .filter-dropdown-wrapper .dropdown:nth-child(1) .dropdown-trigger")).click();
				driver.findElement(By.css(".pageAllTools .filter-dropdown-wrapper .dropdown:nth-child(1) .dropdown-option-list .dropdown-option-list-item:nth-child(2) button")).click();

				driver.findElements(By.css(".pageAllTools .content .middle .body .common-tool-box")).then(tools => {
					freeToolsCount = tools.length;

					// Make sure there is at least 3 free tools
					expect(tools.length).to.be.at.least(3);

					// Make sure that filtered tools match total tool count
					expect(toolsCount).to.equal(paidToolsCount + freeToolsCount);
				});

				// Set effort filter to "Quick and Easy"
				driver.findElement(By.css(".pageAllTools .filter-dropdown-wrapper .dropdown:nth-child(2) .dropdown-trigger")).click();
				driver.findElement(By.css(".pageAllTools .filter-dropdown-wrapper .dropdown:nth-child(2) .dropdown-option-list .dropdown-option-list-item:nth-child(2) button")).click();

				// Make sure there is at least 3 tools with both filters on
				driver.findElements(By.css(".pageAllTools .content .middle .body .common-tool-box")).then(tools => {
					expect(tools.length).to.be.at.least(3);
					done();
				});
			}
		});
	});
});

describe("Full experience", function() {
	this.timeout(10000);
	const coverPageQuery = By.css(".pageCover");

	it("should get to the report and link is displayed", function(done) {
		// Start
		driver.get("http://localhost:8080/index.html");

		// Open statements
		driver.wait(until.elementLocated(coverPageQuery), 4000);
		driver.findElement(coverPageQuery).findElement(By.css(".body .common-button-action.button")).click();

		// Select statement and continue
		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-1")), 4000);
		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-1 .statement-0")), 4000).then(wait(0.5));
		driver.findElement(By.css(".pageStatements-level-1 .statement-0")).click();
		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-1 .footer .button-next")), 4000).then(wait(0.5));
		driver.findElement(By.css(".pageStatements-level-1 .footer .button-next")).click();

		// Select statement and continue
		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-2")), 4000);
		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-2 .statement-0")), 4000).then(wait(0.5));
		driver.findElement(By.css(".pageStatements-level-2 .statement-0")).click();
		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-2 .footer .button-next")), 4000).then(wait(0.5));
		driver.findElement(By.css(".pageStatements-level-2 .footer .button-next")).click();

		// Select statement and continue
		driver.wait(until.elementLocated(By.css(".pageStatements-level-3")), 4000);
		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-3 .statement-0")), 4000).then(wait(0.5));
		driver.findElement(By.css(".pageStatements-level-3 .statement-0")).click();
		driver.wait(waitUntilDisplayed(By.css(".pageStatements-level-3 .footer .button-next")), 4000).then(wait(0.5));
		driver.findElement(By.css(".pageStatements-level-3 .footer .button-next")).click();

		// Asserts
		driver.wait(until.elementLocated(By.css(".pageReport")), 4000).then(wait(0.2));
		driver.findElements(By.css(".pageReport .content .middle .body .group")).then(threats => {
			expect(threats.length).to.be.above(1);
		});
		driver.findElements(By.css(".pageReport .content .middle .body .common-tool-box")).then(tools => {
			expect(tools.length).to.be.above(1);
		});
		driver.findElement(By.css(".pageReport .footer-share .link-wrapper .link")).then(link => {
			expect(link).to.exist;

			// Checks if the last part of the url matches the unique permalink
			link.getText().then(text => {
				const linkParam = text.substr(text.lastIndexOf("/") + 1);
				expect(linkParam).to.match(/^[A-Za-z0-9\-_]{6,}$/);
				done();
				driver.quit();
			});
		});
	});
});
