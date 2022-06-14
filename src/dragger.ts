import { HTMLDivElementPlus } from "./@types/globals";
import { LiteGUI } from "./core";

/** *** DRAGGER **********/
export class Dragger
{
	value : number;
	root : HTMLDivElementPlus;
	options : any;
	input : HTMLInputElement;
	dragging : boolean = false;

	constructor(v : number, options : any)
	{
		let value = v;
		if (value === null || value === undefined)
		{
			value = 0;
		}
		else if (value.constructor === String)
		{
			value = parseFloat(value);
		}
		else if (value.constructor !== Number)
		{
			value = 0;
		}

		this.value = value;
		const that = this;
		const precision = options.precision != undefined ? options.precision : 3; // Num decimals

		this.options = options || {};
		const element = document.createElement("div") as any;
		element.className = "dragger " + (options.extraclass ? options.extraclass : "");
		this.root = element;

		const wrap = document.createElement("span");
		wrap.className = "inputfield " + (options.extraclass ? options.extraclass : "") + (options.full ? " full" : "");
		if (options.disabled)
		{wrap.className += " disabled";}
		element.appendChild(wrap);

		const dragger_class = options.dragger_class || "full";

		const input = document.createElement("input");
		input.className = "text number " + (dragger_class ? dragger_class : "");
		input.value = value.toFixed(precision) + (options.units ? options.units : "");
		input.tabIndex = options.tab_index;
		this.input = input;
		element.input = input;

		if (options.disabled)
		{input.disabled = true;}
		if (options.tab_index)
		{input.tabIndex = options.tab_index;}
		wrap.appendChild(input);

		input.addEventListener("keydown",(e) =>
		{
			const keyCode = e.key || e.keyCode;
			if (keyCode == 38)
			{
				inner_inc(1,e);
			}
			else if (keyCode == 40)
			{
				inner_inc(-1,e);
			}
			else
			{
				return;
			}
			e.stopPropagation();
			e.preventDefault();
			return true;
		});

		const dragger = document.createElement("div") as any;
		dragger.className = "drag_widget";
		if (options.disabled)
		{dragger.className += " disabled";}

		wrap.appendChild(dragger);
		element.dragger = dragger;

		dragger.addEventListener("mousedown",inner_down);

		const inner_wheel = function(e : any)
		{
			if (document.activeElement !== input) {return;}
			const delta = e.wheelDelta !== undefined ? e.wheelDelta : (e.deltaY ? -e.deltaY/3 : 0);
			inner_inc(delta > 0 ? 1 : -1, e);
			e.stopPropagation();
			e.preventDefault();
		};
		input.addEventListener("wheel",inner_wheel.bind(input),false);
		input.addEventListener("mousewheel",inner_wheel.bind(input),false);

		let doc_binded : any = null;

		function inner_down(e : any)
		{
			doc_binded = input.ownerDocument;

			doc_binded.removeEventListener("mousemove", inner_move);
			doc_binded.removeEventListener("mouseup", inner_up);

			if (!options.disabled)
			{
				if (element.requestPointerLock)
				{element.requestPointerLock();}
				doc_binded.addEventListener("mousemove", inner_move);
				doc_binded.addEventListener("mouseup", inner_up);

				dragger.data = [e.screenX, e.screenY];

				that.dragging = true;
				LiteGUI.trigger(element,"start_dragging");
			}

			e.stopPropagation();
			e.preventDefault();
		}

		function inner_move(e : any)
		{
			const deltax = e.screenX - dragger.data[0];
			const deltay = dragger.data[1] - e.screenY;
			let diff = [ deltax, deltay ];
			if (e.movementX !== undefined)
			{diff = [e.movementX, -e.movementY];}
			// Console.log(e);
			dragger.data = [e.screenX, e.screenY];
			const axis = options.horizontal ? 0 : 1;
			inner_inc(diff[axis], e);

			e.stopPropagation();
			e.preventDefault();
			return false;
		}

		function inner_up(e : any)
		{
			that.dragging = false;
			LiteGUI.trigger(element, "stop_dragging");
			const doc = doc_binded || document;
			doc_binded = null;
			doc.removeEventListener("mousemove", inner_move);
			doc.removeEventListener("mouseup", inner_up);
			if (doc.exitPointerLock)
			{doc.exitPointerLock();}
			LiteGUI.trigger(dragger,"blur");
			e.stopPropagation();
			e.preventDefault();
			return false;
		}

		function inner_inc(v : number, e : any)
		{
			let value = v;
			if (!options.linear)
			{
				value = value > 0 ? Math.pow(value,1.2) : Math.pow(Math.abs(value), 1.2) * -1;
			}
			let scale = (options.step ? options.step : 1.0);
			if (e && e.shiftKey)
			{
				scale *= 10;
			}
			else if (e && e.ctrlKey)
			{
				scale *= 0.1;
			}
			let result = parseFloat(input.value) + value * scale;
			if (options.max != null && result > options.max)
			{
				result = options.max;
			}
			if (options.min != null && result < options.min)
			{
				result = options.min;
			}

			input.value = result.toFixed(precision);
			if (options.units) {input.value += options.units;}
			LiteGUI.trigger(input,"change");
		}
	}

	setRange(min : number, max : number)
	{
		this.options.min = min;
		this.options.max = max;
	}

	setValue(v : any, skip_event : boolean)
	{
		let value = parseFloat(v) as any;
		this.value = value;
		if (this.options.precision) {value = value.toFixed(this.options.precision);}
		if (this.options.units) {value += this.options.units;}
		this.input.value = value;
		if (!skip_event) {LiteGUI.trigger(this.input, "change");}
	}

	getValue() : number
	{
		return this.value;
	}
}