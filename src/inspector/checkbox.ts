import { AddCheckboxOptions, InspectorCheckboxWidget } from "../@types/Inspector";
import { LiteGUI } from "../core";
import { Inspector } from "../inspector";

/**
 * Widget to edit a boolean value using a checkbox
 * @function AddCheckbox
 * 
 * @param {Inspector} that
 * @param {string} name
 * @param {boolean} value
 * @param {Object} options, here is a list for that widget (check createWidget for a list of generic options):
 * - label: text to show, otherwise it shows on/off
 * - label_on: text to show when on
 * - label_off: text to show when off
 * - callback: function to call once the value changes
 * @return {HTMLElement} the widget in the form of the DOM element that contains it
 *
 */
export function AddCheckbox(that:Inspector, name: string, value: boolean, options?: AddCheckboxOptions): InspectorCheckboxWidget
{
	value = value ?? false;
	options = options ?? {};
	const valueName = that.getValueName(name, options);
	that.values.set(valueName, value);

	const label_on = options.label_on ?? options.label ?? "on";
	const label_off = options.label_off ?? options.label ?? "off";
	const label = (value ? label_on : label_off);

	// Var element = that.createWidget(name,"<span class='inputfield'><span class='fixed flag'>"+(value ? "on" : "off")+"</span><span tabIndex='"+that.tab_index+"'class='checkbox "+(value?"on":"")+"'></span></span>", options );
	const element = that.createWidget(name,"<span class='inputfield'><span tabIndex='"
		+that.tab_index+"' class='fixed flag checkbox "+(value ? "on" : "off")+"'>"+label+
		"</span></span>", options) as InspectorCheckboxWidget;
	that.tab_index++;

	const checkbox = element.querySelector(".wcontent .checkbox") as HTMLElement;
	checkbox.addEventListener("keypress", (e: any) =>
	{
		if (e.keyCode == 32) { LiteGUI.trigger(checkbox, "click"); }
	});

	element.addEventListener("click", () =>
	{
		value = !value;
		element.querySelector("span.flag")!.innerHTML = value ? label_on : label_off;
		if (value)
		{
			checkbox.classList.add("on");
		}
		else
		{
			checkbox.classList.remove("on");
		}
		that.onWidgetChange.call(that,element,valueName,value, options!);
	});

	element.getValue = function()
	{
		return value;
	};

	element.setValue = (v?: boolean, skip_event?: boolean)=>
	{
		if (v === undefined) {return;}
		if (value != v)
		{
			value = v;
			that.values.set(valueName, v);
			if (!skip_event)
			{
				LiteGUI.trigger(checkbox, "click");
			}
		}
	};

	that.appendWidget(element,options);
	that.processElement(element, options);
	return element;
};