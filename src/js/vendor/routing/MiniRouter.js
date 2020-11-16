export default class MiniRouter {

	/*

	 var router = new MiniRouter();
	 router.addTemplate("/cover/{id}", function(params) {});
	 var xx = router.handle(uri);

	 */

	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------

	constructor() {
		this.uriTemplates = []; // Possible uri templates
		this.uriTemplateHandlers = []; // Handlers for each path template
	}


	// ================================================================================================================
	// PUBLIC INTERFACE -----------------------------------------------------------------------------------------------

	addTemplate(uriTemplate, handler) {
		this.uriTemplates.push(uriTemplate);
		this.uriTemplateHandlers.push(handler);
	}

	removeTemplate(uriTemplate) {
		let idx = this.uriTemplates.indexOf(uriTemplate);
		while (idx > -1) {
			this.uriTemplates.splice(idx, 1);
			this.uriTemplateHandlers.splice(idx, 1);
			idx = this.uriTemplates.indexOf(uriTemplate);
		}
	}

	handle(uri) {
		// Based on a uri, tries to find which uri template is most appropriate for it
		const uriSteps = uri.split(MiniRouter.URI_STEP_DIVIDER);
		let uriTemplateSteps = null;
		let doesMatch = false;
		let paramsObject = null;
		for (let i = 0; i < this.uriTemplates.length; i++) {
			uriTemplateSteps = this.uriTemplates[i].split(MiniRouter.URI_STEP_DIVIDER);

			// Check all steps for matching and builds parameters
			doesMatch = false;
			paramsObject = {};

			// Check for a full match (e.g. "/a/*/b" => "/a/{{id}}/b")
			// Check for rest matches (e.g. "/a/*/b" => "/a/...rest")
			doesMatch = true;

			for (let j = 0; j < uriTemplateSteps.length; j++) {
				if (j >= uriSteps.length) {
					// No more steps in source uri to match the template
					doesMatch = false;
					break;
				} else if (uriTemplateSteps[j].startsWith(MiniRouter.PARAMETER_BRACKET_START) && uriTemplateSteps[j].endsWith(MiniRouter.PARAMETER_BRACKET_END)) {
					// Is a parameter
					const parameterName = uriTemplateSteps[j].substr(MiniRouter.PARAMETER_BRACKET_START.length, uriTemplateSteps[j].length - MiniRouter.PARAMETER_BRACKET_START.length - MiniRouter.PARAMETER_BRACKET_END.length);
					if (parameterName.startsWith(MiniRouter.PARAMETER_REST_START)) {
						// A rest parameter, add to the object and end
						paramsObject[parameterName.substr(MiniRouter.PARAMETER_REST_START.length)] = uriSteps.slice([j]).join(MiniRouter.URI_STEP_DIVIDER);
						break;
					} else {
						// A normal parameter, add to the object
						paramsObject[parameterName] = uriSteps[j];
					}
				} else {
					// A normal string, check for matches
					if (uriSteps[j] != uriTemplateSteps[j]) {
						// No match, breaks prematurely
						doesMatch = false;
						break;
					}
				}

				if (j == uriTemplateSteps.length - 1 && uriSteps.length > uriTemplateSteps.length) {
					// No more steps in template to handle source uri
					doesMatch = false;
				}
			}

			if (doesMatch) {
				// It's a match, return the appropriate handler
				return this.uriTemplateHandlers[i](paramsObject);
			}
		}

		return undefined;
	}
}

MiniRouter.PARAMETER_BRACKET_START = "{";
MiniRouter.PARAMETER_BRACKET_END = "}";
MiniRouter.PARAMETER_REST_START = "...";
MiniRouter.URI_STEP_DIVIDER = "/";