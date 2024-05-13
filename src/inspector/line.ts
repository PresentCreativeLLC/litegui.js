import { LineEditorOptions } from "../@types/globals";
import { LiteGUI } from "../core";
import { Inspector } from "../inspector";
import { LineEditor } from "../widgets";

/**
 * Adds a file input widget to the inspector with the specified name, value, and options.
 * @function AddLine
 *
 * @param {string} name - The name of the line widget.
 * @param {number[][]} value - The initial value of the file input widget.
 * @param {LineEditorOptions} [options] - The options for the file input widget.
 * @returns The created file input widget element.
 */
export function AddLine(that:Inspector, name: string, value: number[][], options: LineEditorOptions)
{
	that.values.set(name, value);

	const element = that.createWidget(name,"<span class='line-editor'></span>", options);
	element.style.width = "100%";

	const line_editor:LineEditor = new LiteGUI.LineEditor(value, options);
	element.querySelector("span.line-editor").appendChild(line_editor);

	LiteGUI.bind(line_editor, "change", (e: any) =>
	{
		LiteGUI.trigger(element, "wbeforechange",[e.target.value]);
		if (options.callback) {options.callback.call(element,e.target.value);}
		LiteGUI.trigger(element, "wchange",[e.target.value]);
		that.onWidgetChange.call(that,element,name,e.target.value, options, null, null);
	});

	that.appendWidget(element, options);
	return element;
};