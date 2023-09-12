import { AddTextAreaOptions, InspectorStringWidget } from "../@types/Inspector";
import { LiteGUI } from "../core";
import { Inspector } from "../inspector";

/**
 * Widget to edit strings with multiline support
 * @method AddTextArea
 *
 * @param {Inspector} that
 * @param {string | undefined} name
 * @param {string | undefined} value
 * @param {CreateWidgetOptions | undefined} options, here is a list for that widget (check createWidget for a list of generic options):
 * - focus: true if you want the cursor to be here
 * - password: true if you want to hide the string
 * - immediate: calls the callback once every keystroke
 * - disabled: shows the widget disabled
 * - callback: function to call when the widget changes
 * @return {InspectorStringWidget} the widget in the form of the DOM element that contains it
 *
 */
export function AddTextArea(that:Inspector, name?: string, value?: string, options?: AddTextAreaOptions): InspectorStringWidget
{
	value = value ?? "";
	options = options ?? {};
	const valueName = that.getValueName(name, options);
	that.values.set(valueName!, value);
	
	const isDisabledText = options.disabled?"disabled":"";
	const element = that.createWidget(name,"<span class='inputfield textarea "+
		isDisabledText+"'><textarea tabIndex='"+that.tab_index+"' "+
		isDisabledText+"></textarea></span>", options) as InspectorStringWidget;
	that.tab_index++;
	const textarea = element.querySelector(".wcontent textarea") as HTMLTextAreaElement;
	textarea.value = value;    
	if (options.placeHolder) {textarea.setAttribute("placeHolder",options.placeHolder);}
	textarea.addEventListener(options.immediate ? "keyup" : "change", (e: Event) =>
	{
		that.onWidgetChange.call(that,element,valueName,(e.target as HTMLTextAreaElement)?.value, options!, false, e);
	});
	if (options.callback_keydown)
	{
		textarea.addEventListener("keydown", options.callback_keydown);
	}

	if (options.height)
	{
		textarea.style.height = "calc( " + LiteGUI.sizeToCSS(options.height) + " - 5px )";
	}
	// Textarea.style.height = LiteGUI.sizeToCSS( options.height );
	that.appendWidget(element, options);
	element.setValue = function(result?: string, skip_event?: boolean)
	{
		if (result === undefined || result == textarea.value) {return;}
		value = result;
		textarea.value = result;
		if (!skip_event) {LiteGUI.trigger(textarea,"change");}
	};
	element.getValue = function()
	{
		return textarea.value;
	};
	element.focus = function() { LiteGUI.focus(textarea); };
	element.disable = function() { textarea.disabled = true;};
	element.enable = function() { textarea.disabled = false;};
	that.processElement(element, options);
	return element;
};