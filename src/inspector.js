
/**
 * Inspector allows to create a list of widgets easily, it also provides methods to create the widgets automatically.<br/>
 * Every widget is created calling the function add followed by the widget name, p.e. addSlider or addVector3 or addNumber.<br/>
 * Widgets always receive three parameters:<br/>
 * - name: String that defines the name at that it will be shown in the left side of the widget.<br/>
 * - value: the value that will be displayed in the widget.<br/>
 * - options: Object containing all the values .<br/>
 *
 * @class Inspector
 * @param {Object} options object with a set of options { <br/>
 *width: total width <br/>
 *height: total height <br/>
 *widgets_width: width of every widget (used mostly in horizontal inspectors) <br/>
 *name_width: width of the name part of widgets <br/>
 *full: set to true if you want the inspector to use all the parent width and height <br/>
 *widgets_per_row: number of widgets per row, default is 1 but you can change it if you want to pack several widgets in a row (useful for small widgets like checkboxes) <br/>
 *one_line: widgets are place one next to the other horizontally <br/>
 *onchange: callback to call when something changes <br/>
 * } <br/>
 *
 *Dependencies:
 *- jscolor.js
 *
 * @constructor
 */

function Inspector(options)
{
	// For legacy code
	if (options && options.constructor === String)
	{
		const id = options;
		options = arguments[1] || {};
		options.id = id;
		console.warn("LiteGUI.Inspector legacy parameter, use options as first parameter instead of id.");
	}

	options = options || {};
	this.root = document.createElement("DIV");
	this.root.className = "inspector " + (options.full ? "full" : "") + (options.className || "");
	if (options.one_line)
	{
		this.one_line = true;
		this.root.className += " one_line";
	}

	if (options.id)
	{this.root.id = options.id;}

	this.sections = [];
	this.values = {};
	this.widgets = [];
	this.widgets_by_name = {};
	this.row_number = 0; // Used to detect if element is even (cannot use CSS, special cases everywhere)

	this.addContainer(); // Add empty container
	this.tab_index = Math.floor(Math.random() * 10000);

	if (options.width)
	{this.root.style.width = LiteGUI.sizeToCSS(options.width);}
	if (options.height)
	{
		this.root.style.height = LiteGUI.sizeToCSS(options.height);
		if (!options.one_line)
		{this.root.style.overflow = "auto";}
	}

	if (options.name_width)
	{this.name_width = options.name_width;}
	if (options.widgets_width)
	{this.widgets_width = options.widgets_width;}

	if (options.noscroll)
	{this.root.style.overflow = "hidden";}

	if (options.onchange)
	{this.onchange = options.onchange;}

	if (options.parent)
	{this.appendTo(options.parent);}

	this.className = this.root.className;

	this.widgets_per_row = options.widgets_per_row || 1;
}

Inspector.prototype.getValues = function()
{
	const r = {};
	for (const i in this.widgets_by_name)
	{r[i] = this.widgets_by_name[i].getValue();}
	return r;
};

Inspector.prototype.setValues = function(v)
{
	for (const i in v)
	{
		if (this.widgets_by_name[i])
		{this.widgets_by_name[i].setValue(v[i]);}
	}
};

// Append the inspector to a parent
Inspector.prototype.appendTo = function(parent, at_front)
{
	if (!parent)
	{return;}
	if (parent.constructor === String)
	{parent = document.querySelector(parent);}
	if (!parent)
	{return;}
	if (at_front)
	{parent.insertBefore(this.root, parent.firstChild);}
	else
	{parent.appendChild(this.root);}
};

/**
 * Removes all the widgets inside the inspector
 * @method clear
 */
Inspector.prototype.clear = function()
{
	purgeElement(this.root, true); // Hack, but doesnt seem to work

	while (this.root.hasChildNodes())
	{this.root.removeChild(this.root.lastChild);}

	this.root.className = this.className;

	this.row_number = 0;
	this.values = {};
	this.widgets = [];
	this.widgets_by_name = {};
	this.sections = [];
	this.current_section = null;
	this._current_container = null;
	this._current_container_stack = null;
	this.addContainer();
};

/**
 * Tryes to refresh (calls on_refresh)
 * @method refresh
 */
Inspector.prototype.refresh = function()
{
	if (this.on_refresh) {this.on_refresh();}
};

/*
 * Append widget to this inspector (TODO: rename to appendWidget)
 * + widget_parent
 * + replace
 */
Inspector.prototype.append = function(widget, options)
{
	options = options || {};

	const root = options.widget_parent || this._current_container || this.root;

	if (options.replace)
	{options.replace.parentNode.replaceChild(widget, options.replace);}
	else
	{
		widget.section = this.current_section;
		root.appendChild(widget);
	}
};

Inspector.prototype.pushContainer = function(container)
{
	if (!this._current_container_stack)
	{this._current_container_stack = [ container ];}
	else
	{
		if (this._current_container_stack.indexOf(container) != -1)
		{
			console.warn("Container already in the stack");
			return;
		}

		this._current_container_stack.push(container);
	}

	this._current_container = container;
};

Inspector.prototype.isContainerInStack = function(container)
{
	if (!this._current_container_stack)
	{return false;}
	if (this._current_container_stack.indexOf(container) != -1)
	{return true;}
	return false;
};

Inspector.prototype.popContainer = function(container)
{
	this.row_number = 0;
	if (this._current_container_stack && this._current_container_stack.length)
	{
		if (container)
		{
			let aux = this._current_container_stack.pop();
			while (aux && aux != container)
			{aux = this._current_container_stack.pop();}
		}
		else
		{
			this._current_container_stack.pop();
		}
		this._current_container = this._current_container_stack[ this._current_container_stack.length - 1 ];
	}
	else
	{this._current_container = null;}
};

Inspector.prototype.setup = function(info)
{
	for (const i in info)
	{
		const w = info[i];
		const widget = this.add(w.type, w.name, w.value, w.options);
	}
};

/**
 *  Returns the widget given the name
 *
 * @method getWidget
 * @param {String} name the name of the widget supplied when creating it or the number of the widget
 * @return {Object} widget object
 */
Inspector.prototype.getWidget = function(name)
{
	if (name !== null && name.constructor === Number)
	{return this.widgets[ name ];}
	return this.widgets_by_name[ name ];
};

/**
 *  Given an instance it shows all the attributes
 *
 * @method inspectInstance
 * @param {Object} instance the instance that you want to inspect, attributes will be collected from this object
 * @param {Array} properties an array with all the names of the properties you want to inspect,
 *		  if not specified then it calls getProperties, othewise collect them and tries to guess the type
 * @param {Object} properties_info_example it overwrites the info about properties found in the object (in case the automaticaly guessed type is wrong)
 * @param {Array} properties_to_skip this properties will be ignored
 */
Inspector.prototype.inspectInstance = function(instance, properties, properties_info_example, properties_to_skip)
{
	if (!instance)
	{return;}

	if (!properties)
	{
		if (instance.getProperties)
		{properties = instance.getProperties();}
		else
		{properties = this.collectProperties(instance);}
	}

	const classObject = instance.constructor;
	if (!properties_info_example && classObject.properties)
	{properties_info_example = classObject.properties;}

	/*
	 * Properties info contains  name:type for every property
	 * Must be cloned to ensure there is no overlap between widgets reusing the same container
	 */
	let properties_info = {};

	if (instance.getInspectorProperties)
	{properties_info = instance.getInspectorProperties();}
	else
	{
		// Add to properties_info the ones that are not specified
		for (const i in properties)
		{
			if (properties_info_example && properties_info_example[i])
			{
				// Clone
				properties_info[i] = inner_clone(properties_info_example[i]);
				continue;
			}

			const v = properties[i];

			if (classObject["@" + i]) // Guess from class object info
			{
				const shared_options = classObject["@" + i];
				if (shared_options && shared_options.widget === null)
				{continue;} // Skip
				properties_info[i] = inner_clone(shared_options);
			}
			else if (instance["@" + i]) // Guess from instance info
			{properties_info[i] = instance["@" + i];}
			else if (v === null || v === undefined) // Are you sure?
			{continue;}
			else
			{
				switch (v.constructor)
				{
				case Number: properties_info[i] = { type: "number", step: 0.1 }; break;
				case String: properties_info[i] = { type: "string" }; break;
				case Boolean: properties_info[i] = { type: "boolean" }; break;
				default:
					if (v && (v.constructor === Array || v.constructor.BYTES_PER_ELEMENT)) // Array or typed_array
					{
						const is_number = v[0] != null && v[0].constructor === Number;
						switch (v.length)
						{
						case 2: properties_info[i] = { type: is_number ? "vec2" : "Array", step: 0.1 }; break;
						case 3: properties_info[i] = { type: is_number ? "vec3" : "Array", step: 0.1 }; break;
						case 4: properties_info[i] = { type: is_number ? "vec4" : "Array", step: 0.1 }; break;
						default:
							properties_info[i] = { type: "Array" };
							break;
						}
					}
				}
			}
		}
	}

	if (properties_to_skip)
	{
		for (const i in properties_to_skip)
		{delete properties_info[ properties_to_skip[i] ];}
	}

	// Allows to establish the order of the properties in the inspector
	if (classObject.properties_order)
	{
		const sorted_properties = {};
		for (const i in classObject.properties_order)
		{
			const name = classObject.properties_order[i];
			if (properties_info[ name ])
			{sorted_properties[ name ] = properties_info[ name ];}
			else
			{console.warn("property not found in instance:", name);}
		}
		for (const i in properties_info) // Add the missing ones at the end (should this be optional?)
		{
			if (!sorted_properties[i])
			{sorted_properties[i] = properties_info[i];}
		}
		properties_info = sorted_properties;
	}


	// ShowAttributes doesnt return anything but just in case...
	return this.showProperties(instance, properties_info);

	// Basic cloner
	function inner_clone(original, target)
	{
		target = target || {};
		for (const j in original)
		{target[j] = original[j];}
		return target;
	}
};

/**
 *  Extract all attributes from an instance (enumerable properties that are not function and a name starting with alphabetic character)
 *
 * @method collectPropertier
 * @param {Object} instance extract enumerable and public (name do not start with '_' ) properties from an object
 * return {Object} object with "name" : value for every property
 *
 */
Inspector.prototype.collectProperties = function(instance)
{
	const properties = {};

	for (const i in instance)
	{
		if (i[0] == "_" || i[0] == "@" || i.substr(0,6) == "jQuery") // Skip vars with _ (they are private)
		{continue;}

		const v = instance[i];
		if (v && v.constructor == Function && !instance.constructor["@" + i])
		{continue;}
		properties[i] = v;
	}
	return properties;
};

/**
 * Adds the widgets for the properties specified in properties_info of instance, it will create callback and callback_update
 *
 * @method showProperties
 * @param {Object} instance the instance that you want to inspect
 * @param {Object} properties_info object containing   "property_name" :{ type: value, widget:..., min:..., max:... }  or just "property":"type"
 * @param {Array} properties_to_skip this properties will be ignored
 */
Inspector.prototype.showProperties = function(instance, properties_info)
{
	// For every enumerable property create widget
	for (const i in properties_info)
	{
		let varname = i;
		let options = properties_info[i];
		if (!options)
		{continue;}
		if (options.constructor === String) // It allows to just specify the type
		{options = { type: options };}
		if (options.name)
		{varname = options.name;}
		if (!options.callback) // Generate default callback to modify data
		{
			const o = { instance: instance, name: varname, options: options };
			if (options.type != "function") { options.callback = Inspector.assignValue.bind(o);}

		}
		if (!options.callback_update) // Generate default refresh
		{
			const o = { instance: instance, name: varname };
			options.callback_update = (function(){ return this.instance[ this.name ]; }).bind(o);
		}

		options.instance = instance;
		options.varname = varname;

		const type = options.widget || options.type || "string";

		// Used to hook stuff on special occasions
		if (this.on_addProperty)
		{this.on_addProperty(type, instance, varname, instance[varname], options);}
		this.add(type, varname, instance[varname], options);
	}

	// Extra widgets inserted by the object (stored in the constructor)
	if (instance.constructor.widgets)
	{
		for (const i in instance.constructor.widgets)
		{
			const w = instance.constructor.widgets[i];
			this.add(w.widget, w.name, w.value, w);
		}
	}

	// Used to add extra widgets at the end
	if (instance.onShowProperties)
	{instance.onShowProperties(this);}
	if (instance.constructor.onShowProperties)
	{instance.constructor.onShowProperties(instance, this);}
};

/**
 * Tryes to assigns a value to the instance stored in this.instance
 * @method assignValue
 */
Inspector.assignValue = function(value)
{
	const instance = this.instance;
	const current_value = instance[ this.name ];

	if (current_value == null || value == null || this.options.type == "enum")
	{instance[this.name] = value;}
	else if (typeof(current_value) == "number")
	{instance[this.name] = parseFloat(value);}
	else if (typeof(current_value) == "string")
	{instance[this.name] = value;}
	else if (value && value.length && current_value && current_value.length &&
		(!Object.getOwnPropertyDescriptor(instance, this.name) || !Object.getOwnPropertyDescriptor(instance, this.name).set) &&  // No setters
		(!Object.getOwnPropertyDescriptor(Object.getPrototypeOf(instance), this.name) || !Object.getOwnPropertyDescriptor(Object.getPrototypeOf(instance), this.name).set))
	{
		for (let i = 0; i < value.length; ++i)
		{current_value[i] = value[i];}
	}
	else
	{instance[ this.name ] = value;}
};

/**
 * Used by all widgets to create the container of one widget
 * @method createWidget
 * @param {string} name the string to show at the left side of the widget, if null this element wont be created and the value part will use the full width
 * @param {string} content the string with the html of the elements that conform the interactive part of the widget
 * @param {object} options some generic options that any widget could have:
 * - widget_name: the name used to store this widget in the widgets_by_name container, if omited the parameter name is used
 * - width: the width of the widget (if omited it will use the Inspector widgets_width, otherwise 100%
 * - name_width: the width of the name part of the widget, if not specified it will use Inspector name_width, otherwise css default
 * - content_width: the width of the widget content area
 * - pre_title: string to append to the left side of the name, this is helpful if you want to add icons with behaviour when clicked
 * - title: string to replace the name, sometimes you want to supply a different name than the one you want to show (this is helpful to retrieve values from an inspector)
 */
Inspector.prototype.createWidget = function(name, content, options)
{
	options = options || {};
	content = (content === undefined || content === null) ? "" : content;
	const element = document.createElement("DIV");
	element.className = "widget " + (options.className || "");
	element.inspector = this;
	element.options = options;
	element.name = name;

	this.row_number += this.widgets_per_row;
	if (this.row_number % 2 == 0)
	{element.className += " even";}

	const width = options.width || this.widgets_width;
	if (width)
	{
		element.style.width = LiteGUI.sizeToCSS(width);
		if (!element.style.width)
		{element.style.width = "calc(" + LiteGUI.sizeToCSS(width) + ")";}
		element.style.minWidth = "auto";
	}
	const height = options.height || this.height;
	if (height)
	{
		element.style.height = LiteGUI.sizeToCSS(height);
		if (!element.style.height)
		{element.style.height = "calc(" + LiteGUI.sizeToCSS(height) + ")";}
		element.style.minHeight = "auto";
	}

	// Store widgets
	this.widgets.push(element);
	if (options.widget_name || name)
	{this.widgets_by_name[ options.widget_name || name ] = element;}

	if (this.widgets_per_row != 1)
	{
		if (!options.width)
		{element.style.width = (100 / this.widgets_per_row).toFixed(2) + "%";}
		element.style.display = "inline-block";
	}

	let namewidth = "";
	let contentwidth = "";
	if ((name !== undefined && name !== null) && (this.name_width || options.name_width) && !this.one_line)
	{
		const w = LiteGUI.sizeToCSS(options.name_width || this.name_width);
		namewidth = "style='width: calc(" + w + " - 0px); width: -webkit-calc(" + w + " - 0px); width: -moz-calc(" + w + " - 0px); '"; // Hack
		contentwidth = "style='width: calc( 100% - " + w + "); width: -webkit-calc(100% - " + w + "); width: -moz-calc( 100% - " + w + "); '";
	}

	if (options.name_width)
	{namewidth = "style='width: "+ LiteGUI.sizeToCSS(options.name_width)+" '";}
	if (options.content_width)
	{contentwidth = "style='width: "+ LiteGUI.sizeToCSS(options.content_width)+" '";}

	let code = "";
	let pretitle = "";
	const filling = this.one_line ? "" : "<span class='filling'></span>";

	if (options.pretitle)
	{pretitle = options.pretitle;}

	let content_class = "wcontent ";
	let title = name;
	if (options.title)
	{title = options.title;}
	if (name === null || name === undefined)
	{content_class += " full";}
	else if (name === "") // Three equals because 0 == ""
	{code += "<span class='wname' title='"+title+"' "+namewidth+">"+ pretitle +"</span>";}
	else
	{code += "<span class='wname' title='"+title+"' "+namewidth+">"+ pretitle + name + filling + "</span>";}

	if (content.constructor === String || content.constructor === Number || content.constructor === Boolean)
	{element.innerHTML = code + "<span class='info_content "+content_class+"' "+contentwidth+">"+content+"</span>";}
	else
	{
		element.innerHTML = code + "<span class='info_content "+content_class+"' "+contentwidth+"></span>";
		const content_element = element.querySelector("span.info_content");
		if (content_element)
		{content_element.appendChild(content);}
	}

	element.content = element.querySelector("span.info_content");
	element.remove = function()
	{
		if (this.parentNode)
		{this.parentNode.removeChild(this);}
	};

	return element;
};

// Calls callback, triggers wchange, calls onchange in Inspector
Inspector.onWidgetChange = function(element, name, value, options, expand_value, event)
{
	const section = element.section; // This.current_section

	if (!options.skip_wchange)
	{
		if (section)
		{LiteGUI.trigger(section, "wbeforechange", value);}
		LiteGUI.trigger(element, "wbeforechange", value);
	}

	// Assign and launch callbacks
	this.values[ name ] = value;
	let r = undefined;
	if (options.callback)
	{
		if (expand_value)
		{r = options.callback.apply(element, value);}
		else
		{r = options.callback.call(element, value, event);}
	}

	if (!options.skip_wchange)
	{
		if (section)
		{LiteGUI.trigger(section, "wchange", value, element);}
		LiteGUI.trigger(element, "wchange", value, element);
	}

	if (this.onchange)
	{this.onchange(name, value, element);}
	return r;
};

// Must be lowercase
Inspector.widget_constructors = {
	"null": 'addNull', // Use for special cases
	title: 'addTitle',
	info: 'addInfo',
	"default": 'addDefault', // It guesses
	number: 'addNumber',
	slider: 'addSlider',
	string: 'addString',
	text: 'addString',
	textarea: 'addTextarea',
	color: 'addColor',
	"boolean": 'addCheckbox',
	checkbox: 'addCheckbox',
	icon: 'addIcon',
	vec2: 'addVector2',
	vector2: 'addVector2',
	vec3: 'addVector3',
	vector3: 'addVector3',
	vec4: 'addVector4',
	vector4: 'addVector4',
	"enum": 'addCombo',
	dropdown: 'addCombo',
	combo: 'addCombo',
	button: 'addButton',
	buttons: 'addButtons',
	file: 'addFile',
	line: 'addLine',
	list: 'addList',
	tree: 'addTree',
	datatree: 'addDataTree',
	pad: 'addPad',
	array: 'addArray',
	separator: 'addSeparator'
};


Inspector.registerWidget = function(name, callback)
{
	const func_name = "add" + name.charAt(0).toUpperCase() + name.slice(1);
	Inspector.prototype[func_name] = callback;
	Inspector.widget_constructors[name] = func_name;
};


/**
 * Adds a widgete to the inspector, its a way to provide the widget type from a string
 * @method add
 * @param {string} type string specifying the name of the widget to use (check Inspector.widget_constructors for a complete list)
 * @param {string} name the string to show at the left side of the widget, if null this element wont be created and the value part will use the full width
 * @param {string} value the value to assign to the widget
 * @param {object} options: some generic options that any widget could have:
 * - type: overwrites the type
 * - callback: function to call when the user interacts with the widget and changes the value
 * [For a bigger list check createWidget and every widget in particular]
 * @return {HTMLElement} the widget in the form of the DOM element that contains it
 *
 */
Inspector.prototype.add = function(type, name, value, options)
{
	if (!type)
	{throw ("Inspector: no type specified");}

	// Type could be an object with every parameter contained inside
	if (arguments.length == 1 && typeof(type) == "object")
	{
		options = type;
		type = options.type;
		name = options.name;
		value = options.value;
	}

	let func = LiteGUI.Inspector.widget_constructors[type.toLowerCase()];
	if (!func)
	{
		console.warn("LiteGUI.Inspector do not have a widget called",type);
		return;
	}

	if (func.constructor === String)
	{func = LiteGUI.Inspector.prototype[func];}
	if (!func)
	{return;}
	if (func.constructor !== Function)
	{return;}

	if (options && options.constructor === Function)
	{options = { callback: options };}

	return func.call(this, name,value, options);
};

Inspector.prototype.getValue = function(name)
{
	return this.values[name];
};


Inspector.prototype.applyOptions = function(element, options)
{
	if (!element || !options)
	{return;}

	if (options.className)
	{element.className += " " + options.className;}
	if (options.id)
	{element.id = options.id;}
	if (options.width)
	{element.style.width = LiteGUI.sizeToCSS(options.width);}
	if (options.height)
	{element.style.height = LiteGUI.sizeToCSS(options.height);}
};


/**
 * Creates a line
 * @method addSeparator
 * @return {HTMLElement} the widget in the form of the DOM element that contains it
 *
 */
Inspector.prototype.addSeparator = function()
{
	const element = document.createElement("DIV");
	element.className = "separator";
	this.append(element);
	return element;
};

// Used when you want to skip the widget of an object
Inspector.prototype.addNull = function(name,value, options)
{
	return null;
};

// Used when you dont know which widget to use
Inspector.prototype.addDefault = function(name, value, options)
{
	if (value === null || value === undefined) // Can we guess it from the current value?
	{return null;}

	if (value.constructor === Boolean)
	{return this.addCheckbox(name, value, options);}
	else if (value.constructor === String)
	{return this.addString(name, value, options);}
	else if (value.constructor === Number)
	{return this.addNumber(name, value, options);}
	else if (value.length == 4)
	{return this.addVector4(name, value, options);}
	else if (value.length == 3)
	{return this.addVector3(name, value, options);}
	else if (value.length == 2)
	{return this.addVector2(name, value, options);}
	return null;
};


/**
 * Widget to edit strings
 * @method addString
 * @param {string} name
 * @param {string} value
 * @param {Object} options, here is a list for this widget (check createWidget for a list of generic options):
 * - focus: true if you want the cursor to be here
 * - password: true if you want to hide the string
 * - immediate: calls the callback once every keystroke
 * - disabled: shows the widget disabled
 * - callback: function to call when the widget changes
 * @return {HTMLElement} the widget in the form of the DOM element that contains it
 *
 */
Inspector.prototype.addString = function(name,value, options)
{
	options = this.processOptions(options);

	value = value || "";
	const that = this;
	this.values[name] = value;

	let inputtype = "text";
	if (options.password)
	{inputtype = "password";}
	const focus = options.focus ? "autofocus" : "";

	const element = this.createWidget(name,"<span class='inputfield full "+(options.disabled?"disabled":"")+"'><input type='"+inputtype+"' tabIndex='"+this.tab_index+"' "+focus+" class='text string' value='"+value+"' "+(options.disabled?"disabled":"")+"/></span>", options);
	const input = element.querySelector(".wcontent input");

	if (options.placeHolder)
	{input.setAttribute("placeHolder",options.placeHolder);}

	if (options.align == "right")
	{
		input.style.direction = "rtl";
		// Input.style.textAlign = "right";
	}

	input.addEventListener(options.immediate ? "keyup" : "change", (e) =>
	{
		const r = Inspector.onWidgetChange.call(that, element, name, e.target.value, options);
		if (r !== undefined) {input.value = r;}
	});

	if (options.callback_enter)
	{
		input.addEventListener("keydown" , (e) =>
		{
			if (e.keyCode == 13)
			{
				const r = Inspector.onWidgetChange.call(that, element, name, e.target.value, options);
				options.callback_enter();
				e.preventDefault();
			}
		});
	}

	this.tab_index += 1;

	element.setIcon = function(img)
	{
		if (!img)
		{
			input.style.background = "";
			input.style.paddingLeft = "";
		}
		else
		{
			input.style.background = "transparent url('"+img+"') no-repeat left 4px center";
			input.style.paddingLeft = "1.7em";
		}
	};
	if (options.icon)
	{element.setIcon(options.icon);}

	element.setValue = function(v, skip_event)
	{
		if (v === undefined)
		{return;}
		if (v === input.value)
		{return;}
		input.value = v;
		if (!skip_event)
		{LiteGUI.trigger(input, "change");}
	};
	element.getValue = function() { return input.value; };
	element.focus = function() { this.querySelector("input").focus(); };
	element.disable = function() { input.disabled = true; };
	element.enable = function() { input.disabled = false; };
	this.append(element,options);
	this.processElement(element, options);
	return element;
};

/**
 * Widget to edit strings, but it adds a button behind (useful to search values somewhere in case the user do not remember the name)
 * @method addStringButton
 * @param {string} name
 * @param {string} value the string to show
 * @param {Object} options, here is a list for this widget (check createWidget for a list of generic options):
 * - disabled: shows the widget disabled
 * - button: string to show inside the button, default is "..."
 * - callback: function to call when the string is edited
 * - callback_button: function to call when the button is pressed
 * @return {HTMLElement} the widget in the form of the DOM element that contains it
 *
 */
Inspector.prototype.addStringButton = function(name, value, options)
{
	options = this.processOptions(options);

	if (value === undefined)
	{value = "";}
	const that = this;
	this.values[name] = value;

	const element = this.createWidget(name, "<span class='inputfield button'><input type='text' tabIndex='"+this.tab_index+"' class='text string' value='' "+(options.disabled?"disabled":"")+"/></span><button class='micro'>"+(options.button || "...")+"</button>", options);
	const input = element.querySelector(".wcontent input");
	input.value = value;
	input.addEventListener("change", (e) =>
	{
		const r = Inspector.onWidgetChange.call(that,element,name,e.target.value, options);
		if (r !== undefined) { input.value = r; }
	});

	if (options.disabled)
	{input.setAttribute("disabled","disabled");}

	element.setIcon = function(img)
	{
		if (!img)
		{
			input.style.background = "";
			input.style.paddingLeft = "";
		}
		else
		{
			input.style.background = "transparent url('"+img+"') no-repeat left 4px center";
			input.style.paddingLeft = "1.7em";
		}
	};
	if (options.icon)
	{element.setIcon(options.icon);}

	const button = element.querySelector(".wcontent button");
	button.addEventListener("click", (e) =>
	{
		if (options.callback_button) {options.callback_button.call(element, input.value, e);}
	});

	if (options.button_width)
	{
		button.style.width = LiteGUI.sizeToCSS(options.button_width);
		const inputfield = element.querySelector(".inputfield");
		inputfield.style.width = "calc( 100% - " + button.style.width + " - 6px)";
	}


	this.tab_index += 1;
	this.append(element,options);
	element.setValue = function(v, skip_event)
	{
		input.value = v;
		if (!skip_event)
		{LiteGUI.trigger(input, "change");}
	};
	element.disable = function() { input.disabled = true; button.disabled = true; };
	element.enable = function() { input.disabled = false; button.disabled = false; };
	element.getValue = function() { return input.value; };
	element.focus = function() { LiteGUI.focus(input); };
	this.processElement(element, options);
	return element;
};

/**
 * Widget to edit strings with multiline support
 * @method addTextarea
 * @param {string} name
 * @param {string} value
 * @param {Object} options, here is a list for this widget (check createWidget for a list of generic options):
 * - focus: true if you want the cursor to be here
 * - password: true if you want to hide the string
 * - immediate: calls the callback once every keystroke
 * - disabled: shows the widget disabled
 * - callback: function to call when the widget changes
 * @return {HTMLElement} the widget in the form of the DOM element that contains it
 *
 */
Inspector.prototype.addTextarea = function(name,value, options)
{
	options = this.processOptions(options);

	value = value || "";
	const that = this;
	this.values[name] = value;

	const element = this.createWidget(name,"<span class='inputfield textarea "+(options.disabled?"disabled":"")+"'><textarea tabIndex='"+this.tab_index+"' "+(options.disabled?"disabled":"")+"></textarea></span>", options);
	this.tab_index++;
	const textarea = element.querySelector(".wcontent textarea");
	textarea.value = value;
	textarea.addEventListener(options.immediate ? "keyup" : "change", (e) =>
	{
		Inspector.onWidgetChange.call(that,element,name,e.target.value, options, false, e);
	});
	if (options.callback_keydown)
	{
		textarea.addEventListener("keydown", options.callback_keydown);
	}

	if (options.height)
	{
		textarea.style.height = "calc( " + LiteGUI.sizeToCSS(options.height) + " - 5px )";
	}
	// Textarea.style.height = LiteGUI.sizeToCSS( options.height );
	this.append(element,options);
	element.setValue = function(v, skip_event)
	{
		if (v === undefined)
		{return;}
		if (v == textarea.value)
		{return;}
		value = v;
		textarea.value = v;
		if (!skip_event)
		{LiteGUI.trigger(textarea,"change");}
	};
	element.getValue = function(v)
	{
		return textarea.value;
	};
	element.focus = function() { LiteGUI.focus(textarea); };
	element.disable = function() { textarea.disabled = true;};
	element.enable = function() { textarea.disabled = false;};
	this.processElement(element, options);
	return element;
};

/**
 * Widget to edit numbers (it adds a dragging mini widget in the right side)
 * @method addNumber
 * @param {string} name
 * @param {number} value
 * @param {Object} options, here is a list for this widget (check createWidget for a list of generic options):
 * - disabled: shows the widget disabled
 * - callback: function to call when the string is edited
 * - precision: number of digits after the colon
 * - units: string to show after the number
 * - min: minimum value accepted
 * - max: maximum value accepted
 * - step: increments when draggin the mouse (default is 0.1)
 * @return {HTMLElement} the widget in the form of the DOM element that contains it
 *
 */
Inspector.prototype.addNumber = function(name, value, options)
{
	options = this.processOptions(options);

	value = value || 0;
	const that = this;
	this.values[name] = value;

	const element = this.createWidget(name,"", options);
	this.append(element,options);

	options.extraclass = "full";
	options.tab_index = this.tab_index;
	// Options.dragger_class = "full";
	options.full = true;
	options.precision = options.precision !== undefined ? options.precision : 2;
	options.step = options.step === undefined ? (options.precision == 0 ? 1 : 0.1) : options.step;

	this.tab_index++;

	let dragger = null;

	dragger = new LiteGUI.Dragger(value, options);
	dragger.root.style.width = "calc( 100% - 1px )";
	element.querySelector(".wcontent").appendChild(dragger.root);

	const inner_before_change = function(options)
	{
		if (options.callback_before) {options.callback_before.call(element);}
	};
	dragger.root.addEventListener("start_dragging", inner_before_change.bind(undefined,options));
	element.dragger = dragger;

	if (options.disabled)
	{dragger.input.setAttribute("disabled","disabled");}

	const input = element.querySelector("input");

	input.addEventListener("change", (e) =>
	{
		const el = e.target;
		LiteGUI.trigger(element, "wbeforechange", e.target.value);

		that.values[name] = e.target.value;

		if (options.callback && dragger.dragging)
		{
			const ret = options.callback.call(element, parseFloat(e.target.value));
			if (typeof(ret) == "number") { el.value = ret; }
		}
		else if ((options.callback || options.finalCallback) && !dragger.dragging)
		{
			let ret = undefined;
			if (options.finalCallback)
			{
				ret = options.finalCallback.call(element, parseFloat(e.target.value));
			}
			else if (options.callback)
			{
				ret = options.callback.call(element, parseFloat(e.target.value));
			}
			if (typeof(ret) == "number") {el.value = ret;}
		}
		LiteGUI.trigger(element, "wchange", e.target.value);
		if (that.onchange) {that.onchange(name,e.target.value,element);}
	});

	dragger.root.addEventListener("stop_dragging", (e) =>
	{
		LiteGUI.trigger(input, "change");
	});

	element.setValue = function(v, skip_event)
	{
		if (v === undefined)
		{return;}
		v = parseFloat(v);
		if (options.precision)
		{v = v.toFixed(options.precision);}
		v += (options.units || "");
		if (input.value == v)
		{return;}
		input.value = v;
		if (!skip_event)
		{LiteGUI.trigger(input,"change");}
	};

	element.setRange = function(min,max) { dragger.setRange(min,max); };
	element.getValue = function() { return parseFloat(input.value); };
	element.focus = function() { LiteGUI.focus(input); };
	element.disable = function() { input.disabled = true;};
	element.enable = function() { input.disabled = false;};
	this.processElement(element, options);
	return element;
};

/**
 * Widget to edit two numbers (it adds a dragging mini widget in the right side)
 * @method addVector2
 * @param {string} name
 * @param {vec2} value
 * @param {Object} options, here is a list for this widget (check createWidget for a list of generic options):
 * - callback: function to call once the value changes
 * - disabled: shows the widget disabled
 * - callback: function to call when the string is edited
 * - precision: number of digits after the colon
 * - units: string to show after the number
 * - min: minimum value accepted
 * - max: maximum value accepted
 * - step: increments when draggin the mouse (default is 0.1)
 * @return {HTMLElement} the widget in the form of the DOM element that contains it
 *
 */
Inspector.prototype.addVector2 = function(name,value, options)
{
	options = this.processOptions(options);
	if (!options.step)
	{options.step = 0.1;}

	value = value || [0,0];
	const that = this;
	this.values[name] = value;

	const element = this.createWidget(name,"", options);

	options.step = options.step ||0.1;
	// Options.dragger_class = "medium";
	options.tab_index = this.tab_index;
	options.full = true;
	this.tab_index++;

	const draggers = element.draggers = [];

	const inner_before_change = function(e)
	{
		if (options.callback_before) {options.callback_before(e);}
	};

	for (let i = 0; i < 2; i++)
	{
		const dragger = new LiteGUI.Dragger(value[i], options);
		dragger.root.style.marginLeft = 0;
		dragger.root.style.width = "calc( 25% - 1px )";
		element.querySelector(".wcontent").appendChild(dragger.root);
		options.tab_index = this.tab_index;
		this.tab_index++;
		dragger.root.addEventListener("start_dragging", inner_before_change);
		draggers.push(dragger);
	}

	const inputs = element.querySelectorAll("input");
	const onChangeCallback = function(e)
	{
		// Gather all three parameters
		let r = [];
		const elems = inputs;
		for (let j = 0; j < elems.length; j++)
		{
			r.push(parseFloat(elems[j].value));
		}

		LiteGUI.trigger(element, "wbeforechange", [r]);

		that.values[name] = r;

		const dragger = e.target.dragger;
		if (options.callback && dragger.dragging)
		{
			const new_val = options.callback.call(element, r);

			if (typeof(new_val) == "object" && new_val.length >= 2)
			{
				for (let j = 0; j < elems.length; j++)
				{
					elems[j].value = new_val[j];
				}
				r = new_val;
			}
		}
		else if ((options.callback || options.finalCallback) && !dragger.dragging)
		{
			let new_val = undefined;
			if (options.finalCallback)
			{
				new_val = options.finalCallback.call(element, r);
			}
			else if (options.callback)
			{
				new_val = options.callback.call(element, r);
			}

			if (typeof(new_val) == "object" && new_val.length >= 2)
			{
				for (let j = 0; j < elems.length; j++)
				{
					elems[j].value = new_val[j];
				}
				r = new_val;
			}
		}

		LiteGUI.trigger(element, "wchange", [r]);
		if (that.onchange) {that.onchange(name,r,element);}
	};
	const onStopDragging = function(input, e)
	{
		LiteGUI.trigger(input, "change");
	};
	for (let i = 0; i < inputs.length; ++i)
	{
		const dragger = draggers[i];
		const input = inputs[i];
		input.dragger = dragger;
		input.addEventListener("change" , onChangeCallback);
		dragger.root.addEventListener("stop_dragging", onStopDragging.bind(undefined, input));
	}

	this.append(element,options);

	element.setValue = function(v, skip_event)
	{
		if (!v) {return;}
		for (let i = 0; i < draggers.length; i++)
		{
			draggers[i].setValue(v[i],skip_event || i < draggers.length - 1);
		}
	};
	element.setRange = function(min,max) { for (const i in draggers) { draggers[i].setRange(min,max); } };

	this.processElement(element, options);
	return element;
};

/**
 * Widget to edit two numbers (it adds a dragging mini widget in the right side)
 * @method addVector3
 * @param {string} name
 * @param {vec3} value
 * @param {Object} options, here is a list for this widget (check createWidget for a list of generic options):
 * - callback: function to call once the value changes
 * - disabled: shows the widget disabled
 * - callback: function to call when the string is edited
 * - precision: number of digits after the colon
 * - units: string to show after the number
 * - min: minimum value accepted
 * - max: maximum value accepted
 * - step: increments when draggin the mouse (default is 0.1)
 * @return {HTMLElement} the widget in the form of the DOM element that contains it
 *
 */
Inspector.prototype.addVector3 = function(name,value, options)
{
	options = this.processOptions(options);
	if (!options.step)
	{options.step = 0.1;}

	value = value || [0,0,0];
	const that = this;
	this.values[name] = value;

	const element = this.createWidget(name,"", options);

	options.step = options.step || 0.1;
	// Options.dragger_class = "mini";
	options.tab_index = this.tab_index;
	options.full = true;
	this.tab_index++;

	const draggers = element.draggers = [];

	const inner_before_change = function(e)
	{
		if (options.callback_before) {options.callback_before(e);}
	};

	for (let i = 0; i < 3; i++)
	{
		const dragger = new LiteGUI.Dragger(value[i], options);
		dragger.root.style.marginLeft = 0;
		dragger.root.style.width = "calc( 25% - 1px )";
		element.querySelector(".wcontent").appendChild(dragger.root);
		options.tab_index = this.tab_index;
		this.tab_index++;
		dragger.root.addEventListener("start_dragging", inner_before_change);
		draggers.push(dragger);
	}

	const inputs = element.querySelectorAll("input");
	const onChangeCallback = function(e)
	{
		// Gather all three parameters
		let r = [];
		const elems = inputs;
		for (let j = 0; j < elems.length; j++)
		{
			r.push(parseFloat(elems[j].value));
		}

		LiteGUI.trigger(element, "wbeforechange", [r]);

		that.values[name] = r;

		const dragger = e.target.dragger;
		if (options.callback && dragger.dragging)
		{
			const new_val = options.callback.call(element, r);

			if (typeof(new_val) == "object" && new_val.length >= 2)
			{
				for (let j = 0; j < elems.length; j++)
				{
					elems[j].value = new_val[j];
				}
				r = new_val;
			}
		}
		else if ((options.callback || options.finalCallback) && !dragger.dragging)
		{
			let new_val = undefined;
			if (options.finalCallback)
			{
				new_val = options.finalCallback.call(element, r);
			}
			else if (options.callback)
			{
				new_val = options.callback.call(element, r);
			}

			if (typeof(new_val) == "object" && new_val.length >= 2)
			{
				for (let j = 0; j < elems.length; j++)
				{
					elems[j].value = new_val[j];
				}
				r = new_val;
			}
		}

		LiteGUI.trigger(element, "wchange", [r]);
		if (that.onchange) {that.onchange(name,r,element);}
	};
	const onStopDragging = function(input, e)
	{
		LiteGUI.trigger(input, "change");
	};
	for (let i = 0; i < inputs.length; ++i)
	{
		const dragger = draggers[i];
		const input = inputs[i];
		input.dragger = dragger;
		input.addEventListener("change" , onChangeCallback);
		dragger.root.addEventListener("stop_dragging", onStopDragging.bind(undefined, input));
	}

	this.append(element,options);

	element.setValue = function(v, skip_event)
	{
		if (!v) {return;}
		for (let i = 0; i < draggers.length; i++)
		{
			draggers[i].setValue(v[i],skip_event || i < draggers.length - 1);
		}
	};
	element.setRange = function(min,max) { for (const i in draggers) { draggers[i].setRange(min,max); } };

	this.processElement(element, options);
	return element;
};

/**
 * Widget to edit two numbers (it adds a dragging mini widget in the right side)
 * @method addVector4
 * @param {string} name
 * @param {vec4} value
 * @param {Object} options, here is a list for this widget (check createWidget for a list of generic options):
 * - callback: function to call once the value changes
 * - disabled: shows the widget disabled
 * - callback: function to call when the string is edited
 * - precision: number of digits after the colon
 * - units: string to show after the number
 * - min: minimum value accepted
 * - max: maximum value accepted
 * - step: increments when draggin the mouse (default is 0.1)
 * @return {HTMLElement} the widget in the form of the DOM element that contains it
 *
 */
Inspector.prototype.addVector4 = function(name,value, options)
{
	options = this.processOptions(options);
	if (!options.step)
	{options.step = 0.1;}

	value = value || [0,0,0,0];
	const that = this;
	this.values[name] = value;

	const element = this.createWidget(name,"", options);

	options.step = options.step || 0.1;
	// Options.dragger_class = "mini";
	options.tab_index = this.tab_index;
	options.full = true;
	this.tab_index++;

	const draggers = element.draggers = [];

	const inner_before_change = function(e)
	{
		if (options.callback_before) {options.callback_before(e);}
	};

	for (let i = 0; i < 4; i++)
	{
		const dragger = new LiteGUI.Dragger(value[i], options);
		dragger.root.style.marginLeft = 0;
		dragger.root.style.width = "calc( 25% - 1px )";
		element.querySelector(".wcontent").appendChild(dragger.root);
		options.tab_index = this.tab_index;
		this.tab_index++;
		dragger.root.addEventListener("start_dragging", inner_before_change);
		draggers.push(dragger);
	}

	const inputs = element.querySelectorAll("input");
	const onChangeCallback = function(e)
	{
		// Gather all parameters
		let r = [];
		const elems = inputs;
		for (let j = 0; j < elems.length; j++)
		{
			r.push(parseFloat(elems[j].value));
		}

		LiteGUI.trigger(element, "wbeforechange", [r]);

		that.values[name] = r;

		const dragger = e.target.dragger;
		if (options.callback && dragger.dragging)
		{
			const new_val = options.callback.call(element, r);
			if (typeof(new_val) == "object" && new_val.length >= 4)
			{
				for (let j = 0; j < elems.length; j++)
				{
					elems[j].value = new_val[j];
				}
				r = new_val;
			}
		}
		else if ((options.callback || options.finalCallback) && !dragger.dragging)
		{
			let new_val = undefined;
			if (options.finalCallback)
			{
				new_val = options.finalCallback.call(element, r);
			}
			else if (options.callback)
			{
				new_val = options.callback.call(element, r);
			}

			if (typeof(new_val) == "object" && new_val.length >= 4)
			{
				for (let j = 0; j < elems.length; j++)
				{
					elems[j].value = new_val[j];
				}
				r = new_val;
			}
		}

		LiteGUI.trigger(element, "wchange",[r]);
		if (that.onchange) {that.onchange(name,r,element);}
	};
	const onStopDragging = function(input, e)
	{
		LiteGUI.trigger(input, "change");
	};
	for (let i = 0; i < inputs.length; ++i)
	{
		const dragger = draggers[i];
		const input = inputs[i];
		input.dragger = dragger;
		input.addEventListener("change" , onChangeCallback);
		dragger.root.addEventListener("stop_dragging", onStopDragging.bind(undefined, input));
	}

	this.append(element,options);

	element.setValue = function(v, skip_event)
	{
		if (!v) {return;}
		for (let i = 0; i < draggers.length; i++)
		{
			draggers[i].setValue(v[i],skip_event || i < draggers.length - 1);
		}
	};
	element.setRange = function(min,max) { for (const i in draggers) { draggers[i].setRange(min,max); } };

	this.processElement(element, options);
	return element;
};

/**
 * Widget to edit two numbers using a rectangular pad where you can drag horizontaly and verticaly a handler
 * @method addPad
 * @param {string} name
 * @param {vec2} value
 * @param {Object} options, here is a list for this widget (check createWidget for a list of generic options):
 * - callback: function to call once the value changes
 * - disabled: shows the widget disabled
 * - callback: function to call when the string is edited
 * - precision: number of digits after the colon
 * - units: string to show after the number
 * - min: minimum value accepted
 * - minx: minimum x value accepted
 * - miny: minimum y value accepted
 * - max: maximum value accepted
 * - maxx: maximum x value accepted
 * - maxy: maximum y value accepted
 * - step: increments when draggin the mouse (default is 0.1)
 * - background: url of image to use as background (it will be streched)
 * @return {HTMLElement} the widget in the form of the DOM element that contains it
 *
 */
Inspector.prototype.addPad = function(name,value, options)
{
	options = this.processOptions(options);
	if (!options.step)
	{options.step = 0.1;}

	value = value || [0,0];
	const that = this;
	this.values[name] = value;

	const element = this.createWidget(name,"", options);

	options.step = options.step ||0.1;
	// Options.dragger_class = "medium";
	options.tab_index = this.tab_index;
	options.full = true;
	this.tab_index++;

	const minx = options.minx || options.min || 0;
	const miny = options.miny || options.min || 0;
	const maxx = options.maxx || options.max || 1;
	const maxy = options.maxy || options.max || 1;

	const wcontent = element.querySelector(".wcontent");

	const pad = document.createElement("div");
	pad.className = "litepad";
	wcontent.appendChild(pad);
	pad.style.width = "100%";
	pad.style.height = "100px";
	if (options.background)
	{
		pad.style.backgroundImage = "url('" + options.background + "')";
		pad.style.backgroundSize = "100%";
		pad.style.backgroundRepeat = "no-repeat";
	}

	const handler = document.createElement("div");
	handler.className = "litepad-handler";
	pad.appendChild(handler);

	options.tab_index = this.tab_index;
	this.tab_index++;

	let dragging = false;

	pad._onMouseEvent = function(e)
	{
		const b = pad.getBoundingClientRect();
		e.mousex = e.pageX - b.left;
		e.mousey = e.pageY - b.top;
		e.preventDefault();
		e.stopPropagation();

		if (e.type == "mousedown")
		{
			document.body.addEventListener("mousemove", pad._onMouseEvent);
			document.body.addEventListener("mouseup", pad._onMouseEvent);
			dragging = true;
		}
		else if (e.type == "mousemove")
		{
			let x = e.mousex / (b.width);
			let y = e.mousey / (b.height);

			x = x * (maxx - minx) + minx;
			y = y * (maxy - miny) + minx;

			const r = [x,y];

			LiteGUI.trigger(element, "wbeforechange", [r]);

			element.setValue(r);

			if (options.callback)
			{
				const new_val = options.callback.call(element, r);
				if (new_val && new_val.length >= 2)
				{
					for (let i = 0; i < elems.length; i++)
					{element.setValue(new_val);}
				}
			}

			LiteGUI.trigger(element, "wchange",[r]);
			if (that.onchange)
			{that.onchange(name,r,element);}
		}
		else if (e.type == "mouseup")
		{
			dragging = false;
			document.body.removeEventListener("mousemove", pad._onMouseEvent);
			document.body.removeEventListener("mouseup", pad._onMouseEvent);
		}

		return true;
	};

	pad.addEventListener("mousedown", pad._onMouseEvent);

	element.setValue = function(v,skip_event)
	{
		if (v === undefined)
		{return;}

		const b = pad.getBoundingClientRect();
		let x = (v[0] - minx) / (maxx - minx);
		let y = (v[1] - miny) / (maxy - miny);
		x = Math.max(0, Math.min(x, 1)); // Clamp
		y = Math.max(0, Math.min(y, 1));

		/*
		 * Handler.style.left = (x * (b.width - 10)) + "px";
		 * handler.style.top = (y * (b.height - 10)) + "px";
		 */
		const w = ((b.width - 10) / b.width) * 100;
		const h = ((b.height - 10) / b.height) * 100;
		handler.style.left = (x * w).toFixed(1) + "%";
		handler.style.top = (y * h).toFixed(1) + "%";

		/*
		 * If(!skip_event)
		 * 	LiteGUI.trigger(this,"change");
		 */
	};

	this.append(element,options);

	element.setValue(value);

	this.processElement(element, options);
	return element;
};

/**
 * Widget to show plain information in HTML (not interactive)
 * @method addInfo
 * @param {string} name
 * @param {string} value HTML code
 * @param {Object} options, here is a list for this widget (check createWidget for a list of generic options):
 * - className: to specify a classname of the content
 * - height: to specify a height
 * @return {HTMLElement} the widget in the form of the DOM element that contains it
 *
 */
Inspector.prototype.addInfo = function(name, value, options)
{
	options = this.processOptions(options);

	value = (value === undefined || value === null) ? "" : value;
	let element = null;
	if (name != null)
	{element = this.createWidget(name, value, options);}
	else
	{
		element = document.createElement("div");
		if (options.className)
		{element.className = options.className;}
		if (value.nodeName !== undefined)
		{
			element.innerHTML = "<span class='winfo'></span>";
			element.childNodes[0].appendChild(value);
		}
		else
		{element.innerHTML = "<span class='winfo'>"+value+"</span>";}
	}

	const info = element.querySelector(".winfo") || element.querySelector(".wcontent");

	if (options.callback) {element.addEventListener("click",options.callback.bind(element));}

	element.setValue = function(v)
	{
		if (v === undefined) {return;}
		if (info) {info.innerHTML = v;}
	};

	let content = element.querySelector("span.info_content");
	if (!content)
	{content = element.querySelector(".winfo");}

	if (options.width)
	{
		element.style.width = LiteGUI.sizeToCSS(options.width);
		element.style.display = "inline-block";
		if (!name)
		{info.style.margin = "2px";}
	}
	if (options.height)
	{
		content.style.height = LiteGUI.sizeToCSS(options.height);
		content.style.overflow = "auto";
	}

	element.scrollToBottom = function()
	{
		content.scrollTop = content.offsetTop;
	};

	element.add = function(e)
	{
		content.appendChild(e);
	};

	this.append(element,options);
	this.processElement(element, options);
	return element;
};

/**
 * Widget to edit a number using a slider
 * @method addSlider
 * @param {string} name
 * @param {number} value
 * @param {Object} options, here is a list for this widget (check createWidget for a list of generic options):
 * - min: min value
 * - max: max value
 * - step: increments when dragging
 * - callback: function to call once the value changes
 * @return {HTMLElement} the widget in the form of the DOM element that contains it
 *
 */
Inspector.prototype.addSlider = function(name, value, options)
{
	options = this.processOptions(options);

	if (options.min === undefined)
	{options.min = 0;}

	if (options.max === undefined)
	{options.max = 1;}

	if (options.step === undefined)
	{options.step = 0.01;}

	const that = this;
	if (value === undefined || value === null)
	{value = 0;}
	this.values[name] = value;

	const element = this.createWidget(name,"<span class='inputfield full'>\n<input tabIndex='"+this.tab_index+"' type='text' class='slider-text fixed liteslider-value' value='' /><span class='slider-container'></span></span>", options);

	const slider_container = element.querySelector(".slider-container");

	const slider = new LiteGUI.Slider(value,options);
	slider_container.appendChild(slider.root);

	// Text change -> update slider
	const skip_change = false; // Used to avoid recursive loops
	const text_input = element.querySelector(".slider-text");
	text_input.value = value;
	text_input.addEventListener('change', (e) =>
	{
		if (skip_change) {return;}
		const v = parseFloat(text_input.value);
		value = v;
		slider.setValue(v);
		Inspector.onWidgetChange.call(that,element,name,v, options);
	});

	// Slider change -> update Text
	slider.onChange = function(value)
	{
		text_input.value = value;
		Inspector.onWidgetChange.call(that, element, name, value, options);
	};

	this.append(element,options);

	element.setValue = function(v,skip_event)
	{
		if (v === undefined)
		{return;}
		value = v;
		slider.setValue(v,skip_event);
	};
	element.getValue = function()
	{
		return value;
	};

	this.processElement(element, options);
	return element;
};

/**
 * Widget to edit a boolean value using a checkbox
 * @method addCheckbox
 * @param {string} name
 * @param {boolean} value
 * @param {Object} options, here is a list for this widget (check createWidget for a list of generic options):
 * - label: text to show, otherwise it shows on/off
 * - label_on: text to show when on
 * - label_off: text to show when off
 * - callback: function to call once the value changes
 * @return {HTMLElement} the widget in the form of the DOM element that contains it
 *
 */
Inspector.prototype.addCheckbox = function(name, value, options)
{
	options = this.processOptions(options);
	value = Boolean(value);
	const that = this;
	this.values[name] = value;

	const label_on = options.label_on || options.label || "on";
	const label_off = options.label_off || options.label || "off";
	const label = (value ? label_on : label_off);

	// Var element = this.createWidget(name,"<span class='inputfield'><span class='fixed flag'>"+(value ? "on" : "off")+"</span><span tabIndex='"+this.tab_index+"'class='checkbox "+(value?"on":"")+"'></span></span>", options );
	const element = this.createWidget(name,"<span class='inputfield'><span tabIndex='"+this.tab_index+"' class='fixed flag checkbox "+(value ? "on" : "off")+"'>"+label+"</span></span>", options);
	this.tab_index++;

	const checkbox = element.querySelector(".wcontent .checkbox");
	checkbox.addEventListener("keypress", (e) =>
	{
		if (e.keyCode == 32) { LiteGUI.trigger(checkbox, "click"); }
	});

	element.addEventListener("click", () =>
	{
		value = !value;
		element.querySelector("span.flag").innerHTML = value ? label_on : label_off;
		if (value)
		{
			checkbox.classList.add("on");
		}
		else
		{
			checkbox.classList.remove("on");
		}
		Inspector.onWidgetChange.call(that,element,name,value, options);
	});

	element.getValue = function()
	{
		return value;
	};

	element.setValue = function(v,skip_event)
	{
		if (v === undefined)
		{return;}
		value = v;
		if (that.values[name] != v && !skip_event)
		{LiteGUI.trigger(checkbox, "click");}
	};

	this.append(element,options);
	this.processElement(element, options);
	return element;
};

/**
 * Widget to edit a set of boolean values using checkboxes
 * @method addFlags
 * @param {Object} value object that contains all the booleans
 * @param {Object} optional object with extra flags to insert
 * @return {HTMLElement} the widget in the form of the DOM element that contains it
 *
 */
Inspector.prototype.addFlags = function(flags, force_flags, options)
{
	const f = {};
	for (const i in flags)
	{f[i] = flags[i];}
	if (force_flags)
	{
		for (const i in force_flags)
		{
			if (typeof(f[i]) == "undefined")
			{f[i] = (force_flags[i] ? true : false);}
		}
	}

	for (const i in f)
	{
		const flag_options = {};
		for (const j in options)
		{flag_options[j] = options[j];}

		flag_options.callback = (function(j)
		{
			return function(v)
			{
				flags[j] = v;
			};
		}(i));

		this.addCheckbox(i, f[i], flag_options);
	}
};

/**
 * Widget to edit an enumeration using a combobox
 * @method addCombo
 * @param {string} name
 * @param {*} value
 * @param {Object} options, here is a list for this widget (check createWidget for a list of generic options):
 * - values: a list with all the possible values, it could be an array, or an object, in case of an object, the key is the string to show, the value is the value to assign
 * - disabled: true to disable
 * - callback: function to call once an items is clicked
 * @return {HTMLElement} the widget in the form of the DOM element that contains it
 *
 */
Inspector.prototype.addCombo = function(name, value, options)
{
	options = this.processOptions(options);

	// Value = value || "";
	const that = this;
	this.values[name] = value;

	this.tab_index++;

	const element = this.createWidget(name,"<span class='inputfield full inputcombo "+(options.disabled?"disabled":"")+"'></span>", options);
	element.options = options;

	let values = options.values || [];
	if (values.constructor === Function)
	{values = options.values();}

	/*
	 *If(!values)
	 *	values = [];
	 *
	 *const index = 0;
	 *for(const i in values)
	 *{
	 *	const item_value = values[i];
	 *	const item_index = values.constructor === Array ? index : i;
	 *	const item_title = values.constructor === Array ? item_value : i;
	 *	if(item_value && item_value.title)
	 *		item_title = item_value.title;
	 *	code += "<option value='"+item_index+"' "+( item_value == value ? " selected":"")+" data-index='"+item_index+"'>" + item_title + "</option>";
	 *	index++;
	 *}
	 */

	const code = "<select tabIndex='"+this.tab_index+"' "+(options.disabled?"disabled":"")+" class='"+(options.disabled?"disabled":"")+"'></select>";
	element.querySelector("span.inputcombo").innerHTML = code;
	setValues(values);

	let stop_event = false; // Used internally

	const select = element.querySelector(".wcontent select");
	select.addEventListener("change", (e) =>
	{
		const index = e.target.value;
		value = values[index];
		if (stop_event) {return;}
		Inspector.onWidgetChange.call(that,element,name,value, options);
	});

	element.getValue = function()
	{
		return value;
	};

	element.setValue = function(v, skip_event)
	{
		if (v === undefined)
		{return;}
		value = v;
		const select = element.querySelector("select");
		const items = select.querySelectorAll("option");
		let index =  -1;
		if (values.constructor === Array)
		{index = values.indexOf(v);}
		else
		{
			// Search the element index in the values
			let j = 0;
			for (const i in values)
			{
				if (values[j] == v)
				{
					index = j;
					break;
				}
				else
				{j++;}
			}
		}

		if (index == -1)
		{return;}

		stop_event = skip_event;

		for (const i in items)
		{
			const item = items[i];
			if (!item || !item.dataset) // Weird bug
			{continue;}
			if (parseFloat(item.dataset["index"]) == index)
			{
				item.setAttribute("selected", true);
				select.selectedIndex = index;
			}
			else
			{item.removeAttribute("selected");}
		}

		stop_event = false;
	};

	function setValues(v, selected)
	{
		if (!v)
		{v = [];}
		values = v;
		if (selected)
		{value = selected;}
		let code = "";
		let index = 0;
		for (const i in values)
		{
			const item_value = values[i];
			const item_index = values.constructor === Array ? index : i;
			let item_title = values.constructor === Array ? item_value : i;
			if (item_value && item_value.title)
			{item_title = item_value.title;}
			code += "<option value='"+item_index+"' "+(item_value == value ? " selected":"")+" data-index='"+item_index+"'>" + item_title + "</option>";
			index++;
		}
		element.querySelector("select").innerHTML = code;
	}

	element.setOptionValues = setValues;

	this.append(element,options);
	this.processElement(element, options);
	return element;
};

Inspector.prototype.addComboButtons = function(name, value, options)
{
	options = this.processOptions(options);

	value = value || "";
	const that = this;
	this.values[name] = value;

	let code = "";
	if (options.values)
	{
		for (const i in options.values)
		{
			code += "<button class='wcombobutton "+(value == options.values[i] ? "selected":"")+"' data-name='options.values[i]'>" + options.values[i] + "</button>";
		}
	}

	const element = this.createWidget(name,code, options);
	const buttons = element.querySelectorAll(".wcontent button");
	LiteGUI.bind(buttons, "click", (e) =>
	{
		const el = e.target;
		const buttonname = e.target.innerHTML;
		that.values[name] = buttonname;

		const elements = element.querySelectorAll(".selected");
		for (let i = 0; i < elements.length; ++i)
		{
			elements[i].classList.remove("selected");
		}
		el.classList.add("selected");

		Inspector.onWidgetChange.call(that,element,name,buttonname, options);
	});

	this.append(element,options);
	this.processElement(element, options);
	return element;
};

Inspector.prototype.addTags = function(name, value, options)
{
	options = this.processOptions(options);

	value = value || [];
	const that = this;
	this.values[name] = value;

	let code = "<select>";
	if (options.values)
	{
		for (const i in options.values)
		{code += "<option>" + options.values[i] + "</option>";}
	}

	code += "</select><div class='wtagscontainer inputfield'></div>";

	const element = this.createWidget(name,"<span class='inputfield full'>"+code+"</span>", options);
	element.tags = {};

	// Add default tags
	for (const i in options.value)
	{inner_addtag(options.value[i]);}

	// Combo change
	const select_element = element.querySelector(".wcontent select");
	select_element.addEventListener("change", (e) =>
	{
		inner_addtag(e.target.value);
	});

	function inner_addtag(tagname)
	{
		if (element.tags[tagname])
		{return;} // Repeated tags no

		LiteGUI.trigger(element, "wbeforechange", element.tags);

		element.tags[tagname] = true;

		const tag = document.createElement("div");
		tag.data = tagname;
		tag.className = "wtag";
		tag.innerHTML = tagname+"<span class='close'>X</span>";

		tag.querySelector(".close").addEventListener("click", (e) =>
		{
			const tagname = tag.data;
			delete element.tags[tagname];
			LiteGUI.remove(tag);
			LiteGUI.trigger(element, "wremoved", tagname);
			Inspector.onWidgetChange.call(that,element,name,element.tags, options);
		});

		element.querySelector(".wtagscontainer").appendChild(tag);

		that.values[name] = element.tags;
		if (options.callback)
		{options.callback.call(element, element.tags);}
		LiteGUI.trigger(element, "wchange", element.tags);
		LiteGUI.trigger(element, "wadded", tagname);
		if (that.onchange)
		{that.onchange(name, element.tags, element);}
	}

	this.append(element,options);
	this.processElement(element, options);
	return element;
};

/**
 * Widget to select from a list of items
 * @method addList
 * @param {string} name
 * @param {*} value [Array or Object]
 * @param {Object} options, here is a list for this widget (check createWidget for a list of generic options):
 * - multiselection: allow multiple selection
 * - callback: function to call once an items is clicked
 * - selected: the item selected
 * @return {HTMLElement} the widget in the form of the DOM element that contains it
 *
 */
Inspector.prototype.addList = function(name, values, options)
{
	options = this.processOptions(options);

	const that = this;

	let list_height = "";
	if (options.height) {list_height = "style='height: 100%; overflow: auto;'";}
	// Height = "style='height: "+options.height+"px; overflow: auto;'";

	const code = "<ul class='lite-list' "+list_height+" tabIndex='"+this.tab_index+"'><ul>";
	this.tab_index++;

	const element = this.createWidget(name,"<span class='inputfield full "+(options.disabled?"disabled":"")+"' style='height: 100%;'>"+code+"</span>", options);

	const infocontent = element.querySelector(".info_content");
	infocontent.style.height = "100%";

	const list_element = element.querySelector(".lite-list");
	const inputfield = element.querySelector(".inputfield");
	inputfield.style.height = "100%";
	inputfield.style.paddingBottom = "0.2em";

	const ul_elements = element.querySelectorAll("ul");

	const inner_key = function(e)
	{
		const selected = element.querySelector("li.selected");
		if (!selected)
		{return;}

		if (e.keyCode == 13) // Intro
		{
			if (!selected)
			{return;}
			const value = values[ selected.dataset["pos"] ];
			if (options.callback_dblclick)
			{options.callback_dblclick.call(that,value);}
		}
		else if (e.keyCode == 40) // Arrow down
		{
			const next = selected.nextSibling;
			if (next)
			{LiteGUI.trigger(next, "click");}
			if (selected.scrollIntoViewIfNeeded)
			{selected.scrollIntoViewIfNeeded({block: "end", behavior: "smooth"});}
		}
		else if (e.keyCode == 38) // Arrow up
		{
			const prev = selected.previousSibling;
			if (prev)
			{LiteGUI.trigger(prev,"click");}
			if (selected.scrollIntoViewIfNeeded)
			{selected.scrollIntoViewIfNeeded({block: "end", behavior: "smooth"});}
		}
		else
		{return;}

		e.preventDefault();
		e.stopPropagation();
		return true;
	};
	const inner_item_click = function(e)
	{
		const el = e.target;
		if (options.multiselection)
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

		const value = values[ el.dataset["pos"] ];
		// If(options.callback) options.callback.call(element,value); //done in onWidgetChange
		Inspector.onWidgetChange.call(that,element,name,value, options);
		LiteGUI.trigger(element, "wadded", value);
	};
	const inner_item_dblclick = function(e)
	{
		const value = values[ e.target.dataset["pos"] ];
		if (options.callback_dblclick)
		{options.callback_dblclick.call(that,value);}
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


	element.updateItems = function(new_values, item_selected)
	{
		item_selected = item_selected || options.selected;
		values = new_values;
		const ul = this.querySelector("ul");
		ul.innerHTML = "";

		if (values)
		{
			for (const i in values)
			{
				const	value = values[i];
				const li_element = insert_item(value, item_selected, i);
				ul.appendChild(li_element);
			}
		}

		const li = ul.querySelectorAll("li");
		LiteGUI.bind(li, "click", inner_item_click);
	};

	function insert_item(value, selected, index)
	{
		const item_index = index; // To reference it
		let item_title = index; // To show in the list
		selected = Boolean(selected);

		let item_style = null;
		let icon = "";
		if (value != null)
		{
			if (value.constructor === String || value.constructor === Number || value.constructor === Boolean)
			{
				item_title = String(value);
			}
			else if (value)
			{
				item_title = value.content || value.title || value.name || index;
				item_style = value.style;
				if (value.icon)
				{icon = "<img src='"+value.icon+"' class='icon' /> ";}
				if (value.selected)
				{selected = true;}
			}
		}

		let item_name = item_title;
		item_name = item_name.replace(/<(?:.|\n)*?>/gm, ''); // Remove html tags that could break the html

		const li_element = document.createElement("li");
		li_element.classList.add('item-' + LiteGUI.safeName(item_index));
		if (selected)
		{li_element.classList.add('selected');}
		li_element.dataset["name"] = item_name;
		li_element.dataset["pos"] = item_index;
		li_element.value = value;
		if (item_style)
		{li_element.setAttribute("style", item_style);}
		li_element.innerHTML = icon + item_title;
		li_element.addEventListener("click", inner_item_click);
		if (options.callback_dblclick)
		{
			li_element.addEventListener("dblclick", inner_item_dblclick);
		}
		return li_element;
	}

	element.addItem = function(value, selected, name)
	{
		if (values.constructor !== Array)
		{
			console.error("cannot add item to list of object, only array");
			return;
		}
		values.push(value);
		const ul = this.querySelector("ul");
		const li_element = insert_item(value, selected);
		ul.appendChild(li_element);
	};

	element.removeItem = function(name)
	{
		const items = element.querySelectorAll(".wcontent li");
		for (let i = 0; i < items.length; i++)
		{
			if (items[i].dataset["name"] == name)
			{LiteGUI.remove(items[i]);}
		}
	};

	element.updateItems(values, options.selected);
	this.append(element,options);

	element.getSelected = function()
	{
		const r = [];
		const selected = this.querySelectorAll("ul li.selected");
		for (let i = 0; i < selected.length; ++i)
		{r.push(selected[i].dataset["name"]);}
		return r;
	};

	element.getByIndex = function(num)
	{
		const items = this.querySelectorAll("ul li");
		return items[num];
	};
	element.getIndex = element.getByIndex; // Legacy

	element.selectIndex = function(num, add_to_selection)
	{
		const items = this.querySelectorAll("ul li");
		for (let i = 0; i < items.length; ++i)
		{
			const item = items[i];
			if (i == num)
			{item.classList.add("selected");}
			else if (!add_to_selection)
			{item.classList.remove("selected");}
		}
		return items[num];
	};

	element.deselectIndex = function(num)
	{
		const items = this.querySelectorAll("ul li");
		const item = items[num];
		if (item)
		{item.classList.remove("selected");}
		return item;
	};

	element.scrollToIndex = function(num)
	{
		const items = this.querySelectorAll("ul li");
		const item = items[num];
		if (!item)
		{return;}
		this.scrollTop = item.offsetTop;
	};

	element.selectAll = function()
	{
		const items = this.querySelectorAll("ul li");
		for (let i = 0; i < items.length; ++i)
		{
			const item = items[i];
			if (item.classList.contains("selected"))
			{continue;}
			LiteGUI.trigger(item, "click");
		}
	};

	element.deselectAll = function()
	{
		// There has to be a more efficient way to do this
		const items = this.querySelectorAll("ul li");
		for (let i = 0; i < items.length; ++i)
		{
			const item = items[i];
			if (!item.classList.contains("selected"))
			{continue;}
			LiteGUI.trigger(item, "click");
		}
	};

	element.setValue = function(v)
	{
		if (v === undefined)
		{return;}
		this.updateItems(v);
	};

	element.getNumberOfItems = function()
	{
		const items = this.querySelectorAll("ul li");
		return items.length;
	};

	element.filter = function(callback, case_sensitive)
	{
		const items = this.querySelectorAll("ul li");
		let use_string = false;

		if (callback && callback.constructor === String)
		{
			const needle = callback;
			if (case_sensitive)
			{needle.toLowerCase();}
			use_string = true;
			callback = function(v){ return ((case_sensitive ? v : v.toLowerCase()).indexOf(needle) != -1); };
		}

		for (let i = 0; i < items.length; ++i)
		{
			const item = items[i];
			if (!callback)
			{
				item.style.display = "";
				continue;
			}

			let value = item.value;
			if (use_string && value != null && value.constructor !== String)
			{value = item.innerHTML;}

			if (!callback(value, item, item.classList.contains("selected")))
			{item.style.display = "none";}
			else
			{item.style.display = "";}
		}
	};

	element.selectByFilter = function(callback)
	{
		const items = this.querySelectorAll("ul li");
		for (let i = 0; i < items.length; ++i)
		{
			const item = items[i];
			const r = callback(item.value, item, item.classList.contains("selected"));
			if (r === true)
			{item.classList.add("selected");}
			else if (r === false)
			{item.classList.remove("selected");}
		}
	};

	if (options.height) {element.scrollTop = 0;}
	this.processElement(element, options);
	return element;
};

Inspector.prototype.addButton = function(name, value, options)
{
	options = this.processOptions(options);

	value = options.button_text || value || "";
	const that = this;

	let button_classname = "";
	if (name === null)
	{button_classname = "single";}
	if (options.micro)
	{button_classname += " micro";}

	let attrs = "";
	if (options.disabled)
	{attrs = "disabled='disabled'";}

	const title = options.title || "";

	const element = this.createWidget(name,"<button tabIndex='"+ this.tab_index + "' "+attrs+"></button>", options);
	this.tab_index++;
	const button = element.querySelector("button");
	button.setAttribute("title",title);
	button.className = "litebutton " + button_classname;
	button.innerHTML = value;
	button.addEventListener("click", (event) =>
	{
		Inspector.onWidgetChange.call(that, element, name, button.innerHTML, options, false, event);
		LiteGUI.trigger(button, "wclick", value);
	});
	this.append(element,options);

	element.wclick = function(callback)
	{
		if (!options.disabled)
		{LiteGUI.bind(this, "wclick", callback);}
	};

	element.setValue = function(v)
	{
		if (v === undefined)
		{return;}
		button.innerHTML = v;
	};

	element.disable = function() { button.disabled = true; };
	element.enable = function() { button.disabled = false; };

	this.processElement(element, options);
	return element;
};

Inspector.prototype.addButtons = function(name, value, options)
{
	options = this.processOptions(options);

	value = value || "";
	const that = this;

	let code = "";
	// Var w = "calc("+(100/value.length).toFixed(3)+"% - "+Math.floor(16/value.length)+"px);";
	const w = "calc( " + (100/value.length).toFixed(3) + "% - 4px )";
	const style = "width:"+w+"; width: -moz-"+w+"; width: -webkit-"+w+"; margin: 2px;";
	if (value && typeof(value) == "object")
	{
		for (const i in value)
		{
			let title = "";
			if (options.title && options.title.constructor === Array)
			{title = options.title[i] || "";}
			code += "<button class='litebutton' title='"+title+"' tabIndex='"+this.tab_index+"' style='"+style+"'>"+value[i]+"</button>";
			this.tab_index++;
		}
	}
	const element = this.createWidget(name,code, options);
	const buttons = element.querySelectorAll("button");
	const buttonCallback = (button, evt) =>
	{
		Inspector.onWidgetChange.call(that, element, name, button.innerHTML, options, null, evt);
		LiteGUI.trigger(element, "wclick",button.innerHTML);
	};
	for (let i = 0; i < buttons.length; ++i)
	{
		const button = buttons[i];
		button.addEventListener("click", buttonCallback.bind(undefined,button));
	}

	this.append(element,options);
	this.processElement(element, options);
	return element;
};

Inspector.prototype.addIcon = function(name, value, options)
{
	options = this.processOptions(options);

	value = value || "";
	const that = this;

	const img_url = options.image;
	const width = options.width || options.size || 20;
	const height = options.height || options.size || 20;

	const element = this.createWidget(name,"<span class='icon' "+(options.title ? "title='"+options.title+"'" : "")+" tabIndex='"+ this.tab_index + "'></span>", options);
	this.tab_index++;
	const content = element.querySelector("span.wcontent");
	const icon = element.querySelector("span.icon");

	let x = options.x || 0;
	if (options.index)
	{x = options.index * -width;}
	const y = value ? height : 0;

	element.style.minWidth = element.style.width = (width) + "px";
	element.style.margin = "0 2px"; element.style.padding = "0";
	content.style.margin = "0"; content.style.padding = "0";

	icon.style.display = "inline-block";
	icon.style.cursor = "pointer";
	icon.style.width = width + "px";
	icon.style.height = height + "px";
	icon.style.backgroundImage = "url('"+img_url+"')";
	icon.style.backgroundPosition = x + "px " + y + "px";

	icon.addEventListener("mousedown", (e) =>
	{
		e.preventDefault();
		value = !value;
		const ret = Inspector.onWidgetChange.call(that,element,name, value, options);
		LiteGUI.trigger(element, "wclick", value);

		if (ret !== undefined)
		{value = ret;}

		const y = value ? height : 0;
		icon.style.backgroundPosition = x + "px " + y + "px";

		if (options.toggle === false) // Blink
		{setTimeout(()=> { icon.style.backgroundPosition = x + "px 0px"; value = false; },200);}

	});
	this.append(element,options);

	element.setValue = function(v, skip_event)
	{
		if (v === undefined)
		{return;}
		value = v;
		const y = value ? height : 0;
		icon.style.backgroundPosition = x + "px " + y + "px";
		if (!skip_event)
		{Inspector.onWidgetChange.call(that,element,name, value, options);}
	};
	element.getValue = function() { return value; };
	this.processElement(element, options);
	return element;
};

Inspector.prototype.addColor = function(name, value, options)
{
	options = this.processOptions(options);

	value = value || [0.0,0.0,0.0];
	const that = this;
	this.values[name] = value;

	let code = "<input tabIndex='"+this.tab_index+"' id='colorpicker-"+name+"' class='color' value='"+(value[0]+","+value[1]+","+value[2])+"' "+(options.disabled?"disabled":"")+"/>";
	this.tab_index++;

	if (options.show_rgb)
	{code += "<span class='rgb-color'>"+Inspector.parseColor(value)+"</span>";}
	const element = this.createWidget(name,code, options);
	this.append(element,options); // Add now or jscolor dont work

	// Create jsColor
	const input_element = element.querySelector("input.color");
	let myColor = null;

	if (window.jscolor)
	{

		/*
		 * SHOWS CONTEXTUAL MENU
		 * block focusing
		 */
		/*
		 *Input_element.addEventListener("contextmenu", function(e) {
		 *	if(e.button != 2) //right button
		 *		return false;
		 *	//create the context menu
		 *	var contextmenu = new LiteGUI.ContextMenu( ["Copy in HEX","Copy in RGBA"], { event: e, callback: inner_action });
		 *	e.preventDefault();
		 *	e.stopPropagation();
		 *
		 *	input_element.addEventListener("focus", block_focus , true);
		 *	setTimeout(function(){ input_element.removeEventListener("focus", block_focus , true);},1000);
		 *
		 *	return false;
		 *},true);
		 *
		 *function block_focus(e)
		 *{
		 *	e.stopPropagation();
		 *	e.stopImmediatePropagation();
		 *	e.preventDefault();
		 *	return false;
		 *}
		 *
		 *function inner_action(v)
		 *{
		 *	if(v == "Copy in HEX")
		 *	{
		 *		LiteGUI.toClipboard( "in HEX");
		 *	}
		 *	else
		 *	{
		 *		LiteGUI.toClipboard( "in RGB");
		 *	}
		 *}
		 */

		myColor = new jscolor.color(input_element);
		myColor.pickerFaceColor = "#333";
		myColor.pickerBorderColor = "black";
		myColor.pickerInsetColor = "#222";
		myColor.rgb_intensity = 1.0;

		if (options.disabled)
		{myColor.pickerOnfocus = false;} // This doesnt work

		if (value.constructor !== String && value.length && value.length > 2)
		{
			const intensity = 1.0;
			myColor.fromRGB(value[0]*intensity,value[1]*intensity,value[2]*intensity);
			myColor.rgb_intensity = intensity;
		}

		// Update values in rgb format
		input_element.addEventListener("change", (e) =>
		{
			const rgbelement = element.querySelector(".rgb-color");
			if (rgbelement)
			{rgbelement.innerHTML = LiteGUI.Inspector.parseColor(myColor.rgb);}
		});
		input_element.addEventListener("focusin", (e) =>
		{
			input_element.focused = true;
		});
		input_element.addEventListener("focusout", (e) =>
		{
			input_element.focused = false;
			const v = [ myColor.rgb[0] * myColor.rgb_intensity, myColor.rgb[1] * myColor.rgb_intensity, myColor.rgb[2] * myColor.rgb_intensity ];
			if (options.finalCallback)
			{
				options.finalCallback.call(element, v.concat(), "#" + myColor.toString(), myColor);
			}
			else if (options.callback)
			{
				options.callback.call(element, v.concat(), "#" + myColor.toString(), myColor);
			}
		});

		if (options.add_dragger)
		{
			myColor.onImmediateChange = function(dragging)
			{
				const v = [ myColor.rgb[0] * myColor.rgb_intensity, myColor.rgb[1] * myColor.rgb_intensity, myColor.rgb[2] * myColor.rgb_intensity ];
				// Inspector.onWidgetChange.call(that,element,name,v, options);
				const event_data = [v.concat(), myColor.toString()];
				LiteGUI.trigger(element, "wbeforechange", event_data);
				that.values[name] = v;
				if (options.callback && dragging)
				{
					options.callback.call(element, v.concat(), "#" + myColor.toString(), myColor);
				}
				else if ((options.callback || options.finalCallback) && !dragging)
				{
					if (options.finalCallback)
					{
						options.finalCallback.call(element, v.concat(), "#" + myColor.toString(), myColor);
					}
					else if (options.callback)
					{
						options.callback.call(element, v.concat(), "#" + myColor.toString(), myColor);
					}
				}
				LiteGUI.trigger(element, "wchange", event_data);
				if (that.onchange) {that.onchange(name, v.concat(), element);}
			};

			// Alpha dragger
			options.step = options.step || 0.01;
			options.dragger_class = "nano";

			const dragger = new LiteGUI.Dragger(1, options);
			element.querySelector('.wcontent').appendChild(dragger.root);
			const callOnInmediateChange = function(dragging)
			{
				if (myColor.onImmediateChange)
				{myColor.onImmediateChange(dragging);}
			};
			const callOnStopDragging = function()
			{
				if (!input_element.focused)
				{
					callOnInmediateChange(false);
				}
			};
			dragger.root.addEventListener("stop_dragging", callOnStopDragging);
			dragger.input.addEventListener("change", (e) =>
			{
				const v = parseFloat(dragger.input.value);
				myColor.rgb_intensity = v;
				callOnInmediateChange(dragger.dragging);
			});

			element.setValue = function(value,skip_event)
			{
				myColor.fromRGB(value[0],value[1],value[2]);
				if (!skip_event)
				{LiteGUI.trigger(dragger.input, "change");}
			};
		}
		else
		{
			myColor.onImmediateChange = function()
			{
				const v = [ myColor.rgb[0] * myColor.rgb_intensity, myColor.rgb[1] * myColor.rgb_intensity, myColor.rgb[2] * myColor.rgb_intensity ];
				// Inspector.onWidgetChange.call(that,element,name,v, options);
				const event_data = [v.concat(), myColor.toString()];
				LiteGUI.trigger(element, "wbeforechange", event_data);
				that.values[name] = v;
				if (options.callback)
				{options.callback.call(element, v.concat(), "#" + myColor.toString(), myColor);}LiteGUI.trigger(element, "wchange", event_data);
				if (that.onchange) {that.onchange(name, v.concat(), element);}
			};
			element.setValue = function(value)
			{
				myColor.fromRGB(value[0],value[1],value[2]);
			};
		}

		element.getValue = function()
		{
			return value;
		};
	}
	else
	{
		input_element.addEventListener("change", (e) =>
		{
			const rgbelement = element.querySelector(".rgb-color");
			if (rgbelement) {rgbelement.innerHTML = LiteGUI.Inspector.parseColor(myColor.rgb);}
		});
	}

	this.processElement(element, options);
	return element;
};

Inspector.prototype.addColorPosition = function(name, value, options)
{
	options = this.processOptions(options);

	value = value || [0.0,0.0,0.0];
	const that = this;
	this.values[name] = value;

	let code = "<input tabIndex='"+this.tab_index+"' id='colorpicker-"+name+"' class='color' value='"+(value[0]+","+value[1]+","+value[2])+"' "+(options.disabled?"disabled":"")+"/>";
	this.tab_index++;

	if (options.show_rgb)
	{code += "<span class='rgb-color'>"+Inspector.parseColor(value)+"</span>";}
	const element = this.createWidget(name,code, options);
	this.append(element,options); // Add now or jscolor dont work

	// Create jsColor
	const input_element = element.querySelector("input.color");
	let myColor = null;

	if (window.jscolor)
	{

		/*
		 * SHOWS CONTEXTUAL MENU
		 * block focusing
		 */
		/*
		 *Input_element.addEventListener("contextmenu", function(e) {
		 *	if(e.button != 2) //right button
		 *		return false;
		 *	//create the context menu
		 *	var contextmenu = new LiteGUI.ContextMenu( ["Copy in HEX","Copy in RGBA"], { event: e, callback: inner_action });
		 *	e.preventDefault();
		 *	e.stopPropagation();
		 *
		 *	input_element.addEventListener("focus", block_focus , true);
		 *	setTimeout(function(){ input_element.removeEventListener("focus", block_focus , true);},1000);
		 *
		 *	return false;
		 *},true);
		 *
		 *function block_focus(e)
		 *{
		 *	e.stopPropagation();
		 *	e.stopImmediatePropagation();
		 *	e.preventDefault();
		 *	return false;
		 *}
		 *
		 *function inner_action(v)
		 *{
		 *	if(v == "Copy in HEX")
		 *	{
		 *		LiteGUI.toClipboard( "in HEX");
		 *	}
		 *	else
		 *	{
		 *		LiteGUI.toClipboard( "in RGB");
		 *	}
		 *}
		 */

		myColor = new jscolor.color(input_element);
		myColor.pickerFaceColor = "#333";
		myColor.pickerBorderColor = "black";
		myColor.pickerInsetColor = "#222";
		myColor.position = options.position || 0;

		if (options.disabled)
		{myColor.pickerOnfocus = false;} // This doesnt work

		if (value.constructor !== String && value.length && value.length > 2)
		{
			myColor.fromRGB(value[0],value[1],value[2]);
		}

		// Update values in rgb format
		input_element.addEventListener("change", (e) =>
		{
			const rgbelement = element.querySelector(".rgb-color");
			if (rgbelement)
			{rgbelement.innerHTML = LiteGUI.Inspector.parseColor(myColor.rgb);}
		});
		input_element.addEventListener("focusin", (e) =>
		{
			input_element.focused = true;
		});
		input_element.addEventListener("focusout", (e) =>
		{
			input_element.focused = false;
			if (options.finalCallback)
			{
				options.finalCallback.call(element, myColor.position, "#" + myColor.toString(), myColor);
			}
			else if (options.callback)
			{
				options.callback.call(element, myColor.position, "#" + myColor.toString(), myColor);
			}
		});

		if (options.add_dragger)
		{
			myColor.onImmediateChange = function(dragging)
			{
				const v = [ myColor.rgb[0], myColor.rgb[1], myColor.rgb[2] ];
				// Inspector.onWidgetChange.call(that,element,name,v, options);
				const event_data = [v.concat(), myColor.toString()];
				LiteGUI.trigger(element, "wbeforechange", event_data);
				that.values[name] = v;
				if (options.callback && dragging)
				{
					options.callback.call(element, myColor.position, "#" + myColor.toString(), myColor);
				}
				else if ((options.callback || options.finalCallback) && !dragging)
				{
					if (options.finalCallback)
					{
						options.finalCallback.call(element, myColor.position, "#" + myColor.toString(), myColor);
					}
					else if (options.callback)
					{
						options.callback.call(element, myColor.position, "#" + myColor.toString(), myColor);
					}
				}
				LiteGUI.trigger(element, "wchange", event_data);
				if (that.onchange) {that.onchange(name, v.concat(), element);}
			};

			// Alpha dragger
			options.step = options.step || 0.01;
			options.dragger_class = "nano";

			const dragger = new LiteGUI.Dragger(myColor.position, options);
			element.querySelector('.wcontent').appendChild(dragger.root);
			const callOnInmediateChange = function(dragging)
			{
				if (myColor.onImmediateChange)
				{myColor.onImmediateChange(dragging);}
			};
			const callOnStopDragging = function()
			{
				if (!input_element.focused)
				{
					callOnInmediateChange(false);
				}
			};
			dragger.root.addEventListener("stop_dragging", callOnStopDragging);
			dragger.input.addEventListener("change", (e) =>
			{
				const v = parseFloat(dragger.input.value);
				myColor.position = v;
				callOnInmediateChange(dragger.dragging);
			});

			element.setValue = function(value,skip_event)
			{
				myColor.fromRGB(value[0],value[1],value[2]);
				if (!skip_event)
				{LiteGUI.trigger(dragger.input, "change");}
			};
		}
		else
		{
			myColor.onImmediateChange = function()
			{
				const v = [ myColor.rgb[0] * myColor.rgb_intensity, myColor.rgb[1] * myColor.rgb_intensity, myColor.rgb[2] * myColor.rgb_intensity ];
				// Inspector.onWidgetChange.call(that,element,name,v, options);
				const event_data = [v.concat(), myColor.toString()];
				LiteGUI.trigger(element, "wbeforechange", event_data);
				that.values[name] = v;
				if (options.callback)
				{options.callback.call(element, v.concat(), "#" + myColor.toString(), myColor);}LiteGUI.trigger(element, "wchange", event_data);
				if (that.onchange) {that.onchange(name, v.concat(), element);}
			};
			element.setValue = function(value)
			{
				myColor.fromRGB(value[0],value[1],value[2]);
			};
		}

		element.getValue = function()
		{
			return value;
		};
	}
	else
	{
		input_element.addEventListener("change", (e) =>
		{
			const rgbelement = element.querySelector(".rgb-color");
			if (rgbelement)
			{rgbelement.innerHTML = LiteGUI.Inspector.parseColor(myColor.rgb);}
		});
	}

	this.processElement(element, options);
	return element;
};

Inspector.prototype.addFile = function(name, value, options)
{
	options = this.processOptions(options);

	value = value || "";
	const that = this;
	this.values[name] = value;

	const element = this.createWidget(name,"<span class='inputfield full whidden' style='width: calc(100% - 26px)'><span class='filename'></span></span><button class='litebutton' style='width:20px; margin-left: 2px;'>...</button><input type='file' size='100' class='file' value='"+value+"'/>", options);
	const content = element.querySelector(".wcontent");
	content.style.position = "relative";
	const input = element.querySelector(".wcontent input");
	if (options.accept) {input.accept = options.accept;}
	const filename_element = element.querySelector(".wcontent .filename");
	if (value) {filename_element.innerText = value.name;}

	input.addEventListener("change", (e) =>
	{
		if (!e.target.files.length)
		{
			// Nothing
			filename_element.innerText = "";
			Inspector.onWidgetChange.call(that, element, name, null, options);
			return;
		}

		const url = null;
		// Var data = { url: url, filename: e.target.value, file: e.target.files[0], files: e.target.files };
		const file = e.target.files[0];
		file.files = e.target.files;
		if (options.generate_url)
		{file.url = URL.createObjectURL(e.target.files[0]);}
		filename_element.innerText = file.name;

		if (options.read_file)
		{
			 const reader = new FileReader();
			 reader.onload = function(e2)
			{
				file.data = e2.target.result;
				Inspector.onWidgetChange.call(that, element, name, file, options);
			 };
			 if (options.read_file == "binary")
				 {reader.readAsArrayBuffer(file);}
			 else if (options.read_file == "data_url")
				 {reader.readAsDataURL(file);}
			 else
				 {reader.readAsText(file);}
		}
		else
		{
			Inspector.onWidgetChange.call(that, element, name, file, options);
		}
	});

	this.append(element,options);
	return element;
};

Inspector.prototype.addLine = function(name, value, options)
{
	options = this.processOptions(options);

	value = value || "";
	const that = this;
	this.values[name] = value;

	const element = this.createWidget(name,"<span class='line-editor'></span>", options);
	element.style.width = "100%";

	const line_editor = new LiteGUI.LineEditor(value,options);
	element.querySelector("span.line-editor").appendChild(line_editor);

	LiteGUI.bind(line_editor, "change", (e) =>
	{
		LiteGUI.trigger(element, "wbeforechange",[e.target.value]);
		if (options.callback) {options.callback.call(element,e.target.value);}
		LiteGUI.trigger(element, "wchange",[e.target.value]);
		Inspector.onWidgetChange.call(that,element,name,e.target.value, options);
	});

	this.append(element,options);
	return element;
};

Inspector.prototype.addTree = function(name, value, options)
{
	options = this.processOptions(options);

	value = value || "";
	const element = this.createWidget(name,"<div class='wtree inputfield full'></div>", options);

	const tree_root = element.querySelector(".wtree");
	if (options.height)
	{
		tree_root.style.height = typeof(options.height) == "number" ? options.height + "px" : options.height;
		tree_root.style.overflow = "auto";
	}

	const current = value;

	const tree = element.tree = new LiteGUI.Tree(value, options.tree_options);
	tree.onItemSelected = function(node, data)
	{
		if (options.callback)
		{options.callback.call(element, node, data);}
	};

	tree_root.appendChild(tree.root);

	element.setValue = function(v)
	{
		tree.updateTree(v);
	};

	this.append(element,options);
	this.processElement(element, options);
	return element;
};

Inspector.prototype.addDataTree = function(name, value, options)
{
	options = this.processOptions(options);

	value = value || "";
	const element = this.createWidget(name,"<div class='wtree'></div>", options);

	const node = element.querySelector(".wtree");
	const current = value;

	inner_recursive(node,value);

	function inner_recursive(root_node, value)
	{
		for (const i in value)
		{
			const e = document.createElement("div");
			e.className = "treenode";
			if (typeof(value[i]) == "object")
			{
				e.innerHTML = "<span class='itemname'>" + i + "</span><span class='itemcontent'></span>";
				inner_recursive(e.querySelector(".itemcontent"), value[i]);
			}
			else
			{e.innerHTML = "<span class='itemname'>" + i + "</span><span class='itemvalue'>" + value[i] + "</span>";}
			root_node.appendChild(e);
		}
	}

	this.append(element,options);
	return element;
};

/**
 * Widget to edit an array of values of a certain type
 * @method addArray
 * @param {string} name
 * @param {Array} value
 * @param {Object} options, here is a list for this widget (check createWidget for a list of generic options):
 * - data_type: the type of every value inside the array
 * - data_options: options for the widgets of every item in the array
 * - max_items: max number of items to show from the array, default is 100
 * - callback: function to call once an items inside the array has changed
 * @return {HTMLElement} the widget in the form of the DOM element that contains it
 *
 */
Inspector.prototype.addArray = function(name, value, options)
{
	const that = this;

	if (!value || value.constructor !== Array)
	{
		console.error("Inspector: Array widget value must be a valid array");
		return;
	}

	options = this.processOptions(options);

	const type = options.data_type || "string";
	const max_items = options.max_items || 100;
	let container = null;

	// Length widget
	this.widgets_per_row = 3;
	this.addInfo(name,null,{ name_width: "100%", width: "100% - 160px"});
	const length_widget = this.addString("length", value.length || "0", { width: 100, callback: (v) =>
	{
		const rv = parseInt(v);
		if (value < 0) {value = 0;}
		value.length = rv;
		refresh.call(container);
	}});

	this.addButtons(null,["+","-"], { width: 60, callback: function(v)
	{
		if (v == "+")
		{value.length = value.length + 1;}
		else if (value.length > 0)
		{value.length = value.length - 1;}
		length_widget.setValue(value.length);
		refresh.call(container);
	}});

	this.widgets_per_row = 1;
	container = this.addContainer(name, options);
	container.value = value;

	const assign = function(a, v)
	{
		a.value[ a.index ] = v;
		if (options.callback) {options.callback.call(container, a.value, a.index);}
		// Todo: trigger change
	};

	const refresh = function(container)
	{
		const value = container.value;
		const size = Math.min(value.length, max_items);

		that.widgets_per_row += 1;
		container.innerHTML = "";

		for (let i = 0; i < size; ++i)
		{
			let v = null;
			if (value[i] !== undefined) {v = value[i];}
			const row = document.createElement("div");
			row.className = "array-row";
			row.innerHTML = "<span class='row-index'>" + i + "</span><span class='row-cell'></span><button style='width: 30px;' class='litebutton single row-trash'><img src='imgs/mini-icon-trash.png'/></button>";
			container.appendChild(row);

			const widget_row_container = row.querySelector('.row-cell');

			const item_options = { widget_parent: widget_row_container, callback: assign.bind(undefined,{value: container.value, index: i}) };
			if (options.data_options)
			{
				for (const j in options.data_options)
				{item_options[j] = options.data_options[j];}
			}
			const w = that.add(type, null, v, item_options);

			/*
			 *That.addButton(null,"<img src='imgs/mini-icon-trash.png'/>", {  widget_parent: container, index: i, width: 30, callback: function(){
			 *	if( value && value.length > (this.options.index-1))
			 *	{
			 *		value.splice( this.options.index,1 );
			 *		length_widget.setValue( value.length, true );
			 *		refresh.call( container );
			 *	}
			 *}});
			 */
		}
		that.widgets_per_row -= 1;
	};

	refresh(container);

	container.setValue = function(v)
	{
		this.value = v;
		refresh(container);
	};

	container.getValue = function()
	{
		this.value = v;
		return this.value;
	};

	// This.append(element,options);
	return container;
};

//* **** Containers ********/
// Creates an empty container but it is not set active
Inspector.prototype.addContainer = function(name, options)
{
	if (name && name.constructor !== String)
	{console.warn("LiteGUI.Inspector.addContainer first parameter must be a string with the name");}
	const element = this.startContainer(null,options);
	this.endContainer();
	return element;
};

// Creates an empty container and sets its as active
Inspector.prototype.startContainer = function(name, options)
{
	options = this.processOptions(options);

	const element = document.createElement("DIV");
	element.className = "wcontainer";
	this.applyOptions(element, options);
	this.row_number = 0;

	this.append(element);
	this.pushContainer(element);

	if (options.widgets_per_row)
	{this.widgets_per_row = options.widgets_per_row;}

	if (options.height)
	{
		element.style.height = LiteGUI.sizeToCSS(options.height);
		element.style.overflow = "auto";
	}

	element.refresh = function()
	{
		if (element.on_refresh) {element.on_refresh.call(this, element);}
	};

	return element;
};

Inspector.prototype.endContainer = function(name, options)
{
	this.popContainer();
};

// It is like a group but they cant be nested inside containers
Inspector.prototype.addSection = function(name, options)
{
	options = this.processOptions(options);
	const that = this;

	if (this.current_section) {this.current_section.end();}

	const element = document.createElement("DIV");
	element.className = "wsection";
	if (!name) {element.className += " notitle";}
	if (options.className) {element.className += " " + options.className;}
	if (options.collapsed && !options.no_collapse) {element.className += " collapsed";}

	if (options.id) {element.id = options.id;}
	if (options.instance) {element.instance = options.instance;}

	let code = "";
	if (name)
	{
		code += "<div class='wsectiontitle'>"+(options.no_collapse ? "" : "<span class='switch-section-button'></span>")+name+"</div>";
	}
	code += "<div class='wsectioncontent'></div>";
	element.innerHTML = code;

	// Append to inspector
	element._last_container_stack = this._current_container_stack.concat();
	// This.append( element ); //sections are added to the root, not to the current container
	this.root.appendChild(element);
	this.sections.push(element);

	element.sectiontitle = element.querySelector(".wsectiontitle");

	if (name && !options.no_collapse)
	{
		element.sectiontitle.addEventListener("click",(e) =>
		{
			if (e.target.localName == "button") {return;}
			element.classList.toggle("collapsed");
			const seccont = element.querySelector(".wsectioncontent");
			seccont.style.display = seccont.style.display === "none" ? null : "none";
			if (options.callback)
			{
				options.callback.call(element, element.classList.contains("collapsed"));
			}
		});
	}

	if (options.collapsed && !options.no_collapse)
	{
		element.querySelector(".wsectioncontent").style.display = "none";
	}

	this.setCurrentSection(element);

	if (options.widgets_per_row)
	{
		this.widgets_per_row = options.widgets_per_row;
	}

	element.refresh = function()
	{
		if (element.on_refresh) {element.on_refresh.call(this, element);}
	};

	element.end = function()
	{
		if (that.current_section != this) {return;}

		that._current_container_stack = this._last_container_stack;
		that._current_container = null;

		const content = this.querySelector(".wsectioncontent");
		if (!content) {return;}
		if (that.isContainerInStack(content)) {that.popContainer(content);}
		that.current_section = null;
	};

	return element;
};

// Change current section (allows to add widgets to previous sections)
Inspector.prototype.setCurrentSection = function(section)
{
	if (this.current_section == section)
	{return;}

	this.current_section = section;

	const parent = section.parentNode;
	this.popContainer(parent); // Go back till that container

	const content = section.querySelector(".wsectioncontent");
	this.pushContainer(content);
};

Inspector.prototype.getCurrentSection = function()
{
	for (let i = this._current_container_stack.length - 1; i >= 0; --i)
	{
		const container = this._current_container_stack[i];
		if (container.classList.contains("wsectioncontent"))
		{return container.parentNode;}
	}
	return null;
};

Inspector.prototype.endCurrentSection = function()
{
	if (this.current_section)
	{this.current_section.end();}
};

// A container of widgets with a title
Inspector.prototype.beginGroup = function(name, options)
{
	options = this.processOptions(options);

	const element = document.createElement("DIV");
	element.className = "wgroup";
	name = name || "";
	element.innerHTML = "<div class='wgroupheader "+ (options.title ? "wtitle" : "") +"'><span class='switch-section-button'></span>"+name+"</div>";
	element.group = true;

	const content = document.createElement("DIV");
	content.className = "wgroupcontent";
	if (options.collapsed) {content.style.display = "none";}

	if (options.height) {content.style.height = LiteGUI.sizeToCSS(options.height);}
	if (options.scrollable) {content.style.overflow = "auto";}

	element.appendChild(content);

	let collapsed = options.collapsed || false;
	const header = element.querySelector(".wgroupheader");
	if (collapsed) {header.classList.add("collapsed");}
	header.addEventListener("click", (e) =>
	{
		const style = element.querySelector(".wgroupcontent").style;
		style.display = style.display === "none" ? "" : "none";
		collapsed = !collapsed;
		if (collapsed)
		{
			header.classList.add("collapsed");
		}
		else
		{
			header.classList.remove("collapsed");
		}
		// Element.querySelector(".switch-section-button").innerHTML = (collapsed ? "+" : "-");
		e.preventDefault();
	});

	this.append(element, options);
	this.pushContainer(content);
	return element;
};

Inspector.prototype.endGroup = function()
{
	do
	{
		this.popContainer();
	}
	while (this._current_container && !this._current_container.classList.contains("wgroupcontent"));
};

/**
 * Creates a title bar in the widgets list to help separate widgets
 * @method addTitle
 * @param {string} title
 * @param {Object} options
 * @return {HTMLElement} the widget in the form of the DOM element that contains it
 *
 */
Inspector.prototype.addTitle = function(title,options)
{
	options = this.processOptions(options);

	const element = document.createElement("DIV");
	let code = "<span class='wtitle'><span class='text'>"+title+"</span>";
	if (options.help)
	{
		code += "<span class='help'><div class='help-content'>"+options.help+"</div></span>";
	}
	code += "</span>";
	element.innerHTML = code;
	element.setValue = function(v)
	{
		this.querySelector(".text").innerHTML = v;
	};
	this.row_number = 0;
	this.append(element, options);
	return element;
};


Inspector.prototype.scrollTo = function(id)
{
	const element = this.root.querySelector("#" + id);
	if (!element) {return;}
	const top = this.root.offsetTop;
	const delta = element.offsetTop - top;
	this.root.parentNode.parentNode.scrollTop = delta;
};

Inspector.prototype.processOptions = function(options)
{
	if (typeof(options) == "function")
	{options = { callback: options };}
	return options || {};
};

Inspector.prototype.processElement = function(element, options)
{
	if (options.callback_update && element.setValue)
	{
		element.on_update = function()
		{
			this.setValue(options.callback_update.call(this), true);
		};
	}
};

Inspector.prototype.updateWidgets = function()
{
	for (let i = 0; i < this.widgets.length; ++i)
	{
		const widget = this.widgets[i];
		if (widget.on_update) {widget.on_update(widget);}
	}
};

Inspector.parseColor = function(color)
{
	return "<span style='color: #FAA'>" + color[0].toFixed(2) + "</span>,<span style='color: #AFA'>" + color[1].toFixed(2) + "</span>,<span style='color: #AAF'>" + color[2].toFixed(2) + "</span>";
};

LiteGUI.Inspector = Inspector;