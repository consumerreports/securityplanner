import PageUtils from "./../vendor/utils/PageUtils";

const SecurityPlannerConstants = {
	Actions: {
		SECURITY_PLANNER_DESELECT_ALL_STATEMENTS: "SECURITY_PLANNER_DESELECT_ALL_STATEMENTS",
		SECURITY_PLANNER_TOGGLE_STATEMENT_SELECTED: "SECURITY_PLANNER_TOGGLE_STATEMENT_SELECTED",
		SECURITY_PLANNER_SHOW_TOAST_NOTIFICATION: "SECURITY_PLANNER_SHOW_TOAST_NOTIFICATION",
		SECURITY_PLANNER_CLEANUP_TOAST_NOTIFICATIONS: "SECURITY_PLANNER_CLEANUP_TOAST_NOTIFICATIONS",
		CHANGE_LANGUAGE: "CHANGE_LANGUAGE",
	},
	Colors: {
		"DEFAULT": 0x70C9C1, // Same as "cyan"

		"BACKGROUND_DARK": 0x70C9C1, // Same as "cyan"
		"BACKGROUND_LIGHT": 0xeeeeee,

		"cyan": 0x29bb9c,
		"dark-cyan": 0x239f85,
		"green": 0x39cb74,
		"dark-green": 0x30ad63,
		"blue": 0x3a99d8,
		"dark-blue": 0x2f81b7,
		"purple": 0x9a5cb4,
		"dark-purple": 0x8d48ab,
		"navy-blue": 0x35495d,
		"dark-navy-blue": 0x2d3e4f,
		"yellow": 0xf0c330,
		"dark-yellow": 0xf19b2c,
		"orange": 0xe47e30,
		"dark-orange": 0xd15419,
		"red": 0xe54d42,
		"dark-red": 0xbe3a31,

		Threats: [
			// 0x345962
			// 0x202F3E, 0x1F363B, 0x2D4D55, 0x3F596B, 0x345962, 0x5592A1,
			// 0x354C54, 0x4E7073, 0x679393, 0x99CCCC, 0x6562c6, 0x5675cd, 0x4887d2, 0x3a99d8,
			// 0x2D4D55, 0x437174, 0x589594, 0x0AA394,
			// 0x7A9943, 0x4B6F78, 0xE4BF21, 0x599594, 0xE1E994, 0x85B0BF,
			// 0x85B0BF, 0xE1E994, 0x599594, 0xE4BF21, 0x517781, 0x7A9943, 
			0x85B0BF, 0xE1E994, 0x759d9E, 0xE4BF21, 0x819EA8, 0x7A9943, 
		],
	},
	Values: {
		RECOMMENDATION_MAX_VISIBLE_THREATS: 3,				// Number of maximum visible threats (by default, before expanding) on the action plan
		RECOMMENDATION_MAX_VISIBLE_TOOLS_PER_THREAT: 2,		// Number of maximum visible tool recommendations per threat (by default, before expanding) on the action plan
	},
	Content: {
		CONTENTFUL_SPACE_ID: __SPACE_ID__,
		CONTENTFUL_DELIVERY_KEY: __DELIVERY_KEY__,
		CONTENTFUL_PREVIEW_KEY: __PREVIEW_KEY__,
		IGNORE_DISABLED_ITEMS: true,						// When reading contentful data, will ignore anything that has .enabled set to false
		FEEDBACK_GENERAL_FORM_KEY: process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test" ? null : "1gOC0zxDw_0SoQK9XHNjKe2cP0PgK4TdZx9SCYD_d6x4",
		FEEDBACK_GENERAL_FORM_QUESTIONS_IDS: [
			"entry.244683660", // Form type
			"entry.1610271254", "entry.1842005788",	// Question/answer pairs
			"entry.862098723", "entry.35386193",
			"entry.1294659613", "entry.1535408484",
			"entry.1351294775", "entry.1634242253",
			"entry.1087851128", "entry.378241776",
			"entry.32840562", "entry.2030258114",
			"entry.1756781542", "entry.120666103",
		],
		FEEDBACK_ISSUE_FORM_KEY: process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"  ? null : "1FIpaCM0zsMiT5ZnubiflUP05X4iMA5kMDVF7b6ow5R4",
		FEEDBACK_ISSUE_FORM_QUESTIONS_IDS: [
			"entry.1268947164", // Tool
			"entry.244683660", // Answer issue
			"entry.1610271254", // Problem description
			"entry.1842005788", // Contact Y/N
			"entry.862098723", // Email
		],
	},
	Parameters: {
		IS_DEBUGGING: process.env.NODE_ENV === "staging" ? PageUtils.getQueryParameter("debug") == "1" : false,
		IS_VALIDATING: process.env.NODE_ENV === "staging" ? PageUtils.getQueryParameter("validate") == "1" : false,
		IS_PREVIEWING: PageUtils.getQueryParameter("preview") == "1",
		IS_VALIDATING_POSSIBLE_SELECTIONS: PageUtils.getQueryParameter("validateSelections") == "1",
		SKIP_BROWSER_CHECK: PageUtils.getQueryParameter("bb") == "1",
		PREFERRED_LANGUAGE: PageUtils.getQueryParameter("l"),
		PRESELECTED_STATEMENTS: PageUtils.getQueryParameter("statements") ? PageUtils.getQueryParameter("statements").split(",") : [],
		FORCE_ERRORS: PageUtils.getQueryParameter("forceErrors") == "1",
	},
	Regex: {
		BULLET_CHARS: /(\u2022|\*|\.)/,
		MARKDOWN_LIST: /(^(\u2022|\*|\.)+\s.+$)/gm,
		MARKDOWN_URL: /\[([^\[]+)\]\(([^\)]+)\)/g,
		MARKDOWN_BOLD: /\*\*([^\[]+?)\*\*/g,
		MARKDOWN_ITALIC: /\*([^\[]+?)\*/g,
	},
	UI: {
		ALLOW_HOT_LANGUAGE_SWAP: true,				// Allow changing the language in-place
		LOCK_SCROLL: true,
		TOAST_TIME_FADE_IN: 0.4,					// Seconds a toast notification takes to be fade in
		TOAST_TIME_STAY: 4,							// Seconds a toast notification stays in screen, not counting fades
		TOAST_TIME_FADE_OUT: 0.4,					// Seconds a toast notification takes to be fade out
		CLOSE_TAB_AFTER_PRINT: false,
		SCROLL_DISTANCE_TO_HIDE_ELEMENTS: {			// Number of pixels to scroll for an element to fade away graciously
			"tiny": 30,
			"small": 60,
			"medium": 80,
			"large": 80,
		},
	},
	// Array of tuples with regexes for paths we don't want to track, and what we will track instead
	PRIVATE_LOCATION_PATTERNS: [
		[new RegExp(/action-plan\/.*/), "action-plan/**********"],
		[new RegExp(/action-plan-print\/.*/), "action-plan-print/**********"],
	],
};

export default SecurityPlannerConstants;