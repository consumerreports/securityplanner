export default class WindowScrollUtils {

	// ================================================================================================================
	// PSEUDO CONSTRUCTOR ---------------------------------------------------------------------------------------------

	static init() {
		// Initial events
		window.addEventListener("scroll", WindowScrollUtils.onWindowScrolled.bind(this), false);
		window.addEventListener("scroll", WindowScrollUtils.onWindowScrolled.bind(this), true);

		// Initial values
		WindowScrollUtils.lastKnownScrollY = undefined;
	}


	// ================================================================================================================
	// PUBLIC INTERFACE -----------------------------------------------------------------------------------------------

	static setWindowScrollY(scrollPositionY) {
		// console.log("SET =====> " + scrollPositionY);
		window.scrollTo(0, scrollPositionY);
	}

	static getWindowScrollY(forceUpdate) {
		// return window.hasOwnProperty("scrollY") ? window.scrollY : window.pageYOffset;
		if (forceUpdate || isNaN(WindowScrollUtils.lastKnownScrollY)) WindowScrollUtils.forciblyUpdateScrollY();
		return WindowScrollUtils.lastKnownScrollY;
	}

	static forciblyUpdateScrollY() {
		// Scroll position is cached do it doesn't have to force layout later
		WindowScrollUtils.lastKnownScrollY = window.scrollY || window.pageYOffset;
	}


	// ================================================================================================================
	// EVENT INTERFACE ------------------------------------------------------------------------------------------------

	static onWindowScrolled() {
		WindowScrollUtils.forciblyUpdateScrollY();
	}
}

WindowScrollUtils.init();