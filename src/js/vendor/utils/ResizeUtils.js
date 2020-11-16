import SimpleSignal from "simplesignal";
import SecurityPlannerConstants from "./../../constants/SecurityPlannerConstants";

export default class ResizeUtils {
	static init() {
		this.breakpoints = {
			"tiny": "(max-width: 639px)", // "(max-width: 479px)",
			"small": "(min-width: 640px)", // "(min-width: 480px)",
			"medium": "(min-width: 960px)", // "(min-width: 960px)",
			"large": "(min-width: 1184px)", // "(min-width: 1280px)",
		};

		this.onResize = new SimpleSignal();

		window.addEventListener("resize", () => ResizeUtils.dispatchResize());
		window.addEventListener("orientationchange", () => ResizeUtils.dispatchResize());

		// We also wait and dispatch it once because sometimes the first read is not correct in iOS
		window.requestAnimationFrame(() => ResizeUtils.dispatchResize());
	}

	static dispatchResize() {
		this.onResize.dispatch({
			width: window.innerWidth,
			height: window.innerHeight,
		});
	}

	static getCurrentBreakpoint() {
		if (window.matchMedia(this.breakpoints["large"]).matches) {
			return "large";
		} else if (window.matchMedia(this.breakpoints["medium"]).matches) {
			return "medium";
		} else if (window.matchMedia(this.breakpoints["small"]).matches) {
			return "small";
		} else if (window.matchMedia(this.breakpoints["tiny"]).matches) {
			return "tiny";
		}
	}

	static getCurrentBreakpointHideDistance() {
		return SecurityPlannerConstants.UI.SCROLL_DISTANCE_TO_HIDE_ELEMENTS[ResizeUtils.getCurrentBreakpoint()];
	}
}

ResizeUtils.init();