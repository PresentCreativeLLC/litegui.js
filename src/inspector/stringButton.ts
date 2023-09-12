import { AddStringButtonOptions, InspectorStringWidget } from "../@types/Inspector";
import { LiteGUI } from "../core";
import { Inspector } from "../inspector";

/**
 * Widget to edit strings, but it adds a button behind (useful to search values somewhere in case the user do not remember the name)
 * @method AddStringButton
 *
 * @param {Inspector} that
 * @param {string | undefined} name the name of the field
 * @param {string | undefined} value the string to show
 * @param {AddStringButtonOptions | undefined} options, here is a list for that widget (check createWidget for a list of generic options):
 * - disabled: shows the widget disabled
 * - button: string to show inside the button, default is "..."
 * - callback: function to call when the string is edited
 * - callback_button: function to call when the button is pressed
 * @return {InspectorStringWidget} the widget in the form of the DOM element that contains it
 *
 */
export function AddStringButton(that:Inspector, name?: string, value?: string, options?: AddStringButtonOptions) : InspectorStringWidget
{
	value = value ?? '';
	options = options ?? {};
	const valueName = that.getValueName(name, options);
	that.values.set(valueName!, value);

	const element = that.createWidget(name,
		"<span class='inputfield button'><input type='text' tabIndex='" + that.tab_index +
		"' class='text string' value='' "+(options.disabled?"disabled":"") +
		"/></span><button class='micro'>"+(options.button ?? "...")+"</button>", options) as InspectorStringWidget;
	const input = element.querySelector(".wcontent input") as HTMLInputElement;
	input.value = value;
	input.addEventListener("change", (e: Event) =>
	{
		const r = that.onWidgetChange.call(that,element,valueName,(e.target as HTMLInputElement)!.value, options!);
		if (r !== undefined) { input.value = r; }
	});

	if (options.disabled) {input.setAttribute("disabled","disabled");}

	element.setIcon = function(img: string)
	{
		if (!img)
		{
			input.style.background = "";
			input.style.paddingLeft = "";
		}
		else
		{
			input.style.background = "transparent url('"+img+"') no-repeat left 4px center";
			input.style.paddingLeft = "1.7em";
		}
	};
	if (options.icon) {element.setIcon(options.icon);}

	const button = element.querySelector(".wcontent button") as HTMLInputElement;
	button.addEventListener("click", (e: Event) =>
	{
		if (options!.callback_button) {options!.callback_button.call(element, input.value, e);}
	});

	if (options.button_width)
	{
		button.style.width = LiteGUI.sizeToCSS(options.button_width) ?? '0px';
		const inputField = element.querySelector(".inputfield") as HTMLInputElement;
		inputField.style.width = "calc( 100% - " + button.style.width + " - 6px)";
	}


	that.tab_index += 1;
	that.appendWidget(element,options);
	element.setValue = function(value?: string, skip_event?: boolean)
	{
		if (value === undefined || value === input.value) {return;}
		input.value = value;
		if (!skip_event) {LiteGUI.trigger(input, "change");}
	};
	element.disable = function() { input.disabled = true; button.disabled = true; };
	element.enable = function() { input.disabled = false; button.disabled = false; };
	element.getValue = function() { return input.value; };
	element.focus = function() { LiteGUI.focus(input); };
	that.processElement(element, options);
	return element;
};