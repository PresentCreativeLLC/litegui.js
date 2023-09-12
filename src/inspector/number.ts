import { LiteGUI } from "../core";
import { Inspector } from "../inspector";
import { AddNumberOptions, InspectorNumberWidget } from "../@types/Inspector";

/**
 * Widget to edit numbers (it adds a dragging mini widget in the right side)
 * @method AddNumber
 *
 * @param {Inspector} that
 * @param {string | undefined} name
 * @param {number | undefined} value
 * @param {AddNumberOptions | undefined} options, here is a list for this widget (check createWidget for a list of generic options):
 * - disabled: shows the widget disabled
 * - callback: function to call when the string is edited
 * - precision: number of digits after the colon
 * - units: string to show after the number
 * - min: minimum value accepted
 * - max: maximum value accepted
 * - step: increments when dragging the mouse (default is 0.1)
 * @return {InspectorNumberWidget} the widget in the form of the DOM element that contains it
 *
 */
export function AddNumber(that:Inspector, name?: string, value?: number, options?: AddNumberOptions): InspectorNumberWidget
{
	value = value ?? 0;
	options = options ?? {};
	const valueName = that.getValueName(name, options);
	that.values.set(valueName, value);

	const element = that.createWidget(name,"", options) as InspectorNumberWidget;
	that.appendWidget(element, options);

	options.extra_class = "full";
	options.tab_index = that.tab_index;
	// Options.dragger_class = "full";
	options.full_num = true;
	options.precision = options.precision !== undefined ? options.precision : 2;
	options.step = options.step === undefined ? (options.precision == 0 ? 1 : 0.1) : options.step;

	that.tab_index++;

	const dragger = new LiteGUI.Dragger(value, options);
	dragger.root.style.width = "calc( 100% - 1px )";
	element.querySelector(".wcontent")!.appendChild(dragger.root);

	const inner_before_change = function(options: AddNumberOptions)
	{
		if (options.callback_before) {options.callback_before.call(element);}
	};
	dragger.root.addEventListener("start_dragging", inner_before_change.bind(undefined,options));
	element.dragger = dragger;

	if (options.disabled) {dragger.input.setAttribute("disabled","disabled");}

	const input = element.querySelector("input") as HTMLInputElement;    
	input.addEventListener("change", (e: Event) =>
	{
		const el = e.target as HTMLInputElement;
		LiteGUI.trigger(element, "wbeforechange", el.value);

		that.values.set(valueName, el.value);
		if(options == undefined || typeof(options) == "function") { return; }
		if (options.on_change && dragger.dragging)
		{
			const ret = options.on_change.call(element, parseFloat(el.value));
			if (typeof(ret) == "number") { el.value = ret.toString(); }
		}
		else if ((options.on_change || options.callback) && !dragger.dragging)
		{
			let ret = undefined;
			if (options.callback)
			{
				ret = options.callback.call(element, parseFloat(el.value));
			}
			else if (options.on_change)
			{
				ret = options.on_change.call(element, parseFloat(el.value));
			}
			if (typeof(ret) == "number") {el.value = ret.toString();}
		}
		LiteGUI.trigger(element, "wchange", el.value);
		if (that.onchange) {that.onchange(valueName,el.value,element);}
	});

	dragger.root.addEventListener("stop_dragging", (e: any) =>
	{
		LiteGUI.trigger(input, "change");
	});

	element.setValue = function(value?: number | string, skip_event?: boolean)
	{
		if(options == undefined || typeof options == "function") { return; }
		if (value === undefined) {return;}
		if (typeof value == 'string') {value = parseFloat(value as string);}
		if (options.precision) {value = value.toFixed(options.precision);}
		value = value.toString();
		value += options.units ?? '';
		if (input.value == value) {return;}
		input.value = value;
		if (!skip_event) {LiteGUI.trigger(input,"change");}
	};

	element.setRange = function(min: number, max: number) { dragger.setRange(min,max); };
	element.getValue = function() { return parseFloat(input.value); };
	element.focus = function() { LiteGUI.focus(input); };
	element.disable = function() { input.disabled = true;};
	element.enable = function() { input.disabled = false;};
	that.processElement(element, options);
	return element;
};