import Language from "./../../stores/data/Language";

export default class DirectionUtils {

	static getClass(stringList) {
		return "direction-" + (DirectionUtils.isLTR(stringList) ? "ltr" : "rtl");
	}

	static isLTR(stringList) {
		if (!stringList) {
			console.warn("Error: no string list passed to DirectionUtils!"); // eslint-disable-line no-console
			return true;
		}
		return stringList.getLanguage().direction == Language.DIRECTION_LTR;
	}

}
