import { LiteGUI } from "../core";
import { Inspector } from "../inspector";
import { AddVectorOptions, InspectorNumberVectorWidget, VectorInput } from "../@types/Inspector";
import { Dragger } from "../dragger";

/**
 * Widget to edit an array of numbers from 2 to 4 (it adds a dragging mini widget in the right side)
 * @method AddVector
 *
 * @param {string | undefined} name
 * @param {number[]} value
 * @param {Object} options, here is a list for that widget (check createWidget for a list of generic options):
 * - callback: function to call once the value changes
 * - disabled: shows the widget disabled
 * - callback: function to call when the string is edited
 * - precision: number of digits after the colon
 * - units: string to show after the number
 * - min: minimum value accepted
 * - max: maximum value accepted
 * - step: increments when dragging the mouse (default is 0.1)
 * @return {HTMLElement} the widget in the form of the DOM element that contains it
 *
 */
export function AddVector(that:Inspector, name: string | undefined, value: number[], options?: AddVectorOptions): InspectorNumberVectorWidget
{
	options = options ?? {};
	const valueName = that.getValueName(name, options);
	that.values.set(valueName, value);

	const element = that.createWidget(name,"", options) as InspectorNumberVectorWidget;
	const initLength = value.length;
	options.step = options.step ?? 0.1;
	options.tab_index = that.tab_index;
	options.fullVector = true;
	if (!options.step) {options.step = 0.1;}
	that.tab_index++;

	const draggers: Dragger[] = element.draggers = [];

	const inner_before_change = function(e: Event)
	{
		if (options!.callback_before) {options!.callback_before(e);}
	};

	for (let i = 0; i < value.length; i++)
	{
		const dragger: Dragger = new LiteGUI.Dragger(value[i], options);
		dragger.root.style.marginLeft = '0';
		dragger.root.style.width = "calc( 25% - 1px )";
		element.querySelector(".wcontent")!.appendChild(dragger.root);
		options.tab_index = that.tab_index;
		that.tab_index++;
		dragger.root.addEventListener("start_dragging", inner_before_change);
		draggers.push(dragger);
	}

	const inputs = element.querySelectorAll("input") as NodeListOf<VectorInput>;
	const onChangeCallback = (e: Event) =>
	{
		// Gather all three parameters
		let r = [];
		for (let j = 0; j < inputs.length; j++)
		{
			r.push(parseFloat(inputs[j].value));
		}

		LiteGUI.trigger(element, "wbeforechange", [r]);

		that.values.set(valueName, r);

		const dragger = (e.target as VectorInput).dragger;
		if (options!.on_change && dragger.dragging)
		{
			const new_val = options!.on_change.call(element, r);

			if (Array.isArray(new_val) && new_val.length >= initLength)
			{
				for (let j = 0; j < inputs.length; j++)
				{
					inputs[j].value = new_val[j].toString();
				}
				r = new_val;
			}
		}
		else if ((options!.on_change || options!.callback) && !dragger.dragging)
		{
			let new_val = undefined;
			if (options!.callback)
			{
				new_val = options!.callback.call(element, r);
			}
			else if (options!.on_change)
			{
				new_val = options!.on_change.call(element, r);
			}

			if (Array.isArray(new_val) && new_val.length >= initLength)
			{
				for (let j = 0; j < inputs.length; j++)
				{
					inputs[j].value = new_val[j].toString();
				}
				r = new_val;
			}
		}

		LiteGUI.trigger(element, "wchange", [r]);
		if (that.onchange) {that.onchange(valueName, r, element);}
	};
	const onStopDragging = function(input: VectorInput)
	{
		LiteGUI.trigger(input, "change");
	};
	for (let i = 0; i < inputs.length; ++i)
	{
		const dragger = draggers[i];
		const input = inputs[i];
		input.dragger = dragger;
		input.addEventListener("change" , onChangeCallback);
		dragger.root.addEventListener("stop_dragging", onStopDragging.bind(undefined, input));
	}

	that.appendWidget(element,options);

	element.setValue = function(value?: (number|string)[], skip_event?: boolean)
	{
		if (value == undefined) {return;}
		for (let i = 0; i < draggers.length; i++)
		{
			draggers[i].setValue(value[i],skip_event ?? i < draggers.length - 1);
		}
	};
	element.setRange = function(min: number, max: number) { for (const i in draggers) { draggers[i].setRange(min,max); } };

	that.processElement(element, options);
	return element;
};