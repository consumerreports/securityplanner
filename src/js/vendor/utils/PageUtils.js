import { map } from "moremath";

import Fween from "./../transitions/Fween";
import Easing from "./../transitions/Easing";

import PositionUtils from "./PositionUtils";

export default class PageUtils {
	static isTouchDevice() {
		return !(window.screen.width > 1400 || window.screen.width < 1400 &&
			window.innerWidth < .9 * window.screen.width) &&
			("ontouchstart" in window);
	}

	static getQueryParameter(name) {
		// http://stackoverflow.com/questions/901115/get-query-string-values-in-javascript
		name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		const regexS = "[\\?&]" + name + "=([^&#]*)";
		const regex = new RegExp(regexS);
		const results = regex.exec(window.location.search);
		return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	static scrollToElement(parentElement, childElement, center = false, includeChildren = false, constantChildLayout = false) {
		// Makes sure a specific element is visible in its parent, scrolling if needed
		if (!parentElement || !childElement) return;

		const parentRect = PositionUtils.findElementRect(parentElement, true, includeChildren);
		const childRect = PositionUtils.findElementRect(childElement, true, includeChildren);

		const offsetY = PageUtils.findScrollOffset(parentRect, childRect, center);

		const startScrollTop = parentElement.scrollTop;

		let tween = null;
		const tweenId = PageUtils.getDOMPath(parentElement);
		if (PageUtils.scrollObjects.hasOwnProperty(tweenId)) {
			PageUtils.scrollObjects[tweenId].stop();
			delete(PageUtils.scrollObjects[tweenId]);
		}

		if (offsetY != 0) {
			if (!constantChildLayout) {
				// Easy transition
				tween = Fween.use(() => startScrollTop, (p) => { parentElement.scrollTop = Math.round(p); })
					.from(startScrollTop)
					.to(startScrollTop + offsetY, 0.4, Easing.expoInOut)
					.play();
			} else {
				// If the child is constantly changing (e.g. resizing), need to re-layout on every frame
				tween = Fween.use(
					() => 0,
					(f) => {
						const parentRect = PositionUtils.findElementRect(parentElement, true);
						const childRect = PositionUtils.findElementRect(childElement, true, includeChildren);
						const offsetY = PageUtils.findScrollOffset(parentRect, childRect, center);
						const p = map(f, 0, 1, startScrollTop, offsetY);
						parentElement.scrollTop = Math.round(p);
					})
					.from(0)
					.to(1, 0.4, Easing.expoInOut)
					.play();
			}
		}

		if (tween) PageUtils.scrollObjects[tweenId] = tween;
	}

	static findScrollOffset(parentRect, childRect, center = false) {
		// Find the amount of scroll needed to get a childRect inside a parentRect
		const pHeight = parentRect.bottom - parentRect.top;
		const cHeight = childRect.bottom - childRect.top;

		let offsetY = 0;

		if (center && cHeight <= pHeight) {
			// It can fit, so center on the element
			offsetY = childRect.top + cHeight / 2 - pHeight / 2 - parentRect.top;
		} else {
			// Cannot fit or doesn't need to center, so just scroll until the desired part is visible
			if (childRect.bottom > parentRect.bottom) {
				// Need to scroll down
				offsetY = childRect.bottom - parentRect.bottom;
			} else if (childRect.top < parentRect.top) {
				// Need to scroll up
				offsetY = childRect.top - parentRect.top;
			}
		}

		return offsetY;
	}


	static scrollToPosition(parentElement, scrollTop) {
		const startScrollTop = parentElement.scrollTop;
		Fween.use(() => startScrollTop, (p) => { parentElement.scrollTop = Math.round(p); })
			.from(startScrollTop)
			.to(scrollTop, 0.4, Easing.expoInOut)
			.play();
	}

	static getDOMPath(element) {
		return PageUtils.getDOMPathArray(element).join(" > ");
	}

	static getDOMPathArray(element) {
		let path = [];

		// Add parent
		if (element.parentElement && element !== document.body) {
			path = path.concat(PageUtils.getDOMPath(element.parentElement));
		}

		// Add this
		let entry = element.tagName;
		if (element.className) {
			entry += "." + element.className.split(" ").join(".");
		}

		path.push(entry);

		return path;
	}
}

PageUtils.scrollObjects = {};
