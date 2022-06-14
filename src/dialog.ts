import { HTMLDivElementPlus, HTMLElementPlus } from "./@types/globals";
import { LiteGUI } from "./core";

/** **************** DIALOG **********************/
export class Dialog
{
	width?: string;
	height?: string;
	minWidth?: string;
	minHeight?: string;
	content?: HTMLDivElement;
	root?: HTMLDivElementPlus = undefined;
	footer?: HTMLDivElement;
	dialog_window?: Window;
	old_box?: DOMRect;
	minimized: any = [];
	header?: HTMLDivElement;
	detach_window: any;
	resizable: boolean = false;
	draggable: boolean = false;
	on_resize?: Function;
	onclose?: Function;
	on_attached_to_DOM?: Function;
	on_detached_from_DOM?: Function;
	private _old_height?: string;

	public static MINIMIZED_WIDTH = 200;
	public static title_height = "20px";

	/**
	 * Dialog
	 *
	 * @class Dialog
	 * @param {Object} options useful options are { title, width, height, closable, on_close, scroll }
	 * @constructor
	 */
	constructor(options : any, legacy : any = undefined)
	{
		if (legacy || (options && options.constructor === String))
		{
			const id = options;
			options = legacy || {};
			options.id = id;
			console.warn("LiteGUI.Dialog legacy parameter, use options as first parameter instead of id.");
		}

		this._ctor(options);
	}

	getDialog(id : string) : HTMLElementPlus | null
	{
		const element = document.getElementById(id) as HTMLElementPlus;
		if (!element)
		{return null;}
		return element.dialog;
	}

	_ctor(options : any)
	{
		options = options || {};

		const that = this;
		this.width = options.width;
		this.height = options.height;
		this.minWidth = options.minWidth || 150;
		this.minHeight = options.minHeight || 100;
		this.content = options.content || "";

		const panel = document.createElement("div") as any;
		if (options.id) {panel.id = options.id;}

		panel.className = "litedialog " + (options.className || "");
		panel.data = this;
		panel.dialog = this;

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

		code += "<div class='content'>"+this.content+"</div>";
		code += "<div class='panel-footer'></div>";
		panel.innerHTML = code;

		this.root = panel;
		this.content = panel.querySelector(".content");
		this.footer = panel.querySelector(".panel-footer");

		if (options.fullcontent)
		{
			this.content!.style.width = "100%";
			this.content!.style.height = options.title ? "calc( 100% - "+Dialog.title_height+" )" : "100%";
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
		const close_button = panel.querySelector(".close-button");
		if (close_button)
		{
			close_button.addEventListener("click", this.close.bind(this));
		}

		const maximize_button = panel.querySelector(".maximize-button");
		if (maximize_button)
		{
			maximize_button.addEventListener("click", this.maximize.bind(this));
		}

		const minimize_button = panel.querySelector(".minimize-button");
		if (minimize_button)
		{
			minimize_button.addEventListener("click", this.minimize.bind(this));
		}

		const hide_button = panel.querySelector(".hide-button");
		if (hide_button)
		{
			hide_button.addEventListener("click", this.hide.bind(this));
		}

		const detach_button = panel.querySelector(".detach-button");
		if (detach_button)
		{
			detach_button.addEventListener("click", () => { that.detachWindow(undefined, undefined); });
		}

		// Size, draggable, resizable, etc
		this.enableProperties(options);

		this.root?.addEventListener("DOMNodeInsertedIntoDocument", ()=>
		{
			if (that.on_attached_to_DOM) {that.on_attached_to_DOM();}
			if (that.on_resize) {that.on_resize();}
		});
		this.root?.addEventListener("DOMNodeRemovedFromDocument", ()=>
		{
			if (that.on_detached_from_DOM)
			{
				that.on_detached_from_DOM();
			}
		});


		// Attach
		if (options.attach || options.parent)
		{
			let parent = null;
			if (options.parent)
			{parent = typeof(options.parent) == "string" ? document.querySelector(options.parent) : options.parent;}
			if (!parent)
			{parent = LiteGUI.root;}
			parent.appendChild(this.root);
			this.center();
		}
	}

	/**
	 * Add widget or html to the content of the dialog
	 * @method add
	 */
	add(litegui_item : any)
	{
		this.content?.appendChild(litegui_item.root || litegui_item);
	}

	// Takes the info from the parent to
	enableProperties(options : any)
	{
		options = options || {};
		const that = this;

		const panel = this.root as any;
		panel.style.position = "absolute";
		// Panel.style.display = "none";

		panel.style.minWidth = this.minWidth + "px";
		panel.style.minHeight = this.minHeight + "px";

		if (this.width)
		{panel.style.width = this.width + "px";}

		if (this.height)
		{
			if (typeof(this.height) == "number")
			{
				panel.style.height = this.height + "px";
			}
			else
			{
				if (this.height.indexOf("%") != -1)
				{panel.style.height = this.height;}
			}

			this.content!.style.height = "calc( " + this.height + "px - 24px )";
		}

		panel.style.boxShadow = "0 0 3px black";

		if (options.draggable)
		{
			this.draggable = true;
			LiteGUI.draggable(panel, panel.querySelector(".panel-header"), ()=>
			{
				that.bringToFront();
			},()=>{}, ()=>
			{
				return !that.minimized;
			});
		}

		if (options.resizable)
		{this.setResizable();}
	}

	setResizable()
	{
		if (this.resizable)
		{return;}

		const root = this.root as any;
		this.resizable = true;
		const footer = this.footer;
		footer!.style.minHeight = "4px";
		footer!.classList.add("resizable");

		const corner = document.createElement("div");
		corner.className = "resizable-corner";
		this.root?.appendChild(corner);

		const mouse = [0,0];
		const that = this;

		let is_corner = false;

		const inner_mouse = function(e : any)
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
				const neww = w - (mouse[0] - e.pageX);

				const h = rect.height;
				const newh = h - (mouse[1] - e.pageY);

				if (is_corner) {root.style.width = neww + "px";}
				root.style.height = newh + "px";

				mouse[0] = e.pageX;
				mouse[1] = e.pageY;
				that.content!.style.height = "calc( 100% - 24px )";

				if (that.on_resize && (w != neww || h != newh))
				{
					that.on_resize(e,neww,newh);
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

	dockTo(parent : any, dock_type : string)
	{
		if (!parent) {return;}
		const panel = this.root as any;

		dock_type = dock_type || "full";
		parent = parent.content || parent;

		panel.style.top = 0;
		panel.style.left = 0;

		panel.style.boxShadow = "0 0 0";

		if (dock_type == "full")
		{
			panel.style.position = "relative";
			panel.style.width = "100%";
			panel.style.height = "100%";
			this.content!.style.width = "100%";
			this.content!.style.height = "calc(100% - "+ LiteGUI.Panel.title_height +")"; // Title offset: 20px
			this.content!.style.overflow = "auto";
		}
		else if (dock_type == 'left' || dock_type == 'right')
		{
			panel.style.position = "absolute";
			panel.style.top = 0;
			panel.style[dock_type] = 0;

			panel.style.width = this.width + "px";
			panel.style.height = "100%";
			this.content!.style.height = "calc(100% - "+ LiteGUI.Panel.title_height +")";
			this.content!.style.overflow = "auto";

			if (dock_type == 'right')
			{
				panel.style.left = "auto";
				panel.style.right = 0;
			}
		}
		else if (dock_type == 'bottom' || dock_type == 'top')
		{
			panel.style.width = "100%";
			panel.style.height = this.height + "px";
			if (dock_type == 'bottom')
			{
				panel.style.bottom = 0;
				panel.style.top = "auto";
			}
		}

		if (this.draggable)
		{
			LiteGUI.draggable(panel);
		}


		if (parent.content)
		{parent.content.appendChild(panel);}
		else if (typeof(parent) == "string")
		{
			parent = document.querySelector(parent);
			if (parent)
			{parent.appendChild(panel);}
		}
		else
		{parent.appendChild(panel);}
	}

	addButton(name : string, options : any)
	{
		options = options || {};
		if (options.constructor === Function)
		{options = { callback: options };}

		const that = this;
		const button = document.createElement("button");
		button.className = "litebutton";

		button.innerHTML = name;
		if (options.className)
		{button.className += " " + options.className;}

		this.root!.querySelector(".panel-footer")!.appendChild(button);

		const buttonCallback = function(e : any)
		{
			if (options.callback)
			{
				options.callback(button);
			}

			if (options.close)
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
		LiteGUI.remove(this.root);
		LiteGUI.trigger(this, "closed", this);
		if (this.on_close)
		{this.on_close();}
		if (this.onclose)
		{console.warn("Dialog: Do not use onclose, use on_close instead");}
		if (this.dialog_window)
		{
			this.dialog_window.close();
			this.dialog_window = undefined;
		}
	}
	
	on_close() 
	{
		throw new Error("Method not implemented.");
	}


	highlight(time : number)
	{
		time = time || 100;
		this.root!.style.outline = "1px solid white";
		const doc = this.root!.ownerDocument as any;
		const w = doc.defaultView || doc.parentWindow;
		w.focus();
		setTimeout((()=>
		{
			this.root!.style.outline = null!;
		}), time);
	}

	minimize()
	{
		if (this.minimized)
		{return;}

		this.minimized = true;
		this.old_box = this.root?.getBoundingClientRect();

		(this.root!.querySelector(".content") as HTMLElement)!.style.display = "none";

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
			const parent = dialog.root.parentNode;
			const pos = parent.getBoundingClientRect().height - 20;
			dialog.root.style.left = LiteGUI.Dialog.MINIMIZED_WIDTH * parseInt(i);
			dialog.root.style.top = pos + "px";
		}
	}

	maximize()
	{
		if (!this.minimized)
		{return;}
		this.minimized = false;

		(this.root!.querySelector(".content") as HTMLElement).style.display = "";
		LiteGUI.draggable(this.root);
		this.root!.style.left = this.old_box!.left+"px";
		this.root!.style.top = this.old_box!.top + "px";
		this.root!.style.width = this.old_box!.width + "px";
		this.root!.style.height = this.old_box!.height + "px";

		const minimize_button = this.root!.querySelector(".minimize-button") as HTMLElement;
		if (minimize_button)
		{minimize_button.style.display = "";}

		const maximize_button = this.root!.querySelector(".maximize-button") as HTMLElement;
		if (maximize_button)
		{maximize_button.style.display = "none";}

		this.minimized.splice(this.minimized.indexOf(this), 1);
		this.arrangeMinimized();
		LiteGUI.trigger(this, "maximizing");
	}

	makeModal()
	{
		LiteGUI.showModalBackground(true);
		LiteGUI.modalbg_div?.appendChild(this.root as HTMLDivElementPlus); // Add panel
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
		const parent = this.root?.parentNode;
		parent!.removeChild(this.root as HTMLDivElementPlus);
		parent!.appendChild(this.root as HTMLDivElementPlus);
	}

	/**
	 * Shows a hidden dialog
	 * @method show
	 */
	show(v : any = undefined, reference_element : any = undefined)
	{
		if (!this.root?.parentNode)
		{
			if (!reference_element)
			{LiteGUI.add(this);}
			else
			{
				const doc = reference_element.ownerDocument;
				const parent = doc.querySelector(".litegui-wrap") || doc.body;
				parent.appendChild(this.root);
				const w = doc.defaultView || doc.parentWindow;
				w.focus();
			}
			this.center();
		}

		if (!this.detach_window)
		{
			this.root!.style.display = "";
			LiteGUI.trigger(this, "shown");
		}
	}

	/**
	 * Hides the dialog
	 * @method hide
	 */
	hide(v : any)
	{
		this.root!.style.display = "none";
		LiteGUI.trigger(this, "hidden");
	}

	fadeIn(time : number)
	{
		time = time || 1000;
		this.root!.style.display = "";
		this.root!.style.opacity = "0";
		const that = this;
		setTimeout(()=>
		{
			that.root!.style.transition = "opacity "+time+"ms";
			that.root!.style.opacity = "1";
		},100);
	}

	setPosition(x : number, y : number)
	{
		if (!this.root?.parentNode)
		{console.warn("LiteGUI.Dialog: Cannot set position of dialog if it is not in the DOM");}
		this.root!.position = "absolute";
		this.root!.style.left = x + "px";
		this.root!.style.top = y + "px";
	}

	setSize(w : number, h : number)
	{
		this.root!.style.width = typeof(w) == "number" ? w + "px" : w;
		this.root!.style.height = typeof(h) == "number" ? h + "px" : h;
	}

	setTitle(text : string)
	{
		if (!this.header)
		{return;}
		this.header.innerHTML = text;
	}

	center()
	{
		if (!this.root?.parentNode)
		{return;}

		this.root.position = "absolute";
		const width = this.root.offsetWidth;
		const height = this.root.offsetHeight;
		const parent_width = (this.root.parentNode as any).offsetWidth;
		const parent_height = (this.root.parentNode as any).offsetHeight;
		this.root.style.left = Math.floor((parent_width - width) * 0.5) + "px";
		this.root.style.top = Math.floor((parent_height - height) * 0.5) + "px";
	}

	/**
	 * Adjust the size of the dialog to the size of the content
	 * @method adjustSize
	 * @param {number} margin
	 */
	adjustSize(margin : number, skip_timeout : boolean)
	{
		margin = margin || 0;
		this.content!.style.height = "auto";

		if (this.content!.offsetHeight == 0 && !skip_timeout) // Happens sometimes if the dialog is not yet visible
		{
			const that = this;
			setTimeout(()=> { that.adjustSize(margin, true); }, 1);
			return;
		}

		let extra = 0;
		const footer = this.root?.querySelector(".panel-footer") as any;
		if (footer)
		{extra += footer.offsetHeight;}

		const width = this.content!.offsetWidth;
		const height = this.content!.offsetHeight + 20 + margin + extra;

		this.setSize(width, height);
	}

	clear()
	{
		this.content!.innerHTML = "";
	}

	detachWindow(on_complete : Function | undefined, on_close : Function | undefined) : Window | undefined
	{
		if (this.dialog_window)
		{return;}

		// Create window
		const rect = this.root!.getClientRects()[0];
		const w = rect.width;
		const h = rect.height;
		let title = "Window";
		const header = this.root?.querySelector(".panel-header");
		if (header)
		{title = header.textContent as string;}

		const dialog_window = window.open("","","width="+w+", height="+h+", location=no, status=no, menubar=no, titlebar=no, fullscreen=yes") as Window;
		dialog_window.document.write("<head><title>"+title+"</title>");
		this.dialog_window = dialog_window;

		// Transfer style
		const styles = document.querySelectorAll("link[rel='stylesheet'],style");
		for (let i = 0; i < styles.length; i++)
		{dialog_window.document.write(styles[i].outerHTML);}
		dialog_window.document.write("</head><body></body>");
		dialog_window.document.close();

		const that = this;

		// Closing event
		dialog_window.onbeforeunload = function()
		{
			const index = LiteGUI.windows.indexOf(dialog_window);
			if (index != -1)
			{LiteGUI.windows.splice(index, 1);}
			if (on_close)
			{on_close();}
		};

		// Move the content there
		dialog_window.document.body.appendChild(this.content as HTMLDivElement);
		this.root!.style.display = "none"; // Hide
		this._old_height = this.content?.style.height;
		this.content!.style.height = "100%";

		LiteGUI.windows.push(dialog_window);

		if (on_complete)
		{on_complete();}

		return dialog_window;
	}

	reattachWindow(on_complete : Function)
	{
		if (!this.dialog_window)
		{return;}

		this.root?.appendChild(this.content as HTMLDivElement);
		this.root!.style.display = ""; // Show
		this.content!.style.height = this._old_height as string;
		delete this._old_height;
		this.dialog_window.close();
		const index = LiteGUI.windows.indexOf(this.dialog_window);
		if (index != -1)
		{LiteGUI.windows.splice(index, 1);}
		this.dialog_window = undefined;
	}

	//* ********************************************

	showAll()
	{
		const dialogs = document.body.querySelectorAll("litedialog");
		for (let i = 0; i < dialogs.length; i++)
		{
			const dialog = dialogs[i] as any;
			dialog.dialog.show();
		}
	};

	hideAll()
	{
		const dialogs = document.body.querySelectorAll("litedialog");
		for (let i = 0; i < dialogs.length; i++)
		{
			const dialog = dialogs[i] as any;
			dialog.dialog.hide();
		}
	};

	closeAll()
	{
		const dialogs = document.body.querySelectorAll("litedialog");
		for (let i = 0; i < dialogs.length; i++)
		{
			const dialog = dialogs[i] as any;
			dialog.dialog.close();
		}
	};

}