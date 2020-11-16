import Bowser from "bowser";

import SecurityPlannerConstants from "./../../constants/SecurityPlannerConstants";

export default class GoogleFormsUtils {

	static submit(formId, formData, callback) {
		// Re-encode the form data object into a URL-encoded string
		let newData = "";
		Object.keys(formData).forEach(key => {
			if (newData.length > 0) newData += "&";
			newData += key + "=" + encodeURIComponent(formData[key]);
		});

		const useGet = Bowser.msie || Bowser.safari;

		if (useGet) {
			// Cannot do proper fetch calls; just open an iframe with a GET and assume it worked
			const url = `https://docs.google.com/forms/d/${formId}/formResponse?${newData}`;
			const iframe = document.createElement("iframe");
			iframe.src = url;
			document.body.appendChild(iframe);
			requestAnimationFrame(() => callback(true));
		} else {
			// Normal POST fetch
			fetch(`https://docs.google.com/forms/d/${formId}/formResponse`, {
				credentials: "include",
				method: "POST",
				mode: "no-cors",
				redirect: "follow",
				headers: new Headers({
					"Accept": "application/json, application/xml, text/plain, text/html, *.*",
					"Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
				}),
				body: newData,
			}).then(response => {
				// Response: { body: null, bodyUsed: false, ok: false, status: 0, statusText: "", type: "opaque", url: "", headers: ... }
				// Regardless of the actual submission status, the response is always the same:
				// * If fields are missing: still success, but doesn't save data
				// * If form is now allowing responses: still success, but doesn't save data

				if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
					callback(true)
				} else {
					if (SecurityPlannerConstants.Parameters.FORCE_ERRORS) {
						callback(false, "Forced error for testing");
					} else if (response.status === 0 || response.status === 200) {
						callback(true);
					} else {
						callback(false, response.statusText);
					}
				}
			}).catch(error => {
				callback(false, error);
			});
		}
	}
}
