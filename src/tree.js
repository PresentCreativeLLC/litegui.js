// enclose in a scope
(function()
{


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

	/** ********* LiteTree *****************************/
	function Tree(data, options, legacy)
	{
		if (legacy || (data && data.constructor === String))
		{
			let id = data;
			data = options;
			options = legacy || {};
			options.id = id;
			console.warn("LiteGUI.Tree legacy parameter, use data as first parameter instead of id.");
		}

		options = options || {};

		let root = document.createElement("div");
		this.root = root;
		if (options.id)
			{root.id = options.id;}

		root.className = "litetree";
		this.tree = data;
		let that = this;
		options = options || {allow_rename: false, allow_drag: true, allow_multiselection: false};
		this.options = options;
		this.indent_offset = options.indent_offset || 0;

		if (options.height)
			{this.root.style.height = typeof(options.height) == "string" ? options.height : Math.round(options.height) + "px";}

		this.collapsed_depth = 3;
		if (options.collapsed_depth != null)
			this.collapsed_depth = options.collapsed_depth;

		// bg click
		root.addEventListener("click", (e)=> {
			if (e.srcElement != that.root)
				{return;}

			if (that.onBackgroundClicked)
				{that.onBackgroundClicked(e,that);}
		});

		// bg click right mouse
		root.addEventListener("contextmenu", (e) => {
			if (e.button != 2) // right button
				{return false;}

			if (that.onContextMenu)
				{that.onContextMenu(e);}
			e.preventDefault();
			return false;
		});


		let root_item = this.createAndInsert(data, options, null);
		if (!root_item)
			{throw("Error in LiteGUI.Tree, createAndInsert returned null");}
		root_item.className += " root_item";
		// this.root.appendChild(root_item);
		this.root_item = root_item;
	}

	Tree.INDENT = 20;


	/**
	 * Update tree with new data (old data will be thrown away)
	 * @method updateTree
	 * @param {object} data
	 */
	Tree.prototype.updateTree = function(data)
	{
		this.root.innerHTML = "";
		let root_item = this.createAndInsert(data, this.options, null);
		if (root_item)
		{
			root_item.className += " root_item";
			this.root_item = root_item;
		}
		else
			{this.root_item = null;}
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
	Tree.prototype.insertItem = function(data, parent_id, position, options)
	{
		if (!parent_id)
		{
			let root = this.root.childNodes[0];
			if (root)
				{parent_id = root.dataset["item_id"];}
		}

		let element = this.createAndInsert(data, options, parent_id, position);

		// update parent collapse button
		if (parent_id)
			{this._updateListBox( this._findElement(parent_id) );} // no options here, this is the parent


		return element;
	};

	Tree.prototype.createAndInsert = function(data, options, parent_id, element_index)
	{
		// find parent
		let parent_element_index = -1;
		if (parent_id)
			{parent_element_index = this._findElementIndex( parent_id );}
		else if (parent_id === undefined)
			{parent_element_index = 0;} // root

		let parent = null;
		let child_level = 0;

		// find level
		if (parent_element_index != -1)
		{
			parent = this.root.childNodes[ parent_element_index ];
			child_level = parseInt(parent.dataset["level"]) + 1;
		}

		// create
		let element = this.createTreeItem(data, options, child_level);
		if (!element) // error creating element
			{return;}

		element.parent_id = parent_id;

		// check
		let existing_item = this.getItem(element.dataset["item_id"]);
		if (existing_item)
			{console.warn("There another item with the same ID in this tree");}

		// insert
		if (parent_element_index == -1)
			{this.root.appendChild( element );}
		else
			{this._insertInside( element, parent_element_index, element_index );}

		// compute visibility according to parents
		if (parent && !this._isNodeChildrenVisible(parent_id))
			{element.classList.add("hidden");}

		// children
		if (data.children)
		{
			for (let i = 0; i < data.children.length; ++i)
			{
				this.createAndInsert(data.children[i], options, data.id);
			}
		}

		// update collapse button
		this._updateListBox(element, options, child_level);

		if (options && options.selected)
			{this.markAsSelected( element, true );}

		return element;
	};

	// element to add, position of the parent node, position inside children, the depth level
	Tree.prototype._insertInside = function(element, parent_index, offset_index, level)
	{
		let parent = this.root.childNodes[ parent_index ];
		if (!parent)
			{throw("No parent node found, index: " + parent_index +", nodes: " + this.root.childNodes.length );}

		let parent_level = parseInt(parent.dataset["level"]);
		let child_level = level !== undefined ? level : parent_level + 1;

		let indent = element.querySelector(".indentblock");
		if (indent)
			{indent.style.paddingLeft = ((child_level + this.indent_offset) * Tree.INDENT ) + "px";} // inner padding

		element.dataset["level"] = child_level;

		// under level nodes
		for (var j = parent_index+1; j < this.root.childNodes.length; ++j)
		{
			let new_childNode = this.root.childNodes[j];
			if (!new_childNode.classList || !new_childNode.classList.contains("ltreeitem"))
				{continue;}
			let current_level = parseInt(new_childNode.dataset["level"]);

			if (current_level == child_level && offset_index)
			{
				offset_index--;
				continue;
			}

			// last position
			if (current_level < child_level || (offset_index === 0 && current_level === child_level))
			{
				this.root.insertBefore(element, new_childNode);
				return;
			}
		}

		// ended
		this.root.appendChild(element);
	};


	Tree.prototype._isNodeChildrenVisible = function(id)
	{
		let node = this.getItem(id);
		if (!node)
			{return false;}
		if (node.classList.contains("hidden"))
			{return false;}

		// check listbox
		let listbox = node.querySelector(".listbox");
		if (!listbox)
			{return true;}
		if (listbox.getValue() == "closed")
			{return false;}
		return true;
	};

	Tree.prototype._findElement = function(id)
	{
		if (!id || id.constructor !== String)
			{throw("findElement param must be string with item id");}
		for (let i = 0; i < this.root.childNodes.length; ++i)
		{
			let childNode = this.root.childNodes[i];
			if (!childNode.classList || !childNode.classList.contains("ltreeitem"))
				{continue;}
			if (childNode.classList.contains("ltreeitem-" + id))
				{return childNode;}
		}

		return null;
	};

	Tree.prototype._findElementIndex = function(id)
	{
		for (let i = 0; i < this.root.childNodes.length; ++i)
		{
			let childNode = this.root.childNodes[i];
			if (!childNode.classList || !childNode.classList.contains("ltreeitem"))
				{continue;}

			if (typeof(id) === "string")
			{
				if (childNode.dataset["item_id"] === id)
					{return i;}
			}
			else if (childNode === id)
				{return i;}
		}

		return -1;
	};

	Tree.prototype._findElementLastChildIndex = function(start_index)
	{
		if (start_index == -1)
			{return -1;}

		let level = parseInt(this.root.childNodes[ start_index ].dataset["level"]);

		for (let i = start_index+1; i < this.root.childNodes.length; ++i)
		{
			let childNode = this.root.childNodes[i];
			if (!childNode.classList || !childNode.classList.contains("ltreeitem"))
				{continue;}

			let current_level = parseInt(childNode.dataset["level"]);
			if (current_level == level)
				{return i;}
		}

		return -1;
	};

	// returns child elements (you can control levels)
	Tree.prototype._findChildElements = function(id, only_direct)
	{
		let parent_index = this._findElementIndex(id);
		if (parent_index == -1)
			{return;}

		let parent = this.root.childNodes[ parent_index ];
		let parent_level = parseInt(parent.dataset["level"]);

		let result = [];

		for (let i = parent_index + 1; i < this.root.childNodes.length; ++i)
		{
			let childNode = this.root.childNodes[i];
			if (!childNode.classList || !childNode.classList.contains("ltreeitem"))
				{continue;}

			let current_level = parseInt(childNode.dataset["level"]);
			if (only_direct && current_level > (parent_level + 1))
				{continue;}
			if (current_level <= parent_level)
				{return result;}

			result.push(childNode);
		}

		return result;
	};

	Tree.prototype.createTreeItem = function(data, options, level)
	{
		if (data === null || data === undefined)
		{
			console.error("Tree item cannot be null");
			return;
		}

		options = options || this.options;

		let root = document.createElement("li");
		root.className = "ltreeitem";
		let that = this;

		// ids are not used because they could collide, classes instead
		if (data.id)
		{
			let safe_id = data.id.replace(/\s/g,"_");
			root.className += " ltreeitem-" + safe_id;
			root.dataset["item_id"] = data.id;
		}

		if (data.dataset)
			{for(var i in data.dataset)
				root.dataset[i] = data.dataset[i];}

		data.DOM = root; // double link
		root.data = data;

		if (level !== undefined)
		{
			root.dataset["level"] = level;
			root.classList.add("ltree-level-" + level);
		}

		let title_element = document.createElement("div");
		title_element.className = "ltreeitemtitle";
		if (data.className)
			{title_element.className += " " + data.className;}

		title_element.innerHTML = "<span class='precontent'></span><span class='indentblock'></span><span class='collapsebox'></span><span class='incontent'></span><span class='postcontent'></span>";

		let content = data.content || data.id || "";
		title_element.querySelector(".incontent").innerHTML = content;

		if (data.precontent)
			{title_element.querySelector(".precontent").innerHTML = data.precontent;}

		if (data.postcontent)
			{title_element.querySelector(".postcontent").innerHTML = data.postcontent;}

		if (data.dataset)
			{for(var i in data.dataset)
				root.dataset[i] = data.dataset[i];}

		root.appendChild(title_element);
		root.title_element = title_element;

		if (data.visible === false)
			{root.style.display = "none";}

		// var row = root.querySelector(".ltreeitemtitle .incontent");
		let row = root;
		row.addEventListener("click", onNodeSelected);
		row.addEventListener("dblclick",onNodeDblClicked);
		row.addEventListener("contextmenu", function(e) 
{
			let item = this;
			e.preventDefault();
			e.stopPropagation();

			if (e.button != 2) // right button
				{return;}

			if (that.onItemContextMenu)
				{return that.onItemContextMenu(e, { item: item, data: item.data} );}

			return false;
		});

		function onNodeSelected(e)
		{
			e.preventDefault();
			e.stopPropagation();

			/*
			 * var title = this.parentNode;
			 * var item = title.parentNode;
			 */
			let node = this;
			let title = node.title_element;

			if (title._editing)
				{return;}

			if (e.ctrlKey && that.options.allow_multiselection)
			{
				// check if selected
				if (that.isNodeSelected(node))
				{
					node.classList.remove("selected");
					LiteGUI.trigger(that, "item_remove_from_selection", { item: node, data: node.data});
					LiteGUI.trigger(that.root, "item_remove_from_selection", { item: node, data: node.data}); // LEGACY
					return;
				}

				// mark as selected
				that.markAsSelected(node, true);
				LiteGUI.trigger(that, "item_add_to_selection", { item: node, data: node.data});
				LiteGUI.trigger(that.root, "item_add_to_selection", { item: node, data: node.data}); // LEGACY
				var r = false;
				if (data.callback)
					{r = data.callback.call(that,node);}

				if (!r && that.onItemAddToSelection)
					{that.onItemAddToSelection(node.data, node);}
			}
			if (e.shiftKey && that.options.allow_multiselection)
			{
				/*
				 * select from current selection till here
				 * current
				 */
				let last_item = that.getSelectedItem();
				if (!last_item)
					{return;}

				if (last_item === node)
					{return;}

				let nodeList = Array.prototype.slice.call(last_item.parentNode.children);
				let last_index = nodeList.indexOf(last_item);
				let current_index = nodeList.indexOf(node);

				let items = current_index > last_index ? nodeList.slice(last_index, current_index) : nodeList.slice(current_index, last_index);
				for (var i = 0; i < items.length; ++i)
				{
					let item = items[i];
					/*
					 * console.log(item);
					 * mark as selected
					 */
					that.markAsSelected(item, true);
					LiteGUI.trigger(that, "item_add_to_selection", { item: item, data: item.data });
					LiteGUI.trigger(that.root, "item_add_to_selection", { item: item, data: item.data }); // LEGACY
				}
			}
			else
			{
				// mark as selected
				that.markAsSelected(node);

				that._skip_scroll = true; // avoid scrolling while user clicks something
				LiteGUI.trigger(that, "item_selected", { item: node, data: node.data });
				LiteGUI.trigger(that.root, "item_selected", { item: node, data: node.data }); // LEGACY
				var r = false;
				if (data.callback)
					{r = data.callback.call(that,node);}

				if (!r && that.onItemSelected)
					{that.onItemSelected(node.data, node);}
				that._skip_scroll = false;
			}
		}

		function onNodeDblClicked(e)
		{
			let node = this; // this.parentNode;
			let title = node.title_element.querySelector(".incontent");

			LiteGUI.trigger(that, "item_dblclicked", node);
			LiteGUI.trigger(that.root, "item_dblclicked", node); // LEGACY

			if (!title._editing && that.options.allow_rename)
			{
				title._editing = true;
				title._old_name = title.innerHTML;
				let that2 = title;
				title.innerHTML = "<input type='text' value='" + title.innerHTML + "' />";
				let input = title.querySelector("input");

				// loose focus when renaming
				input.addEventListener("blur",(e) => {
					let new_name = e.target.value;
					setTimeout(() => { that2.innerHTML = new_name; },1); // bug fix, if I destroy input inside the event, it produce a NotFoundError
					// item.node_name = new_name;
					delete that2._editing;
					LiteGUI.trigger(that.root, "item_renamed", { old_name: that2._old_name, new_name: new_name, item: node, data: node.data });
					delete that2._old_name;
				});

				// finishes renaming
				input.addEventListener("keydown", function(e) 
{
					if (e.keyCode != 13)
						{return;}
					this.blur();
				});

				// set on focus
				input.focus();

				e.preventDefault();
			}

			e.preventDefault();
			e.stopPropagation();
		}

		// dragging element on tree
		let draggable_element = title_element;
		if (this.options.allow_drag)
		{
			draggable_element.draggable = true;

			// starts dragging this element
			draggable_element.addEventListener("dragstart", function(ev) 
{
				/*
				 * this.removeEventListener("dragover", on_drag_over ); //avoid being drag on top of himself
				 * ev.dataTransfer.setData("node-id", this.parentNode.id);
				 */
				ev.dataTransfer.setData("item_id", this.parentNode.dataset["item_id"]);
				if (!data.onDragData)
					{return;}

				let drag_data =	data.onDragData();
				if (drag_data)
				{
					for (let i in drag_data)
						{ev.dataTransfer.setData(i,drag_data[i]);}
				}
			});
		}

		let count = 0;

		// something being dragged entered
		draggable_element.addEventListener("dragenter", (ev)
		=> {
			ev.preventDefault();
			if (data.skipdrag)
				{return false;}

			if (count == 0)
				{title_element.classList.add("dragover");}
			count++;
		});

		draggable_element.addEventListener("dragleave", (ev)
		=> {
			ev.preventDefault();
			// console.log(data.id);
			count--;
			if (count == 0)
				{title_element.classList.remove("dragover");}
			// if(ev.srcElement == this) return;
		});

		// test if allows to drag stuff on top?
		draggable_element.addEventListener("dragover", on_drag_over);
		function on_drag_over(ev)
		{
			ev.preventDefault();
		}

		draggable_element.addEventListener("drop", function (ev)
		{
			title_element.classList.remove("dragover");
			ev.preventDefault();
			if (data.skipdrag)
				{return false;}

			let item_id = ev.dataTransfer.getData("item_id");

			// var data = ev.dataTransfer.getData("Text");
			if (!item_id)
			{
				LiteGUI.trigger(that.root, "drop_on_item", { item: this, event: ev });
				if (that.onDropItem)
					{that.onDropItem( ev, this.parentNode.data );}
				return;
			}

			// try
			{
				let parent_id = this.parentNode.dataset["item_id"];

				if (!that.onMoveItem || (that.onMoveItem && that.onMoveItem(that.getItem(item_id), that.getItem(parent_id)) != false))
				{
					if (that.moveItem(item_id, parent_id))
						{LiteGUI.trigger( that.root, "item_moved", { item: that.getItem( item_id ), parent_item: that.getItem( parent_id ) } );}
				}
			}
			/*
			 *catch (err)
			 *{
			 *	console.error("Error: " + err );
			 *}
			 */

			if (that.onDropItem)
				{that.onDropItem( ev, this.parentNode.data );}
		});

		return root;
	};


	/**
	 * Remove from the tree the items that do not have a name that matches the string
	 * @method filterByName
	 * @param {string} name
	 */
	Tree.prototype.filterByName = function(name)
	{
		for (let i = 0; i < this.root.childNodes.length; ++i)
		{
			let childNode = this.root.childNodes[i]; // ltreeitem
			if (!childNode.classList || !childNode.classList.contains("ltreeitem"))
				{continue;}

			let content = childNode.querySelector(".incontent");
			if (!content)
				{continue;}

			let str = content.innerHTML.toLowerCase();

			if (!name || str.indexOf(name.toLowerCase()) != -1)
			{
				if (childNode.data && childNode.data.visible !== false)
					{childNode.classList.remove("filtered");}
				let indent = childNode.querySelector(".indentblock");
				if (indent)
				{
					if (name)
						{indent.style.paddingLeft = 0;}
					else
						{indent.style.paddingLeft = paddingLeft = ( (parseInt(childNode.dataset["level"]) + this.indent_offset) * Tree.INDENT) + "px";}
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
	Tree.prototype.filterByRule = function(callback_to_filter, param)
	{
		if (!callback_to_filter)
			{throw("filterByRule requires a callback");}
		for (let i = 0; i < this.root.childNodes.length; ++i)
		{
			let childNode = this.root.childNodes[i]; // ltreeitem
			if (!childNode.classList || !childNode.classList.contains("ltreeitem"))
				{continue;}

			let content = childNode.querySelector(".incontent");
			if (!content)
				{continue;}

			if (callback_to_filter(childNode.data, content, param))
			{
				if (childNode.data && childNode.data.visible !== false)
					{childNode.classList.remove("filtered");}
				let indent = childNode.querySelector(".indentblock");
				if (indent)
				{
					if (name)
						{indent.style.paddingLeft = 0;}
					else
						{indent.style.paddingLeft = paddingLeft = ( (parseInt(childNode.dataset["level"]) + this.indent_offset) * LiteGUI.Tree.INDENT) + "px";}
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
	Tree.prototype.getItem = function(id)
	{
		if (!id)
			{return null;}

		if (id.classList) // if it is already a node
			{return id;}

		for (let i = 0; i < this.root.childNodes.length; ++i)
		{
			let childNode = this.root.childNodes[i];
			if (!childNode.classList || !childNode.classList.contains("ltreeitem"))
				{continue;}

			if (childNode.dataset["item_id"] === id)
				{return childNode;}
		}

		return null;

		/*
		 *var safe_id = id.replace(/\s/g,"_");
		 *var node = this.root.querySelector(".ltreeitem-"+safe_id);
		 *if(!node)
		 *	return null;
		 *if( !node.classList.contains("ltreeitem") )
		 *	throw("this node is not a tree item");
		 *return node;
		 */
	};

	/**
	 * In case an item is collapsed, it expands it to show children
	 * @method expandItem
	 * @param {string} id
	 */
	Tree.prototype.expandItem = function(id, parents)
	{
		let item = this.getItem(id);
		if (!item)
			{return;}

		if (!item.listbox)
			{return;}

		item.listbox.setValue(true); // this propagates changes

		if (!parents)
			{return;}

		let parent = this.getParent(item);
		if (parent)
			{this.expandItem(parent,parents);}
	};

	/**
	 * In case an item is expanded, it collapses it to hide children
	 * @method collapseItem
	 * @param {string} id
	 */
	Tree.prototype.collapseItem = function(id)
	{
		let item = this.getItem(id);
		if (!item)
			{return;}

		if (!item.listbox)
			{return;}

		listbox.setValue(false);  // this propagates changes
	};


	/**
	 * Tells you if the item its out of the view due to the scrolling
	 * @method isInsideArea
	 * @param {string} id
	 */
	Tree.prototype.isInsideArea = function(id)
	{
		let item = id.constructor === String ? this.getItem(id) : id;
		if (!item)
			{return false;}

		let rects = this.root.getClientRects();
		if (!rects.length)
			{return false;}
		let r = rects[0];
		let h = r.height;
		let y = item.offsetTop;

		if (this.root.scrollTop < y && y < (this.root.scrollTop + h))
			{return true;}
		return false;
	};

	/**
	 * Scrolls to center this item
	 * @method scrollToItem
	 * @param {string} id
	 */
	Tree.prototype.scrollToItem = function(id)
	{
		let item = id.constructor === String ? this.getItem(id) : id;
		if (!item)
			{return;}

		let container = this.root.parentNode;

		if (!container)
			{return;}

		let rect = container.getBoundingClientRect();
		if (!rect)
			{return;}
		let h = rect.height;
		let x = (parseInt(item.dataset["level"]) + this.indent_offset) * Tree.INDENT + 50;

		container.scrollTop = item.offsetTop - (h * 0.5)|0;
		if (rect.width * 0.75 < x)
			{container.scrollLeft = x;}
		else
			{container.scrollLeft = 0;}
	};

	/**
	 * Mark item as selected
	 * @method setSelectedItem
	 * @param {string} id
	 */
	Tree.prototype.setSelectedItem = function(id, scroll, send_event)
	{
		if (!id)
		{
			// clear selection
			this.unmarkAllAsSelected();
			return;
		}

		let node = this.getItem(id);
		if (!node) // not found
			{return null;}

		// already selected
		if (node.classList.contains("selected"))
			{return;}

		this.markAsSelected(node);
		if (scroll && !this._skip_scroll)
			{this.scrollToItem(node);}

		// expand parents
		this.expandItem(node, true);

		if (send_event)
			{LiteGUI.trigger( node, "click" );}

		return node;
	};

	/**
	 * Adds item to selection (multiple selection)
	 * @method addItemToSelection
	 * @param {string} id
	 */
	Tree.prototype.addItemToSelection = function(id)
	{
		if (!id)
			{return;}

		let node = this.getItem(id);
		if (!node) // not found
			{return null;}

		this.markAsSelected(node, true);
		return node;
	};

	/**
	 * Remove item from selection (multiple selection)
	 * @method removeItemFromSelection
	 * @param {string} id
	 */
	Tree.prototype.removeItemFromSelection = function(id)
	{
		if (!id)
			{return;}
		let node = this.getItem(id);
		if (!node) // not found
			{return null;}
		node.classList.remove("selected");
	};

	/**
	 * Returns the first selected item (its HTML element)
	 * @method getSelectedItem
	 * @return {HTML}
	 */
	Tree.prototype.getSelectedItem = function()
	{
		return this.root.querySelector(".ltreeitem.selected");
	};

	/**
	 * Returns an array with the selected items (its HTML elements)
	 * @method getSelectedItems
	 * @return {HTML}
	 */
	Tree.prototype.getSelectedItems = function()
	{
		return this.root.querySelectorAll(".ltreeitem.selected");
	};

	/**
	 * Returns if an item is selected
	 * @method isItemSelected
	 * @param {string} id
	 * @return {bool}
	 */
	Tree.prototype.isItemSelected = function(id)
	{
		let node = this.getItem(id);
		if (!node)
			{return false;}
		return this.isNodeSelected(node);
	};

	/**
	 * Returns the children of an item
	 * @method getChildren
	 * @param {string} id could be string or node directly
	 * @param {bool} [only_direct=false] to get only direct children
	 * @return {Array}
	 */
	Tree.prototype.getChildren = function(id, only_direct)
	{
		if (id && id.constructor !== String && id.dataset)
			{id = id.dataset["item_id"];}
		return this._findChildElements(id, only_direct);
	};

	/**
	 * Returns the parent of a item
	 * @method getParent
	 * @param {string} id
	 * @return {HTML}
	 */
	Tree.prototype.getParent = function(id_or_node)
	{
		let element = this.getItem(id_or_node);
		if (element)
			{return this.getItem( element.parent_id );}
		return null;
	};

	/**
	 * Returns an array with all the ancestors
	 * @method getAncestors
	 * @param {string} id
	 * @return {Array}
	 */
	Tree.prototype.getAncestors = function(id_or_node, result)
	{
		result = result || [];
		let element = this.getItem(id_or_node);
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
	Tree.prototype.isAncestor = function(child, node)
	{
		let element = this.getItem(child);
		if (!element)
			{return false;}
		let dest = this.getItem(node);
		let parent = this.getItem(element.parent_id);
		if (!parent)
			{return false;}
		if (parent == dest)
			{return true;}
		return this.isAncestor(parent, node);
	};

	/**
	 * Move item with id to be child of parent_id
	 * @method moveItem
	 * @param {string} id
	 * @param {string} parent_id
	 * @return {bool}
	 */
	Tree.prototype.moveItem = function(id, parent_id)
	{
		if (id === parent_id)
			{return false;}

		let node = this.getItem(id);
		let parent = this.getItem(parent_id);

		if (this.isAncestor(parent, node))
			{return false;}

		let parent_index = this._findElementIndex(parent);
		let parent_level = parseInt(parent.dataset["level"]);
		let old_parent = this.getParent(node);
		if (!old_parent)
		{
			console.error("node parent not found by id, maybe id has changed");
			return false;
		}
		let old_parent_level = parseInt(old_parent.dataset["level"]);
		let level_offset = parent_level - old_parent_level;

		if (!parent || !node)
			{return false;}

		if (parent == old_parent)
			{return false;}

		// replace parent info
		node.parent_id = parent_id;

		// get all children and subchildren and reinsert them in the new level
		let children = this.getChildren(node);
		if (children)
		{
			children.unshift(node); // add the node at the beginning

			// remove all children
			for (var i = 0; i < children.length; i++)
				{children[i].parentNode.removeChild( children[i] );}

			// update levels
			for (var i = 0; i < children.length; i++)
			{
				var child = children[i];
				let new_level = parseInt(child.dataset["level"]) + level_offset;
				child.dataset["level"] = new_level;
			}

			// reinsert
			parent_index = this._findElementIndex(parent); // update parent index
			let last_index = this._findElementLastChildIndex(parent_index);
			if (last_index == -1)
				{last_index = 0;}
			for (var i = 0; i < children.length; i++)
			{
				var child = children[i];
				this._insertInside(child, parent_index, last_index + i - 1, parseInt(child.dataset["level"]));
			}
		}

		// update collapse button
		this._updateListBox(parent);
		if (old_parent)
			{this._updateListBox( old_parent );}

		return true;
	};

	/**
	 * Remove item with given id
	 * @method removeItem
	 * @param {string} id
	 * @return {bool}
	 */
	Tree.prototype.removeItem = function(id_or_node, remove_children)
	{
		let node = id_or_node;
		if (typeof(id_or_node) == "string")
			{node = this.getItem( id_or_node );}
		if (!node)
			{return false;}

		// get parent
		let parent = this.getParent(node);

		// get all descendants
		let child_nodes = null;
		if (remove_children)
			{child_nodes = this.getChildren( node );}

		// remove html element
		this.root.removeChild(node);

		// remove all children
		if (child_nodes)
		{
			for (var i = 0; i < child_nodes.length; i++)
				{this.root.removeChild( child_nodes[i] );}
		}

		// update parent collapse button
		if (parent)
			{this._updateListBox( parent );}
		return true;
	};

	/**
	 * Update a given item with new data
	 * @method updateItem
	 * @param {string} id
	 * @param {object} data
	 */
	Tree.prototype.updateItem = function(id, data)
	{
		let node = this.getItem(id);
		if (!node)
			{return false;}

		node.data = data;
		if (data.id)
			{node.id = data.id;} // this updateItemId ?
		if (data.content)
		{
			// node.title_element.innerHTML = "<span class='precontent'></span><span class='incontent'>" +  + "</span><span class='postcontent'></span>";
			let incontent = node.title_element.querySelector(".incontent");
			incontent.innerHTML = data.content;
		}

		return true;
	};

	/**
	 * Update a given item id and the link with its children
	 * @method updateItemId
	 * @param {string} old_id
	 * @param {string} new_id
	 */
	Tree.prototype.updateItemId = function(old_id, new_id)
	{
		let node = this.getItem(old_id);
		if (!node)
			{return false;}

		let children = this.getChildren(old_id, true);
		node.id = new_id;

		for (let i = 0; i < children.length; ++i)
		{
			let child = children[i];
			child.parent_id = new_id;
		}

		return true;
	};


	/**
	 * Clears all the items
	 * @method clear
	 * @param {bool} keep_root if you want to keep the root item
	 */
	Tree.prototype.clear = function(keep_root)
	{
		if (!keep_root)
		{
			this.root.innerHTML = "";
			return;
		}

		let items = this.root.querySelectorAll(".ltreeitem");
		for (let i = 1; i < items.length; i++)
		{
			let item = items[i];
			this.root.removeChild(item);
		}
	};


	Tree.prototype.getNodeByIndex = function(index)
	{
		let items = this.root.querySelectorAll(".ltreeitem");
		return items[index];
	};

	// private ********************************

	Tree.prototype.unmarkAllAsSelected = function()
	{
		this.root.classList.remove("selected");
		let selected_array = this.root.querySelectorAll(".ltreeitem.selected");
		if (selected_array)
		{
			for (var i = 0; i < selected_array.length; i++)
				{selected_array[i].classList.remove("selected");}
		}
		let semiselected = this.root.querySelectorAll(".ltreeitem.semiselected");
		for (var i = 0; i < semiselected.length; i++)
			{semiselected[i].classList.remove("semiselected");}
	};

	Tree.prototype.isNodeSelected = function(node)
	{
		// already selected
		if (node.classList.contains("selected"))
			{return true;}
		return false;
	};

	Tree.prototype.markAsSelected = function(node, add_to_existing_selection)
	{
		// already selected
		if (node.classList.contains("selected"))
			{return;}

		// clear old selection
		if (!add_to_existing_selection)
			{this.unmarkAllAsSelected();}

		// mark as selected (it was node.title_element?)
		node.classList.add("selected");

		// go up and semiselect
		let parent = this.getParent(node);
		let visited = [];
		while (parent && visited.indexOf(parent) == -1)
		{
			parent.classList.add("semiselected");
			visited.push(parent);
			parent = this.getParent(parent);
		}
		/*
		 *var parent = node.parentNode.parentNode; //two elements per level
		 *while(parent && parent.classList.contains("ltreeitem"))
		 *{
		 *	parent.title_element.classList.add("semiselected");
		 *	parent = parent.parentNode.parentNode;
		 *}
		 */
	};

	// updates the widget to collapse
	Tree.prototype._updateListBox = function(node, options, current_level)
	{
		if (!node)
			{return;}

		let that = this;

		if (!node.listbox)
		{
			let pre = node.title_element.querySelector(".collapsebox");
			var box = LiteGUI.createLitebox(true, (e) => {
				that.onClickBox(e, node);
				LiteGUI.trigger(that.root, "item_collapse_change", { item: node, data: box.getValue() });
			});
			box.stopPropagation = true;
			box.setEmpty(true);
			pre.appendChild(box);
			node.listbox = box;
		}

		if ((options && options.collapsed) || current_level >= this.collapsed_depth)
			{node.listbox.collapse();}

		let child_elements = this.getChildren(node.dataset["item_id"]);
		if (!child_elements)
			{return;} // null

		if (child_elements.length)
			{node.listbox.setEmpty(false);}
		else
			{node.listbox.setEmpty(true);}
	};

	Tree.prototype.onClickBox = function(e, node)
	{
		let children = this.getChildren(node);

		if (!children)
			{return;}

		// update children visibility
		for (let i = 0; i < children.length; ++i)
		{
			let child = children[i];

			let child_parent = this.getParent(child);
			let visible = true;
			if (child_parent)
				{visible = this._isNodeChildrenVisible(child_parent);}
			if (visible)
				{child.classList.remove("hidden");}
			else
				{child.classList.add("hidden");}
		}
	};

	LiteGUI.Tree = Tree;
}());