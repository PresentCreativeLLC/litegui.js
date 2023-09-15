import { AddColorOptions, ColorInput, InspectorWidget } from "../@types/Inspector";
import { LiteGUI } from "../core";
import { Inspector } from "../inspector";
import { jscolor } from "../jscolor";

/**
 * Adds a color input widget to the Inspector.
 *
 * @param {Inspector} that - The Inspector instance.
 * @param {string} name - The name of the color input.
 * @param {number[]} [value=[0.0, 0.0, 0.0]] - The initial RGB value of the color input.
 * @param {AddColorOptions} [options] - Additional options for the color input.
 * @returns {InspectorWidget} The created color input widget.
 */
export function AddColor(that:Inspector, name: string, value?: [number, number, number], options?: AddColorOptions)
{
	value = value ?? [0.0,0.0,0.0];
	that.values.set(name, value);
	const processedOptions = that.processOptions(options) as AddColorOptions;

	let code = "<input tabIndex='"+that.tab_index+"' id='colorpicker-"+name+"' class='color' value='"+(value[0]+","+value[1]+","+value[2])+"' "+(processedOptions.disabled?"disabled":"")+"/>";
	that.tab_index++;

	if (processedOptions.show_rgb) {code += "<span class='rgb-color'>"+Inspector.parseColor(value)+"</span>";}
	const element = that.createWidget(name,code, processedOptions) as InspectorWidget;
	that.appendWidget(element,processedOptions); // Add now or jscolor dont work

	// Create jsColor
	const input_element = element.querySelector("input.color") as ColorInput;
	window.jscolor = jscolor;
	let myColor: any = null;
	if (window.jscolor)
	{
		/*
		 * SHOWS CONTEXTUAL MENU
		 * block focusing
		 */
		/*
		 *Input_element.addEventListener("contextmenu", function(e) {
		 *	if(e.button != 2) //right button
		 *		return false;
		 *	//create the context menu
		 *	var contextmenu = new LiteGUI.ContextMenu( ["Copy in HEX","Copy in RGBA"], { event: e, callback: inner_action });
		 *	e.preventDefault();
		 *	e.stopPropagation();
		 *
		 *	input_element.addEventListener("focus", block_focus , true);
		 *	setTimeout(function(){ input_element.removeEventListener("focus", block_focus , true);},1000);
		 *
		 *	return false;
		 *},true);
		 *
		 *function block_focus(e)
		 *{
		 *	e.stopPropagation();
		 *	e.stopImmediatePropagation();
		 *	e.preventDefault();
		 *	return false;
		 *}
		 *
		 *function inner_action(v)
		 *{
		 *	if(v == "Copy in HEX")
		 *	{
		 *		LiteGUI.toClipboard( "in HEX");
		 *	}
		 *	else
		 *	{
		 *		LiteGUI.toClipboard( "in RGB");
		 *	}
		 *}
		 */

		myColor = new jscolor.color(input_element);
		myColor.pickerFaceColor = "#333";
		myColor.pickerBorderColor = "black";
		myColor.pickerInsetColor = "#222";
		let rgb_intensity = 1.0;

		if (processedOptions.disabled)
		{myColor.pickerOnfocus = false;} // This doesnt work

		if (value.length > 2)
		{
			const intensity = 1.0;
			myColor.fromRGB(value[0]*intensity, value[1]*intensity, value[2]*intensity);
			rgb_intensity = intensity;
		}

		// Update values in rgb format
		input_element.addEventListener("change", () =>
		{
			const rgbelement = element.querySelector(".rgb-color");
			if (rgbelement)
			{rgbelement.innerHTML = LiteGUI.Inspector.parseColor(myColor.rgb);}
		});
		input_element.addEventListener("focusin", () =>
		{
			input_element.focused = true;
		});
		input_element.addEventListener("focusout", () =>
		{
			input_element.focused = false;
			const v = [ myColor.rgb[0] * rgb_intensity, myColor.rgb[1] * rgb_intensity,
				myColor.rgb[2] * rgb_intensity ];
			if (processedOptions.callback)
			{
				processedOptions.callback.call(element, v.concat(), "#" + myColor.toString(), myColor);
			}
			else if (processedOptions.on_change)
			{
				processedOptions.on_change.call(element, v.concat(), "#" + myColor.toString(), myColor);
			}
		});

		if (processedOptions.add_dragger)
		{
			myColor.onImmediateChange = (dragging: boolean) =>
			{
				const v = [ myColor.rgb[0] * rgb_intensity, myColor.rgb[1] * rgb_intensity,
					myColor.rgb[2] * rgb_intensity ];
				// Inspector.onWidgetChange.call(that,element,name,v, options);
				const event_data = [v.concat(), myColor.toString()];
				LiteGUI.trigger(element, "wbeforechange", event_data);
				that.values.set(name, v);
				if (processedOptions.on_change && dragging)
				{
					processedOptions.on_change.call(element, v.concat(), "#" + myColor.toString(), myColor);
				}
				else if ((processedOptions.on_change || processedOptions.callback) && !dragging)
				{
					if (processedOptions.callback)
					{
						processedOptions.callback.call(element, v.concat(), "#" + myColor.toString(), myColor);
					}
					else if (processedOptions.on_change)
					{
						processedOptions.on_change.call(element, v.concat(), "#" + myColor.toString(), myColor);
					}
				}
				LiteGUI.trigger(element, "wchange", event_data);
				if (that.onchange) {that.onchange(name, v.concat(), element);}
			};

			// Alpha dragger
			processedOptions.step = processedOptions.step || 0.01;
			processedOptions.dragger_class = "nano";

			const dragger = new LiteGUI.Dragger(1, processedOptions);
			const content = element.querySelector('.wcontent') as HTMLElement;
			content.appendChild(dragger.root);
			const callOnInmediateChange = function(dragging: boolean)
			{
				if (myColor.onImmediateChange) {myColor.onImmediateChange(dragging);}
			};
			const callOnStopDragging = function()
			{
				if (!input_element.focused)
				{
					callOnInmediateChange(false);
				}
			};
			dragger.root.addEventListener("stop_dragging", callOnStopDragging);
			dragger.input.addEventListener("change", () =>
			{
				const v = parseFloat(dragger.input.value);
				rgb_intensity = v;
				callOnInmediateChange(dragger.dragging);
			});

			element.setValue = function(value: number[], skip_event?: boolean)
			{
				myColor.fromRGB(value[0],value[1],value[2]);
				if (!skip_event) {LiteGUI.trigger(dragger.input, "change");}
			};
		}
		else
		{
			myColor.onImmediateChange = () =>
			{
				const v = [ myColor.rgb[0] * rgb_intensity, myColor.rgb[1] *
					rgb_intensity, myColor.rgb[2] * rgb_intensity ];
				// Inspector.onWidgetChange.call(that,element,name,v, options);
				const event_data = [v.concat(), myColor.toString()];
				LiteGUI.trigger(element, "wbeforechange", event_data);
				that.values.set(name, v);
				if (processedOptions.on_change)
				{
					processedOptions.on_change.call(element, v.concat(), "#" + myColor.toString(), myColor);
				}
				LiteGUI.trigger(element, "wchange", event_data);
				if (that.onchange) {that.onchange(name, v.concat(), element);}
			};
			element.setValue = function(value: number[])
			{
				myColor.fromRGB(value[0],value[1],value[2]);
			};
		}

		element.getValue = function()
		{
			return value;
		};
	}
	else
	{
		input_element.addEventListener("change", () =>
		{
			const rgbelement = element.querySelector(".rgb-color");
			if (rgbelement) {rgbelement.innerHTML = LiteGUI.Inspector.parseColor(myColor.rgb);}
		});
	}

	that.processElement(element, processedOptions);
	return element;
};