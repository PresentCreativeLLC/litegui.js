import { LiteGUI, special_codes } from "./core";
import { HTMLDivElementPlus, HTMLLIElementPlus, HTMLParagraphElementPlus, LiteguiObject } from "./@types/globals/index";

export interface TabsOptions
{
	selected?: boolean;
	onclose?: Function;
	className?: string;
	parent?: string | HTMLDivElement;
	height?: string | number;
	width?: string | number;
	index?: number;
	bigicon?: string;
	title?: string;
	callback?: Function;
	callback_leave?: Function;
	callback_context?: Function;
	callback_canopen?: Function;
	skip_callbacks?: boolean;
	content?: HTMLDivElementPlus | string;
	closable?: boolean;
	tab_width?: number | string;
	tab_className?: string;
	id?: string;
	size?: string | number;
	mode?: string;
	button?: boolean;
	autoswitch? : boolean;
}

/**
 * Widget that contains several tabs and their content
 * Options:
 * - mode: "vertical","horizontal"
 * - size
 * - width,height
 * - autoswitch: allow autoswitch (switch when mouse over)
 * @class Tabs
 * @constructor
 */
export class Tabs
{
	root: HTMLDivElementPlus;
	options: TabsOptions;
	mode: string;
	current_tab: number;
	previous_tab: number;
	list: HTMLUListElement;
	tabs_root: HTMLElement;
	tabs: tab_info[];
	tabs_by_index: tab_info[];
	selected: string | null;
	onchange: CallableFunction;
	plus_tab?: tab_info | Node;
	_timeout_mouseover?: NodeJS.Timeout | null;
	static tabs_width: number = 64;
	static tabs_height: number = 26;
    
	constructor(options?: TabsOptions | string, legacy?: object)
	{
		if (legacy || (options && options.constructor === String))
		{
			const id = options;
			options = legacy || {};
			(options as TabsOptions).id = id as string;
			console.warn("LiteGUI.Tabs legacy parameter, use options as first parameter instead of id.");
		}

		this.options = (options as TabsOptions) || {};
		const op = options as TabsOptions;

		const mode = this.mode = op.mode || "horizontal";

		const root = document.createElement("div") as HTMLDivElementPlus;
		if (op.id) { root.id = op.id; }
		root.data = this;
		root.className = "litetabs " + mode;
		this.root = root;
		this.root.tabs = this;

		//this.current_tab = null; // Current tab array [id, tab, content]
		this.current_tab = -1;
		this.previous_tab = -1;
		if (mode == "horizontal") {
			if (op.size) {
				if (op.size == "full") { this.root.style.height = "100%"; }
				else { this.root.style.height = op.size.toString(); }
			}
		}
		else if (mode == "vertical") {
			if (op.size) {
				if (op.size == "full") { this.root.style.width = "100%"; }
				else { this.root.style.width = op.size.toString(); }
			}
		}

		if (op.width) { this.root.style.width = op.width.constructor === Number ? op.width.toFixed(0) + "px" : op.width.toString(); }
		if (op.height) { this.root.style.height = op.height.constructor === Number ? op.height.toFixed(0) + "px" : op.height.toString(); }

		// Container of tab elements
		const list = document.createElement("ul");
		list.className = "wtabcontainer";
		if (mode == "vertical") { list.style.width = Tabs.tabs_width + "px"; }
		else { list.style.height = Tabs.tabs_height + "px"; }

		// Allows to use the wheel to see hidden tabs
		list.addEventListener("wheel", this.onMouseWheel);
/* 		list.addEventListener("mousewheel", this.onMouseWheel); */ //Deprecated

		this.list = list;
		this.root.appendChild(this.list);
		this.tabs_root = list;

		this.tabs = [];
		this.tabs_by_index = [];
		this.selected = null;

		this.onchange = op.callback!;

		if (op.parent) { this.appendTo(op.parent as HTMLDivElement); }
	}

	onMouseWheel(e: WheelEvent) {
		if (e.deltaY) { this.list.scrollLeft += e.deltaY; }
	}

	show() {
		this.root.style.display = "block";
	}

	hide() {
		this.root.style.display = "none";
	}


	/**
	 * Returns the currently selected tab in the form of a tab object
	 * @method getCurrentTab
	 * @return {Object} the tab in the form of an object with {id,tab,content}
	 */
	getCurrentTab() {
		return this.tabs[this.current_tab].tab;
	}

	getCurrentTabId() {
		return this.tabs[this.current_tab].id;
	}

	/**
	 * Returns the last tab pressed before this one. used to know from which tab we come
	 * @method getCurrentTab
	 * @return {Object} the tab in the form of an object with {id,tab,content}
	 */
	getPreviousTab() {
		return this.tabs[this.previous_tab].tab;
	}

	appendTo(parent: HTMLElement, at_front?: boolean ) {
		if (at_front) { parent.prepend(this.root); }
		else { parent.appendChild(this.root); }
	}

	/**
	 * Returns a tab given its id
	 * @method getTab
	 * @param {String} id tab id
	 * @return {Object} the tab in the form of an object with {id,tab,content}
	 */
	getTab(id: string) {
		for(let i = 0; i < this.tabs.length; i++)
		{
			if (this.tabs[i].id == id)
			{
				return this.tabs[i];
			}
		}
		return null;
	}

	/**
	 * Returns a tab given its index in the tabs list
	 * @method getTabByIndex
	 * @param {Number} index
	 * @return {Object} the tab in the form of an object with {id,tab,content}
	 */
	getTabByIndex(index: number) {
		return this.tabs_by_index[index];
	}

	/**
	 * Returns how many tabs there is
	 * @method getNumOfTabs
	 * @return {number} number of tabs
	 */
	getNumOfTabs() {
		let num = 0;
		for (const i in this.tabs) { num++; }
		return num;
	}

	/**
	 * Returns the content HTML element of a tab
	 * @method getTabContent
	 * @param {String} id
	 * @return {HTMLEntity} content
	 */
	getTabContent(id: string) {
		for(let i = 0; i < this.tabs.length; i++)
		{
			if (this.tabs[i].id == id)
			{
				return this.tabs[i].content;
			}
		}
		return null;
	}

	/**
	 * Returns the index of a tab (the position in tab)
	 */
	getTabIndexInTab(id: string)
	{
		for(let i = 0; i < this.tabs.length; i++)
		{
			if (this.tabs[i].id == id)
			{
				return i;
			}
		}
		return -1;
	}
	/**
	 * Returns the index of a tab (the position in the tabs list)
	 * @method getTabIndex
	 * @param {String} id
	 * @return {number} index
	 */
	getTabIndex(id: string) {
		let tab = null;
		for(let i = 0; i < this.tabs.length; i++)
		{
			if (this.tabs[i].id == id)
			{
				tab = this.tabs[i];
			}
		}
		if (!tab) { return -1; }
		for (let i = 0; i < this.list.childNodes.length; i++) {
			if (this.list.childNodes[i] == tab.tab) {
				return i;
			}
		}
		return -1;
	}


	/**
	 * Create a new tab, where id is a unique identifier
	 * @method addTab
	 * @param {String} id could be null then a random id is generated
	 * @param {Object} options {
	 *	title: tab text,
	 *	callback: called when selected,
	 *	callback_leave: callback when leaving,
	 *   callback_context: on right click on tab
	 *   callback_canopen: used to block if this tab can be opened or not (if it returns true then yes)
	 *	content: HTML content,
	 *   closable: if it can be closed (callback is onclose),
	 *	tab_width: size of the tab,
	 *	tab_className: classes for the tab element,
	 *	id: content id,
	 *	size: full means all,
	 *	mode: "vertical" or "horizontal",
	 *	button: if it is a button tab, not a selectable tab
	 *	}
	 * @param {bool} skip_event prevent dispatching events
	 * @return {Object} an object containing { id, tab, content }
	 */
	addTab(id: string, options: TabsOptions | Function, skip_event: boolean = false) 
	{
		if (typeof (options) == "function") { options = { callback: options }; }
		this.options = options! || {};
		const that = this;
		const op = options as TabsOptions;
		if (id === undefined || id === null) { id = "rand_" + ((Math.random() * 1000000) | 0); }

		// The tab element
		const element = document.createElement("li") as HTMLLIElementPlus;
		const safe_id = id.replace(/ /gi, "_");
		element.className = "wtab wtab-" + safe_id + " ";
		// If(options.selected) element.className += " selected";
		element.dataset["id"] = id;
		element.innerHTML = "<span class='tabtitle'>" + (op.title || id) + "</span>";

		if (op.button) { element.className += "button "; }
		if (op.tab_className) { element.className += op.tab_className; }
		if (op.bigicon) { element.innerHTML = "<img class='tabbigicon' src='" + op.bigicon + "'/>" + element.innerHTML; }
		if (op.closable) {
			element.innerHTML += "<span class='tabclose'>" + special_codes.close + "</span>";
			element.querySelector("span.tabclose")?.addEventListener("click", (e) => {
				that.removeTab(id);
				e.preventDefault();
				e.stopPropagation();
			}, true);
		}
		// WARNING: do not modify element.innerHTML or events will be lost

		if (op.index !== undefined) {
			const after = this.list.childNodes[op.index];
			if (after) { this.list.insertBefore(element, after); }
			else { this.list.appendChild(element); }
		}
		else if (this.plus_tab) { this.list.insertBefore(element, (this.plus_tab as tab_info).tab); }
		else { this.list.appendChild(element); }

		if (op.tab_width) {
			element.style.width = op.tab_width.constructor === Number ? (op.tab_width.toFixed(0) + "px") : op.tab_width.toString();
			element.style.minWidth = "0";
		}

		if (this.options.autoswitch) {
			element.classList.add("autoswitch");
			const dragEnterCallback = (e: MouseEvent) => {
				const el = e.target;
				if (that._timeout_mouseover) { clearTimeout(that._timeout_mouseover); }
				that._timeout_mouseover = setTimeout((() => {
					LiteGUI.trigger(el as EventTarget, "click");
					that._timeout_mouseover = null;
				}), 500);
			};
			element.addEventListener("dragenter", dragEnterCallback);

			element.addEventListener("dragleave", (e) => {
				// Console.log("Leave",this.dataset["id"]);
				if (that._timeout_mouseover) {
					clearTimeout(that._timeout_mouseover);
					that._timeout_mouseover = null;
				}
			});
		}


		// The content of the tab
		const content = document.createElement("div");
		if (op.id) { content.id = op.id; }

		content.className = "wtabcontent " + "wtabcontent-" + safe_id + " " + (op.className || "");
		content.dataset["id"] = id;
		content.style.display = "none";

		// Adapt height
		if (this.mode == "horizontal") {
			if (op.size) {
				content.style.overflow = "auto";
				if (op.size == "full") {
					content.style.width = "100%";
					content.style.height = "calc( 100% - " + Tabs.tabs_height + "px )"; // Minus title
					content.style.height = "-moz-calc( 100% - " + Tabs.tabs_height + "px )"; // Minus title
					content.style.height = "-webkit-calc( 100% - " + Tabs.tabs_height + "px )"; // Minus title
					// Content.style.height = "-webkit-calc( 90% )"; //minus title
				}
				else { content.style.height = op.size.toString(); }
			}
		}
		else if (this.mode == "vertical") {
			if (op.size) {
				content.style.overflow = "auto";
				if (op.size == "full") {
					content.style.height = "100%";
					content.style.width = "calc( 100% - " + Tabs.tabs_width + "px )"; // Minus title
					content.style.width = "-moz-calc( 100% - " + Tabs.tabs_width + "px )"; // Minus title
					content.style.width = "-webkit-calc( 100% - " + Tabs.tabs_width + "px )"; // Minus title
					// Content.style.height = "-webkit-calc( 90% )"; //minus title
				}
				else { content.style.width = op.size.toString(); }
			}
		}

		// Overwrite
		if (op.width !== undefined) { content.style.width = typeof (op.width) === "string" ? op.width : op.width + "px"; }
		if (op.height !== undefined) { content.style.height = typeof (op.height) === "string" ? op.height : op.height + "px"; }

		// Add content
		if (op.content) {
			if (typeof (op.content) == "string") { content.innerHTML = op.content; }
			else { content.appendChild(op.content); }
		}

		this.root.appendChild(content);

		// When clicked
		if (!op.button) {
			element.addEventListener("click", this.onTabClicked.call);
		}
		else {
			const clickCallback = (e: MouseEvent) => {
				if (!e.target) {return;}
				const tab_id = (e.target as HTMLInputElement).dataset["id"];
				if (op.callback) { op.callback(tab_id, e); }
			};
			element.addEventListener("click", clickCallback.bind(element));
		}

		element.options = options;
		element.tabs = this;

		const title = element.querySelector("span.tabtitle");

		const tabInfo: tab_info = new tab_info(id, element, content, title!);

		if (op.onclose) { tabInfo.onClose = op.onclose; }
		//let tempo = this.getTabIndexInTab(id);
		const tempo = this.tabs.length;
		this.tabs[tempo] = tabInfo;

		this.recomputeTabsByIndex();

		// Context menu
		element.addEventListener("contextmenu", ((e) => {
			if (e.button != 2) { return false; }// Right button
			e.preventDefault();
			if (op.callback_context) { op.callback_context.call(tabInfo); }
			return false;
		}));

		if (op.selected == true || this.selected == null) { this.selectTab(id, op.skip_callbacks); }

		return tabInfo;
	}

	addPlusTab(callback: CallableFunction) {
		if (this.plus_tab) { console.warn("There is already a plus tab created in this tab widget"); }
		this.plus_tab = this.addTab("plus_tab", { title: "+", tab_width: 20, button: true, callback: callback, skip_callbacks: true });
	}

	addButtonTab(id: string, title: string, callback: CallableFunction) {
		return this.addTab(id, { title: title, tab_width: 20, button: true, callback: callback, skip_callbacks: true });
	}

	// This is tab
	onTabClicked(e: MouseEvent, element: HTMLLIElementPlus) {
		// Skip if already selected
		if (element.selected) { return; }

		if (!element.parentNode) { return; } // This could happend if it gets removed while being clicked (not common)

		const options = this.options;
		if (!this) { throw ("tabs not found"); }

		// Check if this tab is available
		if (options.callback_canopen && options.callback_canopen() == false) { return; }

		const tab_id = element.dataset["id"];
		// Launch leaving current tab event
		if (this.current_tab != -1 &&
			this.tabs[this.current_tab].id != tab_id &&
			this.tabs[this.current_tab].content &&
			element.options.callback_leave) { element.options.callback_leave(this.tabs[this.current_tab].id, this.tabs[this.current_tab].tab, this.tabs[this.current_tab].content); }

		
		let tab_content = null;

		// Iterate tab labels
		for (const i in this.tabs) {
			const tab_info = this.tabs[i];
			if (i == tab_id) {
				tab_info.selected = true;
				tab_info.content.style.display = "";
				tab_content = tab_info.content;
			}
			else {
				tab_info.selected = false;
				tab_info.content.style.display = "none";
			}
		}

		const list = this.list.querySelectorAll("li.wtab");
		for (let i = 0; i < list.length; ++i) {
			//list[i].classList.remove("selected");
			(list[i] as HTMLLIElementPlus).selected = false;
		}
		element.selected = true;

		// Change tab
		this.previous_tab = this.current_tab;
		this.current_tab = this.getTabIndexInTab(tab_id!);

		if (e) // User clicked
		{
			// Launch callback
			if (options.callback) { options.callback(tab_id, tab_content, e); }

			LiteGUI.trigger(this, "wchange", [tab_id, tab_content]);
			if (this.onchange) { this.onchange(tab_id, tab_content); }
		}

		// Change afterwards in case the user wants to know the previous one
		this.selected = tab_id!;
	}

	selectTab(id: string, skip_events: boolean = false) {
		if (!id) { return; }

		// If (id.constructor != String) { id = id.id; } // In case id is the object referencing the tab

		const tabs = this.list.querySelectorAll("li.wtab");
		for (let i = 0; i < tabs.length; i++) {
			if (id == (tabs[i] as HTMLLIElementPlus).dataset["id"]) {
				// This.onTabClicked.call(tabs[i], !skip_events);
				this.onTabClicked.call;
				break;
			}
		}
	}

	setTabVisibility(id: string, v: boolean) {
		const tab = this.getTab(id);
		if (!tab) { return; }

		tab.tab.style.display = v ? "none" : "";
		tab.content.style.display = v ? "none" : "";
	}

	recomputeTabsByIndex() {
		this.tabs_by_index = [];

		for (const i in this.tabs) {
			const tab = this.tabs[i];

			// Compute index
			let index = 0;
			let child = tab.tab;
			while (child != null) {
				index++;
				child = child.previousSibling as HTMLLIElementPlus;
			}

			this.tabs_by_index[index] = tab;
		}
	}

	removeTab(id: string) {
		const tab = this.getTab(id);
		if (!tab) {
			console.warn("tab not found: " + id);
			return;
		}

		if (tab.onClose) { tab.onClose(tab); }

		if (tab.tab.parentNode) { tab.tab.parentNode.removeChild(tab.tab); }
		if (tab.content.parentNode) { tab.content.parentNode.removeChild(tab.content); }
		const index = this.getTabIndexInTab(id);
		this.tabs.splice(index, 1);
		//delete this.tabs[index];

		this.recomputeTabsByIndex();
	}

	removeAllTabs(keep_plus: boolean = false) {
		const tabs = [];
		for (const i in this.tabs) {
			tabs.push(this.tabs[i]);
		}

		for (const i in tabs) {
			const tab = tabs[i];
			if (tab == this.plus_tab && keep_plus) { continue; }
			if (tab.tab.parentNode) { tab.tab.parentNode.removeChild(tab.tab); }
			if (tab.content.parentNode) { tab.content.parentNode.removeChild(tab.content); }
			const index = this.getTabIndexInTab(tab.id);
			//delete this.tabs[index];
			this.tabs.splice(index, 1);
		}

		this.recomputeTabsByIndex();
	}

	clear() {
		this.removeAllTabs();
	}

	hideTab(id: string) {
		this.setTabVisibility(id, false);
	}

	showTab(id: string) {
		this.setTabVisibility(id, true);
	}

	transferTab(id: string, target_tabs: Tabs, index: number = 0) {
		const tab = this.getTab(id);
		if (!tab) { return; }

		target_tabs.tabs[target_tabs.getTabIndexInTab(id)] = tab;

		if (index !== undefined) {
			target_tabs.list.insertBefore(tab.tab, target_tabs.list.childNodes[index]);
		}
		else {
			target_tabs.list.appendChild(tab.tab);
		}
		target_tabs.root.appendChild(tab.content);
		//this.tabs[id] = undefined;
		//delete this.tabs[this.getTabIndexInTab(id)];
		//!IMPORTANT this.tabs.splice(this.getTabIndexInTab(id), 1);
		let newtab = null;
		for (const i in this.tabs) {
			newtab = i;
			if (newtab) { break; }
		}

		if (newtab) { this.selectTab(newtab); }

		//tab.tab.classList.remove("selected");
		tab.tab.selected = false;
		target_tabs.selectTab(id);
	}

	detachTab(id: string, on_complete: CallableFunction, on_close: CallableFunction) {
		const index = this.getTabIndex(id);
		const tab = this.tabs[index];
		if (!tab) { return; }

		

		// Create window
		const w = 800;
		const h = 600;
		const tab_window = window.open("", "", "width=" + w + ", height=" + h + ", location=no, status=no, menubar=no, titlebar=no, fullscreen=yes");
		if(!tab_window) { return; }
		tab_window.document.write("<head><title>" + id + "</title>");

		// Transfer style
		const styles = document.querySelectorAll("link[rel='stylesheet'],style");
		for (let i = 0; i < styles.length; i++) { tab_window.document.write(styles[i].outerHTML); }
		tab_window.document.write("</head><body></body>");
		tab_window.document.close();

		const that = this;

		// Transfer content after a while so the window is propertly created
		const newtabs = new LiteGUI.Tabs(undefined, this.options) as Tabs;
		tab_window.tabs = newtabs;

		// Closing event
		tab_window.onbeforeunload = function () {
			newtabs.transferTab(id, that, index);
			if (on_close) { on_close(); }
		};

		// Move the content there
		newtabs.list.style.height = "20px";
		tab_window.document.body.appendChild(newtabs.root);
		that.transferTab(id, newtabs, index);
		//newtabs.tabs[id].tab.classList.add("selected");
		newtabs.tabs[newtabs.getTabIndexInTab(id)].tab.selected = true;
		this.recomputeTabsByIndex();

		if (on_complete) { on_complete(); }

		return tab_window;
	}

	destroy(id: string)
	{
		this.removeTab(id);
	}
}

// Tab object
class tab_info
{
	id: string;
	tab: HTMLLIElementPlus;
	content: HTMLDivElement;
	title: Element;
	onClose?: Function;
	selected?: boolean;
	constructor(id: string, tab: HTMLLIElementPlus, content: HTMLDivElement, title: Element)
	{
		this.id= id;
		this.tab = tab;
		this.content = content;
		this.title = title;
	}

	add(v: LiteguiObject | HTMLDivElementPlus)
	{
		this.content.appendChild((v as LiteguiObject).root ? (v as LiteguiObject).root! : (v as HTMLDivElementPlus));
	}
	setTitle(title: string)
	{
		this.title.innerHTML = title;
	}
	click()
	{
		LiteGUI.trigger(this.tab, "click");
	}
	/*
	 * this should be moved to the main class
	 *destroy()
	 *{
	 *	that.removeTab(this.id);
	 *}
	 */
}