import { HTMLDivElementOptions,
	InspectorSection,
	InspectorStringWidget,
	InspectorValue,
	InspectorWidget,
	InspectorWidgetTypes,
	GenericCreationOptions,
	AddStringOptions,
	AppendOptions,
	CreateWidgetOptions,
	ProcessElementOptions, 
	AddStringButtonOptions,
	WidgetChangeOptions,
	AddTextAreaOptions,
	InspectorOptions,
	AddNumberOptions,
	InspectorNumberWidget,
	InspectorNumberVectorWidget,
	AddVectorOptions,
	VectorInput,
	InspectorPadWidget,
	AddPadOptions,
	AddInfoOptions,
	InspectorInfoWidget,
	AddSliderOptions,
	InspectorSliderWidget,
	AddCheckboxOptions,
	AddFlagsOptions,
	InspectorCheckboxWidget,
	AddComboOptions,
	InspectorComboWidget,
	InspectorComboButtonsWidget,
	InspectorTagsWidget,
	AddTagOptions,
	AddListOptions,
	InspectorListWidget,
	AddButtonOptions,
	InspectorButtonWidget} from "./@types/Inspector";
import { EventTargetPlus,
	HTMLDivElementPlus,
	HTMLElementPlus,
	addTitleOptions,
	beginGroupOptions,
	containerOptions,
	addTreeOptions,
	addFileOptions,
	LineEditorOptions,
	addColorOptions,
	addIconOptions,
	properties_info,
	ParentNodePlus,
	ItemOptions,
	TreeNode,
	FileAddedResponse,
	ChildNodePlus } from "./@types/globals";
import { LiteGUI } from "./core";
import { purgeElement } from "./core";
import { Dragger } from "./dragger";
import { jscolor } from "./jscolor";
import { LineEditor } from "./widgets";




declare global
{
    interface Window
    {
        jscolor: jscolor;
    }
}

export class Inspector 
{
    root: HTMLDivElement;
    sections: InspectorSection[] = [];
    values: Map<string, InspectorValue> = new Map<string, InspectorValue>();
    widgets: InspectorWidget[] = [];
    widgets_by_name: Map<string, InspectorWidget> = new Map<string, InspectorWidget>();
	// Used to detect if element is even (cannot use CSS, special cases everywhere)
    row_number: number = 0;
    name_width?: number | null = null;
    widgets_width?: number | null = null;
    tab_index: number;
    onchange?: (name?:string, value?: InspectorValue, element?: InspectorWidget)=>void;
    className: string;
    widgets_per_row: number;
    one_line?: boolean | null = null;
    current_section: any;
    _current_container_stack: any[] = [];
    private _current_container: any;
    on_refresh?: Function;
    on_addProperty?: Function;
    instance?: {[key: string]: any};
    name: string = "";
    options: InspectorOptions;
    height?: string | number;

    constructor(options?: InspectorOptions) // TODO: Define the options
    {
        this.options = options ?? {};
        const root = document.createElement("DIV") as HTMLDivElement;
        this.root = root;
        this.root.className = `inspector ${this.options.full ? "full" : ""}${this.options.className ?? ""}`;
		this.root.id = this.options.id ?? "";
        if (this.options.one_line) 
        {
            this.one_line = true;
            this.root.className += " one_line";
        }

        this.addContainer("", {}); // Add empty container
        this.tab_index = Math.floor(Math.random() * 10000);

        if (this.options.width) { this.root.style.width = LiteGUI.sizeToCSS(this.options.width)!.toString(); }
        if (this.options.height) {
            this.root.style.height = LiteGUI.sizeToCSS(this.options.height)!.toString();
            if (!this.options.one_line) { this.root.style.overflow = "auto"; }
        }

        if (this.options.name_width) { this.name_width = this.options.name_width; }
        if (this.options.widgets_width) { this.widgets_width = this.options.widgets_width; }

        if (this.options.noscroll) { this.root.style.overflow = "hidden"; }

        if (this.options.onchange) { this.onchange = this.options.onchange; }

        if (this.options.parent) { this.appendTo(this.options.parent); }

        this.className = this.root.className;

        this.widgets_per_row = this.options.widgets_per_row || 1;
    }

    getValues()
    {
        const r = new Map<string, InspectorValue>();
        for (const i in this.widgets_by_name)
        {
			const widget = this.widgets_by_name.get(i);
			if (widget && widget.getValue)
			{
				const w = widget.getValue();
				// if (!w) { continue; }
				r.set(i, w);
			}
        }
        return r;
    };
    
    setValues(values: {[key:string]:InspectorValue})
    {
        for (const i in values)
        {
			const widget = this.widgets_by_name.get(i);
            if (widget && widget.setValue)
            {
                widget.setValue(values[i]);
            }
        }
    };

    // Append the inspector to a parent
    appendTo(parent?: HTMLElement | string, at_front?: boolean)
    {
        if (!parent) {return;}

        if (typeof parent === 'string')
        {
            parent = document.querySelector(parent) as HTMLElement;
			if (!parent) {return;}
        }

        if (at_front)
        {
            parent.insertBefore(this.root, parent.firstChild);
        }
        else
        {
			parent.appendChild(this.root);
		}
    };
    
    /**
     * Removes all the widgets inside the inspector
     * @method clear
     */
    clear()
    {
        purgeElement(this.root, true); // Hack, but doesn't seem to work
    
        while (this.root.hasChildNodes())
        {
			this.root.removeChild(this.root.lastChild!);
		}
    
        this.root.className = this.className;
    
        this.row_number = 0;
        this.values.clear();
        this.widgets = [];
        this.widgets_by_name.clear();
        this.sections = [];
        this.current_section = null;
        this._current_container = null;
        this._current_container_stack = [];
        this.addContainer('', {});
    };
    
    /**
     * Tries to refresh (calls on_refresh)
     * @method refresh
     */
    refresh()
    {
        if (this.on_refresh)
        {
            this.on_refresh();
        }
    }
    
    /**
     * Append widget to this inspector 
     * @param {InspectorWidget} widget
     * @param {AppendOptions} options
     */
    appendWidget(widget: InspectorWidget, options?: AppendOptions)
    {
        options = options ?? {};
    
        const root = options.widget_parent ?? this._current_container ?? this.root;
    
        if (options.replace && options.replace.parentNode)
        {
			options.replace.parentNode.replaceChild(widget, options.replace);
		}
        else
        {
            widget.section = this.current_section;
            root.appendChild(widget);
        }
    };
    
    pushContainer(container: any)
    {
        if (!this._current_container_stack)
        {
			this._current_container_stack = [container];
		}
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
    
    isContainerInStack(container: any)
    {
        if (!this._current_container_stack)
        {return false;}
        if (this._current_container_stack.indexOf(container) != -1)
        {return true;}
        return false;
    };
    
    popContainer(container?: any)
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
    
    setup(info: GenericCreationOptions[])
    {
		for (const i in info)
		{
			const widgetOptions = info[i];
        	this.add(widgetOptions.type, widgetOptions.name, widgetOptions.value, widgetOptions.options);
		}
    };
    
    /**
     *  Returns the widget given the name
     *
     * @method getWidget
     * @param {String} name the name of the widget supplied when creating it or the number of the widget
     * @return {Object} widget object
     */
    getWidget(name: string | number)
    {
        if (name.constructor === Number)
        {
            return this.widgets[name];
        }
        return this.widgets_by_name.get(name as string);
    };
    
    /**
     *  Given an instance it shows all the attributes
     *
     * @method inspectInstance
     * @param {Object} instance the instance that you want to inspect, attributes will be collected from this object
     * @param {Array} properties an array with all the names of the properties you want to inspect,
     *		  if not specified then it calls getProperties, otherwise collect them and tries to guess the type
     * @param {Object} properties_info_example it overwrites the info about properties found in the object (in case the automatically guessed type is wrong)
     * @param {Array} properties_to_skip this properties will be ignored
     */
    inspectInstance(instance: any, properties?: string[],
        properties_info_example?: any, properties_to_skip?: string[])
    {
        if (!instance) {return;}
    
        if (!properties)
        {
            if (instance.getProperties)
            {
                properties = instance.getProperties();
            }
            else
            {
                properties = this.collectProperties(instance);
            }
        }
    
        const classObject:{[key:string]:any} = instance.constructor;
        if (!properties_info_example && classObject.properties)
        {
            properties_info_example = classObject.properties;
        }
    
        /*
         * Properties info contains  name:type for every property
         * Must be cloned to ensure there is no overlap between widgets reusing the same container
         */
        let properties_values: {[key:string]:properties_info | undefined} = {};
    
        if (instance.getInspectorProperties)
        {
            properties_values = instance.getInspectorProperties();
        }
        else if (properties)
        {
            // Add to properties_info the ones that are not specified
            for (const i in properties)
            {
                if (properties_info_example && properties_info_example[i])
                {
                    // Clone
                    properties_values[i] = inner_clone(properties_info_example[i]);
                    continue;
                }
    
                const value = properties[i];
                if (classObject["@" + i]) // Guess from class object info
                {
                    const shared_options = classObject["@" + i];
                    if (shared_options && shared_options.widget === null) {continue;} // Skip
                    properties_values[i] = inner_clone(shared_options);
                }
                else if (instance["@" + i]) // Guess from instance info
                {
					properties_values[i] = instance["@" + i];
				}
                else if (i === null || i === undefined) // Are you sure?
                {
					continue;
				}
                else
                {
                    switch (typeof value)
                    {
                    case 'number': properties_values[i] = { type: "number", step: 0.1 }; break;
                    case 'string': properties_values[i] = { type: "string" }; break;
                    case 'boolean': properties_values[i] = { type: "boolean" }; break;
                    default:
                        if (value && (Array.isArray(value) || (value as any).BYTES_PER_ELEMENT)) // Array or typed_array
                        {
                            const is_number = (value[0] && typeof value[0] === "number");
                            switch ((value as Array<any>).length)
                            {
                            case 2: properties_values[i] = { type: is_number ? "vec2" : "Array", step: 0.1 }; break;
                            case 3: properties_values[i] = { type: is_number ? "vec3" : "Array", step: 0.1 }; break;
                            case 4: properties_values[i] = { type: is_number ? "vec4" : "Array", step: 0.1 }; break;
                            default:
                                properties_values[i] = { type: "Array" };
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
            {
				properties_values[properties_to_skip[i]] = undefined;
			}
        }
    
        // Allows to establish the order of the properties in the inspector
        if (classObject.properties_order)
        {
            const sorted_properties: any = {};
            for (const i in classObject.properties_order)
            {
                const name = classObject.properties_order[i];
                if (properties_values[name])
                {
					sorted_properties[name] = properties_values[name];
				}
                else
                {
					console.warn("property not found in instance:", name);
				}
            }
            for (const i in properties_values) // Add the missing ones at the end (should this be optional?)
            {
                if (!sorted_properties[i])
                {
					sorted_properties[i] = properties_values[i];
				}
            }
            properties_values = sorted_properties;
        }
    
    
        // ShowAttributes doesn't return anything but just in case...
        return this.showProperties(instance, properties_values);
    
        // Basic cloner
        function inner_clone(original?: any, target?: any)
        {
            target = target ?? {};
            for (const j in original)
            {
				target[j] = original[j];
			}
            return target;
        }
    };
    
    /**
     *  Extract all attributes from an instance (enumerable properties that are not function and a name starting with alphabetic character)
     *
     * @method collectProperties
     * @param {Object} instance extract enumerable and public (name do not start with '_' ) properties from an object
     * return {Object} object with "name" : value for every property
     *
     */
    collectProperties(instance: any)
    {
        const properties: any = {};
    
        for (const i in instance)
        {
            if (i[0] == "_" || i[0] == "@" || i.substring(0,6) == "jQuery") // Skip vars with _ (they are private)
            {
				continue;
			}
    
            const v = instance[i];
            if (v && v.constructor == Function && !instance.constructor["@" + i])
            {
				continue;
			}
            properties[i] = v;
        }
        return properties;
    }
    
    /**
     * Adds the widgets for the properties specified in properties_info of instance, it will create callback and callback_update
     *
     * @method showProperties
     * @param {Object} instance the instance that you want to inspect
     * @param {Object} properties_info object containing   "property_name" :{ type: value, widget:..., min:..., max:... }  or just "property":"type"
     * @param {Array} properties_to_skip this properties will be ignored
     */
    showProperties(instance: any, properties_info: properties_info)
    {
        // For every enumerable property create widget
        for (const i in properties_info)
        {
            let varname = i;
            let options = properties_info[i as keyof properties_info];

            if (options.name) { varname = options.name; }
            if (!options.callback) // Generate default callback to modify data
            {
                const o = { instance: instance, name: varname, options: options };
                if (options.type != "function") { options.callback = this.assignValue.bind(o);}
            }
            if (!options.callback_update) // Generate default refresh
            {
                const o = { instance: instance, name: varname };
                options.callback_update = (() => 
                { 
                    return this.instance![this.name]; 
                }).bind(o);
            }
    
            options.instance = instance;
            options.varname = varname;
    
            const type = options.widget || options.type || "string";
    
            // Used to hook stuff on special occasions
            if (this.on_addProperty)
            {
                this.on_addProperty(type, instance, varname, instance[varname], options);
            }
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
        if (instance.onShowProperties) { instance.onShowProperties(this); }
        if (instance.constructor.onShowProperties)
        {
            instance.constructor.onShowProperties(instance, this);
        }
    }
    
    /**
     * Tries to assign a value to the instance stored in this.instance
     * @method assignValue
     */
    assignValue(value: string | null | any[] | any)
    {
        const instance = this.instance!;
        const current_value = instance![this.name];
    
        if (current_value == null || value == null || this.options.type == "enum")
        {
            instance[this.name] = value;
        }
        else if (typeof(current_value) == "number")
        {
            instance[this.name] = parseFloat(value.toString());
        }
        else if (typeof(current_value) == "string")
        {
            instance[this.name] = value;
        }
        else if (value && value.length && current_value && current_value.length &&
            (!Object.getOwnPropertyDescriptor(instance, this.name) || 
            !Object.getOwnPropertyDescriptor(instance, this.name)?.set) &&  // No setters
            (!Object.getOwnPropertyDescriptor(Object.getPrototypeOf(instance), this.name) ||
            !Object.getOwnPropertyDescriptor(Object.getPrototypeOf(instance), this.name)?.set))
        {
            for (let i = 0; i < value.length; ++i)
            {
                current_value[i] = value[i];
            }
        }
        else 
        { 
            instance[this.name] = value 
        }
    }
    
    /**
     * Used by all widgets to create the container of one widget
     * @method createWidget
     * @param {string | undefined} name the string to show at the left side of the widget, if null this element wont be created and the value part will use the full width
     * @param {string | number | boolean | HTMLElement} content the string with the html of the elements that conform the interactive part of the widget
     * @param {CreateWidgetOptions} options some generic options that any widget could have:
     * - widget_name: the name used to store this widget in the widgets_by_name container, if omitted the parameter name is used
     * - width: the width of the widget (if omitted it will use the Inspector widgets_width, otherwise 100%
     * - name_width: the width of the name part of the widget, if not specified it will use Inspector name_width, otherwise css default
     * - content_width: the width of the widget content area
     * - pre_title: string to append to the left side of the name, this is helpful if you want to add icons with behaviour when clicked
     * - title: string to replace the name, sometimes you want to supply a different name than the one you want to show (this is helpful to retrieve values from an inspector)
     */
    createWidget(name?: string, content?: string | number | boolean | HTMLElement, 
        options?: CreateWidgetOptions) : InspectorWidget
    {
        options = options ?? {};
        content = content ?? "";
        const element = document.createElement("DIV") as InspectorWidget;
        element.className = "widget " + (options.className ?? "");
        element.inspector = this;
        element.options = options;
        element.name = name;
    
        this.row_number += this.widgets_per_row;
        if (this.row_number % 2 == 0) {element.className += " even";}
    
        const width = options.width ?? this.widgets_width;
        if (width)
        {
			const cssWidth = LiteGUI.sizeToCSS(width);
			if (cssWidth)
			{
				element.style.width = cssWidth.toString();
			}
            else
			{
				element.style.width = "calc(" + LiteGUI.sizeToCSS(width) + ")";
			}
            element.style.minWidth = "auto";
        }
        const height = options.height ?? this.height;
        if (height)
        {
			const cssHeight = LiteGUI.sizeToCSS(height);
			if (cssHeight)
			{
				element.style.height = cssHeight.toString();
			}
            else
			{
				element.style.height = "calc(" + LiteGUI.sizeToCSS(height) + ")";
			}
            element.style.minHeight = "auto";
        }
    
        // Store widgets
        this.widgets.push(element);
        if (options.widget_name || name)
        {
            this.widgets_by_name.set(options.widget_name ?? name ?? '', element);
        }
    
        if (this.widgets_per_row != 1)
        {
            if (!options.width) {element.style.width = (100 / this.widgets_per_row).toFixed(2) + "%";}
            element.style.display = "inline-block";
        }
    
        let nameWidth = "";
        let contentWidth = "";
        if ((name !== undefined && name !== null) && (this.name_width || options.name_width) && !this.one_line)
        {
            const w = LiteGUI.sizeToCSS(options.name_width ?? this.name_width ?? undefined);
            nameWidth = "style='width: calc(" + w + " - 0px); width: -webkit-calc(" + w + " - 0px); width: -moz-calc(" + w + " - 0px); '"; // Hack
            contentWidth = "style='width: calc( 100% - " + w + "); width: -webkit-calc(100% - " + w + "); width: -moz-calc( 100% - " + w + "); '";
        }
    
        if (options.name_width) {nameWidth = "style='width: "+ LiteGUI.sizeToCSS(options.name_width)+" '";}
        if (options.content_width) {contentWidth = "style='width: "+ LiteGUI.sizeToCSS(options.content_width)+" '";}
    
        let code = "";
        let content_class = "wcontent ";
        if (name === null || name === undefined)
        {
			content_class += " full";
		}
		else
		{
			let pre_title = "";
			if (options.pre_title) {pre_title = options.pre_title;}

			let title:string | string[] = name;
			if (options.title) {title = options.title;}

			const filling = this.one_line ? "" : "<span class='filling'></span>";
			if (name === "") // Three equals because 0 == ""
			{
				code += "<span class='wname' title='"+title+"' "+nameWidth+">"+ pre_title +"</span>";
			}
			else
			{
				code += "<span class='wname' title='"+title+"' "+nameWidth+">"+ pre_title + name + filling + "</span>";
			}
		}
    
		const contentType = typeof content;
        if (contentType === "string" || contentType === 'number' || contentType === 'boolean')
        {
			element.innerHTML = code + "<span class='info_content "+content_class+"' "+contentWidth+">"+content+"</span>";
		}
        else
        {
            element.innerHTML = code + "<span class='info_content "+content_class+"' "+contentWidth+"></span>";
            const content_element = element.querySelector("span.info_content");
            if (content_element) {content_element.appendChild(content as Node);}
        }
    
        element.content = element.querySelector("span.info_content") as HTMLElement ?? undefined;
        element.remove = function()
        {
            if (this.parentNode) {this.parentNode.removeChild(this);}
        };
    
        return element;
    };
    
    // Calls callback, triggers wchange, calls onchange in Inspector
    onWidgetChange(element: InspectorWidget, name: string, value: InspectorValue, options: WidgetChangeOptions, expand_value?: boolean, event?: Event)
    {
        const section = element.section; // This.current_section
    
        if (!options.skip_wchange)
        {
            if (section) {LiteGUI.trigger(section, "wbeforechange", value);}
            LiteGUI.trigger(element, "wbeforechange", value);
        }
    
        // Assign and launch callbacks
        this.values.set(name, value);
        let r = undefined;
        if (options.callback)
        {
            if (expand_value && Array.isArray(value))
            {
				const callback = options.callback as (...args:InspectorValue[])=>void;
				r = callback.apply(element, value);
			}
            else
            {
				const callback = options.callback as (value:InspectorValue, e?:Event)=>void;
				r = callback.call(element, value, event);
			}
        }
    
        if (!options.skip_wchange)
        {
            if (section) {LiteGUI.trigger(section, "wchange", value);}
            //{LiteGUI.trigger(section, "wchange", value, element);}
            //LiteGUI.trigger(element, "wchange", value, element);
            LiteGUI.trigger(element, "wchange", value);
        }
    
        if (this.onchange) {this.onchange(name, value, element);}
        return r;
    };

	getValueName(widgetName?: string, options?: GenericCreationOptions): string
	{
		options = options ?? {};
		if (widgetName === undefined && options.widget_name === undefined)
		{
			throw new Error("Neither name nor options.widget_name was set up, this is needed for proper value storage.");
		}
		return widgetName ?? options.widget_name!;
	}
    
    // Must be lowercase
    public static widget_constructors: { [key: string]: string } = 
    {
        "null": 'addNull', // Use for special cases
        "undefined": 'addNull', // Use for special cases
        title: 'addTitle',
        info: 'addInfo',
        number: 'addNumber',
        slider: 'addSlider',
        string: 'addString',
        text: 'addString',
        textarea: 'addTextArea',
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
    
    /**
     * Adds a widget to the inspector, its a way to provide the widget type from a string
     * @method add
     * @param {InspectorWidgetTypes} type string specifying the name of the widget to use (check Inspector.widget_constructors for a complete list)
     * @param {string} name the string to show at the left side of the widget, if null this element wont be created and the value part will use the full width
     * @param {InspectorValue} value the value to assign to the widget
     * @param {GenericCreationOptions} options: some generic options that any widget could have:
     * - type: overwrites the type
     * - callback: function to call when the user interacts with the widget and changes the value
     * [For a bigger list check createWidget and every widget in particular]
     * @return {InspectorWidget} the widget in the form of the DOM element that contains it
     *
     */
    add(type?: InspectorWidgetTypes, name?: string, value?: InspectorValue, options?: GenericCreationOptions): InspectorWidget | undefined
    {
		options = options ?? {};
        if(options.type) { type = options.type; }
        if(options.name) { name = options.name; }
        if(options.value) { value = options.value; }
        
        let func: string | ((name?: string, value?: InspectorValue, options?: CreateWidgetOptions)=>InspectorWidget) =
			Inspector.widget_constructors[type?.toLowerCase() ?? 'null'];
        if (!func)
        {
            console.warn("LiteGUI.Inspector do not have a widget called", type);
            return;
        }
    
        if (typeof func === 'string')
        {
            func = Inspector.prototype[func as keyof Inspector];
        }
        if (typeof func !== 'function') {return;}
    
        return func.call(this, name, value, options);
    };
    
    getValue(name: string): InspectorValue
    {
        return this.values.get(name);
    };
    
    applyOptions(element: HTMLDivElement, options: HTMLDivElementOptions)
    {
        if (!element || !options) {return;}
    
        if (options.className) {element.className += " " + options.className;}
        if (options.id) {element.id = options.id;}
        if (options.width)  {element.style.width = LiteGUI.sizeToCSS(options.width) ?? '0px';}
        if (options.height) {element.style.height = LiteGUI.sizeToCSS(options.height) ?? '0px';}
    };
    
    /**
     * Creates a line
     * @method addSeparator
     * @return {InspectorWidget} the widget in the form of the DOM element that contains it
     *
     */
    addSeparator()
    {
        const element = document.createElement("DIV") as InspectorWidget;
        element.className = "separator";
        this.appendWidget(element);
        return element;
    };
    
    // Used when you want to skip the widget of an object
    addNull()
    {
        return undefined;
    };    
    
    /**
     * Widget to edit strings
     * @method addString
     * @param {string | undefined} name
     * @param {string | undefined} value
     * @param {AddStringOptions | undefined} options, here is a list for this widget (check createWidget for a list of generic options):
     * - focus: true if you want the cursor to be here
     * - password: true if you want to hide the string
     * - immediate: calls the callback once every keystroke
     * - disabled: shows the widget disabled
     * - callback: function to call when the widget changes
     * @return {InspectorStringWidget} the widget in the form of the DOM element that contains it
     *
     */
    addString(name?: string,  value?: string, options?: AddStringOptions) : InspectorStringWidget
    {
		const that = this;
		value = value ?? '';
        options = options ?? {};
		const valueName = this.getValueName(name, options);
        this.values.set(valueName, value);
    
        const inputType = options.password ? "password": "text";
        const focus = options.focus ? "autofocus" : "";
		const isDisabledText = options.disabled ? "disabled" : "";
    
        const element = this.createWidget(name,"<span class='inputfield full "+isDisabledText+
            "'><input type='"+inputType+"' tabIndex='"+this.tab_index+"' "+focus+" class='text string' value='" +
            value+"' "+isDisabledText+"/></span>", options) as InspectorStringWidget;
        const input = element.querySelector(".wcontent input") as HTMLInputElement;
    
        if (options.placeHolder) {input.setAttribute("placeHolder",options.placeHolder);}
    
        if (options.align == "right")
        {
            input.style.direction = "rtl";
            // Input.style.textAlign = "right";
        }
    
        input.addEventListener(options.immediate ? "keyup" : "change", (e: Event) =>
        {
			const target = e.target as HTMLInputElement;
			const value = target.value;
            const r = this.onWidgetChange.call(that, element, valueName, value, options!);
            if (r !== undefined) {input.value = r;}
        });
    
        if (options.callback_enter)
        {
            input.addEventListener("keydown" , (e: KeyboardEvent) =>
            {
                if (e.key === 'Enter')
                {
					const target = e.target as HTMLInputElement;
					const value = target.value;
                    const r = this.onWidgetChange.call(that, element, name!, value, options!);
                    if(options!.callback_enter) { options!.callback_enter(); }
                    e.preventDefault();
                }
            });
        }
    
        this.tab_index += 1;
    
        element.setIcon = function(img: string)
        {
            if (!img)
            {
                input.style.background = "";
                input.style.paddingLeft = "";
            }
            else
            {
                input.style.background = `transparent url('${img}') no-repeat left 4px center`;
                input.style.paddingLeft = "1.7em";
            }
        };
        if (options.icon) {element.setIcon(options.icon);}
    
        element.setValue = function(value?: string, skip_event?: boolean)
        {
            if (value === undefined || value === input.value) {return;}
            input.value = value;
            if (!skip_event) {LiteGUI.trigger(input, "change");}
        };
        element.getValue = function() { return input.value; };
        element.focus = function() { this.querySelector("input")?.focus(); };
        element.disable = function() { input.disabled = true; };
        element.enable = function() { input.disabled = false; };
        this.appendWidget(element, options);
        this.processElement(element, options);
        return element;
    };
    
    /**
     * Widget to edit strings, but it adds a button behind (useful to search values somewhere in case the user do not remember the name)
     * @method addStringButton
     * @param {string | undefined} name the name of the field
     * @param {string | undefined} value the string to show
     * @param {AddStringButtonOptions | undefined} options, here is a list for this widget (check createWidget for a list of generic options):
     * - disabled: shows the widget disabled
     * - button: string to show inside the button, default is "..."
     * - callback: function to call when the string is edited
     * - callback_button: function to call when the button is pressed
     * @return {InspectorStringWidget} the widget in the form of the DOM element that contains it
     *
     */
    addStringButton(name?: string, value?: string, options?: AddStringButtonOptions) : InspectorStringWidget
    {
        const that = this;
		value = value ?? '';
		options = options ?? {};
		const valueName = this.getValueName(name, options);
        this.values.set(valueName!, value);

        const element = this.createWidget(name,
            "<span class='inputfield button'><input type='text' tabIndex='" + this.tab_index +
            "' class='text string' value='' "+(options.disabled?"disabled":"") +
            "/></span><button class='micro'>"+(options.button ?? "...")+"</button>", options) as InspectorStringWidget;
        const input = element.querySelector(".wcontent input") as HTMLInputElement;
        input.value = value;
        input.addEventListener("change", (e: Event) =>
        {
            const r = this.onWidgetChange.call(that,element,valueName,(e.target as HTMLInputElement)!.value, options!);
            if (r !== undefined) { input.value = r; }
        });
    
        if (options.disabled) {input.setAttribute("disabled","disabled");}
    
        element.setIcon = function(img: string)
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
        if (options.icon) {element.setIcon(options.icon);}
    
        const button = element.querySelector(".wcontent button") as HTMLInputElement;
        button.addEventListener("click", (e: Event) =>
        {
            if (options!.callback_button) {options!.callback_button.call(element, input.value, e);}
        });
    
        if (options.button_width)
        {
            button.style.width = LiteGUI.sizeToCSS(options.button_width) ?? '0px';
            const inputField = element.querySelector(".inputfield") as HTMLInputElement;
            inputField.style.width = "calc( 100% - " + button.style.width + " - 6px)";
        }
    
    
        this.tab_index += 1;
        this.appendWidget(element,options);
        element.setValue = function(value?: string, skip_event?: boolean)
        {
            if (value === undefined || value === input.value) {return;}
            input.value = value;
            if (!skip_event) {LiteGUI.trigger(input, "change");}
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
     * @method addTextArea
     * @param {string | undefined} name
     * @param {string | undefined} value
     * @param {CreateWidgetOptions | undefined} options, here is a list for this widget (check createWidget for a list of generic options):
     * - focus: true if you want the cursor to be here
     * - password: true if you want to hide the string
     * - immediate: calls the callback once every keystroke
     * - disabled: shows the widget disabled
     * - callback: function to call when the widget changes
     * @return {InspectorStringWidget} the widget in the form of the DOM element that contains it
     *
     */
    addTextArea(name?: string, value?: string, options?: AddTextAreaOptions): InspectorStringWidget
    {
        const that = this;
        value = value ?? "";
        options = options ?? {};
		const valueName = this.getValueName(name, options);
        this.values.set(valueName!, value);
		
		const isDisabledText = options.disabled?"disabled":"";
        const element = this.createWidget(name,"<span class='inputfield textarea "+
			isDisabledText+"'><textarea tabIndex='"+this.tab_index+"' "+
			isDisabledText+"></textarea></span>", options) as InspectorStringWidget;
        this.tab_index++;
        const textarea = element.querySelector(".wcontent textarea") as HTMLTextAreaElement;
        textarea.value = value;    
        if (options.placeHolder) {textarea.setAttribute("placeHolder",options.placeHolder);}
        textarea.addEventListener(options.immediate ? "keyup" : "change", (e: Event) =>
        {
            this.onWidgetChange.call(that,element,valueName,(e.target as HTMLTextAreaElement)?.value, options!, false, e);
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
        this.appendWidget(element, options);
        element.setValue = function(result?: string, skip_event?: boolean)
        {
            if (result === undefined || result == textarea.value) {return;}
            value = result;
            textarea.value = result;
            if (!skip_event) {LiteGUI.trigger(textarea,"change");}
        };
        element.getValue = function()
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
     * @param {string | undefined} name
     * @param {number | undefined} value
     * @param {AddNumberOptions | undefined} options, here is a list for this widget (check createWidget for a list of generic options):
     * - disabled: shows the widget disabled
     * - callback: function to call when the string is edited
     * - precision: number of digits after the colon
     * - units: string to show after the number
     * - min: minimum value accepted
     * - max: maximum value accepted
     * - step: increments when dragging the mouse (default is 0.1)
     * @return {InspectorNumberWidget} the widget in the form of the DOM element that contains it
     *
     */
    addNumber( name?: string, value?: number, options?: AddNumberOptions): InspectorNumberWidget
    {
        const that = this;
        value = value ?? 0;
        options = options ?? {};
		const valueName = this.getValueName(name, options);
        this.values.set(valueName, value);
    
        const element = this.createWidget(name,"", options) as InspectorNumberWidget;
        this.appendWidget(element, options);
    
        options.extra_class = "full";
        options.tab_index = this.tab_index;
        // Options.dragger_class = "full";
        options.full_num = true;
        options.precision = options.precision !== undefined ? options.precision : 2;
        options.step = options.step === undefined ? (options.precision == 0 ? 1 : 0.1) : options.step;
    
        this.tab_index++;
    
        const dragger = new LiteGUI.Dragger(value, options);
        dragger.root.style.width = "calc( 100% - 1px )";
        element.querySelector(".wcontent")!.appendChild(dragger.root);
    
        const inner_before_change = function(options: AddNumberOptions)
        {
            if (options.callback_before) {options.callback_before.call(element);}
        };
        dragger.root.addEventListener("start_dragging", inner_before_change.bind(undefined,options));
        element.dragger = dragger;
    
        if (options.disabled) {dragger.input.setAttribute("disabled","disabled");}
    
        const input = element.querySelector("input") as HTMLInputElement;    
        input.addEventListener("change", (e: Event) =>
        {
            const el = e.target as EventTargetPlus;
            LiteGUI.trigger(element, "wbeforechange", el.value);
    
            this.values.set(valueName, el.value);
            if(options == undefined || typeof(options) == "function") { return; }
            if (options.on_change && dragger.dragging)
            {
                const ret = options.on_change.call(element, parseFloat(el.value));
                if (typeof(ret) == "number") { el.value = ret; }
            }
            else if ((options.on_change || options.callback) && !dragger.dragging)
            {
                let ret = undefined;
                if (options.callback)
                {
                    ret = options.callback.call(element, parseFloat(el.value));
                }
                else if (options.on_change)
                {
                    ret = options.on_change.call(element, parseFloat(el.value));
                }
                if (typeof(ret) == "number") {el.value = ret;}
            }
            LiteGUI.trigger(element, "wchange", el.value);
            if (that.onchange) {that.onchange(valueName,el.value,element);}
        });
    
        dragger.root.addEventListener("stop_dragging", (e: any) =>
        {
            LiteGUI.trigger(input, "change");
        });
    
        element.setValue = function(value?: number | string, skip_event?: boolean)
        {
            if(options == undefined || typeof options == "function") { return; }
            if (value === undefined) {return;}
            if (typeof value == 'string') {value = parseFloat(value as string);}
            if (options.precision) {value = value.toFixed(options.precision);}
			value = value.toString();
            value += options.units ?? '';
            if (input.value == value) {return;}
            input.value = value;
            if (!skip_event) {LiteGUI.trigger(input,"change");}
        };
    
        element.setRange = function(min: number, max: number) { dragger.setRange(min,max); };
        element.getValue = function() { return parseFloat(input.value); };
        element.focus = function() { LiteGUI.focus(input); };
        element.disable = function() { input.disabled = true;};
        element.enable = function() { input.disabled = false;};
        this.processElement(element, options);
        return element;
    };
	
    /**
     * Widget to edit an array of numbers from 2 to 4 (it adds a dragging mini widget in the right side)
     * @method addVector
     * @param {string | undefined} name
     * @param {number[]} value
     * @param {Object} options, here is a list for this widget (check createWidget for a list of generic options):
     * - callback: function to call once the value changes
     * - disabled: shows the widget disabled
     * - callback: function to call when the string is edited
     * - precision: number of digits after the colon
     * - units: string to show after the number
     * - min: minimum value accepted
     * - max: maximum value accepted
     * - step: increments when dragging the mouse (default is 0.1)
     * @return {HTMLElement} the widget in the form of the DOM element that contains it
     *
     */
    addVector(name: string | undefined, value: number[], options?: AddVectorOptions): InspectorNumberVectorWidget
    {
        const that = this;
        options = options ?? {};
		const valueName = this.getValueName(name, options);
        this.values.set(valueName, value);
    
        const element = this.createWidget(name,"", options) as InspectorNumberVectorWidget;
		const initLength = value.length;
        options.step = options.step ?? 0.1;
        options.tab_index = this.tab_index;
        options.fullVector = true;
        if (!options.step) {options.step = 0.1;}
        this.tab_index++;
    
        const draggers: Dragger[] = element.draggers = [];
    
        const inner_before_change = function(e: Event)
        {
            if (options!.callback_before) {options!.callback_before(e);}
        };
    
        for (let i = 0; i < value.length; i++)
        {
            const dragger: Dragger = new LiteGUI.Dragger(value[i], options);
            dragger.root.style.marginLeft = '0';
            dragger.root.style.width = "calc( 25% - 1px )";
            element.querySelector(".wcontent")!.appendChild(dragger.root);
            options.tab_index = this.tab_index;
            this.tab_index++;
            dragger.root.addEventListener("start_dragging", inner_before_change);
            draggers.push(dragger);
        }
    
        const inputs = element.querySelectorAll("input") as NodeListOf<VectorInput>;
        const onChangeCallback = (e: Event) =>
        {
            // Gather all three parameters
            let r = [];
            for (let j = 0; j < inputs.length; j++)
            {
                r.push(parseFloat(inputs[j].value));
            }
    
            LiteGUI.trigger(element, "wbeforechange", [r]);
    
            this.values.set(valueName, r);
    
            const dragger = (e.target as VectorInput).dragger;
            if (options!.on_change && dragger.dragging)
            {
                const new_val = options!.on_change.call(element, r);
    
                if (Array.isArray(new_val) && new_val.length >= initLength)
                {
                    for (let j = 0; j < inputs.length; j++)
                    {
                        inputs[j].value = new_val[j].toString();
                    }
                    r = new_val;
                }
            }
            else if ((options!.on_change || options!.callback) && !dragger.dragging)
            {
                let new_val = undefined;
                if (options!.callback)
                {
                    new_val = options!.callback.call(element, r);
                }
                else if (options!.on_change)
                {
                    new_val = options!.on_change.call(element, r);
                }
    
                if (Array.isArray(new_val) && new_val.length >= initLength)
                {
                    for (let j = 0; j < inputs.length; j++)
                    {
                        inputs[j].value = new_val[j].toString();
                    }
                    r = new_val;
                }
            }
    
            LiteGUI.trigger(element, "wchange", [r]);
            if (that.onchange) {that.onchange(valueName, r, element);}
        };
        const onStopDragging = function(input: VectorInput)
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
    
        this.appendWidget(element,options);
    
        element.setValue = function(value?: (number|string)[], skip_event?: boolean)
        {
            if (value == undefined) {return;}
            for (let i = 0; i < draggers.length; i++)
            {
                draggers[i].setValue(value[i],skip_event ?? i < draggers.length - 1);
            }
        };
        element.setRange = function(min: number, max: number) { for (const i in draggers) { draggers[i].setRange(min,max); } };
    
        this.processElement(element, options);
        return element;
    };
    
    /**
     * Widget to edit two numbers (it adds a dragging mini widget in the right side)
     * @method addVector2
     * @param {string | undefined} name
     * @param {[number, number] | undefined} value
     * @param {AddVectorOptions | undefined} options, here is a list for this widget (check createWidget for a list of generic options):
     * - callback: function to call once the value changes
     * - disabled: shows the widget disabled
     * - callback: function to call when the string is edited
     * - precision: number of digits after the colon
     * - units: string to show after the number
     * - min: minimum value accepted
     * - max: maximum value accepted
     * - step: increments when dragging the mouse (default is 0.1)
     * @return {InspectorNumberVectorWidget} the widget in the form of the DOM element that contains it
     *
     */
    addVector2(name?: string, value?: [number, number], options?: AddVectorOptions): InspectorNumberVectorWidget
    {
        value = value ?? [0,0];
        options = options ?? {};
        return this.addVector(name, value, options);
    };
    
    /**
     * Widget to edit three numbers (it adds a dragging mini widget in the right side)
     * @method addVector3
     * @param {string | undefined} name
     * @param {[number, number, number] | undefined} value
     * @param {AddVectorOptions | undefined} options, here is a list for this widget (check createWidget for a list of generic options):
     * - callback: function to call once the value changes
     * - disabled: shows the widget disabled
     * - callback: function to call when the string is edited
     * - precision: number of digits after the colon
     * - units: string to show after the number
     * - min: minimum value accepted
     * - max: maximum value accepted
     * - step: increments when dragging the mouse (default is 0.1)
     * @return {InspectorNumberVectorWidget} the widget in the form of the DOM element that contains it
     *
     */
    addVector3(name?: string, value?: [number, number, number], options?: AddVectorOptions): InspectorNumberVectorWidget
    {
        value = value ?? [0,0,0];
        options = options ?? {};
        return this.addVector(name, value, options);
    };
    
    /**
     * Widget to edit four numbers (it adds a dragging mini widget in the right side)
     * @method addVector4
     * @param {string | undefined} name
     * @param {[number, number, number, number] | undefined} value
     * @param {AddVectorOptions | undefined} options, here is a list for this widget (check createWidget for a list of generic options):
     * - callback: function to call once the value changes
     * - disabled: shows the widget disabled
     * - callback: function to call when the string is edited
     * - precision: number of digits after the colon
     * - units: string to show after the number
     * - min: minimum value accepted
     * - max: maximum value accepted
     * - step: increments when dragging the mouse (default is 0.1)
     * @return {InspectorNumberVectorWidget} the widget in the form of the DOM element that contains it
     *
     */
    addVector4(name?: string, value?: [number, number, number, number], options?: AddVectorOptions): InspectorNumberVectorWidget
    {
        value = value ?? [0,0,0,0];
        options = options ?? {};
        return this.addVector(name, value, options);
    };
    
    /**
     * Widget to edit two numbers using a rectangular pad where you can drag horizontally and vertically a handler
     * @method addPad
     * @param {string | undefined} name
     * @param {[number, number] | undefined} value
     * @param {addPadOptions | undefined} options, here is a list for this widget (check createWidget for a list of generic options):
     * - callback: function to call once the value changes
     * - disabled: shows the widget disabled
     * - callback: function to call when the string is edited
     * - precision: number of digits after the colon
     * - units: string to show after the number
     * - min: minimum value accepted
     * - minX: minimum x value accepted
     * - minY: minimum y value accepted
     * - max: maximum value accepted
     * - maxX: maximum x value accepted
     * - maxY: maximum y value accepted
     * - step: increments when dragging the mouse (default is 0.1)
     * - background: url of image to use as background (it will be stretched)
     * @return {InspectorPadWidget} the widget in the form of the DOM element that contains it
     *
     */
    addPad(name?: string, value?: [number, number], options?: AddPadOptions): InspectorPadWidget
    {
        const that = this;
        value = value ?? [0,0];
        options = options ?? {};
		const valueName = this.getValueName(name, options);
        this.values.set(valueName, value);
    
        const element = this.createWidget(name,"", options) as InspectorPadWidget;
    
        options.step = options.step || 0.1;
        options.tab_index = this.tab_index;
        options.full = true;
        this.tab_index++;
    
        const min_x = options.min_x ?? options.min ?? 0;
        const min_y = options.min_y ?? options.min ?? 0;
        const max_x = options.max_x ?? options.max ?? 1;
        const max_y = options.max_y ?? options.max ?? 1;
    
        const wcontent = element.querySelector(".wcontent") as HTMLElement;
    
        const pad = document.createElement("div") as HTMLDivElement;
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

        function mouseDown(e: MouseEvent)
        {
            e.preventDefault();
            e.stopPropagation();

            document.body.addEventListener("mousemove", mouseMove);
            document.body.addEventListener("mouseup", mouseUp);
            dragging = true;
        }

        function mouseMove(e: MouseEvent)
        {
            const b = pad.getBoundingClientRect();
            
            const mouse_x = e.pageX - b.left;
            const mouse_y = e.pageY - b.top;
            e.preventDefault();
            e.stopPropagation();

            let x = mouse_x / (b.width);
			let y = mouse_y / (b.height);

			x = x * (max_x - min_x) + min_x;
			y = y * (max_y - min_y) + min_x;

			const r = [x,y] as [number,number];

			LiteGUI.trigger(element, "wbeforechange", [r]);
			element.setValue(r);

			if (options!.callback)
			{
				const new_val = options!.callback.call(element, r);
				if (new_val && new_val.length >= 2)
				{
					element.setValue(new_val);
				}
			}

			LiteGUI.trigger(element, "wchange",[r]);
			if (that.onchange) {that.onchange(valueName,r,element);}
        }

        function mouseUp(e: MouseEvent)
        {
            e.preventDefault();
            e.stopPropagation();

            dragging = false;
            document.body.removeEventListener("mousemove", mouseMove);
            document.body.removeEventListener("mouseup", mouseUp);
        }

        pad.addEventListener("mousedown", mouseDown);
    
        element.setValue = function(value?: [number, number])
        {
            if (value == undefined) {return;}
    
            const b = pad.getBoundingClientRect();
            let x = (value[0] - min_x) / (max_x - min_x);
            let y = (value[1] - min_y) / (max_y - min_y);
            x = Math.max(0, Math.min(x, 1)); // Clamp
            y = Math.max(0, Math.min(y, 1));

            const w = ((b.width - 10) / b.width) * 100;
            const h = ((b.height - 10) / b.height) * 100;
            handler.style.left = (x * w).toFixed(1) + "%";
            handler.style.top = (y * h).toFixed(1) + "%";
        };
    
        this.appendWidget(element,options);    
        element.setValue(value);    
        this.processElement(element, options);

        return element;
    };
    
    /**
     * Widget to show plain information in HTML (not interactive)
     * @method addInfo
     * @param {string | undefined} name
     * @param {string | undefined} value HTML code
     * @param {AddInfoOptions | undefined} options, here is a list for this widget (check createWidget for a list of generic options):
     * - className: to specify a classname of the content
     * - height: to specify a height
     * @return {InspectorInfoWidget} the widget in the form of the DOM element that contains it
     *
     */
    addInfo(name?: string, value?: string, options?: AddInfoOptions): InspectorInfoWidget
    {
        value = value ?? '';
        options = options ?? {};
        let element:InspectorInfoWidget | undefined = undefined;
        if (name !== undefined)
        {
			element = this.createWidget(name, value, options) as InspectorInfoWidget;
		}
        else
        {
            element = document.createElement("div") as InspectorInfoWidget;
            if (options.className) {element.className = options.className;}

            element.innerHTML = "<span class='winfo'>"+value+"</span>";
        }
    
        const info:HTMLElement = element.querySelector(".winfo") ?? element.querySelector(".wcontent") as HTMLElement;
    
        if (options.callback) {element.addEventListener("click",options.callback.bind(element));}
    
        element.setValue = function(value?: string)
        {
            if (value == undefined) {return;}
            if (info) {info.innerHTML = value;}
        };
    
        let content = element.querySelector("span.info_content") as HTMLElement;
        if (!content) {content = element.querySelector(".winfo") as HTMLElement;}
		element.content = content;
    
        if (options.width)
        {
            element.style.width = LiteGUI.sizeToCSS(options.width) ?? '0';
            element.style.display = "inline-block";
            if (!name) {info.style.margin = "2px";}
        }
        if (options.height)
        {
            content.style.height = LiteGUI.sizeToCSS(options.height) ?? '0';
            content.style.overflow = "auto";
        }
    
        element.scrollToBottom = function()
        {
            content.scrollTop = content.offsetTop;
        };
    
        element.add = function(e: Node)
        {
            content.appendChild(e);
        };

        this.appendWidget(element, options);
        this.processElement(element, options);
        return element;
    };
    
    /**
     * Widget to edit a number using a slider
     * @method addSlider
     * @param {string | undefined} name
     * @param {number | undefined} value
     * @param {Object | undefined} options, here is a list for this widget (check createWidget for a list of generic options):
     * - min: min value
     * - max: max value
     * - step: increments when dragging
     * - callback: function to call once the value changes
     * @return {InspectorSliderWidget} the widget in the form of the DOM element that contains it
     *
     */
    addSlider(name?: string, value?: number, options?: AddSliderOptions): InspectorSliderWidget
    {
        const that = this;
        value = value ?? 0;
        options = options ?? {};
		options.min = options.min ?? 0;
		options.max = options.max ?? 1;
		options.step = options.step || 0.01;
		const valueName = this.getValueName(name, options);
        this.values.set(valueName, value);
    
        const element = this.createWidget(name,
            "<span class='inputfield full'>\n<input tabIndex='" + this.tab_index +
            "' type='text' class='slider-text fixed liteslider-value' value='' /><span class='slider-container'></span></span>",
            options) as InspectorSliderWidget;
    
        const slider_container = element.querySelector(".slider-container") as HTMLElement;
    
        const slider = new LiteGUI.Slider(value,options);
		element.slider = slider;
        slider_container.appendChild(slider.root);
    
        // Text change -> update slider
        const skip_change = false; // Used to avoid recursive loops
        const text_input = element.querySelector(".slider-text") as HTMLInputElement;
        text_input.value = value.toString();
        text_input.addEventListener('change', () =>
        {
            if (skip_change) {return;}
            const v = parseFloat(text_input.value);
            value = v;
            slider.setValue(v);
            this.onWidgetChange.call(that,element,valueName,v, options!);
        });
    
        // Slider change -> update Text
        slider.onChange = (value: number) =>
        {
            text_input.value = value.toString();
            this.onWidgetChange.call(that, element, valueName, value, options!);
        };
    
        this.appendWidget(element, options);
    
        element.setValue = function(v?: number, skip_event?: boolean)
        {
            if (v === undefined) {return;}
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
    addCheckbox(name: string, value: boolean, options?: AddCheckboxOptions): InspectorCheckboxWidget
    {
        const that = this;
        value = value ?? false;
        options = options ?? {};
		const valueName = this.getValueName(name, options);
        this.values.set(valueName, value);
    
        const label_on = options.label_on ?? options.label ?? "on";
        const label_off = options.label_off ?? options.label ?? "off";
        const label = (value ? label_on : label_off);
    
        // Var element = this.createWidget(name,"<span class='inputfield'><span class='fixed flag'>"+(value ? "on" : "off")+"</span><span tabIndex='"+this.tab_index+"'class='checkbox "+(value?"on":"")+"'></span></span>", options );
        const element = this.createWidget(name,"<span class='inputfield'><span tabIndex='"
			+this.tab_index+"' class='fixed flag checkbox "+(value ? "on" : "off")+"'>"+label+
			"</span></span>", options) as InspectorCheckboxWidget;
        this.tab_index++;
    
        const checkbox = element.querySelector(".wcontent .checkbox") as HTMLElement;
        checkbox.addEventListener("keypress", (e: any) =>
        {
            if (e.keyCode == 32) { LiteGUI.trigger(checkbox, "click"); }
        });
    
        element.addEventListener("click", () =>
        {
            value = !value;
            element.querySelector("span.flag")!.innerHTML = value ? label_on : label_off;
            if (value)
            {
                checkbox.classList.add("on");
            }
            else
            {
                checkbox.classList.remove("on");
            }
            this.onWidgetChange.call(that,element,valueName,value, options!);
        });
    
        element.getValue = function()
        {
            return value;
        };
    
        element.setValue = (v?: boolean, skip_event?: boolean)=>
        {
            if (v === undefined) {return;}
			if (value != v)
			{
				value = v;
				this.values.set(valueName, v);
				if (!skip_event)
				{
					LiteGUI.trigger(checkbox, "click");
				}
			}
        };
    
        this.appendWidget(element,options);
        this.processElement(element, options);
        return element;
    };
    
    /**
     * Widget to edit a set of boolean values using checkboxes
     * @method addFlags
     * @param {{[key:string]:boolean}} value object that contains all the booleans
     * @param {{[key:string]:(boolean | undefined)}} force_flags object with extra flags to insert
     * @param {{AddCheckboxOptions | AddFlagsOptions}} options The options to set the checkboxes to
     * @return {InspectorCheckboxWidget[]} the widgets in the form of the DOM element that contains it
     *
     */
    addFlags(flags: {[key:string]:boolean}, force_flags?: {[key:string]:(boolean | undefined)},
		options?: AddCheckboxOptions | AddFlagsOptions): InspectorCheckboxWidget[]
    {
		options = options ?? {};
        const f:{[key:string]:boolean} = {};
        for (const i in flags)
        {
            f[i] = flags[i];
        }
        if (force_flags)
        {
            for (const i in force_flags)
            {
                if (typeof f[i] == "undefined")
                {
                    f[i] = force_flags[i] ?? false;
                }
            }
        }
		let defaultOpt:AddCheckboxOptions | undefined = undefined;
		if (options.hasOwnProperty('default'))
		{
			defaultOpt = (options as AddFlagsOptions).default;
		}
		const result:InspectorCheckboxWidget[] = [];
        for (const i in f)
        {
			let opt:AddCheckboxOptions | undefined = undefined;
			if (options.hasOwnProperty(i))
			{
				opt = (options as AddFlagsOptions)[i];
			}
			else if (defaultOpt)
			{
				opt = defaultOpt;
			}
			else
			{
				opt = options as AddCheckboxOptions;
			}

            const flag_options:AddCheckboxOptions = {};
            for (const j in opt)
            {
                (flag_options as any)[j] = (opt as any)[j];
            }
    
            flag_options.callback = function(v: boolean)
			{
				flags[i] = v;
			};
    
            result.push(this.addCheckbox(i, f[i], flag_options));
        }
		return result;
    };
    
    /**
     * Widget to edit an enumeration using a combobox
     * @method addCombo
     * @param {string | undefined} name
     * @param {string | undefined} value
     * @param {AddComboOptions | undefined} options, here is a list for this widget (check createWidget for a list of generic options):
     * - values: a list with all the possible values, it could be an array, or an object, in case of an object, the key is the string to show, the value is the value to assign
     * - disabled: true to disable
     * - callback: function to call once an items is clicked
     * @return {InspectorComboWidget} the widget in the form of the DOM element that contains it
     *
     */
    addCombo(name?: string, value?: string, options?: AddComboOptions): InspectorComboWidget
    {    
        const that = this;
        value = value ?? '';
        options = options ?? {};
		const valueName = this.getValueName(name, options);
        this.values.set(valueName, value);
    
        this.tab_index++;
    
		const isDisabledText = options.disabled ? "disabled" : "";
        const element = this.createWidget(name,"<span class='inputfield full inputcombo " +
			isDisabledText + "'></span>", options) as InspectorComboWidget;
        element.options = options;
    
        let values: string[] = options.values ?? [];
    
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
    
        const code = "<select tabIndex='"+this.tab_index+"' "+isDisabledText+" class='"+isDisabledText+"'></select>";
        element.querySelector("span.inputcombo")!.innerHTML = code;
        setValues(values);
    
        let stop_event = false; // Used internally
    
        const select = element.querySelector(".wcontent select") as HTMLSelectElement;
        select.addEventListener("change", (e: Event) =>
        {
            const v = (e.target as HTMLSelectElement).value;
            value = v;
            if (stop_event) {return;}
            this.onWidgetChange.call(that,element,valueName,value, options!);
        });
    
        element.getValue = function()
        {
            return value;
        };
    
        element.setValue = function(v: string, skip_event?: boolean)
        {
            value = v;
            const select = element.querySelector("select") as HTMLSelectElement;
            const items = select.querySelectorAll("option");
            const index = values.indexOf(v) ?? -1;
            if (index == -1) {return;}
    
            stop_event = skip_event ?? false;
    
            for (const i in items)
            {
                const item = items[i];
                if (!item || !item.dataset) {continue;}
				const setIndex = item.dataset['index'];
                if (setIndex && parseFloat(setIndex) == index)
                {
                    item.selected = true;
                    select.selectedIndex = index;
                }
                else
                {
					item.removeAttribute("selected");
				}
            }
    
            stop_event = false;
        };
    
        function setValues(v: string[], selected?: string)
        {
            values = v;
            if (selected) {value = selected;}
            let code = "";
            for (const i in values)
            {
                code += "<option value='"+i+"' "+(values[i] == value ? " selected":"")+" data-index='"+i+"'>" + values[i] + "</option>";
            }
            element.querySelector("select")!.innerHTML = code;
        }
    
        element.setOptionValues = setValues;
    
        this.appendWidget(element,options);
        this.processElement(element, options);
        return element;
    };
    
    /**
     * Widget with an array of buttons that return the name of the button when pressed and remains selected
     * @method addComboButtons
     * @param {string | undefined} name
     * @param {string | undefined} value
     * @param {AddComboOptions | undefined} options, here is a list for this widget (check createWidget for a list of generic options):
     * - values: a list with all the possible values, it could be an array, or an object, in case of an object, the key is the string to show, the value is the value to assign
     * - disabled: true to disable
     * - callback: function to call once an items is clicked
     * @return {InspectorComboButtonsWidget} the widget in the form of the DOM element that contains it
     *
     */
    addComboButtons(name?: string, value?: string, options?: AddComboOptions): InspectorComboButtonsWidget
    {    
		const that = this;
        value = value ?? '';
        options = options ?? {};
		const valueName = this.getValueName(name, options);
        this.values.set(valueName, value);
    
        let code = "";
        if (options.values)
        {
            for (const i in options.values)
            {
                code += "<button class='wcombobutton "+(value == options.values[i] ? "selected":"")+"' data-name='options.values[i]'>" + options.values[i] + "</button>";
            }
        }
    
        const element = this.createWidget(name,code, options) as InspectorComboButtonsWidget;
        const buttons = element.querySelectorAll(".wcontent button") as NodeListOf<HTMLButtonElement>;
		element.buttons = buttons;
        LiteGUI.bind(buttons, "click", (e: Event) =>
        {
            const el = e.target as HTMLElement;
            const buttonName = el.innerHTML;
            that.values.set(valueName, buttonName);
    
            const elements = element.querySelectorAll(".selected");
            for (let i = 0; i < elements.length; ++i)
            {
                elements[i].classList.remove("selected");
            }
            el.classList.add("selected");
    
            this.onWidgetChange.call(that,element,valueName,buttonName, options!);
        });
    
        this.appendWidget(element,options);
        this.processElement(element, options);
        return element;
    };
    
    /**
     * Widget with an array of buttons that return the name of the button when pressed and remains selected
     * @method addTags
     * @param {string | undefined} name
     * @param {string[] | undefined} value
     * @param {AddTagOptions | undefined} options, here is a list for this widget (check createWidget for a list of generic options):
     * - values: a list with all the possible values, it could be an array, or an object, in case of an object, the key is the string to show, the value is the value to assign
     * - disabled: true to disable
     * - callback: function to call once an items is clicked
     * @return {InspectorComboWidget} the widget in the form of the DOM element that contains it
     *
     */
    addTags(name?: string, value?: string[], options?: AddTagOptions)
    {
        const that = this;
        value = value ?? [];
        options = options ?? {};
		const valueName = this.getValueName(name, options);
        this.values.set(valueName, value);

        let code = "<select>";
        if (options.values)
        {
            for (const i in options.values)
            {
				code += "<option>" + options.values[i] + "</option>";
			}
        }
    
        code += "</select><div class='wtagscontainer inputfield'></div>";
    
        const element = this.createWidget(name,"<span class='inputfield full'>"+code+"</span>", options) as InspectorTagsWidget;
        element.tags = {};
    
        // Add default tags
        if(options.default_tags)
		{
            for (const i in options.default_tags)
            {
				inner_add_tag(options.default_tags[i]);
			}
        }
    
        // Combo change
        const select_element = element.querySelector(".wcontent select") as HTMLSelectElement;
        select_element.addEventListener("change", (e: any) =>
        {
            inner_add_tag(e.target.value);
        });
    
        function inner_add_tag(tagname: string)
        {
            if (element.tags[tagname]) {return;} // Avoid repeated tags
    
            LiteGUI.trigger(element, "wbeforechange", element.tags);
    
            element.tags[tagname] = true;
    
            const tag = document.createElement("div") as HTMLDivElementPlus;
            tag.data = tagname;
            tag.className = "wtag";
            tag.innerHTML = tagname+"<span class='close'>X</span>";
    
            tag.querySelector(".close")!.addEventListener("click", (e: any) =>
            {
                const tagname = tag.data;
                delete element.tags[tagname];
                LiteGUI.remove(tag);
                LiteGUI.trigger(element, "wremoved", tagname);
                that.onWidgetChange.call(that,element,valueName,element.tags, options!);
            });
    
            element.querySelector(".wtagscontainer")!.appendChild(tag);
    
            that.values.set(valueName, element.tags);
            if (options!.callback) {options!.callback.call(element, element.tags);}
            LiteGUI.trigger(element, "wchange", element.tags);
            LiteGUI.trigger(element, "wadded", tagname);
            if (that.onchange) {that.onchange(valueName, element.tags, element);}
        }
    
        this.appendWidget(element,options);
        this.processElement(element, options);
        return element;
    };
    
    /**
     * Widget to select from a list of items
     * @method addList
     * @param {string | undefined} name
     * @param {string[] | undefined} value [Array or Object]
     * @param {AddListOptions | undefined} options, here is a list for this widget (check createWidget for a list of generic options):
     * - multiselection: allow multiple selection
     * - callback: function to call once an items is clicked
     * - selected: the item selected
     * @return {HTMLElement} the widget in the form of the DOM element that contains it
     *
     */
    addList(name?: string, values?: string[], options?: AddListOptions): InspectorListWidget
    {    
        const that = this;
        values = values ?? [];
        options = options ?? {};
		const valueName = this.getValueName(name, options);
		if (options == undefined) {options = {};}

        let list_height = "";
        if (options.height) {list_height = "style='height: 100%; overflow: auto;'";}
        // Height = "style='height: "+options.height+"px; overflow: auto;'";
    
        const code = "<ul class='lite-list' "+list_height+" tabIndex='"+this.tab_index+"'><ul>";
        this.tab_index++;
    
        const element = this.createWidget(name,"<span class='inputfield full "+
            (options.disabled?"disabled":"")+"' style='height: 100%;'>"+code+"</span>", options) as InspectorListWidget;
    
        const infoContent = element.querySelector(".info_content") as HTMLElement;
        infoContent.style.height = "100%";
    
        const list_element = element.querySelector(".lite-list");
        const inputfield = element.querySelector(".inputfield") as HTMLInputElement;
        inputfield.style.height = "100%";
        inputfield.style.paddingBottom = "0.2em";
    
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
            if (options!.multiselection)
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
            this.onWidgetChange.call(that,element,valueName!,value, options!);
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
        this.appendWidget(element,options);
    
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
            // There has to be a more efficient way to do this
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
        this.processElement(element, options);
        return element;
    };
    
    addButton(name?: string, value?: string, options?: AddButtonOptions | (()=>void))
    {    
        const that = this;
		const processedOptions = this.processOptions(options) as AddButtonOptions;
        value = processedOptions.button_text ?? value ?? "";
		name = name ?? value;
		name = this.getValueName(name, processedOptions);
    
        let button_classname = "";
        if (name == null) {button_classname = "single";}
        if (processedOptions.micro) {button_classname += " micro";}
    
        let attrs = "";
        if (processedOptions.disabled) {attrs = "disabled='disabled'";}
    
        const title = processedOptions.title?.toString() ?? "";
    
        const element = this.createWidget(name,"<button tabIndex='" +
			this.tab_index + "' "+attrs+"></button>", processedOptions) as InspectorButtonWidget;
        this.tab_index++;
        const button = element.querySelector("button") as HTMLButtonElement;
        button.setAttribute("title",title);
        button.className = "litebutton " + button_classname;
        button.innerHTML = value;
        button.addEventListener("click", (event: any) =>
        {
            this.onWidgetChange.call(that, element, name!, button.innerHTML, processedOptions, false, event);
            LiteGUI.trigger(button, "wclick", value);
        });
        this.appendWidget(element,processedOptions);
    
        element.wclick = function(callback: Function)
        {
            if (!processedOptions.disabled) {LiteGUI.bind(this, "wclick", callback);}
        };
    
        element.setValue = function(v: string)
        {
            button.innerHTML = v;
        };
    
        element.disable = function() { button.disabled = true; };
        element.enable = function() { button.disabled = false; };
    
        this.processElement(element, processedOptions);
        return element;
    };
    
    addButtons(name?: string, values?: string[], options?: addButtonOptions | (()=>void))
    {
        const that = this;
		const processedOptions = this.processOptions(options) as addButtonOptions;
		values = values ?? [];
		name = this.getValueName(name, processedOptions);
    
        let code = "";
        // Var w = "calc("+(100/value.length).toFixed(3)+"% - "+Math.floor(16/value.length)+"px);";
        const w = "calc( " + (100/values.length).toFixed(3) + "% - 4px )";
        const style = "width:"+w+"; width: -moz-"+w+"; width: -webkit-"+w+"; margin: 2px;";
        for (const i in values)
        {
            let title = "";
            if (processedOptions.title) {Array.isArray(processedOptions.title) ? title = processedOptions.title[i] : title = processedOptions.title as string}
            code += "<button class='litebutton' title='"+title+"' tabIndex='"+this.tab_index+"' style='"+style+"'>"+values[i]+"</button>";
            this.tab_index++;
        }
        
        const element = this.createWidget(name, code, processedOptions);
        const buttons = element.querySelectorAll("button");
        const buttonCallback = (button: any, evt: any) =>
        {
            this.onWidgetChange.call(that, element, name!, button.innerHTML, processedOptions, false, evt);
            LiteGUI.trigger(element, "wclick",button.innerHTML);
        };
        for (let i = 0; i < buttons.length; ++i)
        {
            const button = buttons[i];
            button.addEventListener("click", buttonCallback.bind(undefined,button));
        }
    
        this.appendWidget(element,processedOptions);
        this.processElement(element, processedOptions);
        return element;
    };
    
    addIcon(name: string, value: boolean, options?: addIconOptions)
    {		
		const processedOptions = this.processOptions(options) as addIconOptions;
        const that = this;
    
        const img_url = processedOptions.image;
        const width = processedOptions.width ?? processedOptions.size ?? 20;
        const height = processedOptions.height ?? processedOptions.size ?? 20;
    
        const element = this.createWidget(name,"<span class='icon' " +
            (processedOptions.title ? "title='"+processedOptions.title+"'" : "") +
            " tabIndex='"+ this.tab_index + "'></span>", processedOptions);
        this.tab_index++;
        const content = element.querySelector("span.wcontent");
        const icon = element.querySelector("span.icon");
    
        let x = processedOptions.x || 0;
        if (processedOptions.index)
        {x = processedOptions.index * -width;}
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
    
        icon.addEventListener("mousedown", (e: MouseEvent) =>
        {
            e.preventDefault();
            value = !value;
            const ret = this.onWidgetChange.call(that,element,name, value, processedOptions, null, null);
            LiteGUI.trigger(element, "wclick", value);
    
            if (ret !== undefined) {value = ret;}
    
            const y = value ? height : 0;
            icon.style.backgroundPosition = x + "px " + y + "px";
    
            if (processedOptions.toggle === false) // Blink
            {
				setTimeout(()=> { icon.style.backgroundPosition = x + "px 0px"; value = false; },200);
			}
    
        });
        this.appendWidget(element,options);
    
        element.setValue = (v: boolean, skip_event: boolean) =>
        {
            value = v;
            const y = value ? height : 0;
            icon.style.backgroundPosition = x + "px " + y + "px";
            if (!skip_event)
            {
				this.onWidgetChange.call(that,element,name, value, processedOptions, null, null);
			}
        };
        element.getValue = function() { return value; };
        this.processElement(element, processedOptions);
        return element;
    };
    
    addColor(name: string, value: number[], options: addColorOptions)
    {
        value = value || [0.0,0.0,0.0];
        const that = this;
        this.values.set(name, value);
    
        let code = "<input tabIndex='"+this.tab_index+"' id='colorpicker-"+name+"' class='color' value='"+(value[0]+","+value[1]+","+value[2])+"' "+(options.disabled?"disabled":"")+"/>";
        this.tab_index++;
    
        if (options.show_rgb) {code += "<span class='rgb-color'>"+Inspector.parseColor(value)+"</span>";}
        const element = this.createWidget(name,code, options);
        this.appendWidget(element,options); // Add now or jscolor dont work
    
        // Create jsColor
        const input_element = element.querySelector("input.color");
        window.jscolor = jscolor;
        let myColor: any = null;
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
            let rgb_intensity = 1.0;
    
            if (options.disabled)
            {myColor.pickerOnfocus = false;} // This doesnt work
    
            if (value.length > 2)
            {
                const intensity = 1.0;
                myColor.fromRGB(value[0]*intensity, value[1]*intensity, value[2]*intensity);
                rgb_intensity = intensity;
            }
    
            // Update values in rgb format
            input_element.addEventListener("change", () =>
            {
                const rgbelement = element.querySelector(".rgb-color");
                if (rgbelement)
                {rgbelement.innerHTML = LiteGUI.Inspector.parseColor(myColor.rgb);}
            });
            input_element.addEventListener("focusin", () =>
            {
                input_element.focused = true;
            });
            input_element.addEventListener("focusout", () =>
            {
                input_element.focused = false;
                const v = [ myColor.rgb[0] * rgb_intensity, myColor.rgb[1] * rgb_intensity,
                    myColor.rgb[2] * rgb_intensity ];
                if (options.callback)
                {
                    options.callback.call(element, v.concat(), "#" + myColor.toString(), myColor);
                }
                else if (options.on_change)
                {
                    options.on_change.call(element, v.concat(), "#" + myColor.toString(), myColor);
                }
            });
    
            if (options.add_dragger)
            {
                myColor.onImmediateChange = (dragging: boolean) =>
                {
                    const v = [ myColor.rgb[0] * rgb_intensity, myColor.rgb[1] * rgb_intensity,
                        myColor.rgb[2] * rgb_intensity ];
                    // Inspector.onWidgetChange.call(that,element,name,v, options);
                    const event_data = [v.concat(), myColor.toString()];
                    LiteGUI.trigger(element, "wbeforechange", event_data);
                    this.values.set(name, v);
                    if (options.on_change && dragging)
                    {
                        options.on_change.call(element, v.concat(), "#" + myColor.toString(), myColor);
                    }
                    else if ((options.on_change || options.callback) && !dragging)
                    {
                        if (options.callback)
                        {
                            options.callback.call(element, v.concat(), "#" + myColor.toString(), myColor);
                        }
                        else if (options.on_change)
                        {
                            options.on_change.call(element, v.concat(), "#" + myColor.toString(), myColor);
                        }
                    }
                    LiteGUI.trigger(element, "wchange", event_data);
                    if (that.onchange) {that.onchange(valueName, v.concat(), element);}
                };
    
                // Alpha dragger
                options.step = options.step || 0.01;
                options.dragger_class = "nano";
    
                const dragger = new LiteGUI.Dragger(1, options);
                element.querySelector('.wcontent').appendChild(dragger.root);
                const callOnInmediateChange = function(dragging: boolean)
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
                dragger.input.addEventListener("change", () =>
                {
                    const v = parseFloat(dragger.input.value);
                    rgb_intensity = v;
                    callOnInmediateChange(dragger.dragging);
                });
    
                element.setValue = function(value: number[], skip_event: boolean)
                {
                    myColor.fromRGB(value[0],value[1],value[2]);
                    if (!skip_event)
                    {LiteGUI.trigger(dragger.input, "change");}
                };
            }
            else
            {
                myColor.onImmediateChange = () =>
                {
                    const v = [ myColor.rgb[0] * rgb_intensity, myColor.rgb[1] *
                        rgb_intensity, myColor.rgb[2] * rgb_intensity ];
                    // Inspector.onWidgetChange.call(that,element,name,v, options);
                    const event_data = [v.concat(), myColor.toString()];
                    LiteGUI.trigger(element, "wbeforechange", event_data);
                    this.values.set(name, v);
                    if (options.on_change)
                    {
                        options.on_change.call(element, v.concat(), "#" + myColor.toString(), myColor);
                    }
                    LiteGUI.trigger(element, "wchange", event_data);
                    if (that.onchange) {that.onchange(name, v.concat(), element);}
                };
                element.setValue = function(value: number[])
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
            input_element.addEventListener("change", () =>
            {
                const rgbelement = element.querySelector(".rgb-color");
                if (rgbelement) {rgbelement.innerHTML = LiteGUI.Inspector.parseColor(myColor.rgb);}
            });
        }
    
        this.processElement(element, options);
        return element;
    };
    
    addColorPosition(name: string, value: number[], options: addColorOptions)
    {    
		
        value = value || [0.0,0.0,0.0];
        const that = this;
        this.values.set(name, value);
    
        let code = "<input tabIndex='"+this.tab_index+"' id='colorpicker-"+name+"' class='color' value='"+
            (value[0]+","+value[1]+","+value[2])+"' "+(options.disabled?"disabled":"")+"/>";
        this.tab_index++;
    
        if (options.show_rgb)
        {code += "<span class='rgb-color'>"+Inspector.parseColor(value)+"</span>";}
        const element = this.createWidget(name,code, options);
        this.appendWidget(element,options); // Add now or jscolor dont work
    
        // Create jsColor
        const input_element = element.querySelector("input.color");
        let myColor: any = null;
    
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
    
            if (value.length > 2)
            {
                myColor.fromRGB(value[0],value[1],value[2]);
            }
    
            // Update values in rgb format
            input_element.addEventListener("change", () =>
            {
                const rgbelement = element.querySelector(".rgb-color");
                if (rgbelement)
                {rgbelement.innerHTML = LiteGUI.Inspector.parseColor(myColor.rgb);}
            });
            input_element.addEventListener("focusin", () =>
            {
                input_element.focused = true;
            });
            input_element.addEventListener("focusout", () =>
            {
                input_element.focused = false;
                if (options.callback)
                {
                    options.callback.call(element, myColor.position, "#" + myColor.toString(), myColor);
                }
                else if (options.on_change)
                {
                    options.on_change.call(element, myColor.position, "#" + myColor.toString(), myColor);
                }
            });
    
            if (options.add_dragger)
            {
                myColor.onImmediateChange = function(dragging: boolean)
                {
                    const v: number[] = [ myColor.rgb[0], myColor.rgb[1], myColor.rgb[2] ];
                    // Inspector.onWidgetChange.call(that,element,name,v, options);
                    const event_data = [v.concat(), myColor.toString()];
                    LiteGUI.trigger(element, "wbeforechange", event_data);
                    this.values.set(name, v);
                    if (options.on_change && dragging)
                    {
                        options.on_change.call(element, myColor.position, "#" + myColor.toString(), myColor);
                    }
                    else if ((options.on_change || options.callback) && !dragging)
                    {
                        if (options.callback)
                        {
                            options.callback.call(element, myColor.position, "#" + myColor.toString(), myColor);
                        }
                        else if (options.on_change)
                        {
                            options.on_change.call(element, myColor.position, "#" + myColor.toString(), myColor);
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
                const callOnInmediateChange = function(dragging: boolean)
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
                dragger.input.addEventListener("change", () =>
                {
                    const v = parseFloat(dragger.input.value);
                    myColor.position = v;
                    callOnInmediateChange(dragger.dragging);
                });
    
                element.setValue = function(value: number[], skip_event: boolean)
                {
                    myColor.fromRGB(value[0],value[1],value[2]);
                    if (!skip_event)
                    {LiteGUI.trigger(dragger.input, "change");}
                };
            }
            else
            {
                myColor.onImmediateChange = () =>
                {
                    const v = [ myColor.rgb[0] * myColor.rgb_intensity, myColor.rgb[1] * myColor.rgb_intensity, myColor.rgb[2] * myColor.rgb_intensity ];
                    // Inspector.onWidgetChange.call(that,element,name,v, options);
                    const event_data = [v.concat(), myColor.toString()];
                    LiteGUI.trigger(element, "wbeforechange", event_data);
                    this.values.set(name, v);
                    if (options.on_change)
                    {options.on_change.call(element, v.concat(), "#" + myColor.toString(), myColor);}LiteGUI.trigger(element, "wchange", event_data);
                    if (that.onchange) {that.onchange(name, v.concat(), element);}
                };
                element.setValue = function(value: number[])
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
            input_element.addEventListener("change", () =>
            {
                const rgbelement = element.querySelector(".rgb-color");
                if (rgbelement)
                {rgbelement.innerHTML = LiteGUI.Inspector.parseColor(myColor.rgb);}
            });
        }
    
        this.processElement(element, options);
        return element;
    };
    
    addFile(name: string, value?: string, options?: ((data:FileAddedResponse)=>void) | addFileOptions)
    {
        const that = this;
        this.values.set(name, {name:value||""});
		const processedOptions:addFileOptions = that.processOptions(options);
    
        const element = this.createWidget(name,"<span class='inputfield full whidden' style='width: calc(100% - 26px)'><span class='filename'></span></span><button class='litebutton' style='width:20px; margin-left: 2px;'>...</button><input type='file' size='100' class='file' value='"+value+"'/>", processedOptions);
        const content = element.querySelector(".wcontent") as HTMLElement;
        content.style.position = "relative";
        const input = element.querySelector(".wcontent input") as HTMLInputElement;
        if (processedOptions.accept)
		{
			input.accept = typeof(processedOptions.accept) === "string" ? processedOptions.accept : processedOptions.accept.toString();
		}
        const filename_element = element.querySelector(".wcontent .filename") as HTMLElement;
        if (value) {filename_element.innerText = value;}
    
        input.addEventListener("change", (e: Event) =>
        {
			if(!e || !e.target) {return;}
			const target = e.target as HTMLInputElement;
			if(!target.files) {return;}
            if (!target.files.length)
            {
                // Nothing
                filename_element.innerText = "";
                this.onWidgetChange.call(that, element, name, null, processedOptions, null, null);
                return;
            }
    
            const url = null;
            // Var data = { url: url, filename: e.target.value, file: e.target.files[0], files: e.target.files };
			const result = target.files[0] as FileAddedResponse;
			result.files = target.files
            if (processedOptions.generate_url) {result.url = URL.createObjectURL(target.files[0]);}
            filename_element.innerText = result.name;
    
            if (processedOptions.read_file)
            {
                 const reader = new FileReader();
                 reader.onload = (e2: ProgressEvent<FileReader>) =>
                {
                    result.data = e2.target?.result;
                    this.onWidgetChange.call(that, element, name, result, processedOptions, null, null);
                 };
                 if (processedOptions.read_file == "binary")
                     {reader.readAsArrayBuffer(result);}
                 else if (processedOptions.read_file == "data_url")
                     {reader.readAsDataURL(result);}
                 else
                     {reader.readAsText(result);}
            }
            else
            {
                this.onWidgetChange.call(that, element, name, result, processedOptions, null, null);
            }
        });
    
        this.appendWidget(element,processedOptions);
        return element;
    };
    
    addLine(name: string, value: number[][], options: LineEditorOptions)
    {
        const that = this;
        this.values.set(name, value);
    
        const element = this.createWidget(name,"<span class='line-editor'></span>", options);
        element.style.width = "100%";
    
        const line_editor: LineEditor = new LiteGUI.LineEditor(value, options);
        element.querySelector("span.line-editor").appendChild(line_editor);
    
        LiteGUI.bind(line_editor, "change", (e: any) =>
        {
            LiteGUI.trigger(element, "wbeforechange",[e.target.value]);
            if (options.callback) {options.callback.call(element,e.target.value);}
            LiteGUI.trigger(element, "wchange",[e.target.value]);
            this.onWidgetChange.call(that,element,name,e.target.value, options, null, null);
        });
    
        this.appendWidget(element,options);
        return element;
    };
    
    addTree(name: string, value: TreeNode, options: addTreeOptions)
    {
        const element = this.createWidget(name,"<div class='wtree inputfield full'></div>", options);
    
        const tree_root = element.querySelector(".wtree");
        if (options.height)
        {
            tree_root.style.height = typeof(options.height) == "number" ? options.height + "px" : options.height;
            tree_root.style.overflow = "auto";
        }
    
        const tree = element.tree = new LiteGUI.Tree(value, options.tree_options);
        tree.onItemSelected = function(node: any, data: any)
        {
            if (options.callback)
            {options.callback.call(element, node, data);}
        };
    
        tree_root.appendChild(tree.root);
    
        element.setValue = function(v: TreeNode)
        {
            tree.updateTree(v);
        };
    
        this.appendWidget(element,options);
        this.processElement(element, options);
        return element;
    };
    
    addDataTree(name: string, value: string[], options?: CreateWidgetOptions)
    {
        const element = this.createWidget(name,"<div class='wtree'></div>", options);
    
        const node: Element | Node = element.querySelector(".wtree");
    
        inner_recursive(node,value);
    
        function inner_recursive(root_node: Element | Node, value: string[] | string[][])
        {
            for (const i in value)
            {
                const e = document.createElement("div");
                e.className = "treenode";
                if (typeof(value[i]) == "object")
                {
                    e.innerHTML = "<span class='itemname'>" + i + "</span><span class='itemcontent'></span>";
                    inner_recursive(e.querySelector(".itemcontent")!, value[i] as string[]);
                }
                else
                {e.innerHTML = "<span class='itemname'>" + i + "</span><span class='itemvalue'>" + value[i] + "</span>";}
                root_node.appendChild(e);
            }
        }
    
        this.appendWidget(element,options);
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
    addArray(name: string, value: Array<number>, options: AddArrayOptions)
    {
        const that = this;
    
        const type = options.data_type || "string";
        const max_items = options.max_items || 100;
        let container: any = null;
    
        // Length widget
        this.widgets_per_row = 3;
        this.addInfo(name, undefined,{ name_width: "100%", width: "100% - 160px"});
        const length_widget = this.addString("length", value.length.toString() || "0", { width: 100, callback: (v: any) =>
        {
            const rv = parseInt(v);
            //if (value < 0) {value = 0;}
            value.length = rv;
            refresh.call(container, null);
        }});
    
        this.addButtons(null, ["+","-"], { width: 60, callback: function(v: any)
        {
            if (v == "+")
            {value.length = value.length + 1;}
            else if (value.length > 0)
            {value.length = value.length - 1;}
            length_widget.setValue(value.length);
            refresh.call(container, null);
        }});
    
        this.widgets_per_row = 1;
        container = this.addContainer(name, options);
        container.value = value;
    
        const assign = function(a: any, v: any)
        {
            a.value[ a.index ] = v;
            if (options.callback) {options.callback.call(container, a.value, a.index);}
            // Todo: trigger change
        };
    
        const refresh = function(container: any)
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
                row.innerHTML = "<span class='row-index'>" + i +
                    "</span><span class='row-cell'></span><button style='width: 30px;' class='litebutton single row-trash'><img src='imgs/mini-icon-trash.png'/></button>";
                container.appendChild(row);
    
                const widget_row_container = row.querySelector('.row-cell');
    
                const item_options: any = { widget_parent: widget_row_container,
                        callback: assign.bind(undefined,{value: container.value, index: i}) };
                if (options.data_options)
                {
                    for (const j in options.data_options)
                    {item_options[j] = options.data_options[j];}
                }
                const w = that.add(type, "", v, item_options);
    
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
    
        container.setValue = function(v: number)
        {
            this.value = v;
            refresh(container);
        };
    
        container.getValue = function()
        {
            return this.value;
        };
    
        // This.appendWidget(element,options);
        return container;
    };
    
    //* **** Containers ********/
    // Creates an empty container but it is not set active
    addContainer(name?: string, options?: containerOptions)
    {
        if (typeof name != 'string')
        {
            console.warn("LiteGUI.Inspector.addContainer first parameter must be a string with the name");
			name = '';
        }
		options = options ?? {};
        const element = this.startContainer(options);
        this.endContainer();
        return element;
    };
    
    // Creates an empty container and sets its as active
    startContainer(options: containerOptions)
    {
        const element = document.createElement("DIV") as HTMLDivElementPlus;
        element.className = "wcontainer";
        this.applyOptions(element, options);
        this.row_number = 0;
    
        this.appendWidget(element);
        this.pushContainer(element);
    
        if (options.widgets_per_row)
        {this.widgets_per_row = options.widgets_per_row;}
    
        if (options.height)
        {
            element.style.height = LiteGUI.sizeToCSS(options.height)!;
            element.style.overflow = "auto";
        }
    
        element.refresh = function()
        {
            if (element.on_refresh) {element.on_refresh.call(this, element);}
        };
    
        return element;
    };
    
    endContainer()
    {
        this.popContainer();
    };
    
    // It is like a group but they cant be nested inside containers
    addSection(name?: string, options?: InspectorOptions)
    {
        const that = this;
		if (options == undefined) {options = {};}
        if (this.current_section) {this.current_section.end();}
    
        const element = document.createElement("DIV") as InspectorSection;
        element.className = "wsection";
        if (!name) {element.className += " notitle";}
        if (options.className) 
        {
            element.className += " " + options.className;
        }
        if (options.collapsed && !options.no_collapse) 
        {
            element.className += " collapsed";
        }
    
        if (options.id) 
        {
            element.id = options.id ?? "";
        }
        if (options.instance) 
        {
            element.instance = options.instance ?? {};
        }
    
        let code = "";
        if (name)
        {
            code += "<div class='wsectiontitle'>"+(options.no_collapse ? "" :
                "<span class='switch-section-button'></span>")+name+"</div>";
        }
        code += "<div class='wsectioncontent'></div>";
        element.innerHTML = code;
    
        // Append to inspector
        element._last_container_stack = this._current_container_stack.concat();
        // This.appendWidget( element ); //sections are added to the root, not to the current container
        this.root.appendChild(element);
        this.sections.push(element);
    
        element.sectionTitle = element.querySelector(".wsectiontitle")!;
    
        if (name && !options.no_collapse)
        {
            element.sectionTitle?.addEventListener("click", (e: any) =>
            {
                if (e.target.localName == "button") {return;}
                element.classList.toggle("collapsed");
                const seccont: HTMLElementPlus = element.querySelector(".wsectioncontent")!;
                seccont.style.display = seccont.style.display === "none" ? "" : "none";
                if (options.callback)
                {
                    options.callback.call(element, element.classList.contains("collapsed"));
                }
            });
        }
    
        if (options.collapsed && !options.no_collapse)
        {
            (element!.querySelector(".wsectioncontent") as HTMLElementPlus)!.style.display = "none";
        }
    
        this.setCurrentSection(element);
    
        if (options.widgets_per_row)
        {
            this.widgets_per_row = options.widgets_per_row;
        }
    
        element.refresh = function()
        {
            if (element.on_refresh) 
            {
                element.on_refresh.call(this, element);
            }
        };
    
        element.end = function()
        {
            if (that.current_section != this) {return;}
    
            that._current_container_stack = this._last_container_stack!;
            that._current_container = null;
    
            const content = this.querySelector(".wsectioncontent");
            if (!content) {return;}
            if (that.isContainerInStack(content)) {that.popContainer(content);}
            that.current_section = undefined;
        };
    
        return element;
    };
    
    // Change current section (allows to add widgets to previous sections)
    setCurrentSection(section: any)
    {
        if (this.current_section == section) {return;}
    
        this.current_section = section;
    
        const parent = section.parentNode;
        this.popContainer(parent); // Go back till that container
    
        const content = section.querySelector(".wsectioncontent");
        this.pushContainer(content);
    };
    
    getCurrentSection()
    {
        for (let i = this._current_container_stack.length - 1; i >= 0; --i)
        {
            const container = this._current_container_stack[i];
            if (container.classList.contains("wsectioncontent"))
            {return container.parentNode;}
        }
        return null;
    };
    
    endCurrentSection()
    {
        if (this.current_section) {this.current_section.end();}
    };
    
    // A container of widgets with a title
    beginGroup(name?: string, options?: beginGroupOptions)
    {
        const element = document.createElement("DIV") as InspectorWidget;
        element.className = "wgroup";
        name = name ?? "";
        element.innerHTML = "<div class='wgroupheader "+ (options.title ? "wtitle" : "") +"'><span class='switch-section-button'></span>"+name+"</div>";
        element.group = true;
    
        const content = document.createElement("DIV") as InspectorWidget;
        content.className = "wgroupcontent";
        if (options.collapsed) {content.style.display = "none";}
    
        if (options.height) {content.style.height = LiteGUI.sizeToCSS(options.height)!;}
        if (options.scrollable) {content.style.overflow = "auto";}
    
        element.appendChild(content);
    
        let collapsed = options.collapsed ?? false;
        const header = element.querySelector(".wgroupheader");
        if (collapsed) {header!.classList.add("collapsed");}
        header!.addEventListener("click", (e: any) =>
        {
            const style = (element.querySelector(".wgroupcontent") as HTMLElement).style;
            style.display = style.display === "none" ? "" : "none";
            collapsed = !collapsed;
            if (collapsed)
            {
                header!.classList.add("collapsed");
            }
            else
            {
                header!.classList.remove("collapsed");
            }
            // Element.querySelector(".switch-section-button").innerHTML = (collapsed ? "+" : "-");
            e.preventDefault();
        });
    
        this.appendWidget(element, options);
        this.pushContainer(content);
        return element;
    };
    
    endGroup()
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
    addTitle(title: string, options?: addTitleOptions)
    {
		options = this.processOptions(options);
        const element = document.createElement("DIV") as InspectorWidget;
        let code = "<span class='wtitle'><span class='text'>"+title+"</span>";
        if (options.help)
        {
            code += "<span class='help'><div class='help-content'>"+options.help+"</div></span>";
        }
        code += "</span>";
        element.innerHTML = code;
        element.setValue = function(v: string)
        {
            const tempo = this.querySelector(".text");
            if(tempo) tempo.innerHTML = v;
        };
        this.row_number = 0;
        this.appendWidget(element, options);
        return element;
    };
    
    
    scrollTo(id: string)
    {
        const element = this.root.querySelector("#" + id) as HTMLElementPlus;
        if (!element) {return;}
        const top = this.root.offsetTop;
        const delta = element.offsetTop - top;
        (this.root.parentNode!.parentNode! as ParentNodePlus).scrollTop = delta;
    };
    
    processOptions(options: any | Function | undefined): {}
    {
        return typeof(options) === 'function' ? {callback: options} : options ?? {};
    };
    
    processElement(element: any, options: ProcessElementOptions)
    {
        if (options.callback_update && element.setValue)
        {
            element.on_update = function()
            {
                this.setValue(options.callback_update!.call(this), true);
            };
        }
    };
    
    updateWidgets()
    {
        for (let i = 0; i < this.widgets.length; ++i)
        {
            const widget = this.widgets[i];
            if (widget.on_update) {widget.on_update(widget);}
        }
    };
    
    public static parseColor(color: [number, number, number])
    {
        return "<span style='color: #FAA'>" + color[0].toFixed(2) +
            "</span>,<span style='color: #AFA'>" + color[1].toFixed(2) +
            "</span>,<span style='color: #AAF'>" + color[2].toFixed(2) + "</span>";
    };
}