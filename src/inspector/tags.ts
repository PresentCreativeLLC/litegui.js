import { AddTagOptions, InspectorTagsWidget, TagElement } from "../@types/Inspector";
import { LiteGUI } from "../core";
import { Inspector } from "../inspector";

/**
 * Widget with an array of buttons that return the name of the button when pressed and remains selected
 * @function AddTags
 *
 * @param {Inspector} that
 * @param {string | undefined} name
 * @param {string[] | undefined} value String array of values
 * @param {AddTagOptions | undefined} options, here is a list for this widget (check createWidget for a list of generic options):
 * - values: a list with all the possible values, it could be an array, or an object, in case of an object, the key is the string to show, the value is the value to assign
 * - disabled: true to disable
 * - callback: function to call once an items is clicked
 * @return {InspectorComboWidget} the widget in the form of the DOM element that contains it
 *
 */
export function AddTags(that:Inspector, name?: string, value?: string[], options?: AddTagOptions)
{
	value = value ?? [];
	options = options ?? {};
	const valueName = that.getValueName(name, options);
	that.values.set(valueName, value);

	let code = "<select>";
	if (options.values)
	{
		for (const i in options.values)
		{
			code += "<option>" + options.values[i] + "</option>";
		}
	}

	code += "</select><div class='wtagscontainer inputfield'></div>";

	const element = that.createWidget(name,"<span class='inputfield full'>"+code+"</span>", options) as InspectorTagsWidget;
	element.tags = {};

	// Add default tags
	if(options.default_tags)
	{
		for (const i in options.default_tags)
		{
			inner_add_tag(options.default_tags[i]);
		}
	}

	// Combo change
	const select_element = element.querySelector(".wcontent select") as HTMLSelectElement;
	select_element.addEventListener("change", (e: any) =>
	{
		inner_add_tag(e.target.value);
	});

	function inner_add_tag(tagname: string)
	{
		if (element.tags[tagname]) {return;} // Avoid repeated tags

		LiteGUI.trigger(element, "wbeforechange", element.tags);

		element.tags[tagname] = true;

		const tag = document.createElement("div") as TagElement;
		tag.data = tagname;
		tag.className = "wtag";
		tag.innerHTML = tagname+"<span class='close'>X</span>";

		tag.querySelector(".close")!.addEventListener("click", (e: any) =>
		{
			const tagname = tag.data;
			delete element.tags[tagname];
			LiteGUI.remove(tag);
			LiteGUI.trigger(element, "wremoved", tagname);
			that.onWidgetChange.call(that,element,valueName,element.tags, options!);
		});

		element.querySelector(".wtagscontainer")!.appendChild(tag);

		that.values.set(valueName, element.tags);
		if (options!.callback) {options!.callback.call(element, element.tags);}
		LiteGUI.trigger(element, "wchange", element.tags);
		LiteGUI.trigger(element, "wadded", tagname);
		if (that.onchange) {that.onchange(valueName, element.tags, element);}
	}

	that.appendWidget(element,options);
	that.processElement(element, options);
	return element;
};