const mockThreats = [
	{
		id: "5dTGSNcIveyS0wGeIqKCW2",
		slug: "browsing",
		name: "Browsing",
		shortDescription: "Browse more securely.",
		longDescription:
			"Your top priority should be to improve your online browsing.",
		stats:
			"As of November 2019, more than 80% of Firefox users visited websites that encrypt traffic using HTTPS, which makes it harder for third parties to know what you do online.",
		statsSource: "https://letsencrypt.org/stats/#percent-pageloads",
		statsName: "Let's Encrypt",
		isAdditionalHelp: false,
		translationOutdated: {
			"ar-001": true
		},
		deprioritizeInLists: false
	},
	{
		id: "2s4dInIbbycwu4kaQUYKq2",
		slug: "computer",
		name: "Computer",
		shortDescription: "Secure your computer.",
		longDescription: "Your top priority should be to have a secure computer.",
		stats:
			"Online backups give you added protection against theft, damage, ransomware, and other threats. Some services will also let you encrypt your backups with a key that only you know, so no one else can access your files.",
		statsSource:
			"https://thewirecutter.com/reviews/best-online-backup-service/",
		statsName: "The Wirecutter",
		isAdditionalHelp: false,
		translationOutdated: {
			"ar-001": true
		},
		deprioritizeInLists: false
	},
	{
		id: "5gp7cItVvUKsqmYgWW2oes",
		slug: "online-accounts",
		name: "Online Accounts",
		shortDescription: "Safeguard your online accounts.",
		longDescription:
			"Your top priority should be to guard your online accounts.",
		stats:
			"At least 8.5 billion accounts have been compromised in data breaches to date — and it’s likely yours has been one of them. You can be alerted to new breaches affecting the services you use.",
		statsSource: "https://haveibeenpwned.com/",
		statsName: "Have I Been Pwned",
		isAdditionalHelp: false,
		translationOutdated: {
			"ar-001": true
		},
		deprioritizeInLists: false
	},
	{
		id: "2Ne2u8ZLh6OwmAS6uOuQIy",
		slug: "internet-connection",
		name: "Internet Connection",
		shortDescription: "Secure your internet connection.",
		longDescription:
			"Your top priority should be to secure your internet connection.",
		stats:
			'In a June 2019 survey, only 24% of Americans knew their employer or internet service provider could still see what they did online when using “private browsing” or “incognito mode."',
		statsSource:
			"https://www.pewresearch.org/internet/2019/10/09/americans-and-digital-knowledge/",
		statsName: "Pew Research Center",
		isAdditionalHelp: false,
		translationOutdated: {
			"ar-001": true
		},
		deprioritizeInLists: false
	},
	{
		id: "4Xr9V8bHZSC4ywEcieaEQQ",
		slug: "phone",
		name: "Phone",
		shortDescription: "Keep your phone's data secure.",
		longDescription: "Your top priority should be to keep your phone secure.",
		stats:
			"Software updates give your devices the latest protections against security threats like malware — so don't delay! It took just a month for 50% of iPhones to be upgraded to iOS 13.",
		statsSource:
			"https://web.archive.org/web/20191105221309/https://developer.apple.com/support/app-store/",
		statsName: "Apple",
		isAdditionalHelp: false,
		translationOutdated: {
			"ar-001": true
		},
		deprioritizeInLists: false
	},
	{
		id: "2BDCsBgU3iS8q44SA6GwcA",
		slug: "connect-with-specialists",
		name: "Connect with Specialists",
		shortDescription:
			"Connect to resources that can provide additional assistance",
		longDescription:
			"Your top priority should be seeking specialized assistance.",
		stats:
			"Some recommendations may not work for you and your situation. If you are dealing with an urgent security issue, you should seek additional support and specialized advice.",
		isAdditionalHelp: true,
		translationOutdated: {
			"ar-001": true
		},
		deprioritizeInLists: true
	}
];

export default mockThreats;