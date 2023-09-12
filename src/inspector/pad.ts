import { LiteGUI } from "../core";
import { Inspector } from "../inspector";
import { AddPadOptions, InspectorPadWidget } from "../@types/Inspector";

/**
 * Widget to edit two numbers using a rectangular pad where you can drag horizontally and vertically a handler
 * @method addPad
 *
 * @param {string | undefined} name
 * @param {[number, number] | undefined} value
 * @param {addPadOptions | undefined} options, here is a list for that widget (check createWidget for a list of generic options):
 * - callback: function to call once the value changes
 * - disabled: shows the widget disabled
 * - callback: function to call when the string is edited
 * - precision: number of digits after the colon
 * - units: string to show after the number
 * - min: minimum value accepted
 * - minX: minimum x value accepted
 * - minY: minimum y value accepted
 * - max: maximum value accepted
 * - maxX: maximum x value accepted
 * - maxY: maximum y value accepted
 * - step: increments when dragging the mouse (default is 0.1)
 * - background: url of image to use as background (it will be stretched)
 * @return {InspectorPadWidget} the widget in the form of the DOM element that contains it
 *
 */
export function AddPad(that:Inspector, name?: string, value?: [number, number], options?: AddPadOptions): InspectorPadWidget
{
	value = value ?? [0,0];
	options = options ?? {};
	const valueName = that.getValueName(name, options);
	that.values.set(valueName, value);

	const element = that.createWidget(name,"", options) as InspectorPadWidget;

	options.step = options.step || 0.1;
	options.tab_index = that.tab_index;
	options.full = true;
	that.tab_index++;

	const min_x = options.min_x ?? options.min ?? 0;
	const min_y = options.min_y ?? options.min ?? 0;
	const max_x = options.max_x ?? options.max ?? 1;
	const max_y = options.max_y ?? options.max ?? 1;

	const wcontent = element.querySelector(".wcontent") as HTMLElement;

	const pad = document.createElement("div") as HTMLDivElement;
	pad.className = "litepad";
	wcontent.appendChild(pad);
	pad.style.width = "100%";
	pad.style.height = "100px";
	if (options.background)
	{
		pad.style.backgroundImage = "url('" + options.background + "')";
		pad.style.backgroundSize = "100%";
		pad.style.backgroundRepeat = "no-repeat";
	}

	const handler = document.createElement("div");
	handler.className = "litepad-handler";
	pad.appendChild(handler);

	options.tab_index = that.tab_index;
	that.tab_index++;

	let dragging = false;

	function mouseDown(e: MouseEvent)
	{
		e.preventDefault();
		e.stopPropagation();

		document.body.addEventListener("mousemove", mouseMove);
		document.body.addEventListener("mouseup", mouseUp);
		dragging = true;
	}

	function mouseMove(e: MouseEvent)
	{
		const b = pad.getBoundingClientRect();
		
		const mouse_x = e.pageX - b.left;
		const mouse_y = e.pageY - b.top;
		e.preventDefault();
		e.stopPropagation();

		let x = mouse_x / (b.width);
		let y = mouse_y / (b.height);

		x = x * (max_x - min_x) + min_x;
		y = y * (max_y - min_y) + min_x;

		const r = [x,y] as [number,number];

		LiteGUI.trigger(element, "wbeforechange", [r]);
		element.setValue(r);

		if (options!.callback)
		{
			const new_val = options!.callback.call(element, r);
			if (new_val && new_val.length >= 2)
			{
				element.setValue(new_val);
			}
		}

		LiteGUI.trigger(element, "wchange",[r]);
		if (that.onchange) {that.onchange(valueName,r,element);}
	}

	function mouseUp(e: MouseEvent)
	{
		e.preventDefault();
		e.stopPropagation();

		dragging = false;
		document.body.removeEventListener("mousemove", mouseMove);
		document.body.removeEventListener("mouseup", mouseUp);
	}

	pad.addEventListener("mousedown", mouseDown);

	element.setValue = function(value?: [number, number])
	{
		if (value == undefined) {return;}

		const b = pad.getBoundingClientRect();
		let x = (value[0] - min_x) / (max_x - min_x);
		let y = (value[1] - min_y) / (max_y - min_y);
		x = Math.max(0, Math.min(x, 1)); // Clamp
		y = Math.max(0, Math.min(y, 1));

		const w = ((b.width - 10) / b.width) * 100;
		const h = ((b.height - 10) / b.height) * 100;
		handler.style.left = (x * w).toFixed(1) + "%";
		handler.style.top = (y * h).toFixed(1) + "%";
	};

	that.appendWidget(element,options);    
	element.setValue(value);    
	that.processElement(element, options);

	return element;
};
    