export default class PositionUtils {

	// Positions an element vertically in its parent to maximize screen time:
	// if the parent is scrolled up (above the screen), set the top to the top of the screen instead (as if it's fixed)
	// TODO: find a better name for this method
	static positionVerticallyOnParentOrScreen(element, neverFixed = false, isDirectionLTR = true) {
		const elementHeight = element.offsetHeight;

		const isFixed = element.style.position === "fixed";
		const parentRect = PositionUtils.findElementRect(element.parentElement);
		const parentHorizPos = isDirectionLTR ? parentRect.x : window.innerWidth - (parentRect.x + parentRect.width);
		const parentTop = parentRect.y;
		const parentWidth = parentRect.width;
		const parentHeight = parentRect.height;

		let finalVerticalPos = "0px";
		let finalHorizPos = "0px";
		let finalWidth = "100%";
		let finalPosition = "absolute";


		if (elementHeight < parentHeight) {
			const windowTop = window.scrollY || window.pageYOffset;
			const windowBottom = windowTop + window.innerHeight;

			if (!isFixed && (windowBottom < parentTop || windowTop > parentTop + parentHeight)) {
				// Out of view, no need to adjust anything
				return;
			}

			if (windowTop < parentTop) {
				// There's space between the screen top and the parent top, so the element should be aligned to the top
				finalHorizPos = "";
			} else if (windowBottom > parentTop + parentHeight) {
				// There's space between the screen bottom and the parent bottom, so the element should be aligned to the bottom
				finalVerticalPos = (parentHeight - elementHeight) + "px";
				finalHorizPos = "";
			} else {
				// Middle of the screen is showing, so adjust accordingly
				if (neverFixed) {
					// Doesn't allow fixed position, manually set it
					finalHorizPos = "";
					finalVerticalPos = (windowTop - parentTop) + "px";
				} else {
					// Just use it fixed
					finalVerticalPos = "0px";
					finalHorizPos = parentHorizPos + "px";
					finalWidth = parentWidth + "px";
					finalPosition = "fixed";
				}
			}
		}

		// Finally, set the value
		element.style.top = finalVerticalPos;
		element.style.width = finalWidth;
		element.style.position = finalPosition;

		if (isDirectionLTR) {
			element.style.left = finalHorizPos;
		} else {
			element.style.right = finalHorizPos;
		}
	}

	static findElementRect(element, includeMargins = false, includeChildren = false) {
		// Finds the actual position of an element in the page
		// Careful when using this method as it forces re-layout
		const rect = element.getBoundingClientRect();
		const scrollLeft = window.scrollX || window.pageXOffset || document.documentElement.scrollLeft;
		const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
		const box = { left: rect.left + scrollLeft, top: rect.top + scrollTop, right: rect.left + scrollLeft + rect.width, bottom: rect.top + scrollTop + rect.height };

		if (includeMargins) {
			const style = window.getComputedStyle(element);
			if (style.marginTop) box.top -= parseInt(style.marginTop, 10);
			if (style.marginBottom) box.bottom += parseInt(style.marginBottom, 10);
			if (style.marginLeft) box.left -= parseInt(style.marginLeft, 10);
			if (style.marginRight) box.right += parseInt(style.marginRight, 10);
		}

		if (includeChildren) {
			// Includes ALL children; probably not very performant, but needed in some cases
			for (let i = 0; i < element.children.length; i++) {
				const rect = PositionUtils.findElementRect(element.children[i], includeMargins, true);
				box.left = Math.min(box.left, rect.left);
				box.top = Math.min(box.top, rect.top);
				box.bottom = Math.max(box.bottom, rect.bottom);
				box.right = Math.max(box.right, rect.right);
			}
		}

		// Other variables
		box.x = box.left;
		box.y = box.top;
		box.width = box.right - box.left;
		box.height = box.bottom - box.top;

		return box;
	}

	static resetVerticalPosition(element) {
		const finalVerticalPos = "auto";
		const finalHorizPos = "auto";
		const finalWidth = "100%";
		const finalPosition = "absolute";
		element.style.top = finalVerticalPos;
		element.style.left = finalHorizPos;
		element.style.width = finalWidth;
		element.style.position = finalPosition;
	}
}
