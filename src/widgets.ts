import { LiteGUI, special_codes } from "./core";
import {
	HTMLDivElementPlus,
	HTMLSpanElementPlus,
	EventTargetPlus,
	HTMLLIElementPlus,
	MouseEventPlus,
	LiteGUIObject,
	ButtonOptions,
	SearchBoxOptions,
	ContextMenuOptions,
	ListOptions,
	SliderOptions,
	ComplexListOptions } from "./@types/globals/index"

interface ListItem
{
	name: string, title: string, id: string
}

export class Button
{
	root: HTMLDivElement;
	content: HTMLButtonElement;
	callback?: Function;
	constructor(value: string, options?: Function | ButtonOptions) {
		options = options || {};

		if (typeof (options) === "function") { options = { callback: options }; }

		// "that" is equal to "this", so this doesn't make sense const that: ThisType<Window> = this;
		const element = document.createElement("div") as HTMLDivElement;
		element.className = "litegui button";

		this.root = element;
		const button = document.createElement("button");
		button.className = "litebutton";
		this.content = button;
		element.appendChild(button);

		button.innerHTML = value;
		button.addEventListener("click", (e) => {
			this.click();
		});

		if (options.callback) { this.callback = options.callback; }
	}

	click()
	{
		if (this.callback) { this.callback.call(this); }		
	}
}

/**
 * SearchBox
 *
 * @class SearchBox
 * @constructor
 * @param {*} value
 * @param {Object} options
 */
export class SearchBox
{
	root: HTMLDivElement;
	options: SearchBoxOptions;
	value: string;
	input: HTMLInputElement;
	constructor(value: string, options?: SearchBoxOptions)
	{
		this.options = options || {};
		this.value = value || "";
		const element = document.createElement("div") as HTMLDivElement;
		element.className = "litegui searchbox";
		const placeholder = (options?.placeholder != null ? options.placeholder : "Search");
		element.innerHTML = "<input value='" + value + "' placeholder='" + placeholder + "'/>";
		this.input = element.querySelector("input")!;
		this.root = element;
	
		this.input.onchange = function (e: Event) {
			console.warn("Valor de e: " + e);
			//const value = e.target.value;
			//if (options.callback) { options.callback.call(this, value); }
		};
	}

	setValue(v: string)
	{
		this.input.value = v; 
		if (this.input.onchange) { this.input.onchange(new Event("change")); }
	}

	getValue()
	{
		return this.input.value;
	}
}

interface ContextMenuItem
{
	content: string;
	submenu: any;
	has_submenu: boolean;
	disabled: boolean;
	title: string;
}

/**
	* ContextMenu
	*
	* @class ContextMenu
	* @constructor
	* @param {Array} values (allows object { title: "Nice text", callback: function ... })
	* @param {Object} options [optional] Some options:\
	* - title: title to show on top of the menu
	* - callback: function to call when an option is clicked, it receives the item information
	* - ignore_item_callbacks: ignores the callback inside the item, it just calls the options.callback
	* - event: you can pass a MouseEvent, this way the ContextMenu appears in that position
	*/
export class ContextMenu
{
	root: HTMLDivElementPlus;
	options: ContextMenuOptions;
	parentMenu?: ContextMenu;
	lock?: boolean;
	current_submenu?: ContextMenu;
	constructor(values:  any,/* Array<ContextMenuItem> | ContextMenuItem, */ options?: ContextMenuOptions)
	{
		options = options! || {};
		this.options = options;

		// To link a menu with its parent
		if (options.parentMenu) {
			if (options.parentMenu.constructor !== this.constructor) {
				console.error("parentMenu must be of class ContextMenu, ignoring it");
				options.parentMenu = undefined;
			}
			else {
				this.parentMenu = options.parentMenu;
				this.parentMenu!.lock = true;
				this.parentMenu!.current_submenu = this;
			}
		}

		if (options.event && options.event.constructor.name !== "MouseEvent" && options.event.constructor.name !== "PointerEvent" && options.event.constructor.name !== "CustomEvent") {
			console.error("Event passed to ContextMenu is not of type MouseEvent or CustomEvent. Ignoring it.");
			options.event = undefined;
		}

		const root = document.createElement("div") as HTMLDivElementPlus;
		root.className = "litecontextmenu litemenubar-panel";
		root.style.minWidth = "100";
		root.style.minHeight = "100";
		root.style.pointerEvents = "none";
		setTimeout(() => { root.style.pointerEvents = "auto"; }, 100); // Delay so the mouse up event is not caugh by this element

		// This prevents the default context browser menu to open in case this menu was created when pressing right button
		root.addEventListener("mouseup", (e: MouseEvent) => {
			e.preventDefault(); return true;
		}, true);
		root.addEventListener("contextmenu", (e: MouseEvent) => {
			if (e.button != 2) // Right button
			{ return false; }
			e.preventDefault();
			return false;
		}, true);

		root.addEventListener("mousedown", (e: MouseEvent) => {
			if (e.button == 2) {
				this.close.bind(this, e);
				e.preventDefault();
				return true;
			}
			return false;
		}, true);


		this.root = root;

		// Title
		if (options.title) {
			const element = document.createElement("div") as HTMLDivElementPlus;
			element.className = "litemenu-title";
			element.innerHTML = options.title;
			root.appendChild(element);
		}

		// Entries
		let num = 0;
		for (const i in values) {
			let name = values.constructor == Array ? values[i as keyof object] : i;
			if (name != null && name.constructor !== String) 
			{ 
				name = (name as ContextMenuItem).content === undefined ? String(name) : (name as ContextMenuItem).content; 
			}
			const value = values[i as keyof object];
			this.addItem(name, value, options);
			num++;
		}

		// Close on leave
		root.addEventListener("mouseleave", (e) => {
			if (this.lock || !this.root) { return; }
			if (this.root.closingTimer) { clearTimeout(this.root.closingTimer); }
			this.root.closingTimer = setTimeout(this.close.bind(this, e), 500);
			// That.close(e);
		});

		root.addEventListener("mouseenter", (e) => {
			if (root.closingTimer) { clearTimeout(root.closingTimer); }
		});

		function on_mouse_wheel(e: WheelEvent) {
			const pos = parseInt(root.style.top);
			root.style.top = (pos + e.deltaY * 0.1).toFixed() + "px";
			e.preventDefault();
			return true;
		}

		root.addEventListener("wheel", on_mouse_wheel, true);
/* 		root.addEventListener("mousewheel", on_mouse_wheel, true); */ //Deprecated


		// Insert before checking position
		let root_document = document;
		if (options.event) { root_document = (options.event.target as HTMLInputElement).ownerDocument; }

		if (!root_document) { root_document = document; }
		root_document.body.appendChild(root);

		// Compute best position
		let left = options.left || 0;
		let top = options.top || 0;
		if (options.event) {
			if (options.event.constructor.name !== "MouseEvent" && options.event.constructor.name !== "PointerEvent" && options.event.constructor.name !== "CustomEvent") {
				console.warn("Event passed to ContextMenu is not of type MouseEvent");
				options.event = undefined;
			}
			else {
				left = ((options.event as PointerEvent | MouseEvent).pageX - 10);
				top = ((options.event as PointerEvent | MouseEvent).pageY - 10);
				if (options.title) { top -= 20; }

				if (options.parentMenu) {
					const rect = options.parentMenu.root.getBoundingClientRect();
					left = rect.left + rect.width;
				}

				const body_rect = document.body.getBoundingClientRect();
				const root_rect = root.getBoundingClientRect();

				if (left > (body_rect.width - root_rect.width - 10)) { left = (body_rect.width - root_rect.width - 10); }
				if (top > (body_rect.height - root_rect.height - 10)) { top = (body_rect.height - root_rect.height - 10); }
			}
		}

		root.style.left = left + "px";
		root.style.top = top + "px";
	}

	close(e?: MouseEvent, ignore_parent_menu?: boolean) {
		if (this.root.parentNode) { this.root.parentNode.removeChild(this.root); }
		if (this.parentMenu && !ignore_parent_menu) {
			this.parentMenu.lock = false;
			this.parentMenu.current_submenu = undefined;
			if (e === undefined) { this.parentMenu.close(); }
			else if (e && !LiteGUI.isCursorOverElement(e, this.parentMenu.root)) { LiteGUI.trigger(this.parentMenu.root, "mouseleave", e); }
		}
		if (this.current_submenu) { this.current_submenu.close(e, true); }
		if (this.root.closingTimer) { clearTimeout(this.root.closingTimer); }
	};

	// Returns the top most menu
	getTopMenu() : ContextMenu 
	{
		if (this.options.parentMenu) { return this.options.parentMenu.getTopMenu(); }
		return this;
	}

	getFirstEvent() : MouseEvent | PointerEvent | CustomEvent | undefined
	{
		if (this.options.parentMenu) { return this.options.parentMenu.getFirstEvent(); }
		return this.options.event;
	}

	addItem(name: string, value: any, options?: ContextMenuOptions) 
	{
		const that = this;
		this.options = options! || {};

		const element = document.createElement("div") as HTMLDivElementPlus;
		element.className = "litemenu-entry submenu";

		let disabled = false;

		if (value === null) {
			element.classList.add("separator");
			/*
			 * Element.innerHTML = "<hr/>"
			 * continue;
			 */
		}
		else {
			element.innerHTML = value && value.title ? value.title : name;
			element.value = value;

			if (value) {
				if (value.disabled) {
					disabled = true;
					element.classList.add("disabled");
				}
				if (value.submenu || value.has_submenu) { element.classList.add("has_submenu"); }
			}

			if (typeof (value) == "function") {
				element.dataset["value"] = name;
				element.onclick = value;
			}
			else { element.dataset["value"] = value; }
		}

		this.root.appendChild(element);

		// Menu option clicked
		const inner_onclick = function (e: MouseEvent) {
			const el = e.target;
			const value = (el as EventTargetPlus).value;
			let close_parent = true;

			if (that.current_submenu) {
				that.current_submenu.close(e);
			}

			// global callback
			if (options?.callback) {
				const r = options!.callback.call(that, value, options, e);
				if (r === true) { close_parent = false; }
			}

			// Special cases
			if (value) {
				if (value.callback && !options?.ignore_item_callbacks && value.disabled !== true)  // Item callback
				{
					const r = value.callback.call(el, value, options, e, that);
					if (r === true) { close_parent = false; }
				}
				if (value.submenu) {
					if (!value.submenu.options) {
						throw ("ContextMenu submenu needs options");
					}
					const submenu = new LiteGUI.ContextMenu(value.submenu.options, {
						callback: value.submenu.callback,
						event: e,
						parentMenu: that,
						ignore_item_callbacks: value.submenu.ignore_item_callbacks,
						title: value.submenu.title,
						autoopen: options?.autoopen
					});
					close_parent = false;
				}
			}

			if (close_parent && !that.lock) { that.close(e, true); }
		};
		const inner_over = function (e: MouseEvent) {
			const el = e.target;
			const value = (el as EventTargetPlus).value;
			if (!value || !value.has_submenu) { return; }
			inner_onclick.call(el, e);
		};

		if (!disabled) {
			element.addEventListener("click", inner_onclick.bind(element));
		}
		if (options?.autoopen) {
			element.addEventListener("mouseenter", inner_over.bind(element));
		}

		return element;
	}
}

export class Checkbox
{
	root: HTMLSpanElementPlus;
	value: boolean;
	element?: HTMLSpanElementPlus;
	onChange: CallableFunction

	constructor(value: boolean, on_change: CallableFunction)
	{
		this.value = value;

		const root = this.root = document.createElement("span") as HTMLSpanElementPlus;
		root.className = "litecheckbox inputfield";
		root.dataset["value"] = value.toString();

		const element = this.element = document.createElement("span") as HTMLSpanElementPlus;
		element.className = "fixed flag checkbox " + (value ? "on" : "off");
		root.appendChild(element);
		root.addEventListener("click", this.onClick.bind(this));
		this.onChange = on_change;
	}

	setValue(v: boolean)
	{
		if (this.value === v || !this.root || !this.element) { return; }

		if (this.root.dataset["value"] == v.toString()) { return; }

		this.root.dataset["value"] = v.toString();
		if (v) {
			this.element.classList.remove("off");
			this.element.classList.add("on");
		}
		else {
			this.element.classList.remove("on");
			this.element.classList.add("off");
		}
		const old_value = this.value;
		this.value = v;
		this.onChange();
		//this.onChange(v, old_value);
	}

	getValue()
	{
		return this.root.dataset["value"] == "true";
	}

	onClick()
	{
		this.setValue(this.root.dataset["value"] != "true");
	}
}


// The tiny box to expand the children of a node
export class LiteBox
{
	root?: HTMLSpanElementPlus;
	stopPropagation : boolean = false;

	constructor(state: boolean, on_change: Function)
	{
		const element = document.createElement("span") as HTMLSpanElementPlus;
		this.root = element;
		element.liteBox = this;
		element.className = "listbox " + (state ? "listopen" : "listclosed");
		element.innerHTML = state ? "&#9660;" : "&#9658;";
		element.dataset["value"] = state ? "open" : "closed";

		element.onclick = this.onMouseClic.bind(this);
		//element.addEventListener("click", onclick!.bind(element));
		element.onchange = on_change as ((this: GlobalEventHandlers, ev: Event) => any);

		element.setEmpty = function (v: boolean) {
			if (v) { this.classList.add("empty"); }
			else { this.classList.remove("empty"); }
		};

		element.expand = function () {
			this.setValue(true);
		};

		element.collapse = function () {
			this.setValue(false);
		};


		// element.getValue = function () {
		// 	return this.dataset["value"];
		// };
        // return element;
	}

	onMouseClic(e: MouseEvent)
	{
		const box = e.target as EventTargetPlus;
		this.setValue(this.root?.dataset["value"] == "open" ? false : true);
		// if (this.stopPropagation) {e.stopPropagation();}
		if (e.stopPropagation) { e.stopPropagation(); }
	}

	setValue(v?: boolean)
	{
		try 
		{
			if((v as unknown as PointerEvent).type == "click")
			{
				v = this.root!.dataset["value"] == "open" ? false : true;
			}
		} 
		catch (error) {}

		if (!this.root) { return; }
		if (this.root.dataset["value"] == (v ? "open" : "closed")) { return; }

		if (!v) {
			this.root.dataset["value"] = "closed";
			this.root.innerHTML = "&#9658;";
			this.root.classList.remove("listopen");
			this.root.classList.add("listclosed");
		}
		else {
			this.root.dataset["value"] = "open";
			this.root.innerHTML = "&#9660;";
			this.root.classList.add("listopen");
			this.root.classList.remove("listclosed");
		}
		if (this.root.onchange) { this.root.onchange(new Event("change")); }
	}

	getValue()
	{
		// return this.element;
        return this.root?.dataset["value"];
	}

	setEmpty(isEmpty: boolean)
	{
		if (isEmpty)
		{
			this.root = undefined;
		}
	}
}

/**
 * List
 *
 * @class List
 * @constructor
 * @param {String} id
 * @param {Array} values
 * @param {Object} options
 */
export class List
{
	root: HTMLUListElement;
	callback: Function;

	constructor(id: string, items: Array<string | ListItem>, options?: ListOptions)
	{
		options = options! || {};

		const root = this.root = document.createElement("ul") as HTMLUListElement;
		root.id = id;
		root.className = "litelist";
		const that = this;

		this.callback = options.callback!;

		const onClickCallback = function (e: MouseEvent) {
			const el = e.target as EventTargetPlus;
			const list = root.querySelectorAll(".list-item.selected");
			for (let j = 0; j < list.length; ++j) {
				list[j].classList.remove("selected");
			}
			el.classList.add("selected");
			LiteGUI.trigger(that.root, "wchanged", el);
			if (that.callback) { that.callback(el.data); }
		};
		// Walk over every item in the list
		for (const i in items) {
			const item = document.createElement("li") as HTMLLIElementPlus;
			item.className = "list-item";
			item.data = items[i];
			item.dataset["value"] = items[i] as string;

			let content = "";
			if (typeof (items[i]) == "string") { content = items[i] + "<span class='arrow'></span>"; }
			else {
				content = ((items[i] as ListItem).name || (items[i] as ListItem).title || "") + "<span class='arrow'></span>";
				if ((items[i] as ListItem).id) { item.id = (items[i] as ListItem).id; }
			}
			item.innerHTML = content;

			item.addEventListener("click", onClickCallback.bind(item));

			root.appendChild(item);
		}


		if (options.parent) {
			if ((options.parent as LiteGUIObject).root) { (options.parent as LiteGUIObject).root?.appendChild(root); }
			else
			{
				//options.parent.appendChild(root);
				console.log("trying to add a widget with out a parent with root");
			}
		}
	}

	getSelectedItem()
	{
		return this.root.querySelector(".list-item.selected");
	}

	setSelectedItem(name: string)
	{
		const items = this.root.querySelectorAll(".list-item");
		for (let i = 0; i < items.length; i++) {
			const item: HTMLLIElementPlus = items[i] as HTMLLIElementPlus;
			if (item.data.id == name) {
				LiteGUI.trigger(item, "click");
				break;
			}
		}
	}
}


/**
 * Slider
 *
 * @class Slider
 * @constructor
 * @param {Number} value
 * @param {Object} options
 */
export class Slider
{
	root: HTMLDivElementPlus;
	value: number;
	options: SliderOptions;
	doc_binded?: Document;
	onChange?: (value: number)=>void;
	mouseMoveBind = this.onMouseMove.bind(this);
	mouseUpBind = this.onMouseUp.bind(this);

	constructor(value: number, options?: SliderOptions)
	{
		this.options = options! || {};
		
		const root = this.root = document.createElement("div") as HTMLDivElementPlus;
		this.value = value;
		root.className = "liteslider";
		this.doc_binded = root.ownerDocument;
		this.root.addEventListener("mousedown", this.onMouseDown.bind(this));
		//root.addEventListener("mousedown", (e: MouseEvent) => {});
		this.setValue(value);
	}

	setFromX(x: number) {
		const rect = this.root.getBoundingClientRect();
		if (!rect) { return; }
		const width = rect.width;
		const norm = x / width;
		const min = this.options.min || 0.0;
		const max = this.options.max || 1.0;
		const range = max - min;
		this.setValue(range * norm + min);
	}

	onMouseDown(e: MouseEvent)
	{
		const event = e as MouseEventPlus;
		let mouseX, mouseY;
		if (event.offsetX) { mouseX = event.offsetX; mouseY = event.offsetY; }
		else if (event.layerX) { mouseX = event.layerX; mouseY = event.layerY; }
		this.setFromX(mouseX as number);
		if(!this.doc_binded) { return; }
		this.root.addEventListener("mousemove", this.mouseMoveBind, false);
		this.root.addEventListener("mouseup", this.mouseUpBind, false);
		e.preventDefault();
		e.stopPropagation();
	}

	onMouseMove(e: MouseEvent) {
		const rect = this.root.getBoundingClientRect();
		if (!rect) { return; }
		const x = e.x === undefined ? e.pageX : e.x;
		const mouseX = x - rect.left;
		this.setFromX(mouseX);
		if (typeof e.preventDefault == 'function')
			e.preventDefault();
		return false;
	}

	onMouseUp(e: MouseEvent) {		
		if(!this.doc_binded) { return false; }
		//this.doc_binded = undefined;
		this.root.removeEventListener("mousemove", this.mouseMoveBind, false);
		this.root.removeEventListener("mouseup", this.mouseUpBind, false);
		if(typeof e.preventDefault == 'function')
			e.preventDefault();
		return false;
	}

	setValue(value: number, skip_event: boolean = false)
	{
		// Var width = canvas.getClientRects()[0].width;
		const min = this.options.min || 0.0;
		const max = this.options.max || 1.0;
		if (value < min) { value = min; }
		else if (value > max) { value = max; }
		const range = max - min;
		const norm = (value - min) / range;
		const percentage = (norm * 100).toFixed(1) + "%";
		const percentage2 = (norm * 100 + 2).toFixed(1) + "%";
		this.root.style.background = "linear-gradient(to right, #999 " + percentage + ", #FC0 " + percentage2 + ", #333 " + percentage2 + ")";

		if (value != this.value) {
			this.value = value;
			if (!skip_event) {
				LiteGUI.trigger(this.root, "change", value);
				if (this.onChange) { this.onChange(value); }
			}
		}
	};
}


export class ComplexList
{
	root: HTMLDivElement;
	options: ComplexListOptions;
	item_code: string;
	selected?: HTMLDivElementPlus | number;
	onItemSelected?: Function;
	onItemToggled?: Function;
	onItemRemoved?: Function;

	constructor(options: ComplexListOptions)
	{
		this.options = options! || {};

		this.root = document.createElement("div");
		this.root.className = "litecomplexlist";

		this.item_code = this.options.item_code || "<div class='listitem'><span class='tick'><span>" + special_codes.tick + "</span></span><span class='title'></span><button class='trash'>" + special_codes.close + "</button></div>";

		if (this.options.height) {
			this.root.style.height = LiteGUI.sizeToCSS(this.options.height) as string;
		}

		this.onItemSelected = options.onItemSelected;
		this.onItemToggled = options.onItemToggled;
		this.onItemRemoved = options.onItemRemoved;
	}

	addTitle(text: string)
	{
		const elem = LiteGUI.createElement("div", ".listtitle", text);
		this.root.appendChild(elem);
		return elem;
	};

	addHTML(html: string, on_click: Function)
	{
		const elem = LiteGUI.createElement("div", ".listtext", html);
		if (on_click) { elem.addEventListener("mousedown", on_click as EventListenerOrEventListenerObject); }
		this.root.appendChild(elem);
		return elem;
	};

	clear()
	{
		this.root.innerHTML = "";
	};

	addItem(item: HTMLDivElementPlus | number, text: string, is_enabled: boolean, can_be_removed: boolean)
	{
		const title = text || ((typeof item === 'object') ? (item.content || item.name) : "");
		const elem = LiteGUI.createListItem(this.item_code, { ".title": title }) as HTMLSpanElementPlus;
		elem.item = item;

		if (is_enabled) { elem.classList.add("enabled"); }

		if (!can_be_removed)
		{
			const trash = elem.querySelector<HTMLElement>(".trash");
			if (trash) {trash.style.display = "none";}
		}

		const that = this;
		elem.addEventListener("mousedown", (e: MouseEvent) => {
			e.preventDefault();
			elem.setSelected(true);
			if (that.onItemSelected) {
				that.onItemSelected(item, elem);
			}
		});
		(elem.querySelector(".tick") as HTMLElement).addEventListener("mousedown", (e: MouseEvent) => {
			e.preventDefault();
			elem.classList.toggle("enabled");
			if (that.onItemToggled) {
				that.onItemToggled(item, elem, elem.classList.contains("enabled"));
			}
		});

		(elem.querySelector(".trash") as HTMLElement).addEventListener("mousedown", (e: MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			elem.remove();
			if (that.onItemRemoved) {
				that.onItemRemoved(item, elem);
			}
		});

		elem.setContent = function (v: string, is_html: boolean) {
			if (is_html) {
				elem.querySelector(".title")!.innerHTML = v;
			}
			else {
				(elem.querySelector(".title") as HTMLElement).innerText = v;
			}
		};

		elem.toggleEnabled = function () {
			elem.classList.toggle("enabled");
		};

		elem.setSelected = function (v: boolean) {
			LiteGUI.removeClass(that.root, "selected");
			if (v) {
				this.classList.add("selected");
			}
			else {
				this.classList.remove("selected");
			}
			that.selected = elem.item;
		};

		elem.show = function () { this.style.display = ""; };
		elem.hide = function () { this.style.display = "none"; };

		this.root.appendChild(elem);
		return elem;
	}
}