import { AddColorOptions, ColorInput } from "../@types/Inspector";
import { LiteGUI } from "../core";
import { Inspector } from "../inspector";
import { jscolor } from "../jscolor";

/**
 * Creates a color picker widget with optional dragger and RGB display.
 * @function AddColorPosition
 *
 * @param {Inspector} that - The Inspector instance.
 * @param {string} name - The name of the color picker.
 * @param {Array<number>} [value=[0.0,0.0,0.0]] - The initial RGB value of the color picker.
 * @param {addColorOptions} [options] - Additional options for the color picker.
 * @returns The created color picker element.
 */
export function AddColorPosition(that:Inspector, name: string, value?: [number, number, number], options?: AddColorOptions)
{    
	value = value ?? [0.0,0.0,0.0];
	options = options ?? {};
	that.values.set(name, value);

	let code = "<input tabIndex='"+that.tab_index+"' id='colorpicker-"+name+"' class='color' value='"+
		(value[0]+","+value[1]+","+value[2])+"' "+(options.disabled?"disabled":"")+"/>";
	that.tab_index++;

	if (options.show_rgb) {code += "<span class='rgb-color'>"+Inspector.parseColor(value)+"</span>";}
	const element = that.createWidget(name,code, options);
	that.appendWidget(element,options); // Add now or jscolor doesn't work

	// Create jsColor
	const input_element = element.querySelector("input.color") as ColorInput;
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
		myColor.position = options.position || 0;

		if (options.disabled)
		{myColor.pickerOnfocus = false;} // This doesnt work

		if (value.length > 2)
		{
			myColor.fromRGB(value[0],value[1],value[2]);
		}

		// Update values in rgb format
		input_element.addEventListener("change", () =>
		{
			const rgbElement = element.querySelector(".rgb-color");
			if (rgbElement) {rgbElement.innerHTML = LiteGUI.Inspector.parseColor(myColor.rgb);}
		});
		input_element.addEventListener("focusin", () =>
		{
			input_element.focused = true;
		});
		input_element.addEventListener("focusout", () =>
		{
			input_element.focused = false;
			if (options!.callback)
			{
				options!.callback.call(element, myColor.position, "#" + myColor.toString(), myColor);
			}
			else if (options!.on_change)
			{
				options!.on_change.call(element, myColor.position, "#" + myColor.toString(), myColor);
			}
		});

		if (options.add_dragger)
		{
			myColor.onImmediateChange = function(dragging: boolean)
			{
				const v: [number, number, number] = [ myColor.rgb[0], myColor.rgb[1], myColor.rgb[2] ];
				// Inspector.onWidgetChange.call(that,element,name,v, options);
				const event_data = [v.concat(), myColor.toString()];
				LiteGUI.trigger(element, "wbeforechange", event_data);
				this.values.set(name, v);
				if (options!.on_change && dragging)
				{
					options!.on_change.call(element, myColor.position, "#" + myColor.toString(), myColor);
				}
				else if ((options!.on_change || options!.callback) && !dragging)
				{
					if (options!.callback)
					{
						options!.callback.call(element, myColor.position, "#" + myColor.toString(), myColor);
					}
					else if (options!.on_change)
					{
						options!.on_change.call(element, myColor.position, "#" + myColor.toString(), myColor);
					}
				}
				LiteGUI.trigger(element, "wchange", event_data);
				if (that.onchange) {that.onchange(name, v.concat(), element);}
			};

			// Alpha dragger
			options.step = options.step || 0.01;
			options.dragger_class = "nano";

			const dragger = new LiteGUI.Dragger(myColor.position, options);
			const content =  element.querySelector('.wcontent') as HTMLElement;
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
				myColor.position = v;
				callOnInmediateChange(dragger.dragging);
			});

			element.setValue = function(value: [number, number, number], skip_event?: boolean)
			{
				myColor.fromRGB(value[0],value[1],value[2]);
				if (!skip_event) {LiteGUI.trigger(dragger.input, "change");}
			};
		}
		else
		{
			myColor.onImmediateChange = () =>
			{
				const v = [ myColor.rgb[0] * myColor.rgb_intensity, myColor.rgb[1] * myColor.rgb_intensity, myColor.rgb[2] * myColor.rgb_intensity ];
				// Inspector.onWidgetChange.call(that,element,name,v, options);
				const event_data = [v.concat(), myColor.toString()];
				LiteGUI.trigger(element, "wbeforechange", event_data);
				that.values.set(name, v);
				if (options!.on_change) {options!.on_change.call(element, v.concat(), "#" + myColor.toString(), myColor);}LiteGUI.trigger(element, "wchange", event_data);
				if (that.onchange) {that.onchange(name, v.concat(), element);}
			};
			element.setValue = function(value: [number, number, number])
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
			const rgbElement = element.querySelector(".rgb-color");
			if (rgbElement) {rgbElement.innerHTML = LiteGUI.Inspector.parseColor(myColor.rgb);}
		});
	}

	that.processElement(element, options);
	return element;
};