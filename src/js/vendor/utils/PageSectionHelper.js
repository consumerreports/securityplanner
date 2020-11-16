import Bowser from "bowser";
import { clamp } from "moremath";
import ReactDOM from 'react-dom';
import SimpleSignal from "simplesignal";

import ADAUtils from "./../../vendor/utils/ADAUtils";

/**
 * A generic page helper, to better handle custom functionality that all sections need.
 */
export default class PageSectionHelper {

	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------

	constructor(page) {
		this._element = undefined;
		this._scrollY = undefined;
		this._windowWidth = window.innerWidth;
		this._windowHeight = window.innerHeight;
		this._page = undefined;
		this._isActive = false;

		this._blockMinMax = Bowser.ios;

		this._onScrolledElementBound = this.onScrolledElement.bind(this);
		this._onResizeBound = this.onResize.bind(this);

		this.onScrolled = new SimpleSignal();
		this.onResized = new SimpleSignal();

		this.activeElement = undefined;

		this.setPage(page);

		this.checkSizeAgain();
	}


	// ================================================================================================================
	// PUBLIC INTERFACE -----------------------------------------------------------------------------------------------

	setPage(page) {
		if (this._page !== page) {
			if (this._page) this.removePageEvents();
			this._page = page;
			if (this._page) this.addPageEvents();
		}
	}

	setElement(element) {
		if (element !== this._element) {
			if (this._element) {
				this.removeElementEvents();
			}
			this._element = element;
			if (this._element) {
				this.addElementEvents();
				this.applyScrollPosition();
			}
		}
		if (this._element) {
			this.validateScrollPosition();
		}
	}

	setComponent(component) {
		if (component) {
			this.setElement(ReactDOM.findDOMNode(component));
		}
	}

	forceCheck() {
		this.validateScrollPosition();
	}

	dispatchOnScrolled() {
		this.onScrolled.dispatch(this._scrollY, this.getMaxScrollPosition());
	}

	destroy() {
		this.setPage(undefined);
		this.setElement(undefined);
		this.onScrolled.removeAll();
	}


	// ================================================================================================================
	// GETTERS/SETTERS ------------------------------------------------------------------------------------------------

	getScrollPosition(validated = false) {
		let pos = this._element ? this._element.scrollTop : 0;
		if (validated) {
			if (this._blockMinMax) {
				pos = clamp(pos, 1, this.getMaxScrollPosition() - 1);
			} else {
				pos = clamp(pos, 0, this.getMaxScrollPosition());
			}
		}
		return pos;
	}

	getMaxScrollPosition() {
		return this._element ? this._element.scrollHeight - this._element.clientHeight : 0;
	}

	setScrollPosition(scrollPositionY, forced = false) {
		if (this._scrollY !== scrollPositionY || forced) {
			this._scrollY = scrollPositionY;
			this.applyScrollPosition();
			requestAnimationFrame(() => {
				this.applyScrollPosition();
			});
		}
	}

	getElement() {
		return this._element;
	}

	getWindowHeight() {
		return this._windowHeight;
	}

	getMinScrollableHeight() {
		return this.getWindowHeight() + (this._blockMinMax ? 2 : 0);
	}

	isActive() {
		return this._isActive;
	}


	// ================================================================================================================
	// PRIVATE INTERFACE ----------------------------------------------------------------------------------------------

	addElementEvents() {
		this._element.addEventListener("scroll", this._onScrolledElementBound);
		this.onScrolledElement(null);
	}

	removeElementEvents() {
		this._element.removeEventListener("scroll", this._onScrolledElementBound);
	}

	addPageEvents() {
		window.addEventListener("resize", this._onResizeBound);
	}

	removePageEvents() {
		window.removeEventListener("resize", this._onResizeBound);
	}

	applyScrollPosition() {
		if (this._element) this._element.scrollTop = this._scrollY;
	}

	validateScrollPosition() {
		if (this._blockMinMax && this._element) {
			if (this.getScrollPosition() < 1) {
				this.setScrollPosition(1);
				return true;
			} else if (this.getScrollPosition() > this.getMaxScrollPosition() - 1) {
				this.setScrollPosition(this.getMaxScrollPosition() - 1);
				return true;
			}
		}
	}

	checkSizeAgain() {
		// Wait and dispatch size change once again because sometimes the first read is not correct in iOS
		window.requestAnimationFrame(() => {
			this.onResize();
		});
	}

	// ================================================================================================================
	// EVENT INTERFACE ------------------------------------------------------------------------------------------------

	onScrolledElement() {
		if (this._scrollY != this.getScrollPosition()) {
			this._scrollY = this.getScrollPosition();
			if (!this.validateScrollPosition()) {
				this.dispatchOnScrolled();
			}
		}
	}

	onActivate(travelOffset, viaHistoryAPI, fromOverlay) { // eslint-disable-line no-unused-vars
		if (travelOffset > 0 || !viaHistoryAPI) this.setScrollPosition(0);
		this._isActive = true;
		if (this.activeElement && ADAUtils.isActivated) this.activeElement.focus();
		if (this._page) this._page.forceUpdate();
	}

	onDeactivate(travelOffset, viaHistoryAPI, toOverlay) { // eslint-disable-line no-unused-vars
		this._isActive = false;
		this.activeElement = document.activeElement;
		if (this._page) this._page.forceUpdate();
	}

	onResize() {
		const newWidth = window.innerWidth;
		const newHeight = window.innerHeight;
		if (this._windowWidth != newWidth || this._windowHeight != newHeight) {
			this._windowWidth = newWidth;
			this._windowHeight = newHeight;
			if (this._page) this._page.forceUpdate();
			this.onResized.dispatch(this._windowsWidth, this._windowsHeight);
			this.checkSizeAgain();
		}
	}
}