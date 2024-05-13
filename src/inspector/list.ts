import { AddListOptions, InspectorListWidget, ItemOptions } from "../@types/Inspector";
import { LiteGUI } from "../core";
import { Inspector } from "../inspector";

/**
 * Widget to select from a list of items
 * @function AddList
 *
 * @param {Inspector} that
 * @param {string} [name]
 * @param {string[]} [value] String array of values
 * @param {AddListOptions} [options] here is a list for this widget (check createWidget for a list of generic options):
 * - multiSelection: allow multiple selection
 * - callback: function to call once an items is clicked
 * - selected: the item selected
 * @return {InspectorListWidget} the widget in the form of the DOM element that contains it
 *
 */
export function AddList(that:Inspector, name?: string, values?: string[], options?: AddListOptions): InspectorListWidget
{
	values = values ?? [];
	options = options ?? {};
	const valueName = that.getValueName(name, options);
	if (options == undefined) {options = {};}

	let list_height = "";
	if (options.height) {list_height = "style='height: 100%; overflow: auto;'";}
	// Height = "style='height: "+options.height+"px; overflow: auto;'";

	const code = "<ul class='lite-list' "+list_height+" tabIndex='"+that.tab_index+"'><ul>";
	that.tab_index++;

	const element = that.createWidget(name,"<span class='inputfield full "+
		(options.disabled?"disabled":"")+"' style='height: 100%;'>"+code+"</span>", options) as InspectorListWidget;

	const infoContent = element.querySelector(".info_content") as HTMLElement;
	infoContent.style.height = "100%";

	element.querySelector(".lite-list");
	const inputField = element.querySelector(".inputfield") as HTMLInputElement;
	inputField.style.height = "100%";
	inputField.style.paddingBottom = "0.2em";

	const ul_elements = element.querySelectorAll("ul");

	const inner_key = function(e: KeyboardEvent)
	{
		const selected = element.querySelector("li.selected") as HTMLLIElement;
		if (!selected) {return;}

		if (e.code == 'Enter') // Intro
		{
			if (!selected) {return;}
			let pos: string | number | undefined = selected.dataset["pos"];
			if (pos == undefined) {return;}
			pos = typeof pos == "string" ? parseFloat(pos) : 0; 
			const value = values![pos];
			if (options!.callback_dblclick)  {options!.callback_dblclick.call(that,value);}
		}
		else if (e.code == 'ArrowDown') // Arrow down
		{
			const next = selected.nextSibling;
			if (next) {LiteGUI.trigger(next, "click");}
			selected.scrollIntoView({block: "end", behavior: "smooth"});
		}
		else if (e.code == 'ArrowUp') // Arrow up
		{
			const prev = selected.previousSibling;
			if (prev) {LiteGUI.trigger(prev,"click");}
			selected.scrollIntoView({block: "end", behavior: "smooth"});
		}
		else
		{
			return;
		}

		e.preventDefault();
		e.stopPropagation();
		return true;
	};
	const inner_item_click = (e: MouseEvent) =>
	{
		const el = e.target as HTMLLIElement;
		if (options!.multiSelection)
		{
			el.classList.toggle("selected");
		}
		else
		{
			// Batch action, jquery...
			const lis = element.querySelectorAll("li");
			for (let i = 0; i < lis.length; ++i)
			{
				lis[i].classList.remove("selected");
			}
			el.classList.add("selected");
		}

		let pos: string | number | undefined = el.dataset["pos"];
		if (pos == undefined) {return;}
		pos = typeof pos == "string" ? parseFloat(pos) : 0; 
		const value = values![pos];
		that.onWidgetChange.call(that,element,valueName!,value, options!);
		LiteGUI.trigger(element, "wadded", value);
	};
	const inner_item_dblclick = function(e: MouseEvent)
	{
		const el = e.target as HTMLLIElement;
		let pos: string | number | undefined = el.dataset["pos"];
		if (pos == undefined) {return;}
		pos = typeof pos == "string" ? parseFloat(pos) : 0; 
		const value = values![pos];
		if (options!.callback_dblclick) {options!.callback_dblclick.call(that,value);}
	};
	const focusCallback = function()
	{
		document.addEventListener("keydown",inner_key,true);
	};
	const blurCallback = function()
	{
		document.removeEventListener("keydown",inner_key,true);
	};

	for (let i = 0; i < ul_elements.length; ++i)
	{
		const ul = ul_elements[i];
		ul.addEventListener("focus", focusCallback);
		ul.addEventListener("blur", blurCallback);
	}


	element.updateItems = function(new_values: string[], item_selected?: string)
	{
		item_selected = item_selected ?? options!.selected;
		if (!item_selected && new_values.length > 0)
		{
			item_selected = new_values[0] ?? '';
		}
		else
		{
			item_selected = '';
		}
		values = new_values;
		const ul = this.querySelector("ul") as HTMLElement;
		ul.innerHTML = "";

		if (values)
		{
			for (const i in values)
			{
				const li_element = insert_item(values[i], item_selected==values[i] ? true: false, i);
				ul.appendChild(li_element);
			}
		}

		const li = ul.querySelectorAll("li");
		LiteGUI.bind(li, "click", inner_item_click);
	};

	function insert_item(value: string | number | ItemOptions, selected: boolean, index?: string)
	{
		const item_index = index; // To reference it
		let item_title = ""; // To show in the list

		let item_style = null;
		let icon = "";

		if (value.constructor === String || value.constructor === Number)
		{
			item_title = value.toString();
		}
		else
		{
			item_title = (value as ItemOptions).content || (value as ItemOptions).title || (value as ItemOptions).name || index;
			item_style = (value as ItemOptions).style;
			if ((value as ItemOptions).icon)
			{icon = "<img src='"+(value as ItemOptions).icon+"' class='icon' /> ";}
			if ((value as ItemOptions).selected)
			{selected = true;}
		}
		

		let item_name = item_title;
		item_name = item_name.replace(/<(?:.|\n)*?>/gm, ''); // Remove html tags that could break the html

		const li_element = document.createElement("li");
		li_element.classList.add('item-' + LiteGUI.safeName(item_index || ""));
		if (selected) {li_element.classList.add('selected');}
		li_element.dataset["name"] = item_name;
		li_element.dataset["pos"] = item_index;
		li_element.value = (value as number);
		if (item_style) {li_element.setAttribute("style", item_style);}
		li_element.innerHTML = icon + item_title;
		li_element.addEventListener("click", inner_item_click);
		if (options!.callback_dblclick)
		{
			li_element.addEventListener("dblclick", inner_item_dblclick);
		}
		return li_element;
	}

	element.addItem = function(value: string, selected: boolean)
	{
		values!.push(value);
		const ul = this.querySelector("ul") as HTMLElement;
		const li_element = insert_item(value, selected);
		ul.appendChild(li_element);
	};

	element.removeItem = function(name: string)
	{
		const items = element.querySelectorAll(".wcontent li") as NodeListOf<HTMLLIElement>;
		for (let i = 0; i < items.length; i++)
		{
			if (items[i].dataset["name"] == name)
			{
				LiteGUI.remove(items[i]);
			}
		}
	};

	element.updateItems(values, options.selected);
	that.appendWidget(element,options);

	element.getSelected = function()
	{
		const r:string[] = [];
		const selected = this.querySelectorAll("ul li.selected") as NodeListOf<HTMLLIElement>;
		for (let i = 0; i < selected.length; ++i)
		{
			r.push(selected[i].dataset["name"] as string);
		}
		return r;
	};

	element.getByIndex = function(index: number)
	{
		const items = this.querySelectorAll("ul li") as NodeListOf<HTMLLIElement>;
		return items[index] as HTMLElement;
	};

	element.selectIndex = function(num: number, add_to_selection?: boolean)
	{
		const items = this.querySelectorAll("ul li") as NodeListOf<HTMLLIElement>;
		for (let i = 0; i < items.length; ++i)
		{
			const item = items[i];
			if (i == num)
			{
				item.classList.add("selected");
			}
			else if (!add_to_selection)
			{
				item.classList.remove("selected");
			}
		}
		return items[num];
	};

	element.deselectIndex = function(num: number)
	{
		const items = this.querySelectorAll("ul li") as NodeListOf<HTMLLIElement>;
		const item = items[num];
		if (item) {item.classList.remove("selected");}
		return item;
	};

	element.scrollToIndex = function(num: number)
	{
		const items = this.querySelectorAll("ul li") as NodeListOf<HTMLLIElement>;
		const item = items[num];
		if (!item) {return;}
		this.scrollTop = item.offsetTop;
	};

	element.selectAll = function()
	{
		const items = this.querySelectorAll("ul li");
		for (let i = 0; i < items.length; ++i)
		{
			const item = items[i];
			if (item.classList.contains("selected")) {continue;}
			LiteGUI.trigger(item, "click");
		}
	};

	element.deselectAll = function()
	{
		// There has to be a more efficient way to do that
		const items = this.querySelectorAll("ul li");
		for (let i = 0; i < items.length; ++i)
		{
			const item = items[i];
			if (!item.classList.contains("selected")) {continue;}
			LiteGUI.trigger(item, "click");
		}
	};

	element.setValue = function(v: string[])
	{
		this.updateItems(v);
	};

	element.getNumberOfItems = function()
	{
		const items = this.querySelectorAll("ul li");
		return items.length;
	};

	element.filter = function(callback?: string |
		((value:number, item:HTMLElement, selected:boolean)=>boolean),
		case_sensitive?: boolean)
	{
		const items = this.querySelectorAll("ul li") as NodeListOf<HTMLLIElement>;
		let use_string = false;
		let string_callback: ((value:string, item:HTMLElement, selected:boolean)=>boolean) | undefined = undefined;

		if (typeof callback == 'string')
		{
			const needle = callback;
			if (case_sensitive) {needle.toLowerCase();}
			use_string = true;
			string_callback = function(v: string){ return ((case_sensitive ? v : v.toLowerCase()).indexOf(needle) != -1); };
		}

		for (let i = 0; i < items.length; ++i)
		{
			const item = items[i];
			if (callback == undefined)
			{
				item.style.display = "";
				continue;
			}

			let value:number | string = item.value;
			if (use_string && typeof value !== "string" && string_callback)
			{
				value = item.innerHTML;
				if (!string_callback(value, item, item.classList.contains("selected")))
				{
					item.style.display = "none";
				}
				else
				{
					item.style.display = "";
				}
			}
			else if (typeof callback != "string")
			{
				if (!callback(value, item, item.classList.contains("selected")))
				{
					item.style.display = "none";
				}
				else
				{
					item.style.display = "";
				}
			}
		}
	};

	element.selectByFilter = function(callback: ((value:number, item:HTMLElement, selected:boolean)=>boolean))
	{
		const items = this.querySelectorAll("ul li") as NodeListOf<HTMLLIElement>;
		for (let i = 0; i < items.length; ++i)
		{
			const item = items[i];
			const r = callback(item.value, item, item.classList.contains("selected"));
			if (r === true)
			{
				item.classList.add("selected");
			}
			else if (r === false)
			{
				item.classList.remove("selected");
			}
		}
	};

	if (options.height) {element.scrollTop = 0;}
	that.processElement(element, options);
	return element;
};