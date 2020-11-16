import { array } from "prop-types";

export default class ADAUtils {

	// ================================================================================================================
	// PUBLIC INTERFACE -----------------------------------------------------------------------------------------------

	static init(className) {
		ADAUtils.className = className;
		document.addEventListener("keydown", (e) => {
			if (e.keyCode == 9) { // TAB
				ADAUtils.activate();
			} else if (e.keyCode == 27) { // ESC
				ADAUtils.deactivate();
			}
		});

		document.addEventListener("click", () => {
			ADAUtils.deactivate();
		});
	}

	static handleKeyboard(onClickFunc, avoidPreventDefault = false, tabOrderFunc) {
		return (e) => {
			if (e.type === "keydown") {
				if (e.keyCode == 32 || e.keyCode == 13) { // ENTER or SPACEBAR
					onClickFunc(e);
					if (!avoidPreventDefault) e.preventDefault();
				}

				if (e.keyCode == 9 && tabOrderFunc) tabOrderFunc(e);
			}
		};
	}

	static removeTabIndex(element) {
		const elements = element.querySelectorAll("*");
		for (let i = 0; i < elements.length; i++) {
			elements[i].removeAttribute("tabindex");
		}
	}

	static handleOverlay(exitFunc) {
		return (e) => { if (e.keyCode === 27) exitFunc() } 
	}

	static addFocusTrap(tabSequence) {
		if (ADAUtils.focusTrap.length) ADAUtils.focusTrap = [];
		ADAUtils.focusTrap.push(...tabSequence)
	}

	static destroyFocusTrap() {
		ADAUtils.focusTrap = []
	}

	// Create a tab sequence that cycles between a set collection of elements
	static handleFocusTrap(onClickFunc, tabSequenceIndex = null, avoidPreventDefault = false) {
		return e => {
			if (e.keyCode == 32 || e.keyCode == 13) { // ENTER or SPACEBAR
				return this.handleKeyboard(onClickFunc, avoidPreventDefault)
			} else if (e.keyCode == 9) {
				let nextElement;
				if(e.shiftKey) {
					// Go backwards in tab sequence
					nextElement = tabSequenceIndex === 0 ? ADAUtils.focusTrap.length - 1 : tabSequenceIndex - 1
				} else {
					// Go forwards in tab sequence
					nextElement = tabSequenceIndex === ADAUtils.focusTrap.length - 1 ? 0 : tabSequenceIndex + 1
				}
				ADAUtils.focusTrap[nextElement].focus();
				e.stopPropagation();
				e.preventDefault();
			}
		}
	}

	// ================================================================================================================
	// INTERNAL INTERFACE ---------------------------------------------------------------------------------------------

	// Activate ADA outlines
	static activate() {
		if (!ADAUtils.isActivated) {
			document.body.classList.add(ADAUtils.className);
			ADAUtils.isActivated = true;
		}
	}

	// Deactivate ADA outlines
	static deactivate() {
		if (ADAUtils.isActivated) {
			document.body.classList.remove(ADAUtils.className);
			ADAUtils.isActivated = false;
		}
	}
}

ADAUtils.isActivated = false;
ADAUtils.className = "";
ADAUtils.focusTrap = [];