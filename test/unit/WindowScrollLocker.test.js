import React from "react";
import WindowScrollLocker from "./../../src/js/vendor/utils/WindowScrollLocker"
describe("WindowScrollLocker", () => {
	const sl = new WindowScrollLocker();

	test("should lock correctly depending on parameters", () => {
		expect(sl.isLocked()).toBe(false);

		sl.lock(10);
		expect(sl._lockedScrollYMin).toBe(10);
		expect(sl._lockedScrollYMax).toBe(10);
		expect(sl._lockOnce).toBe(false);
		expect(sl.isLocked()).toBe(true);

		sl.unlock();
		expect(sl.isLocked()).toBe(false);

		setScrollY(10);
		sl.lock(10, 20);
		expect(sl._lockedScrollYMin).toBe(10);
		expect(sl._lockedScrollYMax).toBe(20);
		expect(sl._lockOnce).toBe(false);
		expect(sl.isLocked()).toBe(true);

		setScrollY(12);
		sl.lock(12, true);
		expect(sl._lockedScrollYMin).toBe(12);
		expect(sl._lockedScrollYMax).toBe(12);
		expect(sl._lockOnce).toBe(true);
		expect(sl.isLocked()).toBe(true);

		sl.lock(12, 15, true);
		expect(sl._lockedScrollYMin).toBe(12);
		expect(sl._lockedScrollYMax).toBe(15);
		expect(sl._lockOnce).toBe(true);
		expect(sl.isLocked()).toBe(true);

		sl.unlock();
		expect(sl.isLocked()).toBe(false);
	});
});

function setScrollY(pos) {
	window.scrollY = pos;
	window.scrollTo(0, pos);
}