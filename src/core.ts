import { isArray, isFunction } from "util";
import {Area, Split} from "./area";
import { Dialog } from "./dialog";
import { Menubar} from "./menubar";
import { Panel } from "./panel";
import { Tabs } from "./tabs";
import { Button, SearchBox, ContextMenu, Checkbox, LiteBox, List, Slider, LineEditor, ComplexList } from "./widgets"
import { Console } from "./console";
import { Tree } from "./tree";
import { Inspector } from "./inspector"
import { Dragger } from "./dragger";
import { Table } from "./table";
import { ContextMenuOptions, DialogOptions, DocumentPlus, EventTargetPlus, HTMLButtonElementPlus, HTMLDivElementPlus, HTMLElementPlus, HTMLLIElementPlus, HTMLScriptElementPlus, HTMLSpanElementPlus, LiteguiObject, MessageOptions } from "./@types/globals";

let escapeHtmlEntities: any;
	// Those useful HTML unicode codes that I never remeber but I always need
	export enum special_codes {
		close = "&#10005;",
		navicon = "&#9776;",
		refresh = "&#8634;",
		gear = "&#9881;",
		open_folder = "&#128194;",
		download = "&#11123;",
		tick = "&#10003;",
		trash ="&#128465;"
	};

	/**
	 * Core namespace of LiteGUI library, it holds some useful functions
	 *
	 * @class LiteGUI
	 * @constructor
	 */
	export class Core
	{
		root: HTMLElement | null = null;
		content: HTMLElement | null = null;
		container: HTMLElement | null = null;

		panels: object = {};
		windows: Array<Window> = []; // Windows opened by the GUI (we need to know about them to close them once the app closes)

		// Undo
		undo_steps: Array<any> = [];

		// Used for blacken when a modal dialog is shown
		modalbg_div: HTMLElement | null = null;

		// The top menu
		mainmenu?: HTMLElement;

		_safe_cliboard? : string;
		menubar : Menubar | undefined;
		tabs: Tabs | undefined;
        
        Area: typeof Area = Area;
        Split: typeof Split = Split;
        Menubar: typeof Menubar = Menubar;
		Dialog: typeof Dialog = Dialog;
		Panel: typeof Panel = Panel;
		Button: typeof Button = Button;
		SearchBox: typeof SearchBox = SearchBox;
		ContextMenu: typeof ContextMenu = ContextMenu;
		Checkbox: typeof Checkbox = Checkbox;
		LiteBox: typeof LiteBox = LiteBox;
		List: typeof List = List;
		Slider: typeof Slider = Slider;
		LineEditor: typeof LineEditor = LineEditor;
		ComplexList: typeof ComplexList = ComplexList;
		Tabs: typeof Tabs = Tabs;
		Tree: typeof Tree = Tree;
		Console: typeof Console = Console;
        Inspector: typeof Inspector = Inspector;
        Dragger: typeof Dragger = Dragger;
		Table: typeof Table = Table;
        special_codes: typeof special_codes = special_codes;

		/**
		 * Initializes the lib, must be called
		 * @method init
		 * @param {object} options some options are container, menubar,
		 */
		init(options?:
			{
				width?: number,
				height?: number,
				container?: string,
				wrapped?: boolean,
				menubar?: boolean,
				gui_callback?: () => void
			}): void
		{
			options = options || {};

			// Choose main container
			this.container = null;
			if (options.container) {
				this.container = document.getElementById(options.container);
			}
			if (!this.container) {this.container = document.body;}

			if (options.wrapped)
			{
				// Create litegui root element
				const root: HTMLElement = document.createElement("div");
				root.style.position = "relative";
				root.style.overflow = "hidden";
				this.root = root;
				this.container.appendChild(root);

				// Content: the main container for everything
				const content: HTMLElement = document.createElement("div");
				this.content = content;
				this.root.appendChild(content);

				// Maximize
				if (this.root.classList.contains("fullscreen"))
				{
					window.addEventListener("resize", (e) =>
					{
						this.maximizeWindow();
					});
				}
			}
			else
			{
				this.root = this.content = this.container;
			}

			if (options.width && options.height) {
				this.setWindowSize(options.width, options.height);
			}

			this.root.className = "litegui-wrap fullscreen";
			this.content.className = "litegui-maincontent";

			// Create modal dialogs container
			const modalbg = this.modalbg_div = document.createElement("div");
			this.modalbg_div.className = "litemodalbg";
			this.root.appendChild(this.modalbg_div);
			modalbg.style.display = "none";

			// Create menubar
			if (options.menubar)
			{
				this.createMenubar();
			}

			// Called before anything
			if (options.gui_callback)
			{
				options.gui_callback();
			}

			// External windows
			window.addEventListener("beforeunload", (e) =>
			{
				for (let i = 0; i < this.windows.length; ++i)
				{
					this.windows[i].close();
				}
				this.windows = [];
			});
		}

		/**
		 * Triggers a simple event in an object (similar to jQuery.trigger)
		 * @method trigger
		 * @param {Object} element could be an HTMLEntity or a regular object
		 * @param {String} event_name the type of the event
		 * @param {*} params it will be stored in e.detail
		 * @param {*} origin it will be stored in e.srcElement
		 */
		trigger(element: HTMLElementPlus | any, event_name: string, params?: any, /*origin? : any*/): CustomEvent<any>
		{
			// TODO: fix the deprecated elements
			const evt = new CustomEvent(event_name, { detail: params });
			//event.target = origin;
			
			if (element.dispatchEvent)
			{
				element.dispatchEvent(evt);
			}
			else if (element.__events)
			{
				element.__events.dispatchEvent(evt);
			}

			// Else nothing seems binded here so nothing to do
			return evt;
		}

		/**
		 * Binds an event in an object (similar to jQuery.bind)
		 * If the element is not an HTML entity a new one is created, attached to the object (as non-enumerable, called __events) and used
		 * @method trigger
		 * @param {Object} element could be an HTMLEntity, a regular object, a query string or a regular Array of entities
		 * @param {String} event the string defining the event
		 * @param {Function} callback where to call
		 */
		bind(element : HTMLElement | object | string | Array<HTMLElement>, event : string, callback : Function): void
		{
			if (!element) {
				throw ("Cannot bind to null");
			}
			if (!event) {
				throw ("Event bind missing");
			}
			if (!callback) {
				throw ("Bind callback missing");
			}

			if (element.constructor === String)
			{
				element = document.querySelectorAll(element as string);
			}

			if (element.constructor === NodeList || element.constructor === Array)
			{
				for (let i = 0; i < element.length; ++i)
				{
					inner(element[i]);
				}
			}
			else
			{
				inner(element as HTMLElement);
			}

			function inner(element : HTMLElementPlus)
			{
				if (element.addEventListener)
				{
					element.addEventListener(event, callback as EventListenerOrEventListenerObject);
				}
				else if (element.__events)
				{
					element.__events.addEventListener(event, callback);
				}
				else
				{
					// Create a dummy HTMLentity so we can use it to bind HTML events
					const dummy = document.createElement("span") as HTMLSpanElementPlus;
					dummy.widget = element; // Double link
					Object.defineProperty(element, "__events", {
						enumerable: false,
						configurable: false,
						writable: false,
						value: dummy
					});
					element.__events.addEventListener(event, callback);
				}
			}
		}

		/**
		 * Unbinds an event in an object (similar to jQuery.unbind)
		 * @method unbind
		 * @param {Object} element could be an HTMLEntity or a regular object
		 * @param {String} event the string defining the event
		 * @param {Function} callback where to call
		 */
		unbind(element : HTMLElement | object | any, event : string, callback : Function): void
		{
			if ((element as HTMLElement).removeEventListener)
			{element.removeEventListener(event, callback);}
			else if (element.__events && element.__events.removeEventListener)
			{element.__events.removeEventListener(event, callback);}
		}

		/**
		 * Removes a class
		 * @method removeClass
		 * @param {HTMLElement} root
		 * @param {String} selector
		 * @param {String} class_name
		 */
		removeClass(elem : HTMLElement, selector : string, class_name?: string): void
		{
			if (!class_name)
			{
				class_name = selector;
				selector = "." + selector;
			}
			const list = (elem || document).querySelectorAll(selector);
			for (let i = 0; i < list.length; ++i)
			{list[i].classList.remove(class_name);}
		}

		/**
		 * Appends litegui widget to the global interface
		 * @method add
		 * @param {Object} litegui_element
		 */
		add(litegui_element : LiteguiObject): void
		{
			this.content?.appendChild((litegui_element.root as HTMLElement) || litegui_element);
		}

		/**
		 * Remove from the interface, it is is an HTML element it is removed from its parent, if it is a widget the same.
		 * @method remove
		 * @param {Object} litegui_element it also supports HTMLentity, selector string or Array of elements
		 */
		remove(litegui_element : LiteguiObject | HTMLElement | string | Array<HTMLLIElement>): void
		{
			if (!litegui_element) {return;}

			if (litegui_element.constructor === String) // Selector
			{
				const elements = document.querySelectorAll(litegui_element);
				for (let i = 0; i < elements.length; ++i)
				{
					const element = elements[i];
					if (element && element.parentNode)
					{
						element.parentNode.removeChild(element);
					}
				}
			}
			if (litegui_element.constructor === Array || litegui_element.constructor === NodeList)
			{
				for (let i = 0; i < litegui_element.length; ++i)
				{
					this.remove(litegui_element[i]);
				}
			}
			else if ((litegui_element as LiteguiObject).root && (litegui_element as LiteguiObject).root!.parentNode) // Ltiegui widget
			{
				(litegui_element as LiteguiObject).root!.parentNode!.removeChild((litegui_element as LiteguiObject).root!);
			}
			else if ((litegui_element as HTMLElement).parentNode) // Regular HTML entity
			{
				(litegui_element as HTMLElement).parentNode!.removeChild((litegui_element as HTMLElement));
			}
		}

		/**
		 * Wrapper of document.getElementById
		 * @method getById
		 * @param {String} id
		 * return {HTMLEntity}
		 *
		 */
		getById(id: string):  HTMLElement | null
		{
			return document.getElementById(id);
		}

		createMenubar(): void
		{
			this.menubar = new LiteGUI.Menubar("mainmenubar");
			this.add(this.menubar);
		}

		/*ContextMenu(options: ContextMenuOptions, values: any): ContextMenu
		{
			return new ContextMenu(values, options);
		}*/

		setWindowSize(w: number | undefined, h: number | undefined) : void
		{
			const style = this.root?.style;

			if (w && h)
			{
				style!.width = w+"px";
				style!.height = h + "px";
				style!.boxShadow = "0 0 4px black";
				this.root?.classList.remove("fullscreen");
			}
			else
			{
				if (this.root?.classList.contains("fullscreen"))
				{return;}
				this.root?.classList.add("fullscreen");
				style!.width = "100%";
				style!.height = "100%";
				style!.boxShadow = "0 0 0";
			}
			LiteGUI.trigger(LiteGUI, "resized", undefined);
		}

		maximizeWindow(): void
		{
			this.setWindowSize(undefined, undefined);
		}

		/**
		 * Change cursor
		 * @method setCursor
		 * @param {String} cursor
		 *
		 */
		setCursor(name: string): void
		{
			this.root!.style.cursor = name;
		}

		/**
		 * Test if the cursor is inside an element
		 * @method setCursor
		 * @param {String} cursor
		 *
		 */
		isCursorOverElement(event : MouseEvent, element : HTMLElement): boolean
		{
			const left = event.pageX;
			const top = event.pageY;
			const rect = element.getBoundingClientRect();
			if (!rect)
			{return false;}
			if (top > rect.top && top < (rect.top + rect.height) &&
				left > rect.left && left < (rect.left + rect.width))
			{return true;}
			return false;
		}

		getRect(element: HTMLElement): DOMRect
		{
			return element.getBoundingClientRect();
		}

		/**
		 * Copy a string to the clipboard (it needs to be invoqued from a click event)
		 * @method toClipboard
		 * @param {String} data
		 * @param {Boolean} force_local force to store the data in the browser clipboard (this one can be read back)
		 *
		 */
		toClipboard(object : string | object, force_local : boolean): void
		{
			if (object && object.constructor !== String)
			{object = JSON.stringify(object);}

			let input = null;
			let in_clipboard = false;
			if (!force_local)
			{
				try
				{
					const copySupported = document.queryCommandSupported('copy');
					input = document.createElement("input");
					input.type = "text";
					input.style.opacity = (0).toString();
					input.value = object;
					document.body.appendChild(input);
					input.select();
					in_clipboard = document.execCommand('copy');
					console.log(in_clipboard ? "saved to clipboard" : "problem saving to clipboard");
					document.body.removeChild(input);
				}
				catch (err)
				{
					if (input)
					{document.body.removeChild(input);}
					console.warn('Oops, unable to copy using the true clipboard');
				}
			}

			// Old system
			try
			{
				this._safe_cliboard = undefined;
				localStorage.setItem("litegui_clipboard", object);
			}
			catch (err)
			{
				this._safe_cliboard = object;
				console.warn("cliboard quota excedeed");
			}
		}

		/**
		 * Reads from the secondary clipboard (only can read if the data was stored using the toClipboard)
		 * @method getLocalClipboard
		 * @return {String} clipboard
		 *
		 */
		getLocalClipboard()
		{
			let data = localStorage.getItem("litegui_clipboard");
			if (!data && this._safe_cliboard)
			{data = this._safe_cliboard;}
			if (!data)
			{return null;}
			if (data[0] == "{")
			{return JSON.parse(data);}
			return data;
		}

		/**
		 * Insert some CSS code to the website
		 * @method addCSS
		 * @param {String|Object} code it could be a string with CSS rules, or an object with the style syntax.
		 *
		 */
		addCSS(code : string | object)
		{
			if (!code)
			{return;}

			if (code.constructor === String)
			{
				const style = document.createElement('style') as HTMLStyleElement;
				style.type = 'text/css';
				style.innerHTML = code;
				document.getElementsByTagName('head')[0].appendChild(style);
				return;
			}

			for (const i in (code as object))
			{document.body.style[parseInt(i)] = code[i as keyof object];}

		}

		/**
		 * Requires a new CSS
		 * @method requireCSS
		 * @param {String} url string with url or an array with several urls
		 * @param {Function} on_complete
		 *
		 */
		requireCSS(url : string | Array<string>, on_complete : Function)
		{
			if (typeof(url)=="string")
			{url = [url];}

			while (url.length)
			{
				const link  = document.createElement('link') as HTMLLinkElement;
				// Link.id   = cssId;
				link.rel  = 'stylesheet';
				link.type = 'text/css';
				link.href = url.shift(/* 1 */) as string;
				link.media = 'all';
				const head = document.getElementsByTagName('head')[0];
				head.appendChild(link);
				if (url.length == 0)
				{link.onload = on_complete as (this:GlobalEventHandlers, ev: Event) => any;}
			}
		}

		/**
		 * Request file from url (it could be a binary, text, etc.). If you want a simplied version use
		 * @method request
		 * @param {Object} request object with all the parameters like data (for sending forms), dataType, success, error
		 * @param {Function} on_complete
		 *
		 */
		request(request : {url: string, dataType: string, mimeType?: string, data?: Array<string>, nocache?: boolean, error?: Function, success?: Function})
		{
			let dataType = request.dataType || "text";
			if (dataType == "json") // Parse it locally
			{dataType = "text";}
			else if (dataType == "xml") // Parse it locally
			{dataType = "text";}
			else if (dataType == "binary")
			{
				// Request.mimeType = "text/plain; charset=x-user-defined";
				dataType = "arraybuffer";
				request.mimeType = "application/octet-stream";
			}

			// Regular case, use AJAX call
			const xhr = new XMLHttpRequest();
			xhr.open(request.data ? 'POST' : 'GET', request.url, true);
			if (dataType)
			{xhr.responseType = dataType as XMLHttpRequestResponseType;}
			if (request.mimeType)
			{xhr.overrideMimeType(request.mimeType);}
			if (request.nocache)
			{xhr.setRequestHeader('Cache-Control', 'no-cache');}

			xhr.onload = function(load)
			{
				let response = this.response;
				if (this.status != 200)
				{
					const err = "Error " + this.status;
					if (request.error)
					{request.error(err);}
					LiteGUI.trigger(xhr,"fail", this.status);
					return;
				}

				if (request.dataType == "json") // Chrome doesnt support json format
				{
					try
					{
						response = JSON.parse(response);
					}
					catch (err)
					{
						if (request.error)
						{request.error(err);}
						else
						{throw err;}
					}
				}
				else if (request.dataType == "xml")
				{
					try
					{
						const xmlparser = new DOMParser();
						response = xmlparser.parseFromString(response,"text/xml");
					}
					catch (err)
					{
						if (request.error)
						{request.error(err);}
						else
						{throw err;}
					}
				}
				if (request.success)
				{request.success.call(this, response, this);}
			};
			xhr.onerror = function(err)
			{
				if (request.error)
				{request.error(err);}
			};

			const data = new FormData();
			if (request.data)
			{
				for (const i in request.data)
				{data.append(i,request.data[i]);}
			}

			xhr.send(data);
			return xhr;
		}

		/**
		 * Request file from url
		 * @method requestText
		 * @param {String} url
		 * @param {Function} on_complete
		 * @param {Function} on_error
		 *
		 */
		requestText(url : string, on_complete : Function, on_error : Function)
		{
			return this.request({ url: url, dataType: "text", success: on_complete, error: on_error });
		}

		/**
		 * Request file from url
		 * @method requestJSON
		 * @param {String} url
		 * @param {Function} on_complete
		 * @param {Function} on_error
		 *
		 */
		requestJSON(url : string, on_complete : Function, on_error : Function)
		{
			return this.request({ url: url, dataType: "json", success: on_complete, error: on_error });
		}

		/**
		 * Request binary file from url
		 * @method requestBinary
		 * @param {String} url
		 * @param {Function} on_complete
		 * @param {Function} on_error
		 *
		 */
		requestBinary(url : string, on_complete : Function, on_error : Function)
		{
			return this.request({ url: url, dataType: "binary", success: on_complete, error: on_error });
		}


		/**
		 * Request script and inserts it in the DOM
		 * @method requireScript
		 * @param {String|Array} url the url of the script or an array containing several urls
		 * @param {Function} on_complete
		 * @param {Function} on_error
		 * @param {Function} on_progress (if several files are required, on_progress is called after every file is added to the DOM)
		 *
		 */
		requireScript(url : string | Array<string>, on_complete : Function, on_error : Function, on_progress : Function, version : Number)
		{
			if (!url) {throw ("invalid URL");}

			if (url.constructor === String) {url = [url];}

			let total = url.length;
			const size = total;
			const loaded_scripts : Array<HTMLScriptElementPlus> = [];
			const onload = function(script : HTMLScriptElementPlus, e : Event)
			{
				total--;
				loaded_scripts.push(script);
				if (total)
				{
					if (on_progress) {on_progress(script.original_src, script.num);}
				}
				else if (on_complete)
				{
					on_complete(loaded_scripts);
				}
			};

			for (const i in url as Array<string>)
			{
				const script = document.createElement('script') as HTMLScriptElementPlus;
				script.num = i;
				script.type = 'text/javascript';
				script.src = url[parseInt(i)] + (version ? "?version=" + version : "");
				script.original_src = url[parseInt(i)];
				script.async = false;
				script.onload = onload.bind(undefined, script);
				if (on_error)
				{
					script.onerror = function(err : string | Event)
					{
						on_error(err, this.original_src, this.num);
					};
				}
				document.getElementsByTagName('head')[0].appendChild(script);
			}
		}


		// Old version, it loads one by one, so it is slower
		requireScriptSerial(url : string | Array<string>, on_complete : Function, on_progress : Function)
		{
			if (typeof(url)=="string")
			{url = [url];}

			const loaded_scripts : Array<GlobalEventHandlers> = [];
			function addScript()
			{
				const script = document.createElement('script');
				script.type = 'text/javascript';
				script.src = (url as Array<string>).shift(/* 1 */) as string;
				script.onload = function(e)
				{
					if (url.length)
					{
						if (on_progress)
						{on_progress(url[0], url.length);}

						addScript();
						return;
					}

					loaded_scripts.push(this);

					if (on_complete)
					{on_complete(loaded_scripts);}
				};
				document.getElementsByTagName('head')[0].appendChild(script);
			}

			addScript();
		}

		newDiv(id : string, code : string)
		{
			return this.createElement("div",id,code, undefined, undefined);
		}

		/**
		 * Request script and inserts it in the DOM
		 * @method createElement
		 * @param {String} tag
		 * @param {String} id_class string containing id and classes, example: "myid .someclass .anotherclass"
		 * @param {String} content
		 * @param {Object} style
		 *
		 */
		createElement(tag : string, id_class : string, content : string, style?: string | object, events?: object) : HTMLElement
		{
			const elem = document.createElement(tag) as HTMLElementPlus;
			if (id_class)
			{
				const t = id_class.split(" ");
				for (let i = 0; i < t.length; i++)
				{
					if (t[i][0] == ".")
					{
						elem.classList.add(t[i].substr(1));
					}
					else if (t[i][0] == "#")
					{
						elem.id = t[i].substr(1);
					}
					else
					{
						elem.id = t[i];
					}
				}
			}
			elem.root = elem;
			if (content)
			{elem.innerHTML = content;}
			elem.add = function(v : HTMLDivElementPlus | LiteguiObject) { this.appendChild((v as LiteguiObject).root! || v); };

			if (style)
			{
				if (style.constructor === String)
				{elem.setAttribute("style",style);}
				else
				{
					for (const i in style as object)
					{
						elem.style[i as keyof object] = style[i as keyof object];
					}
				}
			}

			if (events)
			{
				for (const i in events)
				{
					elem.addEventListener(i, events[i as keyof object]);
				}
			}
			return elem;
		}

		/**
		 * Useful to create elements from a text like '<div><span class="title"></span></div>' and an object like { ".title":"mytitle" }
		 * @method createListItem
		 * @param {String} code
		 * @param {Object} values it will use innerText in the elements that matches that selector
		 * @param {Object} style
		 * @return {HTMLElement}
		 *
		 */
		createListItem(code : string, values : object, style?: object)
		{
			let elem : HTMLSpanElement | ChildNode = document.createElement("span");
			(elem as HTMLSpanElement).innerHTML = code;
			elem = elem.childNodes[0]; // To get the node
			if (values)
			{
				for (const i in values)
				{
					const subelem = (elem as HTMLSpanElement).querySelector(i) as HTMLElement;
					if (subelem) {subelem.innerText = values[i as keyof object];}
				}
			}
			if (style)
			{
				for (const i in style)
				{
					(elem as HTMLSpanElement).style[i as keyof object] = style[i as keyof object];
				}
			}
			return elem;
		}

		/**
		 * Request script and inserts it in the DOM
		 * @method createButton
		 * @param {String} id
		 * @param {String} content
		 * @param {Function} callback when the button is pressed
		 * @param {Object|String} style
		 *
		 */
		createButton(id_class : string, content : string, callback : Function, style : object | string) : HTMLButtonElement
		{
			const elem = document.createElement("button") as HTMLButtonElementPlus;
			elem.className = "litegui litebutton button";
			if (id_class)
			{
				const t = id_class.split(" ");
				for (let i = 0; i < t.length; i++)
				{
					if (t[i][0] == ".")
					{elem.classList.add(t[i].substr(1));}
					else if (t[i][0] == "#")
					{elem.id = t[i].substr(1);}
					else
					{elem.id = t[i];}
				}
			}
			elem.root = elem;
			if (content !== undefined)
			{elem.innerHTML = content;}
			if (callback)
			{elem.addEventListener("click", callback as (this: HTMLButtonElement, ev: MouseEvent) => any);}
			if (style)
			{
				if (style.constructor === String)
				{elem.setAttribute("style",style);}
				else
				{
					for (const i in style as object)
					{
						elem.style[i as keyof object] = style[i as keyof object];
					}
				}
			}
			return elem;
		}

		getParents(element : HTMLElement) : Array<HTMLElement>
		{
			const elements = [];
			let curElement = element.parentElement;
			while (curElement !== null)
			{
				if (element.nodeType !== Node.ELEMENT_NODE)
				{
					continue;
				}
				elements.push(element);
				curElement = curElement.parentElement;
			}
			return elements;
		}

		// Used to create a window that retains all the CSS info or the scripts.
		newWindow(title : string, width : number, height : number, options? : {scripts?: boolean, content?: string}) : Window
		{
			options = options || {};
			const new_window = window.open("","","width="+width+", height="+height+", location=no, status=no, menubar=no, titlebar=no, fullscreen=yes") as Window;
			new_window.document.write("<html><head><title>"+title+"</title>");

			// Transfer style
			const styles = document.querySelectorAll("link[rel='stylesheet'],style");
			for (let i = 0; i < styles.length; i++)
			{
				new_window.document.write(styles[i].outerHTML);
			}

			// Transfer scripts (optional because it can produce some errors)
			if (options.scripts)
			{
				const scripts = document.querySelectorAll("script");
				for (let i = 0; i < scripts.length; i++)
				{
					if (scripts[i].src) // Avoid inline scripts, otherwise a cloned website would be created
					{
						new_window.document.write(scripts[i].outerHTML);
					}
				}
			}

			const content = options.content || "";
			new_window.document.write("</head><body>"+content+"</body></html>");
			new_window.document.close();
			return new_window;
		}

		//* DIALOGS *******************
		showModalBackground(v : boolean)
		{
			if (this.modalbg_div)
			{this.modalbg_div.style.display = v ? "block" : "none";}
		}

		showMessage(content : string, options? : DialogOptions)
		{
			options = options || {};

			options.title = options.title || "Attention";
			options.content = content;
			options.close = 'fade';
			const dialog = new LiteGUI.Dialog(options);
			if (!options.noclose)
			{dialog.addButton("Close",{ close: true });}
			dialog.makeModal();
			return dialog;
		}

		/**
		 * Shows a dialog with a message
		 * @method popup
		 * @param {String} content
		 * @param {Object} options ( min_height, content, noclose )
		 *
		 */
		popup(content : string, options? : DialogOptions) : Dialog
		{
			options = options || {};

			options.min_height = 140;
			if (typeof(content) == "string")
			{content = "<p>" + content + "</p>";}

			options.content = content;
			options.close = 'fade';

			const dialog = new LiteGUI.Dialog(options);
			if (!options.noclose)
			{dialog.addButton("Close",{ close: true });}
			dialog.show();
			return dialog;
		}


		/**
		 * Shows an alert dialog with a message
		 * @method alert
		 * @param {String} content
		 * @param {Object} options ( title, width, height, content, noclose )
		 *
		 */
		alert(content : string, options? : MessageOptions) : Dialog
		{
			options = options || {};


			options.className = "alert";
			options.title = options.title || "Alert";
			options.width = options.width || 280;
			options.height = options.height || 140;
			if (typeof(content) == "string")
			{content = "<p>" + content + "</p>";}
			LiteGUI.remove(".litepanel.alert"); // Kill other panels
			return LiteGUI.showMessage(content,options);
		}

		/**
		 * Shows a confirm dialog with a message
		 * @method confirm
		 * @param {String} content
		 * @param {Function} callback
		 * @param {Object} options ( title, width, height, content, noclose )
		 *
		 */
		confirm(content : string, callback : Function, options? : MessageOptions) : Dialog
		{
			options = options || {};
			options.className = "alert";
			options.title = options.title || "Confirm";
			options.width = options.width || 280;
			// Options.height = 100;
			if (typeof(content) == "string")
			{content = "<p>" + content + "</p>";}

			content +="<button class='litebutton' data-value='yes' style='width:45%; margin-left: 10px'>Yes</button><button class='litebutton' data-value='no' style='width:45%'>No</button>";
			options.noclose = true;

			const dialog = this.showMessage(content,options);
			(dialog.content as HTMLDivElement).style.paddingBottom = "10px";
			const buttons = (dialog.content as HTMLDivElement).querySelectorAll("button");

			const inner = (v : MouseEvent) =>
			{
				const button = v.target as EventTargetPlus;
				const value = button.dataset["value"] == "yes";
				dialog.close(); // Close before callback
				if (callback)
				{
					callback(value);
				}
			};
			for (let i = 0; i < buttons.length; i++)
			{
				const button = buttons[i];
				button.addEventListener("click", inner);
			}
			buttons[0].focus();

			return dialog;
		}

		/**
		 * Shows a prompt dialog with a message
		 * @method prompt
		 * @param {String} content
		 * @param {Function} callback
		 * @param {Object} options ( title, width, height, content, noclose )
		 *
		 */
		prompt(content : string, callback : Function, options? : MessageOptions) : Dialog
		{
			options = options || {};
			options.className = "alert";
			options.title = options.title || "Prompt";
			options.width = options.width || 280;

			// Options.height = 140 + (options.textarea ? 40 : 0);
			if (typeof(content) == "string")
			{content = "<p>" + content + "</p>";}

			const value = options.value || "";
			let textinput = "<input type='text' value='"+value+"'/>";
			if (options.textarea)
			{textinput = "<textarea class='textfield' style='width:95%'>"+value+"</textarea>";}

			content +="<p>"+textinput+"</p><button class='litebutton' data-value='accept' style='width:45%; margin-left: 10px; margin-bottom: 10px'>Accept</button><button class='litebutton' data-value='cancel' style='width:45%'>Cancel</button>";
			options.noclose = true;
			const dialog = this.showMessage(content, options);

			const inner = function(e : Event)
			{
				const button = e.target as EventTargetPlus;
				let value = (input as HTMLDivElementPlus).value;
				if (button!.dataset && button!.dataset["value"] == "cancel")
				{
					value = undefined;
				}
				dialog.close(); // Close before callback
				if (callback) {callback(value);}
			};

			const inner_key = function(e : Event)
			{
				if (!e) {e = window.event!;}
				const keyCode = (e as KeyboardEvent).keyCode || (e as KeyboardEvent).which;
				if (keyCode == 13)
				{
					inner(e);
					return false;
				}
				if (keyCode == 29) {dialog.close();}
				return;
			};

			const buttons = (dialog.content as HTMLDivElement).querySelectorAll("button");
			for (let i = 0; i < buttons.length; i++)
			{
				buttons[i].addEventListener("click", inner);
			}

			const input = (dialog.content as HTMLDivElement).querySelector("input,textarea");
			input!.addEventListener("keydown", inner_key, true);

			(input as HTMLElement).focus();
			return dialog;
		}
		

		/**
		 * Shows a choice dialog with a message
		 * @method choice
		 * @param {String} content
		 * @param {Function} callback
		 * @param {Object} options ( title, width, height, content, noclose )
		 *
		 */
		choice(content : string, choices : object, callback : Function, options? : MessageOptions) : Dialog
		{
			options = options || {};
			options.className = "alert";
			options.title = options.title || "Select one option";
			options.width = options.width || 280;
			// Options.height = 100;
			if (typeof(content) == "string")
			{
				content = "<p>" + content + "</p>";
			}

			for (const i in choices)
			{
				content +="<button class='litebutton' data-value='"+i+"' style='width:45%; margin-left: 10px'>"+((choices as any)[i].content || choices[i as keyof object])+"</button>";
			}
			options.noclose = true;

			const dialog = this.showMessage(content,options);
			(dialog.content as HTMLDivElement).style.paddingBottom = "10px";
			const buttons = (dialog.content as HTMLDivElement).querySelectorAll("button");

			const inner = (v : MouseEvent) =>
			{
				const button = v.target as EventTargetPlus;
				const value = choices[ button.dataset["value"] as keyof object];
				dialog.close(); // Close before callback
				if (callback) {callback(value);}
			};
			for (let i = 0; i < buttons.length; i++)
			{
				buttons[i].addEventListener("click", inner);
			}

			return dialog;
		}

		downloadURL(url : string, filename : string)
		{
			const link = document.createElement('a');
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}

		downloadFile(filename : string, data : File | Blob, dataType : string)
		{
			if (!data)
			{
				console.warn("No file provided to download");
				return;
			}

			if (!dataType)
			{
				if (data.constructor === String)
				{dataType = 'text/plain';}
				else
				{dataType = 'application/octet-stream';}
			}

			let file = null;
			if (data.constructor !== File && data.constructor !== Blob)
			{file = new Blob([ data ], {type: dataType});}
			else
			{file = data;}

			const url = URL.createObjectURL(file);
			const element = document.createElement("a");
			element.setAttribute('href', url);
			element.setAttribute('download', filename);
			element.style.display = 'none';
			document.body.appendChild(element);
			element.click();
			document.body.removeChild(element);
			setTimeout(()=> { URL.revokeObjectURL(url); }, 1000*60); // Wait one minute to revoke url
		}

		/**
		 * Returns the URL vars ( ?foo=faa&foo2=etc )
		 * @method getUrlVars
		 *
		 */
		getUrlVars() : Array<string>
		{
			const vars = [];
			let hash;
			const hashes : string | Array<string> = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
			for (let i = 0; i < hashes.length; i++)
			{
			hash = hashes[i].split('=');
			vars.push(hash[0]);
			vars[hash[0] as keyof object] = hash[1];
			}
			return vars;
		}

		getUrlVar(name : string) : string
		{
			return LiteGUI.getUrlVars()[name as keyof object];
		}

		focus(element : HTMLElement | Window)
		{
			element.focus();
		}

		blur(element : HTMLElement | Window)
		{
			element.blur();
		}

		/**
		 * Makes one element draggable
		 * @method draggable
		 * @param {HTMLEntity} container the element that will be dragged
		 * @param {HTMLEntity} dragger the area to start the dragging
		 *
		 */
		draggable(container : HTMLElement, dragger? : HTMLElement, on_start? : Function, 
			on_finish? : Function, on_is_draggable? : Function)
		{
			dragger = dragger || container;
			dragger.addEventListener("mousedown", inner_mouse);
			dragger.style.cursor = "move";
			let prev_x = 0;
			let prev_y = 0;

			let rect = container.getClientRects()[0];
			let x = rect ? rect.left : 0;
			let y = rect ? rect.top : 0;

			container.style.position = "absolute";
			container.style.left = x + "px";
			container.style.top = y + "px";

			function inner_mouse(e : MouseEvent)
			{
				if (e.type == "mousedown")
				{
					if (!rect)
					{
						rect = container.getClientRects()[0];
						x = rect ? rect.left : 0;
						y = rect ? rect.top : 0;
					}

					if (on_is_draggable && on_is_draggable(container,e) == false)
					{
						e.stopPropagation();
						e.preventDefault();
						return false;
					}

					prev_x = e.clientX;
					prev_y = e.clientY;
					document.addEventListener("mousemove",inner_mouse);
					document.addEventListener("mouseup",inner_mouse);
					if (on_start)
					{on_start(container, e);}
					e.stopPropagation();
					e.preventDefault();
					return false;
				}

				if (e.type == "mouseup")
				{
					document.removeEventListener("mousemove",inner_mouse);
					document.removeEventListener("mouseup",inner_mouse);

					if (on_finish)
					{on_finish(container, e);}
					return;
				}

				if (e.type == "mousemove")
				{
					const deltax = e.clientX - prev_x;
					const deltay = e.clientY - prev_y;
					prev_x = e.clientX;
					prev_y = e.clientY;
					x += deltax;
					y += deltay;
					container.style.left = x + "px";
					container.style.top = y + "px";
				}
				return;
			}
		}

		/**
		 * Clones object content
		 * @method cloneObject
		 * @param {Object} object
		 * @param {Object} target
		 *
		 */
		cloneObject(object : object, target : object)
		{
			const o : any = target || {};
			for (const i in object)
			{
				if (i[0] == "_" || i.substring(0, 5) == "jQuery") // Skip vars with _ (they are private)
				{continue;}

				const v = object[i as keyof object] as any;
				if (v == null)
				{
					o[i] = null;
				}
				else if (typeof (v) === 'function')
				{
					continue;
				}
				else if (typeof(v) == "number" || typeof(v) == "string")
				{
					o[i] = v;
				}
				else if (v.constructor == Float32Array) // Typed arrays are ugly when serialized
				{
					o[i] = Array.apply([], v as never); // Clone
				}
				else if (Array.isArray(v))
				{
					if (o[i] && o[i].constructor == Float32Array) // Reuse old container
					{
						o[i].set(v);
					}
					else // Not safe using slice because it doesn't clone content, only container
					{
						o[i] = JSON.parse(JSON.stringify(v));
					}
				}
				else // Slow but safe
				{
					try
					{
						// Prevent circular recursions
						o[i] = JSON.parse(JSON.stringify(v));
					}
					catch (err)
					{
						console.error(err);
					}
				}
			}
			return o;
		}

		safeName(str : string) : string
		{
			return String(str).replace(/[\s.]/g, '');
		}

		// Given a html entity string it returns the equivalent unicode character
		htmlEncode(html_code : string) : string
		{
			const e = document.createElement("div");
			e.innerHTML = html_code;
			return e.innerText;
		}

		// Given a unicode character it returns the equivalent html encoded string
		htmlDecode(unicode_character : string) : string
		{
			const e = document.createElement("div");
			e.innerText = unicode_character;
			return e.innerHTML;
		}

		/**
		 * Convert sizes in any format to a valid CSS format (number to string, negative number to calc( 100% - number px )
		 * @method sizeToCSS
		 * @param {String||Number} size
		 * @return {String} valid css size string
		 *
		 */
		sizeToCSS(v?: number | string) : string | null
		{
			const value = v;
			if (value ===  undefined || value === null) {return null;}
			if (value.constructor === String) {return value;}
			if (value >= 0) {return (value as number|0) + "px";}
			return "calc( 100% - " + Math.abs(value as number|0) + "px )";
		}

		/**
		 * Returns the window where this element is attached (used in multi window applications)
		 * @method getElementWindow
		 * @param {HTMLElement} v
		 * @return {Window} the window element
		 *
		 */
		getElementWindow(v : HTMLElement) : Window
		{
			const doc = v.ownerDocument as DocumentPlus;
			return doc.defaultView || doc.parentWindow;
		}

		/**
		 * Helper, makes drag and drop easier by enabling drag and drop in a given element
		 * @method createDropArea
		 * @param {HTMLElement} element the element where users could drop items
		 * @param {Function} callback_drop function to call when the user drops the item
		 * @param {Function} callback_enter [optional] function to call when the user drags something inside
		 *
		 */
		createDropArea(element : HTMLElement, callback_drop : Function, callback_enter : Function, callback_exit : Function)
		{
			element.addEventListener("dragenter", onDragEvent);

			function onDragEvent(evt : DragEvent)
			{
				element.addEventListener("dragexit", onDragEvent as EventListenerOrEventListenerObject);
				element.addEventListener("dragover", onDragEvent);
				element.addEventListener("drop", onDrop);
				evt.stopPropagation();
				evt.preventDefault();
				if (evt.type == "dragenter" && callback_enter)
				{
					callback_enter(evt, element);
				}
				if (evt.type == "dragexit" && callback_exit)
				{
					callback_exit(evt, element);
				}
			}

			function onDrop(evt : DragEvent)
			{
				evt.stopPropagation();
				evt.preventDefault();

				element.removeEventListener("dragexit", onDragEvent as EventListenerOrEventListenerObject);
				element.removeEventListener("dragover", onDragEvent);
				element.removeEventListener("drop", onDrop);

				let r = undefined;
				if (callback_drop)
				{
					r = callback_drop(evt);
				}
				if (r)
				{
					evt.stopPropagation();
					evt.stopImmediatePropagation();
					return true;
				}
				return;
			}
		}
	};



// Low quality templating system
Object.defineProperty(String.prototype, "template", {
	value: function(data : object, eval_code : string)
	{
		let tpl = this;
		const re = /{{([^}}]+)?}}/g;
		let match;
	    while (match)
		{
			const str = eval_code ? (new Function("with(this) { try { return " + match[1] +"} catch(e) { return 'error';} }")).call(data) : data[match[1] as keyof object];
		    tpl = tpl.replace(match[0], str);
			match = re.exec(tpl);
	    }
	    return tpl;
	},
	enumerable: false
});


export function purgeElement(d : any, skip : any)
{
	let a = d.attributes, i, l, n;

	if (a)
	{
		for (i = a.length - 1; i >= 0; i -= 1)
		{
			n = a[i].name;
			if (typeof d[n] === 'function')
			{
				d[n] = null;
			}
		}
	}

	a = d.childNodes;
	if (a)
	{
		l = a.length;
		for (i = 0; i < l; i += 1)
		{
			purgeElement(d.childNodes[i], undefined);
		}
	}
}

// Useful functions

// From stackoverflow http://stackoverflow.com/questions/1354064/how-to-convert-characters-to-html-entities-using-plain-javascript

if (typeof escapeHtmlEntities == 'undefined')
{
	escapeHtmlEntities = function (text : string)
	{
		return text.replace(/[\u00A0-\u2666<>&]/g, (c) =>
		{
			return '&' +
                (escapeHtmlEntities.entityTable[c.charCodeAt(0)] || '#'+c.charCodeAt(0)) + ';';
		});
	};

	/*
	 * All HTML4 entities as defined here: http://www.w3.org/TR/html4/sgml/entities.html
	 * Added: amp, lt, gt, quot and apos
	 */
	escapeHtmlEntities.entityTable = {
		34: 'quot',
		38: 'amp',
		39: 'apos',
		60: 'lt',
		62: 'gt',
		160: 'nbsp',
		161: 'iexcl',
		162: 'cent',
		163: 'pound',
		164: 'curren',
		165: 'yen',
		166: 'brvbar',
		167: 'sect',
		168: 'uml',
		169: 'copy',
		170: 'ordf',
		171: 'laquo',
		172: 'not',
		173: 'shy',
		174: 'reg',
		175: 'macr',
		176: 'deg',
		177: 'plusmn',
		178: 'sup2',
		179: 'sup3',
		180: 'acute',
		181: 'micro',
		182: 'para',
		183: 'middot',
		184: 'cedil',
		185: 'sup1',
		186: 'ordm',
		187: 'raquo',
		188: 'frac14',
		189: 'frac12',
		190: 'frac34',
		191: 'iquest',
		192: 'Agrave',
		193: 'Aacute',
		194: 'Acirc',
		195: 'Atilde',
		196: 'Auml',
		197: 'Aring',
		198: 'AElig',
		199: 'Ccedil',
		200: 'Egrave',
		201: 'Eacute',
		202: 'Ecirc',
		203: 'Euml',
		204: 'Igrave',
		205: 'Iacute',
		206: 'Icirc',
		207: 'Iuml',
		208: 'ETH',
		209: 'Ntilde',
		210: 'Ograve',
		211: 'Oacute',
		212: 'Ocirc',
		213: 'Otilde',
		214: 'Ouml',
		215: 'times',
		216: 'Oslash',
		217: 'Ugrave',
		218: 'Uacute',
		219: 'Ucirc',
		220: 'Uuml',
		221: 'Yacute',
		222: 'THORN',
		223: 'szlig',
		224: 'agrave',
		225: 'aacute',
		226: 'acirc',
		227: 'atilde',
		228: 'auml',
		229: 'aring',
		230: 'aelig',
		231: 'ccedil',
		232: 'egrave',
		233: 'eacute',
		234: 'ecirc',
		235: 'euml',
		236: 'igrave',
		237: 'iacute',
		238: 'icirc',
		239: 'iuml',
		240: 'eth',
		241: 'ntilde',
		242: 'ograve',
		243: 'oacute',
		244: 'ocirc',
		245: 'otilde',
		246: 'ouml',
		247: 'divide',
		248: 'oslash',
		249: 'ugrave',
		250: 'uacute',
		251: 'ucirc',
		252: 'uuml',
		253: 'yacute',
		254: 'thorn',
		255: 'yuml',
		402: 'fnof',
		913: 'Alpha',
		914: 'Beta',
		915: 'Gamma',
		916: 'Delta',
		917: 'Epsilon',
		918: 'Zeta',
		919: 'Eta',
		920: 'Theta',
		921: 'Iota',
		922: 'Kappa',
		923: 'Lambda',
		924: 'Mu',
		925: 'Nu',
		926: 'Xi',
		927: 'Omicron',
		928: 'Pi',
		929: 'Rho',
		931: 'Sigma',
		932: 'Tau',
		933: 'Upsilon',
		934: 'Phi',
		935: 'Chi',
		936: 'Psi',
		937: 'Omega',
		945: 'alpha',
		946: 'beta',
		947: 'gamma',
		948: 'delta',
		949: 'epsilon',
		950: 'zeta',
		951: 'eta',
		952: 'theta',
		953: 'iota',
		954: 'kappa',
		955: 'lambda',
		956: 'mu',
		957: 'nu',
		958: 'xi',
		959: 'omicron',
		960: 'pi',
		961: 'rho',
		962: 'sigmaf',
		963: 'sigma',
		964: 'tau',
		965: 'upsilon',
		966: 'phi',
		967: 'chi',
		968: 'psi',
		969: 'omega',
		977: 'thetasym',
		978: 'upsih',
		982: 'piv',
		8226: 'bull',
		8230: 'hellip',
		8242: 'prime',
		8243: 'Prime',
		8254: 'oline',
		8260: 'frasl',
		8472: 'weierp',
		8465: 'image',
		8476: 'real',
		8482: 'trade',
		8501: 'alefsym',
		8592: 'larr',
		8593: 'uarr',
		8594: 'rarr',
		8595: 'darr',
		8596: 'harr',
		8629: 'crarr',
		8656: 'lArr',
		8657: 'uArr',
		8658: 'rArr',
		8659: 'dArr',
		8660: 'hArr',
		8704: 'forall',
		8706: 'part',
		8707: 'exist',
		8709: 'empty',
		8711: 'nabla',
		8712: 'isin',
		8713: 'notin',
		8715: 'ni',
		8719: 'prod',
		8721: 'sum',
		8722: 'minus',
		8727: 'lowast',
		8730: 'radic',
		8733: 'prop',
		8734: 'infin',
		8736: 'ang',
		8743: 'and',
		8744: 'or',
		8745: 'cap',
		8746: 'cup',
		8747: 'int',
		8756: 'there4',
		8764: 'sim',
		8773: 'cong',
		8776: 'asymp',
		8800: 'ne',
		8801: 'equiv',
		8804: 'le',
		8805: 'ge',
		8834: 'sub',
		8835: 'sup',
		8836: 'nsub',
		8838: 'sube',
		8839: 'supe',
		8853: 'oplus',
		8855: 'otimes',
		8869: 'perp',
		8901: 'sdot',
		8968: 'lceil',
		8969: 'rceil',
		8970: 'lfloor',
		8971: 'rfloor',
		9001: 'lang',
		9002: 'rang',
		9674: 'loz',
		9824: 'spades',
		9827: 'clubs',
		9829: 'hearts',
		9830: 'diams',
		338: 'OElig',
		339: 'oelig',
		352: 'Scaron',
		353: 'scaron',
		376: 'Yuml',
		710: 'circ',
		732: 'tilde',
		8194: 'ensp',
		8195: 'emsp',
		8201: 'thinsp',
		8204: 'zwnj',
		8205: 'zwj',
		8206: 'lrm',
		8207: 'rlm',
		8211: 'ndash',
		8212: 'mdash',
		8216: 'lsquo',
		8217: 'rsquo',
		8218: 'sbquo',
		8220: 'ldquo',
		8221: 'rdquo',
		8222: 'bdquo',
		8224: 'dagger',
		8225: 'Dagger',
		8240: 'permil',
		8249: 'lsaquo',
		8250: 'rsaquo',
		8364: 'euro'
	};
}

function beautifyCode(code : string, reserved : Array<String>, skip_css : boolean)
{
	reserved = reserved || ["abstract", "else", "instanceof", "super", "boolean", "enum", "int", "switch", "break", "export", "interface", "synchronized", "byte", "extends", "let", "this", "case", "false", "long", "throw", "catch", "final", "native", "throws", "char", "finally", "new", "transient", "class", "float", "null", "true", "const", "for", "package", "try", "continue", "function", "private", "typeof", "debugger", "goto", "protected", "var", "default", "if", "public", "void", "delete", "implements", "return", "volatile", "do", "import", "short", "while", "double", "in", "static", "with"];

	// Reserved words
	code = code.replace(/\b(\w+)\b/g, (v) =>
	{
		if (reserved.indexOf(v) != -1)
		{return "<span class='rsv'>" + v + "</span>";}
		return v;
	});

	// Numbers
	code = code.replace(/\b([0-9]+)\b/g, (v) =>
	{
		return "<span class='num'>" + v + "</span>";
	});

	// Obj.method
	code = code.replace(/(\w+\.\w+)/g, (v) =>
	{
		const t = v.split(".");
		return "<span class='obj'>" + t[0] + "</span>.<span class='prop'>" + t[1] + "</span>";
	});

	// Function
	code = code.replace(/(\w+)\(/g, (v) =>
	{
		return "<span class='prop'>" + v.substr(0, v.length - 1) + "</span>(";
	});

	// Strings
	code = code.replace(/("(\\.|[^"])*")/g, (v) =>
	{
		return "<span class='str'>" + v + "</span>";
	});

	// Comments
	code = code.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, (v) =>
	{ // /(\/\/[a-zA-Z0-9\?\!\(\)_ ]*)/g
		return "<span class='cmnt'>" + v.replace(/<[^>]*>/g, "") + "</span>";
	});


	if (!skip_css)
	{code = "<style>.obj { color: #79B; } .prop { color: #B97; }	.str,.num { color: #A79; } .cmnt { color: #798; } .rsv { color: #9AB; } </style>" + code;}

	return code;
}

function beautifyJSON(code : string, skip_css : boolean)
{
	if (typeof(code) == "object")
	{code = JSON.stringify(code);}

	const reserved = ["false", "true", "null"];

	// Reserved words
	code = code.replace(/(\w+)/g, (v) =>
	{
		if (reserved.indexOf(v) != -1)
		{return "<span class='rsv'>" + v + "</span>";}
		return v;
	});


	// Numbers
	code = code.replace(/([0-9]+)/g, (v) =>
	{
		return "<span class='num'>" + v + "</span>";
	});

	// Obj.method
	code = code.replace(/(\w+\.\w+)/g, (v) =>
	{
		const t = v.split(".");
		return "<span class='obj'>" + t[0] + "</span>.<span class='prop'>" + t[1] + "</span>";
	});

	// Strings
	code = code.replace(/("(\\.|[^"])*")/g, (v) =>
	{
		return "<span class='str'>" + v + "</span>";
	});

	// Comments
	code = code.replace(/(\/\/[a-zA-Z0-9?!()_ ]*)/g, (v) =>
	{
		return "<span class='cmnt'>" + v + "</span>";
	});

	if (!skip_css)
	{code = "<style>.obj { color: #79B; } .prop { color: #B97; }	.str { color: #A79; } .num { color: #B97; } .cmnt { color: #798; } .rsv { color: #9AB; } </style>" + code;}

	return code;
}

function dataURItoBlob(dataURI : string)
{
	const pos = dataURI.indexOf(",");
	// Convert to binary
	const byteString = atob(dataURI.substr(pos+1));
	// Copy from string to array
	const ab = new ArrayBuffer(byteString.length);
	const ia = new Uint8Array(ab);
	const l = byteString.length;
	for (let i = 0; i < l; i++)
	{
		ia[i] = byteString.charCodeAt(i);
	}

	let mime = dataURI.substr(5,pos-5);
	mime = mime.substr(0, mime.length - 7); // Strip ";base64"
	return new Blob([ab], { type: mime });
}

export const LiteGUI = new Core();