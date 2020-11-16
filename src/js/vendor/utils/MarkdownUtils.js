import React from "react";

import SecurityPlannerConstants from "../../constants/SecurityPlannerConstants";

export default class MarkdownUtils {

	/**
	 * A more complete markdown renderer
	 * Work in progress; should eventually replace other functions once complete
	 */
	static renderMarkdown(source) {
		// Carriage returns
		const R_PARAGRAPHS = /(\n\n|^)([^\n]+?)(\n\n|$)/igm;

		const nodes = [];
		let lastIndex = 0;

		let match = R_PARAGRAPHS.exec(source);
		while (match) {
			if (match.index > lastIndex) {
				// Text before
				nodes.push(
					<span key={ lastIndex }>
						{ source.substr(lastIndex, match.index - lastIndex) }
					</span>
				);
				lastIndex = match.index;
			}

			// Paragraph
			nodes.push(
				<p key={ lastIndex }>
					{ match[2] }
				</p>
			);
			lastIndex += match[0].length;

			match = R_PARAGRAPHS.exec(source);
		}

		// End
		if (lastIndex < source.length) {
			nodes.push(
				<span key={ lastIndex }>
					{ source.substr(lastIndex) }
				</span>
			);
		}

		return nodes;
	}

	static parseURL(message, tagName = "span", className = "", linkClass = "") {
		message = this.parseLinks(message, linkClass);
		message = this.parseBoldAndItalic(message, false);

		return React.createElement(tagName, {
			className: className,
			dangerouslySetInnerHTML: {
				__html: message,
			},
		});
	}

	static parseURLPure(message, linkClass = "", target = "_blank", onClick = null, urlFilter = null) {
		const nodes = [];
		let lastIndex = 0;
		let match = SecurityPlannerConstants.Regex.MARKDOWN_URL.exec(message);
		while (match) {
			if (match.index > lastIndex) {
				// Text before
				nodes.push(
					<span key={ lastIndex }>
						{ message.substr(lastIndex, match.index - lastIndex) }
					</span>
				);
				lastIndex = match.index;
			}

			// Link
			nodes.push(
				<a
					key={ lastIndex }
					className={ linkClass }
					target={ target }
					href={ urlFilter ? urlFilter(match[2]) : match[2] }
					onClick={ onClick }>
					{ match[1] }
				</a>
			);
			lastIndex += match[0].length;

			match = SecurityPlannerConstants.Regex.MARKDOWN_URL.exec(message);
		}

		// End
		nodes.push(
			<span key={ lastIndex }>
				{ message.substr(lastIndex) }
			</span>
		);

		return nodes;
	}

	static parseList(message, ulClasses = "", liClasses = "") {
		const list = message.match(SecurityPlannerConstants.Regex.MARKDOWN_LIST);

		list.forEach((listItem, i) => {
			listItem = listItem.replace(SecurityPlannerConstants.Regex.BULLET_CHARS, "").trim();
			message = message.replace(list[i], `<li><p class="${liClasses}">${listItem}</p></li>`);
		});

		message = this.parseLinks(message);

		return (
            <ul
                className={ulClasses}
                dangerouslySetInnerHTML={{
                    __html: message,
                }} />
        );
	}

	static parseLinks(message, linkClass = "") {
		const links = message.match(SecurityPlannerConstants.Regex.MARKDOWN_URL);

		if (links) {
			links.forEach(link => {
				const mdArray = link.split(SecurityPlannerConstants.Regex.MARKDOWN_URL);
				const mdCopy = mdArray[1];
				const mdUrl = mdArray[2];

				const anchorElement =
					`<a href="${mdUrl}" target="_blank" class="${linkClass}">${mdCopy}</a>`;

				message = message.replace(link, anchorElement);
			});
		}
		return message;
	}

	static parseBoldAndItalic(message, returnElement = true, elementClasses = "", tagName = "span") {
		const boldItems = message.match(SecurityPlannerConstants.Regex.MARKDOWN_BOLD);

		if (boldItems) {
			boldItems.forEach((boldItem, i) => {
				boldItem = boldItem.replace(/\*/g, "");
				message = message.replace(boldItems[i], `<strong>${boldItem}</strong>`);
			});
		}

		const italicItems = message.match(SecurityPlannerConstants.Regex.MARKDOWN_ITALIC);

		if (italicItems) {
			italicItems.forEach((italicItem, i) => {
				italicItem = italicItem.replace(/\*/g, "");
				message = message.replace(italicItems[i], `<em>${italicItem}</em>`);
			});
		}

		if (returnElement) {
			return React.createElement(tagName, {
				className: elementClasses,
				dangerouslySetInnerHTML: {
					__html: message,
				},
			});
		} else {
			return message;
		}
	}
}
