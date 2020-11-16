/* Usage:
 * let locker = new WindowScrollLocker();
 *
 * locker.lock() // Lock current
 * locker.lock(true) // Lock current, once
 * locker.lock(y) // Lock in a Y
 * locker.lock(y, true)  // Lock in a Y, only once
 * locker.lock(minY, maxY) // Lock in a range
 * locker.lock(minY, maxY, true)  // Lock in a range, only once
 *
 * locker.unlock() // unlocks
 * locker.isLocked() // returns true or false
 */
export default class WindowScrollLocker {

	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------

	constructor() {
		this._lockedScrollYMin = undefined;
		this._lockedScrollYMax = undefined;
		this._lastKnownScrollY = undefined;
		this._lockOnce = false;
		this._isLocked = false;
		this._onWindowScrolledBound = this.onWindowScrolled.bind(this);
	}


	// ================================================================================================================
	// PUBLIC INTERFACE -----------------------------------------------------------------------------------------------

	lock(minY, maxY, once) {
		if (maxY === false || maxY === true) once = maxY;
		if (minY === false || minY === true) once = minY;
		if (isNaN(parseFloat(minY)) || !isFinite(minY)) minY = this.getScrollY(true);
		if (isNaN(parseFloat(maxY)) || !isFinite(maxY)) maxY = minY;

		this._lockOnce = Boolean(once);
		this._lockedScrollYMin = minY;
		this._lockedScrollYMax = maxY;

		if (!this._isLocked) {
			window.addEventListener("scroll", this._onWindowScrolledBound, false);
			window.addEventListener("scroll", this._onWindowScrolledBound, true);
			this._isLocked = true;
		}

		this.checkLockedScrollYState(null);
	}

	unlock() {
		if (this._isLocked) {
			window.removeEventListener("scroll", this._onWindowScrolledBound, false);
			window.removeEventListener("scroll", this._onWindowScrolledBound, true);
			this._isLocked = false;
		}
	}

	isLocked() {
		return this._isLocked;
	}


	// ================================================================================================================
	// PRIVATE INTERFACE ----------------------------------------------------------------------------------------------

	getScrollY(forceUpdate) {
		if (forceUpdate || isNaN(this._lastKnownScrollY)) this.forciblyUpdateScrollY();
		return this._lastKnownScrollY;
	}

	setScrollY(scrollPositionY) {
		window.scrollTo(0, scrollPositionY);
	}

	checkLockedScrollYState(e) {
		const y = this.getScrollY(true);
		if (this._isLocked) {
			if (y < this._lockedScrollYMin) {
				if (e && e.preventDefault) e.preventDefault();
				this.setScrollY(this._lockedScrollYMin);
				if (this._lockOnce) this.unlock();
			} else if (y > this._lockedScrollYMax) {
				if (e && e.preventDefault) e.preventDefault();
				this.setScrollY(this._lockedScrollYMax);
				if (this._lockOnce) this.unlock();
			}
		}
	}

	forciblyUpdateScrollY() {
		// Read and cache the scroll position, so it doesn't have to force layout later
		this._lastKnownScrollY =  window.hasOwnProperty("scrollY") ? window.scrollY : window.pageYOffset;
	}


	// ================================================================================================================
	// EVENT INTERFACE ------------------------------------------------------------------------------------------------

	onWindowScrolled(e) {
		this.checkLockedScrollYState(e);
		this.forciblyUpdateScrollY();
	}
}