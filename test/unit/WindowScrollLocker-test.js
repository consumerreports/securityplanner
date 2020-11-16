import { expect } from "chai";
import WindowScrollLocker from "./../../src/js/vendor/utils/WindowScrollLocker";

describe("WindowScrollLocker", function() {
	const sl = new WindowScrollLocker();

	it("should lock correctly depending on parameters", function() {
		expect(sl.isLocked()).to.be.equal(false);

		sl.lock(10);
		expect(sl._lockedScrollYMin).to.be.equal(10);
		expect(sl._lockedScrollYMax).to.be.equal(10);
		expect(sl._lockOnce).to.be.equal(false);
		expect(sl.isLocked()).to.be.equal(true);

		sl.unlock();
		expect(sl.isLocked()).to.be.equal(false);

		setScrollY(10);
		sl.lock(10, 20);
		expect(sl._lockedScrollYMin).to.be.equal(10);
		expect(sl._lockedScrollYMax).to.be.equal(20);
		expect(sl._lockOnce).to.be.equal(false);
		expect(sl.isLocked()).to.be.equal(true);

		setScrollY(12);
		sl.lock(12, true);
		expect(sl._lockedScrollYMin).to.be.equal(12);
		expect(sl._lockedScrollYMax).to.be.equal(12);
		expect(sl._lockOnce).to.be.equal(true);
		expect(sl.isLocked()).to.be.equal(true);

		sl.lock(12, 15, true);
		expect(sl._lockedScrollYMin).to.be.equal(12);
		expect(sl._lockedScrollYMax).to.be.equal(15);
		expect(sl._lockOnce).to.be.equal(true);
		expect(sl.isLocked()).to.be.equal(true);

		sl.unlock();
		expect(sl.isLocked()).to.be.equal(false);
	});
});

function setScrollY(pos) {
	window.scrollY = pos;
	window.scrollTo(0, pos);
}