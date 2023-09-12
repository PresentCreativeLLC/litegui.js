import { AddSliderOptions, InspectorSliderWidget } from "../@types/Inspector";
import { LiteGUI } from "../core";
import { Inspector } from "../inspector";

/**
 * Widget to edit a number using a slider
 * @method AddSlider
 * 
 * @param {Inspector} that
 * @param {string | undefined} name
 * @param {number | undefined} value
 * @param {Object | undefined} options, here is a list for that widget (check createWidget for a list of generic options):
 * - min: min value
 * - max: max value
 * - step: increments when dragging
 * - callback: function to call once the value changes
 * @return {InspectorSliderWidget} the widget in the form of the DOM element that contains it
 *
 */
export function AddSlider(that:Inspector, name?: string, value?: number, options?: AddSliderOptions): InspectorSliderWidget
{
	value = value ?? 0;
	options = options ?? {};
	options.min = options.min ?? 0;
	options.max = options.max ?? 1;
	options.step = options.step || 0.01;
	const valueName = that.getValueName(name, options);
	that.values.set(valueName, value);

	const element = that.createWidget(name,
		"<span class='inputfield full'>\n<input tabIndex='" + that.tab_index +
		"' type='text' class='slider-text fixed liteslider-value' value='' /><span class='slider-container'></span></span>",
		options) as InspectorSliderWidget;

	const slider_container = element.querySelector(".slider-container") as HTMLElement;

	const slider = new LiteGUI.Slider(value,options);
	element.slider = slider;
	slider_container.appendChild(slider.root);

	// Text change -> update slider
	const skip_change = false; // Used to avoid recursive loops
	const text_input = element.querySelector(".slider-text") as HTMLInputElement;
	text_input.value = value.toString();
	text_input.addEventListener('change', () =>
	{
		if (skip_change) {return;}
		const v = parseFloat(text_input.value);
		value = v;
		slider.setValue(v);
		that.onWidgetChange.call(that,element,valueName,v, options!);
	});

	// Slider change -> update Text
	slider.onChange = (value: number) =>
	{
		text_input.value = value.toString();
		that.onWidgetChange.call(that, element, valueName, value, options!);
	};

	that.appendWidget(element, options);

	element.setValue = function(v?: number, skip_event?: boolean)
	{
		if (v === undefined) {return;}
		value = v;
		slider.setValue(v,skip_event);
	};
	element.getValue = function()
	{
		return value;
	};

	that.processElement(element, options);
	return element;
};