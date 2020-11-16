import React from "react";
import MarkdownUtils from "./../../src/js/vendor/utils/MarkdownUtils";

describe("MarkdownUtils", () => {
	test("should parse an string without URLs", () => {
		expect(MarkdownUtils.parseURL("start inner end", "span", "className", "linkClass")).toEqual(
            <span className={ "className" } dangerouslySetInnerHTML={ { __html: "start inner end" } } />
        );
	});

	test("should parse a string with one URL", () => {
		expect(MarkdownUtils.parseURL("start [inner](link) end", "span", "className", "linkClass")).toEqual(
            <span className={ "className" } dangerouslySetInnerHTML={ { __html: "start <a href=\"link\" target=\"_blank\" class=\"linkClass\">inner</a> end" } } />
        );
		expect(MarkdownUtils.parseURL("start ([inner](link)) end", "span", "className", "linkClass")).toEqual(
            <span className={ "className" } dangerouslySetInnerHTML={ { __html: "start (<a href=\"link\" target=\"_blank\" class=\"linkClass\">inner</a>) end" } } />
        );
	});

	test("should parse a string with two URLs", () => {
		expect(MarkdownUtils.parseURL("start [inner](link)[inner2](link2) end", "span", "className", "linkClass")).toEqual(
            <span className={ "className" } dangerouslySetInnerHTML={ { __html: "start <a href=\"link\" target=\"_blank\" class=\"linkClass\">inner</a><a href=\"link2\" target=\"_blank\" class=\"linkClass\">inner2</a> end" } } />
        );
		expect(MarkdownUtils.parseURL("start [inner](link) or [inner2](link2) end", "span", "className", "linkClass")).toEqual(
            <span className={ "className" } dangerouslySetInnerHTML={ { __html: "start <a href=\"link\" target=\"_blank\" class=\"linkClass\">inner</a> or <a href=\"link2\" target=\"_blank\" class=\"linkClass\">inner2</a> end" } } />
        );
	});

	test("should parse a list", () => {
		expect(MarkdownUtils.parseList("* One\n* Two", "ulClass", "liClass")).toEqual(
            <ul className={ "ulClass" } dangerouslySetInnerHTML={ { __html: "<li><p class=\"liClass\">One</p></li>\n<li><p class=\"liClass\">Two</p></li>" } } />
        );
		expect(MarkdownUtils.parseList(". One\n. Two", "ulClass", "liClass")).toEqual(
            <ul className={ "ulClass" } dangerouslySetInnerHTML={ { __html: "<li><p class=\"liClass\">One</p></li>\n<li><p class=\"liClass\">Two</p></li>" } } />
        );
	});

	test("should parse bolds and italics", () => {
		const message = "A **bold1** and *italic1* and **bold2** and *italic2* and *italic3* elements";
		const messageResult = "A <strong>bold1</strong> and <em>italic1</em> and <strong>bold2</strong> and <em>italic2</em> and <em>italic3</em> elements";
		expect(MarkdownUtils.parseBoldAndItalic(message, false, "elementClass", "span")).toEqual(messageResult);
		expect(MarkdownUtils.parseBoldAndItalic(message, true, "elementClass", "span")).toEqual(
            <span className={ "elementClass" } dangerouslySetInnerHTML={ { __html: messageResult } } />
        );
	});
});
