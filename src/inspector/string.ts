import { AddStringOptions, InspectorStringWidget } from "../@types/Inspector";
import { LiteGUI } from "../core";
import { Inspector } from "../inspector";

/**
 * Widget to edit strings
 * @method AddString
 *
 * @param {Inspector} that
 * @param {string | undefined} name
 * @param {string | undefined} value
 * @param {AddStringOptions | undefined} options, here is a list for that widget (check createWidget for a list of generic options):
 * - focus: true if you want the cursor to be here
 * - password: true if you want to hide the string
 * - immediate: calls the callback once every keystroke
 * - disabled: shows the widget disabled
 * - callback: function to call when the widget changes
 * @return {InspectorStringWidget} the widget in the form of the DOM element that contains it
 *
 */
export function AddString(that:Inspector, name?: string,  value?: string, options?: AddStringOptions) : InspectorStringWidget
{
	value = value ?? '';
	options = options ?? {};
	const valueName = that.getValueName(name, options);
	that.values.set(valueName, value);

	const inputType = options.password ? "password": "text";
	const focus = options.focus ? "autofocus" : "";
	const isDisabledText = options.disabled ? "disabled" : "";

	const element = that.createWidget(name,"<span class='inputfield full "+isDisabledText+
		"'><input type='"+inputType+"' tabIndex='"+that.tab_index+"' "+focus+" class='text string' value='" +
		value+"' "+isDisabledText+"/></span>", options) as InspectorStringWidget;
	const input = element.querySelector(".wcontent input") as HTMLInputElement;

	if (options.placeHolder) {input.setAttribute("placeHolder",options.placeHolder);}

	if (options.align == "right")
	{
		input.style.direction = "rtl";
		// Input.style.textAlign = "right";
	}

	input.addEventListener(options.immediate ? "keyup" : "change", (e: Event) =>
	{
		const target = e.target as HTMLInputElement;
		const value = target.value;
		const r = that.onWidgetChange.call(that, element, valueName, value, options!);
		if (r !== undefined) {input.value = r;}
	});

	if (options.callback_enter)
	{
		input.addEventListener("keydown" , (e: KeyboardEvent) =>
		{
			if (e.key === 'Enter')
			{
				const target = e.target as HTMLInputElement;
				const value = target.value;
				const r = that.onWidgetChange.call(that, element, name!, value, options!);
				if(options!.callback_enter) { options!.callback_enter(); }
				e.preventDefault();
			}
		});
	}

	that.tab_index += 1;

	element.setIcon = function(img: string)
	{
		if (!img)
		{
			input.style.background = "";
			input.style.paddingLeft = "";
		}
		else
		{
			input.style.background = `transparent url('${img}') no-repeat left 4px center`;
			input.style.paddingLeft = "1.7em";
		}
	};
	if (options.icon) {element.setIcon(options.icon);}

	element.setValue = function(value?: string, skip_event?: boolean)
	{
		if (value === undefined || value === input.value) {return;}
		input.value = value;
		if (!skip_event) {LiteGUI.trigger(input, "change");}
	};
	element.getValue = function() { return input.value; };
	element.focus = function() { this.querySelector("input")?.focus(); };
	element.disable = function() { input.disabled = true; };
	element.enable = function() { input.disabled = false; };
	that.appendWidget(element, options);
	that.processElement(element, options);
	return element;
};