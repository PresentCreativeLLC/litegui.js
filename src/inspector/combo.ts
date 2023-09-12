import { AddComboOptions, InspectorComboWidget } from "../@types/Inspector";
import { Inspector } from "../inspector";

/**
 * Widget to edit an enumeration using a combobox
 * @function AddCombo
 *
 * @param {Inspector} that
 * @param {string | undefined} name
 * @param {string | undefined} value
 * @param {AddComboOptions | undefined} options, here is a list for this widget (check createWidget for a list of generic options):
 * - values: a list with all the possible values, it could be an array, or an object, in case of an object, the key is the string to show, the value is the value to assign
 * - disabled: true to disable
 * - callback: function to call once an items is clicked
 * @return {InspectorComboWidget} the widget in the form of the DOM element that contains it
 *
 */
export function AddCombo(that:Inspector, name?: string, value?: string, options?: AddComboOptions): InspectorComboWidget
{    
	value = value ?? '';
	options = options ?? {};
	const valueName = that.getValueName(name, options);
	that.values.set(valueName, value);

	that.tab_index++;

	const isDisabledText = options.disabled ? "disabled" : "";
	const element = that.createWidget(name,"<span class='inputfield full inputcombo " +
		isDisabledText + "'></span>", options) as InspectorComboWidget;
	element.options = options;

	let values: string[] = options.values ?? [];

	/*
		*If(!values)
		*	values = [];
		*
		*const index = 0;
		*for(const i in values)
		*{
		*	const item_value = values[i];
		*	const item_index = values.constructor === Array ? index : i;
		*	const item_title = values.constructor === Array ? item_value : i;
		*	if(item_value && item_value.title)
		*		item_title = item_value.title;
		*	code += "<option value='"+item_index+"' "+( item_value == value ? " selected":"")+" data-index='"+item_index+"'>" + item_title + "</option>";
		*	index++;
		*}
		*/

	const code = "<select tabIndex='"+that.tab_index+"' "+isDisabledText+" class='"+isDisabledText+"'></select>";
	element.querySelector("span.inputcombo")!.innerHTML = code;
	setValues(values);

	let stop_event = false; // Used internally

	const select = element.querySelector(".wcontent select") as HTMLSelectElement;
	select.addEventListener("change", (e: Event) =>
	{
		const v = (e.target as HTMLSelectElement).value;
		value = v;
		if (stop_event) {return;}
		that.onWidgetChange.call(that,element,valueName,value, options!);
	});

	element.getValue = function()
	{
		return value;
	};

	element.setValue = function(v: string, skip_event?: boolean)
	{
		value = v;
		const select = element.querySelector("select") as HTMLSelectElement;
		const items = select.querySelectorAll("option");
		const index = values.indexOf(v) ?? -1;
		if (index == -1) {return;}

		stop_event = skip_event ?? false;

		for (const i in items)
		{
			const item = items[i];
			if (!item || !item.dataset) {continue;}
			const setIndex = item.dataset['index'];
			if (setIndex && parseFloat(setIndex) == index)
			{
				item.selected = true;
				select.selectedIndex = index;
			}
			else
			{
				item.removeAttribute("selected");
			}
		}

		stop_event = false;
	};

	function setValues(v: string[], selected?: string)
	{
		values = v;
		if (selected) {value = selected;}
		let code = "";
		for (const i in values)
		{
			code += "<option value='"+i+"' "+(values[i] == value ? " selected":"")+" data-index='"+i+"'>" + values[i] + "</option>";
		}
		element.querySelector("select")!.innerHTML = code;
	}

	element.setOptionValues = setValues;

	that.appendWidget(element,options);
	that.processElement(element, options);
	return element;
};