export default class MultiSharer {

	// ================================================================================================================
	// PUBLIC INTERFACE -----------------------------------------------------------------------------------------------

	static share(channel, url, text, subject) {
		// Find URL template

		const shareURL = MultiSharer.getShareURL(channel, url, text, subject);
		const windowWidth = MultiSharer.getRecommendedWindowWidth(channel);
		const windowHeight = MultiSharer.getRecommendedWindowHeight(channel);
		// let windowSettings = "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,left=" + Math.round(screen.width/2 - windowWidth/2) + ",top=" + Math.round(screen.height/2 - windowHeight/2) + ",width=" + windowWidth + ",height=" + windowHeight;
		const windowSettings = "menubar=no,toolbar=no,resizable=yes,scrollbars=yes," + MultiSharer.getWindowParams(windowWidth, windowHeight);

		// Finally, shares it
		if (shareURL.length) {
			if (isNaN(windowWidth) || isNaN(windowHeight)) {
				// Blank tab
				window.open(shareURL, "_blank");
			} else {
				// Normal popup
				window.open(shareURL, "_blank", windowSettings);
			}
		} else {
			console.error("Share URL of type [" + channel + "] not identified!"); // eslint-disable-line
		}
	}

	static getRecommendedWindowWidth(channel) {
		if (channel == MultiSharer.EMAIL) return undefined;
		return 590;
	}

	static getRecommendedWindowHeight(channel) {
		if (channel == MultiSharer.EMAIL) return undefined;
		return 370;
	}

	static getShareURL(channel, url, text, subject) {
		let shareURL = "";

		if (channel == MultiSharer.EMAIL) {
			shareURL = "mailto:?subject=[[subject]]&body=[[text]]";
		} else if (channel == MultiSharer.FACEBOOK) {
			// https://www.facebook.com/sharing/sharing.php?u=http://www.google.com
			// https://www.facebook.com/dialog/share?app_id=348446702011488&display=popup&href=[[url]]&redirect_uri=http://mountaindew.com/kickstart";
			shareURL = "https://www.facebook.com/sharer/sharer.php?u=[[url]]";
		} else if (channel == MultiSharer.GOOGLE_PLUS) {
			shareURL = "https://plus.google.com/share?url=[[url]]";
		} else if (channel == MultiSharer.TWITTER) {
			shareURL = "https://twitter.com/intent/tweet?&text=[[text]]"; // &via=user
		}

		// Replaces fields
		if (url != undefined) shareURL = shareURL.split("[[url]]").join(encodeURIComponent(url));
		if (text != undefined) shareURL = shareURL.split("[[text]]").join(encodeURIComponent(text));
		if (subject != undefined) shareURL = shareURL.split("[[subject]]").join(encodeURIComponent(subject));

		return shareURL;
	}

	static getWindowParams(width, height) {
		// Properly centers the window
		const a = typeof window.screenX != "undefined" ? window.screenX : window.screenLeft;
		const i = typeof window.screenY != "undefined" ? window.screenY : window.screenTop;
		const g = typeof window.outerWidth != "undefined" ? window.outerWidth : document.documentElement.clientWidth;
		const f = typeof window.outerHeight != "undefined" ? window.outerHeight : (document.documentElement.clientHeight - 22);
		const h = (a < 0) ? window.screen.width + a : a;
		const left = parseInt(h + ((g - width) / 2), 10);
		const top = parseInt(i + ((f - height) / 2.5), 10);
		return "width=" + width + ",height=" + height + ",left=" + left + ",top=" + top + ",scrollbars=1";
	}
}

MultiSharer.EMAIL = "email";
MultiSharer.FACEBOOK = "facebook";
MultiSharer.GOOGLE_PLUS = "google-plus";
MultiSharer.TWITTER = "twitter";
