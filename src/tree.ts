import { ChildNodePlus, HTMLDivElementPlus, HTMLLIElementPlus } from "./@types/globals";
import { LiteGUI }  from "./core";

export class Tree
{
	root : HTMLDivElementPlus;
	tree : any;
	options : any;
	root_item? : HTMLLIElementPlus;
	parentNode?: ParentNode;
	_skip_scroll : boolean = false;
	indent_offset : number;
	collapsed_depth : number;
	onItemSelected? : Function;
	onItemContextMenu? : Function;
	onBackgroundClicked? : Function;
	onContextMenu? : Function;
	onItemAddToSelection? : Function;
	onMoveItem? : Function;
	onDropItem? : Function;

	static INDENT = 20;

	/**
	 * To create interactive trees (useful for folders or hierarchies).<br>
	 * Options are:<br>
	 *	+ allow_multiselection: allow to select multiple elements using the shift key<br>
	 *	+ allow_rename: double click to rename items in the tree<br>
	 *	+ allow_drag: drag elements around<br>
	 *	+ height<br>
	 * Item data should be in the next format:<br>
	 * {<br>
	 *    id: unique_identifier,<br>
	 *    content: what to show in the HTML (if omited id will be shown)<br>
	 *	 children: []  array with another object with the same structure<br>
	 *	 className: class<br>
	 *    precontent: HTML inserted before the content<br>
	 *	 visible: boolean, to hide it<br>
	 *	 dataset: dataset for the element<br>
	 *	 onDragData: callback in case the user drags this item somewhere else<br>
	 * }<br>
	 * To catch events use tree.root.addEventListener(...)<br>
	 * item_selected : receive { item: node, data: node.data }<br>
	 * item_dblclicked<br>
	 * item_renamed<br>
	 * item_moved<br>
	 *
	 * @class Tree
	 * @constructor
	 */
	constructor(data : any, options : any, legacy : any)
	{
		if (legacy || (data && data.constructor === String))
		{
			const id = data;
			data = options;
			options = legacy || {};
			options.id = id;
			console.warn("LiteGUI.Tree legacy parameter, use data as first parameter instead of id.");
		}

		options = options || {};

		const root = document.createElement("div");
		this.root = root as HTMLDivElementPlus;
		if (options.id) {root.id = options.id;}

		root.className = "litetree";
		this.tree = data;
		const that = this;
		options = options || {allow_rename: false, allow_drag: true, allow_multiselection: false};
		this.options = options;
		this.indent_offset = options.indent_offset || 0;

		if (options.height)
		{
			this.root.style.height = typeof(options.height) == "string" ? options.height : Math.round(options.height) + "px";
		}

		this.collapsed_depth = 3;
		if (options.collapsed_depth != null) { this.collapsed_depth = options.collapsed_depth; }

		// Bg click
		root.addEventListener("click", (e)=>
		{
			if (e.target != that.root) {return;}
			if (that.onBackgroundClicked) {that.onBackgroundClicked(e,that);}
		});

		// Bg click right mouse
		root.addEventListener("contextmenu", (e) =>
		{
			if (e.button != 2) {return false;} // Right button

			if (that.onContextMenu) {that.onContextMenu(e);}
			e.preventDefault();
			return false;
		});


		const root_item = this.createAndInsert(data, options, null, undefined);
		if (!root_item)
		{
			throw ("Error in LiteGUI.Tree, createAndInsert returned null");
		}
		root_item.className += " root_item";
		this.root_item = root_item;

	}

	/**
	 * Update tree with new data (old data will be thrown away)
	 * @method updateTree
	 * @param {object} data
	 */
	updateTree(data : any)
	{
		this.root.innerHTML = "";
		const root_item = this.createAndInsert(data, this.options, null, undefined);
		if (root_item)
		{
			root_item.className += " root_item";
			this.root_item = root_item;
		}
		else
		{
			this.root_item = undefined;
		}
	};

/**
	 * Update tree with new data (old data will be thrown away)
	 * @method insertItem
	 * @param {object} data
	 * @param {string} parent_id
	 * @param {number} position index in case you want to add it before the last position
	 * @param {object} options
	 * @return {DIVElement}
	 */
	insertItem(data : any, parent_id : string, position : number, options: any) : HTMLLIElementPlus | undefined
	{
		if (!parent_id)
		{
			const root = this.root.childNodes[0] as ChildNodePlus;
			if (root)
			{
				parent_id = root.dataset["item_id"];
			}
		}

		const element = this.createAndInsert(data, options, parent_id, position);

		// Update parent collapse button
		if (parent_id)
		{
			this._updateListBox(this._findElement(parent_id)); // No options here, this is the parent
		}

		return element;
	};

	createAndInsert(data : any, options : any, parent_id : string | null, element_index : number | undefined) : HTMLLIElementPlus | undefined
	{
		// Find parent
		let parent_element_index = -1;
		if (parent_id)
		{
			parent_element_index = this._findElementIndex(parent_id);
		}
		else if (parent_id === undefined)
		{
			parent_element_index = 0; // Root
		}

		let parent = null;
		let child_level = 0;

		// Find level
		if (parent_element_index != -1)
		{
			parent = this.root.childNodes[ parent_element_index ];
			child_level = parseInt((parent as any).dataset["level"]) + 1;
		}

		// Create
		const element = this.createTreeItem(data, options, child_level) as HTMLLIElementPlus;
		if (!element) {return;} // Error creating element

		element.parent_id = parent_id as string;

		// Check
		const existing_item = this.getItem(element.dataset["item_id"] as any);
		if (existing_item) {console.warn("There another item with the same ID in this tree");}

		// Insert
		if (parent_element_index == -1)
		{
			this.root.appendChild(element);
		}
		else
		{
			this._insertInside(element, parent_element_index, element_index, undefined);
		}

		// Compute visibility according to parents
		if (parent && !this._isNodeChildrenVisible(parent_id))
		{
			element.classList.add("hidden");
		}

		// Children
		if (data.children)
		{
			for (let i = 0; i < data.children.length; ++i)
			{
				this.createAndInsert(data.children[i], options, data.id, undefined);
			}
		}

		// Update collapse button
		this._updateListBox(element, options, child_level);

		if (options && options.selected)
		{
			this.markAsSelected(element, true);
		}

		return element;
	};

	_insertInside(element : any, parent_index : number, offset_index : any, level : number | undefined)
	{
		const parent = this.root.childNodes[ parent_index ] as ChildNodePlus;
		if (!parent)
		{
			throw ("No parent node found, index: " + parent_index +", nodes: " + this.root.childNodes.length);
		}

		const parent_level = parseInt(parent.dataset["level"]);
		const child_level = level !== undefined ? level : parent_level + 1;

		const indent = element.querySelector(".indentblock");
		if (indent)
		{
			indent.style.paddingLeft = ((child_level + this.indent_offset) * Tree.INDENT) + "px"; // Inner padding
		}
		element.dataset["level"] = child_level;

		// Under level nodes
		for (let j = parent_index+1; j < this.root.childNodes.length; ++j)
		{
			const new_childNode = this.root.childNodes[j] as any;
			if (!new_childNode.classList || !new_childNode.classList.contains("ltreeitem"))
			{
				continue;
			}
			const current_level = parseInt(new_childNode.dataset["level"]);

			if (current_level == child_level && offset_index)
			{
				offset_index--;
				continue;
			}

			// Last position
			if (current_level < child_level || (offset_index === 0 && current_level === child_level))
			{
				this.root.insertBefore(element, new_childNode);
				return;
			}
		}

		// Ended
		this.root.appendChild(element);
	};

	_isNodeChildrenVisible(id : any) : boolean
	{
		const node = this.getItem(id) as ChildNodePlus;
		if (!node) {return false;}
		if (node.classList.contains("hidden")) {return false;}

		// Check listboxes
		const listbox = (node as any).querySelector(".listbox");
		if (!listbox) {return true;}
		if (listbox.getValue() == "closed") {return false;}
		return true;
	};

	_findElement(id : string)
	{
		if (!id || id.constructor !== String)
		{
			throw ("findElement param must be string with item id");
		}
		for (let i = 0; i < this.root.childNodes.length; ++i)
		{
			const childNode = this.root.childNodes[i] as any;
			if (!childNode.classList || !childNode.classList.contains("ltreeitem"))
			{
				continue;
			}
			if (childNode.classList.contains("ltreeitem-" + id))
			{
				return childNode;
			}
		}

		return null;
	};

	_findElementIndex(id : string) : number
	{
		for (let i = 0; i < this.root.childNodes.length; ++i)
		{
			const childNode = this.root.childNodes[i] as ChildNodePlus;
			if (!childNode.classList || !childNode.classList.contains("ltreeitem"))
			{
				continue;
			}

			if (typeof(id) === "string")
			{
				if (childNode.dataset["item_id"] === id)
				{
					return i;
				}
			}
			else if (childNode === id)
			{
				return i;
			}
		}

		return -1;
	};

	_findElementLastChildIndex(start_index : number) : number
	{
		if (start_index == -1)
		{
			return -1;
		}

		const level = parseInt((this.root.childNodes[ start_index ] as any).dataset["level"]);

		for (let i = start_index+1; i < this.root.childNodes.length; ++i)
		{
			const childNode = this.root.childNodes[i] as any;
			if (!childNode.classList || !childNode.classList.contains("ltreeitem"))
			{
				continue;
			}

			const current_level = parseInt(childNode.dataset["level"]);
			if (current_level == level)
			{
				return i;
			}
		}

		return -1;
	};

	// Returns child elements (you can control levels)
	_findChildElements(id : string, only_direct : boolean) : ChildNodePlus[] | undefined
	{
		const parent_index = this._findElementIndex(id);
		if (parent_index == -1)
		{
			return;
		}

		const parent = this.root.childNodes[ parent_index ] as ChildNodePlus;
		const parent_level = parseInt(parent.dataset["level"]);

		const result = [];

		for (let i = parent_index + 1; i < this.root.childNodes.length; ++i)
		{
			const childNode = this.root.childNodes[i] as ChildNodePlus;
			if (!childNode.classList || !childNode.classList.contains("ltreeitem"))
			{
				continue;
			}

			const current_level = parseInt(childNode.dataset["level"]);
			if (only_direct && current_level > (parent_level + 1)) {continue;}
			if (current_level <= parent_level) {return result;}

			result.push(childNode);
		}

		return result;
	};

	createTreeItem(data : any, options : any, level : any) : HTMLLIElementPlus | undefined
	{
		if (data === null || data === undefined)
		{
			console.error("Tree item cannot be null");
			return;
		}

		options = options || this.options;

		const root = document.createElement("li") as HTMLLIElementPlus;
		root.className = "ltreeitem";
		const that = this;

		// IDs are not used because they could collide, classes instead
		if (data.id)
		{
			const safe_id = data.id.replace(/\s/g,"_");
			root.className += " ltreeitem-" + safe_id;
			root.dataset["item_id"] = data.id;
		}

		if (data.dataset)
		{
			for (const i in data.dataset)
			{
				root.dataset[i] = data.dataset[i];
			}
		}

		data.DOM = root; // Double link
		root.data = data;

		if (level !== undefined)
		{
			root.dataset["level"] = level;
			root.classList.add("ltree-level-" + level);
		}

		const title_element = document.createElement("div");
		title_element.className = "ltreeitemtitle";
		if (data.className)
		{
			title_element.className += " " + data.className;
		}

		title_element.innerHTML = "<span class='precontent'></span><span class='indentblock'></span><span class='collapsebox'></span><span class='incontent'></span><span class='postcontent'></span>";

		const content = data.content || data.id || "";
		title_element.querySelector(".incontent")!.innerHTML = content;

		if (data.precontent) {title_element.querySelector(".precontent")!.innerHTML = data.precontent;}

		if (data.postcontent) {title_element.querySelector(".postcontent")!.innerHTML = data.postcontent;}

		if (data.dataset)
		{
			for (const i in data.dataset)
			{
				root.dataset[i] = data.dataset[i];
			}
		}

		root.appendChild(title_element);
		root.title_element = title_element as HTMLDivElementPlus;

		if (data.visible === false)
		{
			root.style.display = "none";
		}

		const row = root;
		const onNodeSelected = function(e : any)
		{
			e.preventDefault();
			e.stopPropagation();

			const node = row as any;
			const title = node.title_element;

			if (title._editing) {return;}

			if (e.ctrlKey && that.options.allow_multiselection)
			{
				// Check if selected
				if (that.isNodeSelected(node))
				{
					node.classList.remove("selected");
					LiteGUI.trigger(that, "item_remove_from_selection", { item: node, data: node.data});
					LiteGUI.trigger(that.root, "item_remove_from_selection", { item: node, data: node.data}); // LEGACY
					return;
				}

				// Mark as selected
				that.markAsSelected(node, true);
				LiteGUI.trigger(that, "item_add_to_selection", { item: node, data: node.data});
				LiteGUI.trigger(that.root, "item_add_to_selection", { item: node, data: node.data}); // LEGACY
				let r = false;
				if (data.callback)
				{
					r = data.callback.call(that,node);
				}

				if (!r && that.onItemAddToSelection)
				{
					that.onItemAddToSelection(node.data, node);
				}
			}
			if (e.shiftKey && that.options.allow_multiselection)
			{
				/*
				 * Select from current selection till here
				 * current
				 */
				const last_item = that.getSelectedItem();
				if (!last_item) {return;}

				if (last_item === node) {return;}

				const nodeList = Array.prototype.slice.call(last_item.parentNode!.children);
				const last_index = nodeList.indexOf(last_item);
				const current_index = nodeList.indexOf(node);

				const items = current_index > last_index ? nodeList.slice(last_index, current_index) : nodeList.slice(current_index, last_index);
				for (let i = 0; i < items.length; ++i)
				{
					const item = items[i];
					// Mark as selected
					that.markAsSelected(item, true);
					LiteGUI.trigger(that, "item_add_to_selection", { item: item, data: item.data });
					LiteGUI.trigger(that.root, "item_add_to_selection", { item: item, data: item.data }); // LEGACY
				}
			}
			else
			{
				// Mark as selected
				that.markAsSelected(node);

				that._skip_scroll = true; // Svoid scrolling while user clicks something
				LiteGUI.trigger(that, "item_selected", { item: node, data: node.data });
				LiteGUI.trigger(that.root, "item_selected", { item: node, data: node.data }); // LEGACY
				let r = false;
				if (data.callback)
				{
					r = data.callback.call(that,node);
				}

				if (!r && that.onItemSelected)
				{
					that.onItemSelected(node.data, node);
				}
				that._skip_scroll = false;
			}
		};

		const onNodeDblClicked = function(e : any)
		{
			const node = row as any;
			const title = node.title_element.querySelector(".incontent");

			LiteGUI.trigger(that, "item_dblclicked", node);
			LiteGUI.trigger(that.root, "item_dblclicked", node); // LEGACY

			if (!title._editing && that.options.allow_rename)
			{
				title._editing = true;
				title._old_name = title.innerHTML;
				const that2 = title;
				title.innerHTML = "<input type='text' value='" + title.innerHTML + "' />";
				const input = title.querySelector("input");

				// Loose focus when renaming
				input.addEventListener("blur",(e : any) =>
				{
					const new_name = e.target.value;
					setTimeout(() => { that2.innerHTML = new_name; },1); // Bug fix, if I destroy input inside the event, it produce a NotFoundError
					delete that2._editing;
					LiteGUI.trigger(that.root, "item_renamed", { old_name: that2._old_name, new_name: new_name, item: node, data: node.data });
					delete that2._old_name;
				});

				// Finishes renaming
				input.addEventListener("keydown", (e : any) =>
				{
					if (e.keyCode != 13) {return;}
					input.blur();
				});

				// Set on focus
				input.focus();

				e.preventDefault();
			}

			e.preventDefault();
			e.stopPropagation();
		};
		row.addEventListener("click", onNodeSelected.bind(row));
		row.addEventListener("dblclick",onNodeDblClicked.bind(row));
		const contextMenuCallback = function(e : any)
		{
			const item = row;
			e.preventDefault();
			e.stopPropagation();

			if (e.button != 2) {return;} // Right button

			if (that.onItemContextMenu)
			{
				return that.onItemContextMenu(e, { item: item, data: item.data});
			}

			return false;
		};
		row.addEventListener("contextmenu", contextMenuCallback);

		// Dragging element on tree
		const draggable_element = title_element;
		if (this.options.allow_drag)
		{
			draggable_element.draggable = true;

			// Starts dragging this element
			draggable_element.addEventListener("dragstart", (ev : any) =>
			{
				ev.dataTransfer.setData("item_id", (this.parentNode! as any).dataset["item_id"]);
				if (!data.onDragData) {return;}

				const drag_data = data.onDragData();
				if (drag_data)
				{
					for (const i in drag_data)
					{
						ev.dataTransfer.setData(i,drag_data[i]);
					}
				}
			});
		}

		let count = 0;

		// Something being dragged entered
		draggable_element.addEventListener("dragenter", (ev) =>
		{
			ev.preventDefault();
			if (data.skipdrag) {return false;}

			if (count == 0) {title_element.classList.add("dragover");}
			count++;
			return;
		});

		draggable_element.addEventListener("dragleave", (ev) =>
		{
			ev.preventDefault();
			count--;
			if (count == 0)
			{
				title_element.classList.remove("dragover");
			}
			return;
		});

		// Test if allows to drag stuff on top?
		draggable_element.addEventListener("dragover", on_drag_over);
		function on_drag_over(ev : any)
		{
			ev.preventDefault();
		}

		draggable_element.addEventListener("drop", (ev : any) =>
		{
			const el = ev.target;
			title_element.classList.remove("dragover");
			ev.preventDefault();
			if (data.skipdrag) {return false;}

			const item_id = ev.dataTransfer.getData("item_id");

			if (!item_id)
			{
				LiteGUI.trigger(that.root, "drop_on_item", { item: el, event: ev });
				if (that.onDropItem) {that.onDropItem(ev, el.parentNode.data);}
				return;
			}

			const parent_id = el.parentNode.dataset["item_id"];

			if (!that.onMoveItem || (that.onMoveItem && that.onMoveItem(that.getItem(item_id), that.getItem(parent_id)) != false))
			{
				if (that.moveItem(item_id, parent_id))
				{
					LiteGUI.trigger(that.root, "item_moved", { item: that.getItem(item_id), parent_item: that.getItem(parent_id) });
				}
			}

			if (that.onDropItem) {that.onDropItem(ev, el.parentNode.data);}
			return;
		});

		return root;
	};

	/**
	 * Remove from the tree the items that do not have a name that matches the string
	 * @method filterByName
	 * @param {string} name
	 */
	filterByName(name : string) : void
	{
		for (let i = 0; i < this.root.childNodes.length; ++i)
		{
			const childNode = this.root.childNodes[i] as any; // Ltreeitem
			if (!childNode.classList || !childNode.classList.contains("ltreeitem"))
			{
				continue;
			}

			const content = childNode.querySelector(".incontent");
			if (!content) {continue;}

			const str = content.innerHTML.toLowerCase();

			if (!name || str.indexOf(name.toLowerCase()) != -1)
			{
				if (childNode.data && childNode.data.visible !== false)
				{
					childNode.classList.remove("filtered");
				}
				const indent = childNode.querySelector(".indentblock");
				if (indent)
				{
					if (name)
					{
						indent.style.paddingLeft = 0;
					}
					else
					{
						indent.style.paddingLeft = /* paddingLeft = */ ((parseInt(childNode.dataset["level"]) + this.indent_offset) * Tree.INDENT) + "px";
					}
				}
			}
			else
			{
				childNode.classList.add("filtered");
			}
		}
	};

	/**
	 * Remove from the tree the items that do not have a name that matches the string
	 * @method filterByName
	 * @param {string} name
	 */
	filterByRule(callback_to_filter : Function, name : string) : void
	{
		if (!callback_to_filter) {throw ("filterByRule requires a callback");}
		for (let i = 0; i < this.root.childNodes.length; ++i)
		{
			const childNode = this.root.childNodes[i] as any; // Ltreeitem
			if (!childNode.classList || !childNode.classList.contains("ltreeitem"))
			{
				continue;
			}

			const content = childNode.querySelector(".incontent");
			if (!content) {continue;}

			if (callback_to_filter(childNode.data, content, name))
			{
				if (childNode.data && childNode.data.visible !== false)
				{
					childNode.classList.remove("filtered");
				}
				const indent = childNode.querySelector(".indentblock");
				if (indent)
				{
					if (name)
					{
						indent.style.paddingLeft = 0;
					}
					else
					{
						indent.style.paddingLeft = /* paddingLeft = */ ((parseInt(childNode.dataset["level"]) + this.indent_offset) * LiteGUI.Tree.INDENT) + "px";
					}
				}
			}
			else
			{
				childNode.classList.add("filtered");
			}
		}
	};


	/**
	 * Get the item with that id, returns the HTML element
	 * @method getItem
	 * @param {string} id
	 * @return {Object}
	 */
	getItem(id : string | ChildNodePlus) : ChildNodePlus | string | null
	{
		if (!id) {return null;}

		if ((id as ChildNodePlus).classList) {return id;} // If it is already a node

		for (let i = 0; i < this.root.childNodes.length; ++i)
		{
			const childNode = this.root.childNodes[i] as ChildNodePlus;
			if (!childNode.classList || !childNode.classList.contains("ltreeitem"))
			{
				continue;
			}

			if (childNode.dataset["item_id"] === id)
			{
				return childNode;
			}
		}

		return null;
	};

	/**
	 * In case an item is collapsed, it expands it to show children
	 * @method expandItem
	 * @param {string} id
	 */
	expandItem(id : string, parents : any) : void
	{
		const item = this.getItem(id);
		if (!item) {return;}

		if (!(item as ChildNodePlus).listbox) {return;}

		(item as ChildNodePlus).listbox.setValue(true); // This propagates changes

		if (!parents) {return;}

		const parent = this.getParent(item);
		if (parent) {this.expandItem(parent as string,parents);}
	};

	/**
	 * In case an item is expanded, it collapses it to hide children
	 * @method collapseItem
	 * @param {string} id
	 */
	collapseItem(id : string) : void
	{
		const item = this.getItem(id) as ChildNodePlus;
		if (!item) {return;}

		if (!item.listbox) {return;}

		item.listbox.setValue(false);  // This propagates changes
	};


	/**
	 * Tells you if the item its out of the view due to the scrolling
	 * @method isInsideArea
	 * @param {string} id
	 */
	isInsideArea(id : string) : boolean
	{
		const item = id.constructor === String ? this.getItem(id) : id;
		if (!item) {return false;}

		const rects = this.root.getClientRects();
		if (!rects.length) {return false;}
		const r = rects[0];
		const h = r.height;
		const y = (item as ChildNodePlus).offsetTop;

		if (this.root.scrollTop < y && y < (this.root.scrollTop + h))
		{
			return true;
		}
		return false;
	};

	/**
	 * Scrolls to center this item
	 * @method scrollToItem
	 * @param {string} id
	 */
	scrollToItem(id : string) : void
	{
		const item = id.constructor === String ? this.getItem(id) : id;
		if (!item) {return;}

		const container = this.root.parentNode as any;

		if (!container) {return;}

		const rect = container.getBoundingClientRect();
		if (!rect) {return;}
		const x = (parseInt((item as ChildNodePlus).dataset["level"]) + this.indent_offset) * Tree.INDENT + 50;

		container.scrollTop = (item as ChildNodePlus).offsetTop - (h * 0.5)|0;
		if (rect.width * 0.75 < x)
		{
			container.scrollLeft = x;
		}
		else
		{
			container.scrollLeft = 0;
		}
	};

	/**
	 * Mark item as selected
	 * @method setSelectedItem
	 * @param {string} id
	 */
	setSelectedItem(id : string, scroll : any, send_event : any) : string | ChildNodePlus | null | undefined
	{
		if (!id)
		{
			// Clear selection
			this.unmarkAllAsSelected();
			return;
		}

		const node = this.getItem(id);
		if (!node) {return null;}// Not found

		// Already selected
		if ((node as ChildNodePlus).classList.contains("selected")) {return;}

		this.markAsSelected(node);
		if (scroll && !this._skip_scroll) {this.scrollToItem(node as string);}

		// Expand parents
		this.expandItem(node as string, true);

		if (send_event) {LiteGUI.trigger(node, "click");}

		return node;
	};

	/**
	 * Adds item to selection (multiple selection)
	 * @method addItemToSelection
	 * @param {string} id
	 */
	addItemToSelection(id : string) : string | ChildNodePlus | null | undefined
	{
		if (!id) {return;}

		const node = this.getItem(id);
		if (!node) {return null;} // Not found

		this.markAsSelected(node, true);
		return node;
	};

	/**
	 * Remove item from selection (multiple selection)
	 * @method removeItemFromSelection
	 * @param {string} id
	 */
	removeItemFromSelection(id : string) 
	{
		if (!id) {return;}
		const node = this.getItem(id);
		if (!node) {return null;} // Not found
		(node as ChildNodePlus).classList.remove("selected");
		return;
	};

	/**
	 * Returns the first selected item (its HTML element)
	 * @method getSelectedItem
	 * @return {HTML}
	 */
	getSelectedItem() : Element | null
	{
		return this.root.querySelector(".ltreeitem.selected");
	};

	/**
	 * Returns an array with the selected items (its HTML elements)
	 * @method getSelectedItems
	 * @return {HTML}
	 */
	getSelectedItems() : NodeListOf<Element>
	{
		return this.root.querySelectorAll(".ltreeitem.selected");
	};

	/**
	 * Returns if an item is selected
	 * @method isItemSelected
	 * @param {string} id
	 * @return {bool}
	 */
	isItemSelected(id : string) : boolean
	{
		const node = this.getItem(id);
		if (!node) {return false;}
		return this.isNodeSelected(node);
	};

	/**
	 * Returns the children of an item
	 * @method getChildren
	 * @param {string} id could be string or node directly
	 * @param {bool} [only_direct=false] to get only direct children
	 * @return {Array}
	 */
	getChildren(id : any, only_direct : boolean = false) : ChildNodePlus[] | undefined
	{
		if (id && id.constructor !== String && id.dataset)
		{
			id = id.dataset["item_id"];
		}
		return this._findChildElements(id, only_direct);
	};

	/**
	 * Returns the parent of a item
	 * @method getParent
	 * @param {string} id
	 * @return {HTML}
	 */
	getParent(id_or_node : any) : string | ChildNodePlus | null | undefined
	{
		const element = this.getItem(id_or_node) as ChildNodePlus;
		if (element) {return this.getItem(element.parent_id);}
		return null;
	};

	/**
	 * Returns an array with all the ancestors
	 * @method getAncestors
	 * @param {string} id
	 * @return {Array}
	 */
	getAncestors(id_or_node : any, result : any) : Array<any>
	{
		result = result || [];
		const element = this.getItem(id_or_node) as ChildNodePlus;
		if (element)
		{
			result.push(element);
			return this.getAncestors(element.parent_id, result);
		}
		return result;
	};

	/**
	 * Returns an array with all the ancestors
	 * @method getAncestors
	 * @param {string} id
	 * @return {Array}
	 */
	isAncestor(child : any, node : any) : Array<any> | boolean
	{
		const element = this.getItem(child) as ChildNodePlus;
		if (!element) {return false;}
		const dest = this.getItem(node);
		const parent = this.getItem(element.parent_id);
		if (!parent) {return false;}
		if (parent == dest) {return true;}
		return this.isAncestor(parent, node);
	};

	/**
	 * Move item with id to be child of parent_id
	 * @method moveItem
	 * @param {string} id
	 * @param {string} parent_id
	 * @return {bool}
	 */
	moveItem(id : any, parent_id : string) : boolean
	{
		if (id === parent_id) {return false;}

		const node = this.getItem(id) as ChildNodePlus;
		const parent = this.getItem(parent_id);

		if (this.isAncestor(parent, node)) {return false;}

		let parent_index = this._findElementIndex(parent as string);
		const parent_level = parseInt((parent! as ChildNodePlus).dataset["level"]);
		const old_parent = this.getParent(node) as ChildNodePlus;
		if (!old_parent)
		{
			console.error("node parent not found by id, maybe id has changed");
			return false;
		}
		const old_parent_level = parseInt(old_parent.dataset["level"]);
		const level_offset = parent_level - old_parent_level;

		if (!parent || !node) {return false;}

		if (parent == old_parent) {return false;}

		// Replace parent info
		node.parent_id = parent_id;

		// Get all children and subchildren and reinsert them in the new level
		const children = this.getChildren(node);
		if (children)
		{
			children.unshift(node); // Add the node at the beginning

			// Remove all children
			for (let i = 0; i < children.length; i++)
			{
				children[i].parentNode!.removeChild(children[i]);
			}

			// Update levels
			for (let i = 0; i < children.length; i++)
			{
				const child = children[i];
				const new_level = parseInt(child.dataset["level"]) + level_offset;
				child.dataset["level"] = new_level;
			}

			// Reinsert
			parent_index = this._findElementIndex(parent as string); // Update parent index
			let last_index = this._findElementLastChildIndex(parent_index);
			if (last_index == -1) {last_index = 0;}
			for (let i = 0; i < children.length; i++)
			{
				const child = children[i];
				this._insertInside(child, parent_index, last_index + i - 1, parseInt(child.dataset["level"]));
			}
		}

		// Update collapse button
		this._updateListBox(parent);
		if (old_parent) {this._updateListBox(old_parent);}

		return true;
	};

	/**
	 * Remove item with given id
	 * @method removeItem
	 * @param {string} id
	 * @return {bool}
	 */
	removeItem(id_or_node : any, remove_children : boolean) : boolean
	{
		let node = id_or_node;
		if (typeof(id_or_node) == "string") {node = this.getItem(id_or_node);}
		if (!node) {return false;}

		// Get parent
		const parent = this.getParent(node);

		// Get all descendants
		let child_nodes = null;
		if (remove_children) {child_nodes = this.getChildren(node);}

		// Remove html element
		this.root.removeChild(node);

		// Remove all children
		if (child_nodes)
		{
			for (let i = 0; i < child_nodes.length; i++)
			{
				this.root.removeChild(child_nodes[i]);
			}
		}

		// Update parent collapse button
		if (parent) {this._updateListBox(parent);}
		return true;
	};

	/**
	 * Update a given item with new data
	 * @method updateItem
	 * @param {string} id
	 * @param {object} data
	 */
	updateItem(id : string, data : any) : boolean
	{
		const node = this.getItem(id) as ChildNodePlus;
		if (!node) {return false;}

		node.data = data;
		if (data.id) {node.id = data.id;}
		if (data.content)
		{
			const incontent = node.title_element.querySelector(".incontent");
			incontent!.innerHTML = data.content;
		}

		return true;
	};

	/**
	 * Update a given item id and the link with its children
	 * @method updateItemId
	 * @param {string} old_id
	 * @param {string} new_id
	 */
	updateItemId(old_id : string, new_id : string) : boolean
	{
		const node = this.getItem(old_id) as ChildNodePlus;
		if (!node) {return false;}

		const children = this.getChildren(old_id, true);
		node.id = new_id;

		for (let i = 0; i < children!.length; ++i)
		{
			const child = children![i];
			child.parent_id = new_id;
		}

		return true;
	};


	/**
	 * Clears all the items
	 * @method clear
	 * @param {bool} keep_root if you want to keep the root item
	 */
	clear(keep_root : boolean)
	{
		if (!keep_root)
		{
			this.root.innerHTML = "";
			return;
		}

		const items = this.root.querySelectorAll(".ltreeitem");
		for (let i = 1; i < items.length; i++)
		{
			const item = items[i];
			this.root.removeChild(item);
		}
	};


	getNodeByIndex(index : number) : Element
	{
		const items = this.root.querySelectorAll(".ltreeitem");
		return items[index];
	};

// Private

private unmarkAllAsSelected()
{
	this.root.classList.remove("selected");
	const selected_array = this.root.querySelectorAll(".ltreeitem.selected");
	if (selected_array)
	{
		for (let i = 0; i < selected_array.length; i++)
		{
			selected_array[i].classList.remove("selected");
		}
	}
	const semiselected = this.root.querySelectorAll(".ltreeitem.semiselected");
	for (let i = 0; i < semiselected.length; i++)
	{
		semiselected[i].classList.remove("semiselected");
	}
};

private isNodeSelected(node : any) : boolean
{
	// Already selected
	if (node.classList.contains("selected")) {return true;}
	return false;
};

private markAsSelected(node : any, add_to_existing_selection : boolean = false)
{
	// Already selected
	if (node.classList.contains("selected")) {return;}

	// Clear old selection
	if (!add_to_existing_selection) {this.unmarkAllAsSelected();}

	// Mark as selected (it was node.title_element?)
	node.classList.add("selected");

	// Go up and semiselect
	let parent = this.getParent(node) as ChildNodePlus;
	const visited = [];
	while (parent && visited.indexOf(parent) == -1)
	{
		parent.classList.add("semiselected");
		visited.push(parent);
		parent = this.getParent(parent) as any;
	}
};

// Updates the widget to collapse
private _updateListBox(node : any, options : any = undefined, current_level : number = 0)
{
	if (!node) {return;}

	const that = this;

	if (!node.listbox)
	{
		const pre = node.title_element.querySelector(".collapsebox");
		const box = LiteGUI.widget.createLitebox(true, (e : any) =>
		{
			that.onClickBox(e, node);
			LiteGUI.trigger(that.root, "item_collapse_change", { item: node, data: box.getValue() });
		});
		box.stopPropagation = true;
		box.setEmpty(true);
		pre.appendChild(box);
		node.listbox = box;
	}

	if ((options && options.collapsed) || current_level >= this.collapsed_depth)
	{
		node.listbox.collapse();
	}

	const child_elements = this.getChildren(node.dataset["item_id"]);
	if (!child_elements) {return;}

	if (child_elements.length)
	{
		node.listbox.setEmpty(false);
	}
	else
	{
		node.listbox.setEmpty(true);
	}
};

private onClickBox(e : any, node : any)
{
	const children = this.getChildren(node);

	if (!children) {return;}

	// Update children visibility
	for (let i = 0; i < children.length; ++i)
	{
		const child = children[i];

		const child_parent = this.getParent(child);
		let visible = true;
		if (child_parent) {visible = this._isNodeChildrenVisible(child_parent);}
		if (visible)
		{
			child.classList.remove("hidden");
		}
		else
		{
			child.classList.add("hidden");
		}
	}
};

}