import React from "react";

export default class ReactUtils {
	static getReplacedNodes(template, fieldToSearchFor, elementToReplaceWith) {
		// Creates a list of element nodes by replacing an item in a string with a certain node
		// E.g.
		//   let someSpecialElement = <em>something</em>;
		//   let myItem = getReplacedNodes("this is a [[special]] node", "[[special]]", someSpecialElement);
		//   // Result: <span>"this is a ", <em>something</em>, " node"</span>
		// This is all to avoid dangerouslySetInnerHTML
		const fieldIndex = template.indexOf(fieldToSearchFor);
		if (fieldIndex < 0) {
			// Nothing to replace
			return template;
		} else {
			// Replace
			return (
				<span key="replacement">
					<span key="before">{ReactUtils.getReplacedNodes(template.substr(0, fieldIndex), fieldToSearchFor, elementToReplaceWith)}</span>
					{elementToReplaceWith}
					<span key="after">{ReactUtils.getReplacedNodes(template.substr(fieldIndex + fieldToSearchFor.length), fieldToSearchFor, elementToReplaceWith)}</span>
				</span>
			);
		}
	}

	static getReplacedTags(template, tagToSearchFor, renderFunction) {
		// Similar to getReplacedNodes, but with tags and a function callback
		// E.g.
		//   let someSpecialElement = <em>something</em>;
		//   let myItem = getReplacedTags("this is an <em>emphasized</em> node", "em", function(innerText) { return <em>{innerText}</em>; });
		//   // Result: <span>"this is an ", <em>emphasized</em>, " node"</span>
		// This is all to avoid dangerouslySetInnerHTML
		const tagOpen = "<" + tagToSearchFor + ">";
		const tagClose = "</" + tagToSearchFor + ">";
		const tagIndexOpen = template.indexOf(tagOpen);
		const tagIndexClose = template.indexOf(tagClose, tagIndexOpen);

		if (tagIndexOpen < 0 || tagIndexClose < 0) {
			// Nothing to replace
			return template;
		} else {
			// Replace
			return (
				<span key="replacement">
					<span key="before">{template.substr(0, tagIndexOpen)}</span>
					{renderFunction(template.substr(tagIndexOpen + tagOpen.length, tagIndexClose - tagIndexOpen - tagOpen.length))}
					<span key="after">{template.substr(tagIndexClose + tagClose.length)}</span>
				</span>
			);
		}
	}

	static getReplacedList(items, renderFunction, divider, dividerEndSingle = undefined, dividerEndMultiple = undefined) {
		// Based on a list of strings, responds with a list of nodes
		// This mimics StringUtils.getListedText(), but for React and with varying colors per item
		// renderFunction takes "index" and "innerText"

		// Generates the list
		const list = [];
		for (let i = 0; i < items.length; i++) {
			if (i > 0) {
				// Find divider between items
				let dividerText = divider;
				if (i < items.length - 1) {
					// Between items
					dividerText = divider;
				} else {
					// Between two last items
					if (items.length == 2) {
						dividerText = dividerEndSingle || dividerEndMultiple || divider;
					} else {
						dividerText = dividerEndMultiple || divider;
					}
				}

				list.push(<span key={ "divider-" + i }>{dividerText}</span>);
			}

			// Adds the item
			list.push(renderFunction(i, items[i]));
		}

		return list;
	}
}
