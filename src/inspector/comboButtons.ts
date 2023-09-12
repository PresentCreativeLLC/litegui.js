import { AddComboOptions, InspectorComboButtonsWidget } from "../@types/Inspector";
import { LiteGUI } from "../core";
import { Inspector } from "../inspector";

/**
 * Widget with an array of buttons that return the name of the button when pressed and remains selected
 * @function AddComboButtons
 *
 * @param {Inspector} that
 * @param {string | undefined} name
 * @param {string | undefined} value
 * @param {AddComboOptions | undefined} options, here is a list for this widget (check createWidget for a list of generic options):
 * - values: a list with all the possible values, it could be an array, or an object, in case of an object, the key is the string to show, the value is the value to assign
 * - disabled: true to disable
 * - callback: function to call once an items is clicked
 * @return {InspectorComboButtonsWidget} the widget in the form of the DOM element that contains it
 *
 */
export function AddComboButtons(that:Inspector, name?: string, value?: string, options?: AddComboOptions): InspectorComboButtonsWidget
{    
	value = value ?? '';
	options = options ?? {};
	const valueName = that.getValueName(name, options);
	that.values.set(valueName, value);

	let code = "";
	if (options.values)
	{
		for (const i in options.values)
		{
			code += "<button class='wcombobutton "+(value == options.values[i] ? "selected":"")+"' data-name='options.values[i]'>" + options.values[i] + "</button>";
		}
	}

	const element = that.createWidget(name,code, options) as InspectorComboButtonsWidget;
	const buttons = element.querySelectorAll(".wcontent button") as NodeListOf<HTMLButtonElement>;
	element.buttons = buttons;
	LiteGUI.bind(buttons, "click", (e: Event) =>
	{
		const el = e.target as HTMLElement;
		const buttonName = el.innerHTML;
		that.values.set(valueName, buttonName);

		const elements = element.querySelectorAll(".selected");
		for (let i = 0; i < elements.length; ++i)
		{
			elements[i].classList.remove("selected");
		}
		el.classList.add("selected");

		that.onWidgetChange.call(that,element,valueName,buttonName, options!);
	});

	that.appendWidget(element,options);
	that.processElement(element, options);
	return element;
};
