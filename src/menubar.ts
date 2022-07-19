import { LiteGUI } from "./core";
import { HTMLDivElementPlus, HTMLElementPlus, HTMLLIElementPlus, HTMLParagraphElementPlus, MenubarOptions } from "./@types/globals/index"
import { Panel } from "./panel";

/** ************ MENUBAR ************************/
export class Menubar
{
	closing_time: number;
	options: MenubarOptions;
	root: HTMLDivElementPlus;
	menu: SubMenu[];
	panels: Array<HTMLDivElement>;
	content: HTMLUListElement;
	is_open: boolean;
	auto_open: boolean;
	sort_entries: boolean;
	data?: object;
	closing_by_leave?: NodeJS.Timeout | null;

	constructor(id: string, options?: MenubarOptions)
	{
		this.options = options! || {};

		this.menu = [];
		this.panels = [];

		this.root = document.createElement("div") as HTMLDivElementPlus;
		this.root.id = id;
		this.root.className = "litemenubar";

		this.content = document.createElement("ul");
		this.root.appendChild(this.content);

		this.is_open = false;
		this.auto_open = options?.auto_open || false;
		this.sort_entries = options?.sort_entries || false;
		this.closing_time = 500;
	}

	clear()
	{
		this.content.innerHTML = "";
		this.menu = [];
		this.panels = [];
	}

	attachToPanel(panel: Panel)
	{
		(panel.content as Element).insertBefore(this.root, (panel.content as Element).firstChild);
	}

	add(path: string, data: Function | object)
	{
		this.data = data || {};

		if (typeof(data) == "function") {data = { callback: data };}

		const prev_length = this.menu.length;

		const tokens = path.split("/");
		let current_token = 0;
		let current_pos = 0;
		let menu = this.menu;
		let last_item = undefined;

		while (menu)
		{
			if (current_token > 5) {throw ("Error: Menubar too deep");}
			// Token not found in this menu, create it
			if (menu.length == current_pos)
			{
				const v: SubMenu = { name: "", parent: last_item, children: [], data: null,
					disable: function() { if (this.data) {this.data.disabled = true;} },
					enable: function() { if (this.data) {delete this.data.disabled;} }
				};
				last_item = v;
				if (current_token == tokens.length - 1)
				{v.data = data;}

				v.name = tokens[ current_token ];
				menu.push(v);
				current_token++;
				if (current_token == tokens.length)
				{break;}
				v.children = [];
				menu = v.children;
				current_pos = 0;
				continue;
			}

			// Token found in this menu, get inside for next token
			if (menu[ current_pos ] && tokens[ current_token ] == menu[ current_pos ].name)
			{
				if (current_token < tokens.length - 1)
				{
					last_item = menu[ current_pos ];
					if (menu[ current_pos ].children != undefined)
					{menu = menu[ current_pos ].children!;}
					current_pos = 0;
					current_token++;
					continue;
				}
				else // Last token
				{
					console.warn("Warning: Adding menu that already exists: " + path);
					break;
				}
			}
			current_pos++;
		}

		if (prev_length != this.menu.length) {this.updateMenu();}
	}

	remove(path: string)
	{
		const menu = this.findMenu(path);
		if (!menu)
		{return;}

		if (Array.isArray(menu))
		{
			// This means that it's intended to deleat a list and this is not allowed
			return console.warn("Can't remove an entire list");
		}
		//We are going to remove a single menu
		if (!menu.parent || !menu.parent.children)
		{return console.warn("menu without parent?");}

		const index = menu.parent.children.indexOf(menu);
		if (index != -1)
		{
			menu.parent.children.splice(index, 1);
			if (this.is_open) {
				this.hidePanels();
				const evt = new MouseEvent("click", {
					view: window,
					bubbles: true,
					cancelable: true,
					clientX: 0,
					clientY: 0
				});
				this.showMenu(menu.parent.element!.data, evt, menu.parent.element!);
			};
						
		}
	}

	separator(path: string, order: number)
	{
		const menu = this.findMenu(path);
		if (!menu)
		{return;}
		if (Array.isArray(menu))
		{
			// This means that it's intended to deleat a list and this is not allowed
			return console.warn("Can't separate an entire list");
		}
		if (menu.children)
		menu.children.push({name: "", children: undefined, data: null, separator: true, order: order || 10 });
	};

	// Returns the menu entry that matches this path
	findMenu(path: string): SubMenu | SubMenu[] | undefined
	{
		const tokens = path.split("/");
		let current_token = 0;
		let current_pos = 0;
		let menu = this.menu;

		while (current_pos <= 5)
		{
			// No more tokens, return last found menu
			if (current_token == tokens.length) {return menu;}

			// This menu doesn't have more entries
			if (menu.length <= current_pos) {return undefined;}

			if (tokens[ current_token ] == "*") {return menu[ current_pos ].children;}

			// Token found in this menu, get inside for next token
			if (tokens[ current_token ] == menu[ current_pos ].name)
			{
				if (current_token == tokens.length - 1) // Last token
				{
					return menu[ current_pos ];
				}
				if (menu[ current_pos ].children)
				menu = menu[ current_pos ].children!;
				current_pos = 0;
				current_token++;
				continue;

			}

			// Check next entry in this menu
			current_pos++;
		}
		return undefined;
	}

	// Update top main menu
	updateMenu()
	{
		const that = this;

		this.content.innerHTML = "";
		const clickCallback = function(element: HTMLLIElementPlus, e: MouseEvent)
		{
			const el = element;
			const item = el.data;

			if (item.data && item.data.callback && typeof(item.data.callback) == "function")
			{
				item.data.callback(item.data);
			}

			if (!that.is_open)
			{
				that.is_open = true;
				that.showMenu(item, e, el);
			}
			else
			{
				that.is_open = false;
				that.hidePanels();
			}
		};
		const mouseOverCallback = function(element: HTMLLIElementPlus, e: MouseEvent)
		{
			that.hidePanels();
			if (that.is_open || that.auto_open)
			{
				const el = element;
				that.showMenu(el.data, e, el);
			}
		};
		for (const i in this.menu)
		{
			const element = document.createElement("li") as HTMLLIElementPlus;
			element.innerHTML = "<span class='icon'></span><span class='name'>" + this.menu[i].name + "</span>";
			this.content.appendChild(element);
			element.data = this.menu[i];
			this.menu[i].element = element;

			/* ON CLICK TOP MAIN MENU ITEM */
			element.addEventListener("click", clickCallback.bind(undefined,element));
			element.addEventListener("mouseover", mouseOverCallback.bind(undefined,element));
		}
	}

	hidePanels()
	{
		if (!this.panels.length)
		{return;}
		this.is_open = false;
		for (const i in this.panels)
		{LiteGUI.remove(this.panels[i]);}
		this.panels = [];
	}

	// Create the panel with the drop menu
	showMenu(menu: HTMLDivElement, e: MouseEvent, root: HTMLLIElementPlus | HTMLParagraphElementPlus, is_submenu: boolean = false)
	{
		this.is_open = true;
		if (!is_submenu) {this.hidePanels();}

		if (!menu.children || !menu.children.length) {return;}

		const that = this;
		if (that.closing_by_leave) {clearInterval(that.closing_by_leave);}

		const element = document.createElement("div");
		element.className = "litemenubar-panel";

		const sorted_entries = [];
		for (const i in menu.children)
		{
			sorted_entries.push(menu.children[i]);
		}

		if (this.sort_entries)
		{
			sorted_entries.sort((a,b ) =>
			{
				let a_order = 10;
				let b_order = 10;
				const aa = a as HTMLElementPlus;
				const bb = b as HTMLElementPlus;
				if (aa && aa.data && aa.data.order != null) {a_order = aa.data.order;}
				if (aa && aa.separator && aa.order != null) {a_order = aa.order;}
				if (bb && bb.data && bb.data.order != null) {b_order = bb.data.order;}
				if (bb && bb.separator && bb.order != null) {b_order = bb.order;}
				return a_order - b_order;
			});
		}

		/* ON CLICK SUBMENU ITEM */
		const clickCallback = function(element: HTMLParagraphElementPlus, e: MouseEvent)
		{
			const el = element;
			const item = el.data;
			if (item.data)
			{
				if (item.data.disabled) {return;}

				// To change variables directly
				if (item.data.instance && item.data.property)
				{
					if (item.data.type == "checkbox")
					{
						item.data.instance[item.data.property] = !item.data.instance[item.data.property];
						if (item.data.instance[item.data.property])
						{
							el.classList.add("checked");
						}
						else
						{
							el.classList.remove("checked");
						}
					}
					else if (item.data.hasOwnProperty("value"))
					{
						item.data.instance[item.data.property] = item.data.value;
					}
				}

				// To have a checkbox behaviour
				if (item.data.checkbox != null)
				{
					item.data.checkbox = !item.data.checkbox;
					if (item.data.checkbox)
					{
						el.classList.add("checked");
					}
					else
					{
						el.classList.remove("checked");
					}
				}

				// Execute a function
				if (item.data.callback && typeof(item.data.callback) == "function")
				{
					item.data.callback(item.data);
				}
			}

			// More menus
			if (item.children && item.children.length)
			{
				that.showMenu(item, e, el, true);
			}
			else if (!item.data?.keep_open)
			{
				that.is_open = false;
				that.hidePanels();
			}
			else
			{
				that.is_open = false;
				that.hidePanels();
				that.is_open = true;
				that.showMenu(menu, e, root, is_submenu);
			}
		};
		for (const i in sorted_entries)
		{
			const item = document.createElement("p") as HTMLParagraphElementPlus;
			const menu_item = sorted_entries[i] as HTMLElementPlus;

			item.className = 'litemenu-entry ' + (item.children ? " submenu" : "");
			const has_submenu = menu_item.children && menu_item.children.length;

			if (has_submenu)
			{item.classList.add("has_submenu");}

			if (menu_item && menu_item.name)
			{item.innerHTML = "<span class='icon'></span><span class='name'>" + menu_item.name + (has_submenu ? "<span class='more'>+</span>":"") + "</span>";}
			else
			{
				item.classList.add("separator");
				// Item.innerHTML = "<span class='separator'></span>";
			}

			item.data = menu_item;

			// Check if it has to show the item being 'checked'
			if (item.data.data)
			{
				const data = item.data.data;

				const checked = (data.type == "checkbox" && data.instance && data.property && data.instance[ data.property ] == true) ||
					data.checkbox == true ||
					(data.instance && data.property && data.hasOwnProperty("value") && data.instance[data.property] == data.value) ||
					(typeof(data.isChecked) == "function" && data.isChecked.call(data.instance, data));

				if (checked)
				{item.className += " checked";}

				if (data.disabled)
				{item.className += " disabled";}
			}

			item.addEventListener("click", clickCallback.bind(undefined, item));

			item.addEventListener("mouseenter",(e) =>
			{
				/*
				 *If( that.auto_open && this.classList.contains("has_submenu") )
				 *	LiteGUI.trigger( this, "click" );
				 */
			});

			element.appendChild(item);
		}

		element.addEventListener("mouseleave",(e) =>
		{
			if (that.closing_by_leave)
			{
				clearInterval(that.closing_by_leave);
			}

			that.closing_by_leave = setTimeout(() =>
			{
				that.is_open = false;
				that.hidePanels();
			});
			//},LiteGUI.Menubar.closing_time);
		});

		element.addEventListener("mouseenter",(e) =>
		{
			if (that.closing_by_leave)
			{
				clearInterval(that.closing_by_leave);
			}
			that.closing_by_leave = null;
		});

		// Compute X and Y for menu
		const box = root.getBoundingClientRect();
		element.style.left = box.left + (is_submenu ? 200 : 0) + "px";
		element.style.top = box.top + box.height + (is_submenu ? -20 : 10) + "px";
		/*
		 * Animation, not working well, flickers
		 * element.style.opacity = "0.1";
		 * element.style.transform = "translate(0,-10px)";
		 * element.style.transition = "all 0.2s";
		 * setTimeout( function(){
		 * element.style.opacity = "1";
		 * element.style.transform = "translate(0,0)";
		 * },1);
		 */

		this.panels.push(element);
		document.body.appendChild(element);
	}
}

export interface SubMenu
{
	name: string;
	parent?: SubMenu;
	children: SubMenu[] | undefined;
	data?: any;
	disable?: Function;
	enable?: Function;
	separator?: boolean;
	order?: number;
	element?: HTMLLIElementPlus;
}