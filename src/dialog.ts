import { DocumentPlus, LiteGUIObject } from "./@types/globals";
import { LiteGUI } from "./core";


export interface DialogButtonOptions
{
	name?: string;
	className?: string;
	callback?: (button: HTMLButtonElement)=>void;
	close?: boolean;
}

export interface DialogOptions
{
	min_height?: number;
	parent?: string | HTMLDivElement;
	attach?: boolean;
	scroll?: boolean;
	buttons?: Array<DialogButtonOptions>;
	fullContent?: boolean;
	closable?: boolean;
	close?: string;
	detachable?: boolean;
	hide?: boolean;
	minimize?: boolean;
	title?: string;
	className?: string;
	content?: string;
	minHeight?: number | number;
	minWidth?: number | number;
	height?: string | number;
	width?: string | number;
	id?: string;
	resizable?: boolean;
	draggable?: boolean;
	onClose?: ()=>void;
}

export interface DialogRoot extends HTMLDivElement
{
	ownerDocument: DocumentPlus;
	dialog: Dialog;
	id: string;
}

type DockType = 'full' | 'left' | 'right' | 'bottom' | 'top';

/** **************** DIALOG **********************/
export class Dialog
{
	width?: string | number;
	height?: string | number;
	minWidth?: number;
	minHeight?: number;
	content!: HTMLDivElement;
	root!: DialogRoot;
	footer!: HTMLDivElement;
	dialogWindow?: Window;
	old_box?: DOMRect;
	minimized: Dialog[] = [];
	header?: HTMLDivElement;
	detach_window?: boolean;
	resizable: boolean = false;
	draggable: boolean = false;
	onResize?: (e?: MouseEvent, w?: number, h?: number) => void;
	onClose?: ()=>void;
	onAttachedToDOM?: ()=>void;
	onDetachedFromDOM?: ()=>void;
	private _oldHeight?: string;
	public static titleHeight: string = "20px";
	public static MINIMIZED_WIDTH = 200;

	/**
	 * Dialog
	 *
	 * @class Dialog
	 * @param {DialogOptions} options useful options are { title, width, height, closable, onClose, scroll }
	 * @constructor
	 */
	constructor(options? : DialogOptions | string)
	{
		if(options == undefined)
		{
			options = {};
		}
		else if (typeof options == 'string')
		{
			const id = options;
			options = {};
			options.id = id;
		}

		this.init(options);
	}

	/**
	 * Get a dialog from the document by id
	 *
	 * @param {string} id 
	 * @returns {Dialog | undefined}
	 */
	getDialog(id : string)
	{
		const element = <DialogRoot>document.getElementById(id);
		if (!element) {return;}
		return element.dialog;
	}

	init(options? : DialogOptions)
	{
		options = options ?? {};

		const that = this;
		this.width = options.width;
		this.height = options.height;
		this.minWidth = options.minWidth ?? 150;
		this.minHeight = options.minHeight ?? 100;
		const content = options.content ?? "";

		const root = <DialogRoot>document.createElement("div");
		if (options.id) {root.id = options.id;}

		root.className = "litedialog " + (options.className ?? "");
		root.dialog = this;

		let code = "";
		if (options.title)
		{
			code += "<div class='panel-header'>"+options.title+"</div><div class='buttons'>";
			if (options.minimize)
			{
				code += "<button class='litebutton mini-button minimize-button'>-</button>";
				code += "<button class='litebutton mini-button maximize-button' style='display:none'></button>";
			}
			if (options.hide) {code += "<button class='litebutton mini-button hide-button'></button>";}
			if (options.detachable) {code += "<button class='litebutton mini-button detach-button'></button>";}

			if (options.close || options.closable)
			{
				code += "<button class='litebutton mini-button close-button'>"+ LiteGUI.special_codes.close +"</button>";
			}
			code += "</div>";
		}

		code += "<div class='content'>"+content+"</div>";
		code += "<div class='panel-footer'></div>";
		root.innerHTML = code;

		this.root = root;
		this.header = root.querySelector(".panel-header") as HTMLDivElement;
		this.content = root.querySelector(".content") as HTMLDivElement;
		this.footer = root.querySelector(".panel-footer") as HTMLDivElement;

		if (options.fullContent)
		{
			this.content.style.width = "100%";
			this.content.style.height = options.title ? "calc( 100% - " + Dialog.titleHeight + " )" : "100%";
		}

		if (options.buttons)
		{
			for (const i in options.buttons)
			{
				this.addButton(options.buttons[i].name, options.buttons[i]);
			}
		}

		if (options.scroll == true) {this.content!.style.overflow = "auto";}

		// Buttons *********************************
		const close_button = root.querySelector(".close-button");
		if (close_button)
		{
			close_button.addEventListener("click", this.close.bind(this));
		}

		const maximize_button = root.querySelector(".maximize-button");
		if (maximize_button)
		{
			maximize_button.addEventListener("click", this.maximize.bind(this));
		}

		const minimize_button = root.querySelector(".minimize-button");
		if (minimize_button)
		{
			minimize_button.addEventListener("click", this.minimize.bind(this));
		}

		const hide_button = root.querySelector(".hide-button");
		if (hide_button)
		{
			hide_button.addEventListener("click", this.hide.bind(this));
		}

		const detach_button = root.querySelector(".detach-button");
		if (detach_button)
		{
			detach_button.addEventListener("click", () => { that.detachWindow(undefined, undefined); });
		}

		// Size, draggable, resizable, etc
		this.enableProperties(options);

		this.root?.addEventListener("DOMNodeInsertedIntoDocument", ()=>
		{
			if (that.onAttachedToDOM) {that.onAttachedToDOM();}
			if (that.onResize) {that.onResize();}
		});
		this.root?.addEventListener("DOMNodeRemovedFromDocument", ()=>
		{
			if (that.onDetachedFromDOM)
			{
				that.onDetachedFromDOM();
			}
		});


		// Attach
		if (options.attach || options.parent)
		{
			let parent = null;
			if (options.parent) {parent = typeof(options.parent) == "string" ? document.querySelector(options.parent) : options.parent;}
			if (!parent) {parent = LiteGUI.root;}
			parent?.appendChild(this.root);
			this.center();
		}
	}

	/**
	 * Add widget or html to the content of the dialog
	 * @method add
	 */
	add(item : LiteGUIObject)
	{
		if(item.root)
		{
			this.content.appendChild(item.root);
		}
	}

	// Takes the info from the parent to
	enableProperties(options? : DialogOptions)
	{
		options = options! || {};
		const that = this;

		const panel = this.root;
		panel.style.position = "absolute";
		// Panel.style.display = "none";

		panel.style.minWidth = this.minWidth + "px";
		panel.style.minHeight = this.minHeight + "px";

		if (this.width) {panel.style.width = this.width + "px";}

		if (this.height)
		{
			if (typeof(this.height) == "number")
			{
				panel.style.height = this.height + "px";
			}
			else if (this.height.indexOf("%") != -1)
			{
				panel.style.height = this.height;
			}

			this.content.style.height = "calc( " + this.height + "px - 24px )";
		}

		panel.style.boxShadow = "0 0 3px black";

		if (options.draggable)
		{
			this.draggable = true;
			const element = panel.querySelector(".panel-header") as HTMLElement | null;
			if(element)
			{
				LiteGUI.draggable(panel, element, ()=>
				{
					that.bringToFront();
				},()=>{}, ()=>
				{
					return !that.minimized.includes(that);
				});
			}
		}

		if (options.resizable)
		{this.setResizable();}
	}

	setResizable()
	{
		if (this.resizable) {return;}

		const root = this.root;
		this.resizable = true;
		const footer = this.footer;
		footer.style.minHeight = "4px";
		footer.classList.add("resizable");

		const corner = document.createElement("div");
		corner.className = "resizable-corner";
		this.root?.appendChild(corner);

		const mouse = [0,0];
		const that = this;

		let is_corner = false;

		const inner_mouse = function(e : MouseEvent)
		{
			const el = e.target;
			if (e.type == "mousedown")
			{
				document.body.addEventListener("mousemove", inner_mouse);
				document.body.addEventListener("mouseup", inner_mouse);
				is_corner = el == corner;
				mouse[0] = e.pageX;
				mouse[1] = e.pageY;
			}
			else if (e.type == "mousemove")
			{
				const rect = LiteGUI.getRect(root);
				const w = rect.width;
				const newW = w - (mouse[0] - e.pageX);

				const h = rect.height;
				const newH = h - (mouse[1] - e.pageY);

				if (is_corner) {root.style.width = newW + "px";}
				root.style.height = newH + "px";

				mouse[0] = e.pageX;
				mouse[1] = e.pageY;
				that.content.style.height = "calc( 100% - 24px )";

				if (that.onResize && (w != newW || h != newH))
				{
					that.onResize(e, newW, newH);
				}
			}
			else if (e.type == "mouseup")
			{
				document.body.removeEventListener("mousemove", inner_mouse);
				document.body.removeEventListener("mouseup", inner_mouse);
				is_corner = false;
			}
			e.preventDefault();
			e.stopPropagation();
			return false;
		};

		footer!.addEventListener("mousedown", inner_mouse);
		corner.addEventListener("mousedown", inner_mouse, true);
	}

	dockTo(parent : LiteGUIObject, dockType? : DockType, titleHeight?: string | number)
	{
		if (parent == undefined) {return;}

		dockType = dockType || "full";

		const panel = this.root;
		panel.style.top = "0";
		panel.style.left = "0";

		panel.style.boxShadow = "0 0 0";

		if (dockType == "full")
		{
			panel.style.position = "relative";
			panel.style.width = "100%";
			panel.style.height = "100%";
			this.content.style.width = "100%";
			this.content.style.height = "calc(100% - " + titleHeight ?? LiteGUI.Panel.titleHeight + ")"; // Title offset: 20px
			this.content.style.overflow = "auto";
		}
		else if (dockType == 'left' || dockType == 'right')
		{
			panel.style.position = "absolute";
			panel.style.top = "0";
			panel.style[dockType] = "0";

			panel.style.width = this.width + "px";
			panel.style.height = "100%";
			this.content.style.height = "calc(100% - " + titleHeight ?? LiteGUI.Panel.titleHeight + ")";
			this.content.style.overflow = "auto";

			if (dockType == 'right')
			{
				panel.style.left = "auto";
				panel.style.right = "0";
			}
		}
		else if (dockType == 'bottom' || dockType == 'top')
		{
			panel.style.width = "100%";
			panel.style.height = this.height + "px";
			if (dockType == 'bottom')
			{
				panel.style.bottom = "0";
				panel.style.top = "auto";
			}
		}

		if (this.draggable)
		{
			LiteGUI.draggable(panel);
		}

		if (typeof(parent) == "string")
		{
			parent = document.querySelector(parent);
			if (parent)
			{
				parent.appendChild(panel);
			}
		}
		else if (parent.content)
		{
			parent.content.appendChild(panel);
		}
		else if (parent.root)
		{
			parent.root.appendChild(panel);
		}
	}

	addButton(name?: string, options? : DialogButtonOptions |
		((button: HTMLButtonElement)=>void))
	{
		if (options == undefined)
		{
			options = {} as DialogButtonOptions;
		}

		if (options.constructor === Function)
		{
			options = { callback: options } as DialogButtonOptions;
		}

		const buttonOptions = options as DialogButtonOptions;

		const that = this;
		const button = document.createElement("button");
		button.className = "litebutton";

		if (name != undefined) {button.innerHTML = name;}
		if (typeof buttonOptions.className == 'string')
		{
			button.className += " " + buttonOptions.className;
		}

		this.root?.querySelector(".panel-footer")!.appendChild(button);

		const buttonCallback = function(e : any)
		{
			if (buttonOptions.callback)
			{
				buttonOptions.callback(button);
			}

			if (buttonOptions.close)
			{
				that.close();
			}
		};
		button.addEventListener("click", buttonCallback.bind(button));

		return button;
	}

	/**
	 * Destroys the dialog
	 * @method close
	 */
	close()
	{
		LiteGUI.remove(this.root!);
		LiteGUI.trigger(this, "closed", this);
		if (this.onClose) {this.onClose();}
		if (this.dialogWindow)
		{
			this.dialogWindow.close();
			this.dialogWindow = undefined;
		}
	}

	highlight(time : number)
	{
		time = time || 100;
		this.root!.style.outline = "1px solid white";
		const doc = this.root!.ownerDocument as DocumentPlus;
		const w = doc.defaultView || doc.parentWindow;
		w!.focus();
		setTimeout((()=>
		{
			this.root!.style.outline = null!;
		}), time);
	}

	minimize()
	{
		if (this.minimized.length)
		{return;}

		/* this.minimized = true; */
		this.old_box = this.root?.getBoundingClientRect();

		if(!(this.root!.querySelector(".content") as HTMLElement)) { return; }
		(this.root!.querySelector(".content") as HTMLElement).style.display = "none";

		const minimize_button = this.root?.querySelector(".minimize-button") as HTMLElement;
		if (minimize_button)
		{minimize_button.style.display = "none";}

		const maximize_button = this.root?.querySelector(".maximize-button") as HTMLElement;
		if (maximize_button)
		{maximize_button.style.display = "";}

		this.root!.style.width = LiteGUI.Dialog.MINIMIZED_WIDTH + "px";

		const closeCallback = (e : any) =>
		{
			const el = e.target;
			this.minimized.splice(this.minimized.indexOf(el), 1);
			this.arrangeMinimized();
		};
		LiteGUI.bind(this, "closed", closeCallback);

		this.minimized.push(this);
		this.arrangeMinimized();


		LiteGUI.trigger(this,"minimizing");
	}

	arrangeMinimized()
	{
		for (const i in this.minimized)
		{
			const dialog = this.minimized[i];
			const parent = dialog.root.parentNode as Element;
			const pos = parent?.getBoundingClientRect().height - 20;
			dialog.root.style.left = (LiteGUI.Dialog.MINIMIZED_WIDTH * parseInt(i)).toString();
			dialog.root.style.top = pos + "px";
		}
	}

	maximize()
	{
		if (this.minimized.length == 0) {return;}
		this.minimized = [];

		this.content.style.display = "";
		LiteGUI.draggable(this.root);
		this.root.style.left = this.old_box!.left+"px";
		this.root.style.top = this.old_box!.top + "px";
		this.root.style.width = this.old_box!.width + "px";
		this.root.style.height = this.old_box!.height + "px";

		const minimize_button = this.root.querySelector(".minimize-button") as HTMLElement;
		if (minimize_button)
		{minimize_button.style.display = "";}

		const maximize_button = this.root.querySelector(".maximize-button") as HTMLElement;
		if (maximize_button)
		{maximize_button.style.display = "none";}

		this.minimized.splice(this.minimized.indexOf(this), 1);
		this.arrangeMinimized();
		LiteGUI.trigger(this, "maximizing");
	}

	makeModal()
	{
		LiteGUI.showModalBackground(true);
		LiteGUI.modalbg_div?.appendChild(this.root); // Add panel
		this.show();
		this.center();

		LiteGUI.bind(this, "closed", inner);

		function inner(e : any)
		{
			LiteGUI.showModalBackground(false);
		}
	}

	bringToFront()
	{
		const parent = this.root.parentNode;
		if(parent)
		{
			parent.removeChild(this.root);
			parent.appendChild(this.root);
		}	
	}

	/**
	 * Shows a hidden dialog
	 * @method show
	 */
	show(ownerDocument?: DocumentPlus)
	{
		if (!this.root.parentNode)
		{
			if (!ownerDocument)
			{
				LiteGUI.add(this);
			}
			else
			{
				const doc = ownerDocument;
				const parent = doc.querySelector(".litegui-wrap") ?? doc.body;
				parent.appendChild(this.root);
				const w = doc.defaultView ?? doc.parentWindow;
				w!.focus();
			}
			this.center();
		}

		if (!this.detach_window)
		{
			this.root.style.display = "";
			LiteGUI.trigger(this, "shown");
		}
	}

	/**
	 * Hides the dialog
	 * @method hide
	 */
	hide()
	{
		this.root.style.display = "none";
		LiteGUI.trigger(this, "hidden");
	}

	fadeIn(time : number)
	{
		time = time || 1000;
		this.root.style.display = "";
		this.root.style.opacity = "0";
		const that = this;
		setTimeout(()=>
		{
			that.root!.style.transition = "opacity "+time+"ms";
			that.root!.style.opacity = "1";
		},100);
	}

	setPosition(x : number, y : number)
	{
		if (!this.root.parentNode)
		{
			console.warn("LiteGUI.Dialog: Cannot set position of dialog if it is not in the DOM");
		}
		
		this.root.style.position = "absolute";
		this.root.style.left = x + "px";
		this.root.style.top = y + "px";
	}

	setSize(w : number, h : number)
	{
		this.root!.style.width = typeof(w) == "number" ? w + "px" : w;
		this.root!.style.height = typeof(h) == "number" ? h + "px" : h;
	}

	setTitle(text : string)
	{
		if (!this.header) {return;}
		this.header.innerHTML = text;
	}

	center()
	{
		if (!this.root.parentNode) {return;}

		this.root.style.position = "absolute";
		const width = this.root.offsetWidth;
		const height = this.root.offsetHeight;
		const parentNode = this.root.parentNode as HTMLElement;
		const parent_width = parentNode.offsetWidth;
		const parent_height = parentNode.offsetHeight;
		this.root.style.left = Math.floor((parent_width - width) * 0.5) + "px";
		this.root.style.top = Math.floor((parent_height - height) * 0.5) + "px";
	}

	/**
	 * Adjust the size of the dialog to the size of the content
	 * @method adjustSize
	 * @param {number} margin
	 */
	adjustSize(margin : number, skip_timeout? : boolean)
	{
		margin = margin || 0;
		this.content.style.height = "auto";

		if (this.content.offsetHeight == 0 && !skip_timeout) // Happens sometimes if the dialog is not yet visible
		{
			const that = this;
			setTimeout(()=> { that.adjustSize(margin, true); }, 1);
			return;
		}

		let extra = 0;
		const footer = this.root.querySelector(".panel-footer") as HTMLElement;
		if (footer) {extra += footer.offsetHeight;}

		const width = this.content.offsetWidth;
		const height = this.content.offsetHeight + 20 + margin + extra;

		this.setSize(width, height);
	}

	clear()
	{
		this.content.innerHTML = "";
	}

	detachWindow(onComplete? : Function, onClose? : Function) : Window | undefined
	{
		if(this.minimized.length > 0)
		{
			this.maximize();
		}
		if (this.dialogWindow)
		{
			return;
		}

		// Create window
		const rect = this.root!.getClientRects()[0];
		const w = rect.width;
		const h = rect.height;
		let title = "Window";
		if (this.header)
		{
			title = this.header.textContent ?? '';
		}

		const dialogWindow = window.open("","","width="+w+", height="+h+", location=no, status=no, menubar=no, titlebar=no, fullscreen=yes") as Window;
		dialogWindow.document.write("<head><title>"+title+"</title>");
		this.dialogWindow = dialogWindow;

		// Transfer style
		const styles = document.querySelectorAll("link[rel='stylesheet'],style");
		for (let i = 0; i < styles.length; i++)
		{dialogWindow.document.write(styles[i].outerHTML);}
		dialogWindow.document.write("</head><body></body>");
		dialogWindow.document.close();

		// Closing event
		dialogWindow.onbeforeunload = function()
		{
			const index = LiteGUI.windows.indexOf(dialogWindow);
			if (index != -1) {LiteGUI.windows.splice(index, 1);}
			if (onClose) {onClose();}
		};

		// Move the content there
		dialogWindow.document.body.appendChild(this.content);
		this.root!.style.display = "none"; // Hide
		this._oldHeight = this.content.style.height;
		this.content.style.height = "100%";

		LiteGUI.windows.push(dialogWindow);

		if (onComplete)
		{onComplete();}

		return dialogWindow;
	}

	reattachWindow(onComplete?: ()=>void)
	{
		if (!this.dialogWindow) {return;}

		this.root.appendChild(this.content);
		this.root.style.display = ""; // Show
		if (this._oldHeight)
		{
			this.content.style.height = this._oldHeight;
			this._oldHeight = undefined;
		}

		this.dialogWindow.close();
		const index = LiteGUI.windows.indexOf(this.dialogWindow);
		if (index != -1) {LiteGUI.windows.splice(index, 1);}
		this.dialogWindow = undefined;
		
		if (onComplete) {onComplete();}
	}

	//* ********************************************

	showAll()
	{
		const dialogs = document.body.querySelectorAll("litedialog");
		for (let i = 0; i < dialogs.length; i++)
		{
			const dialog = dialogs[i] as DialogRoot;
			dialog.dialog?.show();
		}
	}

	hideAll()
	{
		const dialogs = document.body.querySelectorAll("litedialog");
		for (let i = 0; i < dialogs.length; i++)
		{
			const dialog = dialogs[i] as DialogRoot;
			dialog.dialog?.hide();
		}
	}

	closeAll()
	{
		const dialogs = document.body.querySelectorAll("litedialog");
		for (let i = 0; i < dialogs.length; i++)
		{
			const dialog = dialogs[i] as DialogRoot;
			dialog.dialog?.close();
		}
	}

}