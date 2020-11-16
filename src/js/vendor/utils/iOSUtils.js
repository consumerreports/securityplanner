/* Stupid functions to help deal with iOS crappy browser */


export default class iOSUtils {
	static rerenderElement(element) {
		element.style.display = "none";
		element.offsetHeight; // eslint-disable-line no-unused-expressions
		element.style.display = "";
	}
}