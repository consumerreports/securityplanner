const mockData = {};

mockData.threatOne = {
	id: "threat1",
	slug: "threat-one",
	name: "Threat One",
	shortDescription: "First Threat.",
	longDescription: "First Threat for Testing.",
	stats: "threat",
	statsSource: "https://letsencrypt.org/stats/#percent-pageloads",
	statsName: "Let's Encrypt",
	isAdditionalHelp: false,
	translationOutdated: {
		"ar-001": true
	},
	deprioritizeInLists: false
};

mockData.threatTwo = {
	id: "threat2",
	slug: "threat-one",
	name: "Threat 2",
	shortDescription: "Second Threat",
	longDescription: "Second Threat for Testing.",
	stats: "threat",
	statsSource: "https://letsencrypt.org/stats/#percent-pageloads",
	statsName: "Let's Encrypt",
	isAdditionalHelp: false,
	translationOutdated: {
		"ar-001": true
	},
	deprioritizeInLists: false
};

mockData.toolOne = {
	id: "123mock",
	slug: "slug-mock",
	threat: mockData.threatOne,
	image:
		"//images.ctfassets.net/ta4xc5av592v/11c8cV6fe8gIEm2w8gEaMY/5a6cc4627c802bf4f3c37ec93b7e7b2e/httpse2.png",
	name: "First Mock Tool",
	headline: "First Mock Tool for Testing",
	label: "Quick and Easy",
	price: "",
	shortDescription:
		"Protect your online activities from prying eyes by encrypting your connection with the websites you visit.",
	overlayDescription:
		"Protect your online activities from prying eyes by encrypting your connections with the websites you visit.",
	longDescription:
		'<ol>\n<li>__Add HTTPS Everywhere to your browser.__\n<p>HTTPS Everywhere is developed by the non-profit Electronic Frontier Foundation (EFF). It is a browser extension that can be used with Firefox, Chrome, or Opera. (Unfortunately, HTTPS Everywhere does not work with Safari or Microsoft’s Edge browser at this time.) </p>\n<p>\n<a target="_blank" href="https://www.eff.org/https-everywhere" class="common-button-details large-button">Get HTTPS Everywhere</a>\n</p>\n</li>\n<li>\n__Know how to check if the websites you visit are secure.__\n<p>Websites secured with HTTPS will say so. Look for HTTPS in your browser’s address bar — for example, https://securityplanner.org. You may also see a padlock icon, or the colour of your address bar change, to indicate that the site is using encryption to protect your connection.</p>\n  <p><a target="_blank" href="https://securityplanner.org/#/tool/check-website-names" title="Security Planner Recommendation Check Website Names">Learn how to spot insecure or fraudulent websites.</a></p>\n</li>\n</ol>',
	whyItsImportant:
		"* An increasing number of websites protect their users by transmitting data over HTTPS — short for Hypertext Transfer Protocol Secure. When you visit a website that uses HTTPS, it prevents any information you exchange from being spied on or changed. It also makes it harder for imposters to pretend to be a website they don’t control — like SecurityPlanner.org\n* Think of HTTPS like an agreement between your browser and the website you’re visiting to keep whatever you do on that website just between the two of you. Websites that offer HTTPS make it difficult for your internet service provider, governments, or even other people on the same network as you from seeing which pages you visit, or intercepting sensitive information like passwords and credit card information.\n* HTTPS Everywhere ensures your browser will always attempt to visit websites over a secure connection first. sites now use HTTPS by default, but not all. Some sites will still load over an insecure connection — HTTP, without the Secure — unless you specifically ask for HTTPS.",
	buttons: [
		{
			id: "2qsmT0IiFCU62q2yauIdev",
			slug:
				"get-it-for-chrome--https-chrome-google-com-webstore-detail-https-everywhere-gcbommkclmclpchllfjekcdonpmejbdp-hl-en",
			caption: "Get it for Chrome",
			url:
				"https://chrome.google.com/webstore/detail/https-everywhere/gcbommkclmclpchllfjekcdonpmejbdp?hl=en",
			translationOutdated: {
				"ar-001": true
			}
		},
		{
			id: "dETaxQvGIEqwsg8usSdev",
			slug:
				"get-it-for-firefox--https-addons-mozilla-org-en-us-firefox-addon-https-everywhere-",
			caption: "Get it for Firefox",
			url: "https://addons.mozilla.org/en-US/firefox/addon/https-everywhere/"
		}
	],
	earlyRecommendationAllowed: true,
	translationOutdated: {
		"ar-001": true
	},
	enabled: true,
	requirements: [
		"STUeEuefcGekGQq6qcccY",
		"or",
		"2i0gPlzrKs8C086eE8YQeO",
		"or",
		"3DJe59c0tyGMGsUs2oE8G0"
	],
	reviews: [],
	resources: [
		{
			id: "20EUg117D0xWY6Z7jG3dev",
			slug: "hacker-lexicon-what-is-https---wired",
			caption: "Hacker Lexicon: What is HTTPS?",
			url:
				"https://www.wired.com/2016/04/hacker-lexicon-what-is-https-encryption/",
			source: "Wired"
		},
		{
			id: "4H2X2S6saghkxlIJDmCdev",
			slug:
				"how-https-everywhere-keeps-protecting-users-on-an-increasingly-encrypted-web--eff",
			caption:
				"How HTTPS Everywhere Keeps Protecting Users On An Increasingly Encrypted Web",
			url:
				"https://www.eff.org/deeplinks/2018/12/how-https-everywhere-keeps-protecting-users-increasingly-encrypted-web",
			source: "EFF"
		},
		{
			id: "5lPfPRFV5B9lq4QakXAdev",
			slug: "https-and-your-online-security--mozilla",
			caption: "HTTPS and your online security",
			url: "https://blog.mozilla.org/internetcitizen/2017/04/21/https-protect/",
			source: "Mozilla"
		}
	],
	recommendationPoints: 0,
	recommendationPointsOnLevel: 0,
	recommendationLevel: ""
};

mockData.toolTwo = {
	id: "1234mock",
	slug: "slug-mock-two",
	threat: mockData.threatOne,
	image:
		"//images.ctfassets.net/ta4xc5av592v/11c8cV6fe8gIEm2w8gEaMY/5a6cc4627c802bf4f3c37ec93b7e7b2e/httpse2.png",
	name: "Second Mock Tool Two",
	headline: "Second Mock Tool for Testing",
	label: "Quick and Easy",
	price: "",
	shortDescription:
		"Protect your online activities from prying eyes by encrypting your connection with the websites you visit.",
	overlayDescription:
		"Protect your online activities from prying eyes by encrypting your connections with the websites you visit.",
	longDescription:
		'<ol>\n<li>__Add HTTPS Everywhere to your browser.__\n<p>HTTPS Everywhere is developed by the non-profit Electronic Frontier Foundation (EFF). It is a browser extension that can be used with Firefox, Chrome, or Opera. (Unfortunately, HTTPS Everywhere does not work with Safari or Microsoft’s Edge browser at this time.) </p>\n<p>\n<a target="_blank" href="https://www.eff.org/https-everywhere" class="common-button-details large-button">Get HTTPS Everywhere</a>\n</p>\n</li>\n<li>\n__Know how to check if the websites you visit are secure.__\n<p>Websites secured with HTTPS will say so. Look for HTTPS in your browser’s address bar — for example, https://securityplanner.org. You may also see a padlock icon, or the colour of your address bar change, to indicate that the site is using encryption to protect your connection.</p>\n  <p><a target="_blank" href="https://securityplanner.org/#/tool/check-website-names" title="Security Planner Recommendation Check Website Names">Learn how to spot insecure or fraudulent websites.</a></p>\n</li>\n</ol>',
	whyItsImportant:
		"* An increasing number of websites protect their users by transmitting data over HTTPS — short for Hypertext Transfer Protocol Secure. When you visit a website that uses HTTPS, it prevents any information you exchange from being spied on or changed. It also makes it harder for imposters to pretend to be a website they don’t control — like SecurityPlanner.org\n* Think of HTTPS like an agreement between your browser and the website you’re visiting to keep whatever you do on that website just between the two of you. Websites that offer HTTPS make it difficult for your internet service provider, governments, or even other people on the same network as you from seeing which pages you visit, or intercepting sensitive information like passwords and credit card information.\n* HTTPS Everywhere ensures your browser will always attempt to visit websites over a secure connection first. sites now use HTTPS by default, but not all. Some sites will still load over an insecure connection — HTTP, without the Secure — unless you specifically ask for HTTPS.",
	buttons: [
		{
			id: "2qsmT0IiFCU62q2yauItwo",
			slug:
				"get-it-for-chrome--https-chrome-google-com-webstore-detail-https-everywhere-gcbommkclmclpchllfjekcdonpmejbdp-hl-en",
			caption: "Get it for Chrome",
			url:
				"https://chrome.google.com/webstore/detail/https-everywhere/gcbommkclmclpchllfjekcdonpmejbdp?hl=en",
			translationOutdated: {
				"ar-001": true
			}
		},
		{
			id: "dETaxQvGIEqwsg8usStwo",
			slug:
				"get-it-for-firefox--https-addons-mozilla-org-en-us-firefox-addon-https-everywhere-",
			caption: "Get it for Firefox",
			url: "https://addons.mozilla.org/en-US/firefox/addon/https-everywhere/"
		}
	],
	earlyRecommendationAllowed: true,
	translationOutdated: {
		"ar-001": true
	},
	enabled: true,
	requirements: [
		"STUeEuefcGekGQq6qcccY",
		"or",
		"2i0gPlzrKs8C086eE8YQeO",
		"or",
		"3DJe59c0tyGMGsUs2oE8G0"
	],
	reviews: [],
	resources: [
		{
			id: "20EUg117D0xWY6Z7jG3two",
			slug: "hacker-lexicon-what-is-https---wired",
			caption: "Hacker Lexicon: What is HTTPS?",
			url:
				"https://www.wired.com/2016/04/hacker-lexicon-what-is-https-encryption/",
			source: "Wired"
		},
		{
			id: "4H2X2S6saghkxlIJDmCtwo",
			slug:
				"how-https-everywhere-keeps-protecting-users-on-an-increasingly-encrypted-web--eff",
			caption:
				"How HTTPS Everywhere Keeps Protecting Users On An Increasingly Encrypted Web",
			url:
				"https://www.eff.org/deeplinks/2018/12/how-https-everywhere-keeps-protecting-users-increasingly-encrypted-web",
			source: "EFF"
		},
		{
			id: "5lPfPRFV5B9lq4QakXAtwo",
			slug: "https-and-your-online-security--mozilla",
			caption: "HTTPS and your online security",
			url: "https://blog.mozilla.org/internetcitizen/2017/04/21/https-protect/",
			source: "Mozilla"
		}
	],
	recommendationPoints: 0,
	recommendationPointsOnLevel: 0,
	recommendationLevel: ""
};

mockData.toolThree = {
	id: "123mock3",
	slug: "slug-mock",
	threat: mockData.threatTwo,
	image:
		"//images.ctfassets.net/ta4xc5av592v/11c8cV6fe8gIEm2w8gEaMY/5a6cc4627c802bf4f3c37ec93b7e7b2e/httpse2.png",
	name: "Mock Tool",
	headline: "Third Mock Tool for Testing",
	label: "Quick and Easy",
	price: "",
	shortDescription:
		"Protect your online activities from prying eyes by encrypting your connection with the websites you visit.",
	overlayDescription:
		"Protect your online activities from prying eyes by encrypting your connections with the websites you visit.",
	longDescription:
		'<ol>\n<li>__Add HTTPS Everywhere to your browser.__\n<p>HTTPS Everywhere is developed by the non-profit Electronic Frontier Foundation (EFF). It is a browser extension that can be used with Firefox, Chrome, or Opera. (Unfortunately, HTTPS Everywhere does not work with Safari or Microsoft’s Edge browser at this time.) </p>\n<p>\n<a target="_blank" href="https://www.eff.org/https-everywhere" class="common-button-details large-button">Get HTTPS Everywhere</a>\n</p>\n</li>\n<li>\n__Know how to check if the websites you visit are secure.__\n<p>Websites secured with HTTPS will say so. Look for HTTPS in your browser’s address bar — for example, https://securityplanner.org. You may also see a padlock icon, or the colour of your address bar change, to indicate that the site is using encryption to protect your connection.</p>\n  <p><a target="_blank" href="https://securityplanner.org/#/tool/check-website-names" title="Security Planner Recommendation Check Website Names">Learn how to spot insecure or fraudulent websites.</a></p>\n</li>\n</ol>',
	whyItsImportant:
		"* An increasing number of websites protect their users by transmitting data over HTTPS — short for Hypertext Transfer Protocol Secure. When you visit a website that uses HTTPS, it prevents any information you exchange from being spied on or changed. It also makes it harder for imposters to pretend to be a website they don’t control — like SecurityPlanner.org\n* Think of HTTPS like an agreement between your browser and the website you’re visiting to keep whatever you do on that website just between the two of you. Websites that offer HTTPS make it difficult for your internet service provider, governments, or even other people on the same network as you from seeing which pages you visit, or intercepting sensitive information like passwords and credit card information.\n* HTTPS Everywhere ensures your browser will always attempt to visit websites over a secure connection first. sites now use HTTPS by default, but not all. Some sites will still load over an insecure connection — HTTP, without the Secure — unless you specifically ask for HTTPS.",
	buttons: [
		{
			id: "2qsmT0IiFCU62q2yauIdev",
			slug:
				"get-it-for-chrome--https-chrome-google-com-webstore-detail-https-everywhere-gcbommkclmclpchllfjekcdonpmejbdp-hl-en",
			caption: "Get it for Chrome",
			url:
				"https://chrome.google.com/webstore/detail/https-everywhere/gcbommkclmclpchllfjekcdonpmejbdp?hl=en",
			translationOutdated: {
				"ar-001": true
			}
		},
		{
			id: "dETaxQvGIEqwsg8usSdev",
			slug:
				"get-it-for-firefox--https-addons-mozilla-org-en-us-firefox-addon-https-everywhere-",
			caption: "Get it for Firefox",
			url: "https://addons.mozilla.org/en-US/firefox/addon/https-everywhere/"
		}
	],
	earlyRecommendationAllowed: true,
	translationOutdated: {
		"ar-001": true
	},
	enabled: true,
	requirements: [
		"STUeEuefcGekGQq6qcccY",
		"or",
		"2i0gPlzrKs8C086eE8YQeO",
		"or",
		"3DJe59c0tyGMGsUs2oE8G0"
	],
	reviews: [],
	resources: [
		{
			id: "20EUg117D0xWY6Z7jG3dev",
			slug: "hacker-lexicon-what-is-https---wired",
			caption: "Hacker Lexicon: What is HTTPS?",
			url:
				"https://www.wired.com/2016/04/hacker-lexicon-what-is-https-encryption/",
			source: "Wired"
		},
		{
			id: "4H2X2S6saghkxlIJDmCdev",
			slug:
				"how-https-everywhere-keeps-protecting-users-on-an-increasingly-encrypted-web--eff",
			caption:
				"How HTTPS Everywhere Keeps Protecting Users On An Increasingly Encrypted Web",
			url:
				"https://www.eff.org/deeplinks/2018/12/how-https-everywhere-keeps-protecting-users-increasingly-encrypted-web",
			source: "EFF"
		},
		{
			id: "5lPfPRFV5B9lq4QakXAdev",
			slug: "https-and-your-online-security--mozilla",
			caption: "HTTPS and your online security",
			url: "https://blog.mozilla.org/internetcitizen/2017/04/21/https-protect/",
			source: "Mozilla"
		}
	],
	recommendationPoints: 0,
	recommendationPointsOnLevel: 0,
	recommendationLevel: ""
};

mockData.toolFour = {
	id: "1234mock4",
	slug: "slug-mock-two",
	threat: mockData.threatTwo,
	image:
		"//images.ctfassets.net/ta4xc5av592v/11c8cV6fe8gIEm2w8gEaMY/5a6cc4627c802bf4f3c37ec93b7e7b2e/httpse2.png",
	name: "Second Mock Tool Two",
	headline: "Fourth Mock Tool for Testing",
	label: "Quick and Easy",
	price: "",
	shortDescription:
		"Protect your online activities from prying eyes by encrypting your connection with the websites you visit.",
	overlayDescription:
		"Protect your online activities from prying eyes by encrypting your connections with the websites you visit.",
	longDescription:
		'<ol>\n<li>__Add HTTPS Everywhere to your browser.__\n<p>HTTPS Everywhere is developed by the non-profit Electronic Frontier Foundation (EFF). It is a browser extension that can be used with Firefox, Chrome, or Opera. (Unfortunately, HTTPS Everywhere does not work with Safari or Microsoft’s Edge browser at this time.) </p>\n<p>\n<a target="_blank" href="https://www.eff.org/https-everywhere" class="common-button-details large-button">Get HTTPS Everywhere</a>\n</p>\n</li>\n<li>\n__Know how to check if the websites you visit are secure.__\n<p>Websites secured with HTTPS will say so. Look for HTTPS in your browser’s address bar — for example, https://securityplanner.org. You may also see a padlock icon, or the colour of your address bar change, to indicate that the site is using encryption to protect your connection.</p>\n  <p><a target="_blank" href="https://securityplanner.org/#/tool/check-website-names" title="Security Planner Recommendation Check Website Names">Learn how to spot insecure or fraudulent websites.</a></p>\n</li>\n</ol>',
	whyItsImportant:
		"* An increasing number of websites protect their users by transmitting data over HTTPS — short for Hypertext Transfer Protocol Secure. When you visit a website that uses HTTPS, it prevents any information you exchange from being spied on or changed. It also makes it harder for imposters to pretend to be a website they don’t control — like SecurityPlanner.org\n* Think of HTTPS like an agreement between your browser and the website you’re visiting to keep whatever you do on that website just between the two of you. Websites that offer HTTPS make it difficult for your internet service provider, governments, or even other people on the same network as you from seeing which pages you visit, or intercepting sensitive information like passwords and credit card information.\n* HTTPS Everywhere ensures your browser will always attempt to visit websites over a secure connection first. sites now use HTTPS by default, but not all. Some sites will still load over an insecure connection — HTTP, without the Secure — unless you specifically ask for HTTPS.",
	buttons: [
		{
			id: "2qsmT0IiFCU62q2yauItwo",
			slug:
				"get-it-for-chrome--https-chrome-google-com-webstore-detail-https-everywhere-gcbommkclmclpchllfjekcdonpmejbdp-hl-en",
			caption: "Get it for Chrome",
			url:
				"https://chrome.google.com/webstore/detail/https-everywhere/gcbommkclmclpchllfjekcdonpmejbdp?hl=en",
			translationOutdated: {
				"ar-001": true
			}
		},
		{
			id: "dETaxQvGIEqwsg8usStwo",
			slug:
				"get-it-for-firefox--https-addons-mozilla-org-en-us-firefox-addon-https-everywhere-",
			caption: "Get it for Firefox",
			url: "https://addons.mozilla.org/en-US/firefox/addon/https-everywhere/"
		}
	],
	earlyRecommendationAllowed: true,
	translationOutdated: {
		"ar-001": true
	},
	enabled: true,
	requirements: [
		"STUeEuefcGekGQq6qcccY",
		"or",
		"2i0gPlzrKs8C086eE8YQeO",
		"or",
		"3DJe59c0tyGMGsUs2oE8G0"
	],
	reviews: [],
	resources: [
		{
			id: "20EUg117D0xWY6Z7jG3two",
			slug: "hacker-lexicon-what-is-https---wired",
			caption: "Hacker Lexicon: What is HTTPS?",
			url:
				"https://www.wired.com/2016/04/hacker-lexicon-what-is-https-encryption/",
			source: "Wired"
		},
		{
			id: "4H2X2S6saghkxlIJDmCtwo",
			slug:
				"how-https-everywhere-keeps-protecting-users-on-an-increasingly-encrypted-web--eff",
			caption:
				"How HTTPS Everywhere Keeps Protecting Users On An Increasingly Encrypted Web",
			url:
				"https://www.eff.org/deeplinks/2018/12/how-https-everywhere-keeps-protecting-users-increasingly-encrypted-web",
			source: "EFF"
		},
		{
			id: "5lPfPRFV5B9lq4QakXAtwo",
			slug: "https-and-your-online-security--mozilla",
			caption: "HTTPS and your online security",
			url: "https://blog.mozilla.org/internetcitizen/2017/04/21/https-protect/",
			source: "Mozilla"
		}
	],
	recommendationPoints: 0,
	recommendationPointsOnLevel: 0,
	recommendationLevel: ""
};

export default mockData;
