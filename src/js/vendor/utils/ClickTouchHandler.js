/**
 * A helper to handle onTouchEnd and onClick events of a React component
 * Why?
 * . onClick() doesn't trigger on iOS if it happens while the page is scrolling. You need to use onTouchEnd.
 * . using onTouchEnd() makes the event always fire, even after dragging the page
 */
export default class ClickTouchHandler {

	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------

	constructor(onClickFunc, preventDefault = false) {
		this._hasJustClicked = false;
		this._doubleTouchTimeout = 60;
		this._maxClickTouchDistance = 10 * (window.devicePixelRatio ? window.devicePixelRatio : 1);
		this._onClick = onClickFunc;
		this._preventDefault = preventDefault;

		this._isTouching = false;
		this._lastPoint = undefined;
		this._touchedDistance = 0;
		this._disposed = false;
	}


	// ================================================================================================================
	// PUBLIC INTERFACE -----------------------------------------------------------------------------------------------

	get handler() {
		return this.internalEventHandler.bind(this);
	}

	dispose() {
		this._disposed = true;
		this._onClickFunc = undefined;
	}


	// ================================================================================================================
	// PRIVATE INTERFACE ----------------------------------------------------------------------------------------------

	internalEventHandler(e) {
		if (this._disposed) return;

		if (e.type === "touchstart") {
			this.onTouchStart();
			this.onTouchMove(e.touches);
		} else if (e.type === "touchmove") {
			this.onTouchMove(e.touches);
		} else if (e.type === "touchend") {
			this.onTouchMove(e.touches);
			this.onTouchEnd(e);
		} else if (e.type === "touchcancel") {
			this.onTouchMove(e.touches);
			this.onTouchCancel();
		} else if (e.type === "keydown") {
			this.onKeyDown(e);
		} else if (e.type === "click" || e.type === undefined) {
			this.onClick(e);
		}
	}

	onTouchStart() {
		this._isTouching = true;
		this._lastPoint = undefined;
		this._touchedDistance = 0;
	}

	onTouchMove(touches) {
		if (touches) {
			for (let i = 0; i < touches.length; i++) {
				const touch = touches[i];
				const p = { x: touch.screenX, y: touch.screenY };
				if (!this._lastPoint) {
					// First point
					this._touchedDistance = 0;
				} else {
					// Continuing
					const dx = p.x - this._lastPoint.x;
					const dy = p.y - this._lastPoint.y;
					this._touchedDistance += Math.sqrt(dx * dx + dy * dy);
				}
				this._lastPoint = p;
			}
		}
	}

	onTouchEnd(e) {
		this._isTouching = false;
		if (this._touchedDistance < this._maxClickTouchDistance) this.onClick(e);
	}

	onTouchCancel() {
		this._isTouching = false;
	}

	onKeyDown(e) {
		if (e.keyCode == 32 || e.keyCode == 13) this.onClick(e);
	}

	onClick(e) {
		if (!this._hasJustClicked) {
			this._hasJustClicked = true;
			if (this._preventDefault) e.preventDefault();
			if (this._onClick) {
				this._onClick(e);
			}

			setTimeout(() => {
				this._hasJustClicked = false;
			}, this._doubleTouchTimeout);
		}
	}
}