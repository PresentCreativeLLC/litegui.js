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
	AddTagOptions,
	AddListOptions,
	InspectorListWidget,
	AddButtonOptions,
	AddArrayOptions} from "./@types/Inspector";
import { HTMLDivElementPlus,
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
	TreeNode,
	FileAddedResponse} from "./@types/globals";
import { LiteGUI } from "./core";
import { purgeElement } from "./core";
import { AddButton, AddButtons } from "./inspector/button";
import { AddCheckbox } from "./inspector/checkbox";
import { AddColor } from "./inspector/color";
import { AddColorPosition } from "./inspector/colorPosition";
import { AddCombo } from "./inspector/combo";
import { AddComboButtons } from "./inspector/comboButtons";
import { AddFile } from "./inspector/file";
import { AddFlags } from "./inspector/flag";
import { AddIcon } from "./inspector/icon";
import { AddInfo } from "./inspector/info";
import { AddList } from "./inspector/list";
import { AddNumber } from "./inspector/number";
import { AddPad } from "./inspector/pad";
import { AddSlider } from "./inspector/slider";
import { AddString } from "./inspector/string";
import { AddStringButton } from "./inspector/stringButton";
import { AddTags } from "./inspector/tags";
import { AddTextArea } from "./inspector/textArea";
import { AddVector } from "./inspector/vector";
import { jscolor } from "./jscolor";
import { LineEditor } from "./widgets";

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
		return AddString(this, name, value, options);
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
        return AddStringButton(this, name, value, options);
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
		return AddTextArea(this, name, value, options);
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
		return AddNumber(this, name, value, options);
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
        return AddVector(this, name, value, options);
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
        return AddVector(this, name, value, options);
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
        return AddVector(this, name, value, options);
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
        return AddVector(this, name, value, options);
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
        return AddPad(this, name, value, options);
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
        return AddInfo(this, name, value, options);
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
        return AddSlider(this, name, value, options);
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
		return AddCheckbox(this, name, value, options);
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
		return AddFlags(this, flags, force_flags, options);
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
        return AddCombo(this, name, value, options);
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
		return AddComboButtons(this, name, value, options);
    };
    
    /**
     * Widget with an array of buttons that return the name of the button when pressed and remains selected
     * @method addTags
     * @param {string | undefined} name
     * @param {string[] | undefined} value String array of values
     * @param {AddTagOptions | undefined} options, here is a list for this widget (check createWidget for a list of generic options):
     * - values: a list with all the possible values, it could be an array, or an object, in case of an object, the key is the string to show, the value is the value to assign
     * - disabled: true to disable
     * - callback: function to call once an items is clicked
     * @return {InspectorComboWidget} the widget in the form of the DOM element that contains it
     *
     */
    addTags(name?: string, value?: string[], options?: AddTagOptions)
    {
        return AddTags(this, name, value, options);
    };
    
    /**
     * Widget to select from a list of items
     * @method addList
     * @param {string} [name]
     * @param {string[]} [value] String array of values
     * @param {AddListOptions} [options] here is a list for this widget (check createWidget for a list of generic options):
     * - multiselection: allow multiple selection
     * - callback: function to call once an items is clicked
     * - selected: the item selected
     * @return {InspectorListWidget} the widget in the form of the DOM element that contains it
     *
     */
    addList(name?: string, values?: string[], options?: AddListOptions): InspectorListWidget
    {    
        return AddList(this, name, values, options);
    };
    
    /**
     * Creates an HTML button widget with optional name, value, and options.
	 * @method addButton
	 *
     * @param {string} [name] - The name of the button.
     * @param {string} [value] - The value of the button.
     * @param {AddButtonOptions | (() => void)} [options] - The options for the button.
     * @returns {InspectorButtonWidget} - The created button widget element.
     */
    addButton(name?: string, value?: string, options?: AddButtonOptions | (()=>void))
    {    
        return AddButton(this, name, value, options);
    };

	/**
	 * Creates an HTML buttons widget with optional name, value, and options.
	 * @method addButtons
	 *
	 * @param {string} [name] - The name of the buttons.
	 * @param {string[]} [values] - The values to be displayed on the buttons.
	 * @param {AddButtonOptions | (() => void)} [options] - The options for the buttons.
	 * @returns {HTMLElement} - The element containing the buttons.
	 */
    addButtons(name?: string, values?: string[], options?: AddButtonOptions | (()=>void))
    {
        return AddButtons(this, name, values, options);
    };

	/**
	 * Creates an HTML buttons widget with optional name, value, and options.
	 * @method addButtons
	 *
	 * @param {string} [name] - The name of the buttons.
	 * @param {string[]} [values] - The values to be displayed on the buttons.
	 * @param {AddButtonOptions | (() => void)} [options] - The options for the buttons.
	 * @returns {InspectorButtonWidget} - The element containing the buttons.
	 */
    addIcon(name?: string, value?: boolean, options?: addIconOptions)
    {		
		return AddIcon(this, name, value, options);
    };
    
	/**
	 * Adds a color input widget to the Inspector.
	 * @method addColor
	 *
	 * @param {string} name - The name of the color input.
	 * @param {number[]} [value=[0.0, 0.0, 0.0]] - The initial RGB value of the color input.
	 * @param {AddColorOptions} [options] - Additional options for the color input.
	 * @returns {InspectorWidget} The created color input widget.
	 */
    addColor(name: string, value?: [number, number, number], options?: addColorOptions)
    {
        return AddColor(this, name, value, options);
    };
    
	/**
	 * Creates a color picker widget with optional dragger and RGB display.
	 * @method addColorPosition
	 *
	 * @param {string} name - The name of the color picker.
	 * @param {Array<number>} [value=[0.0,0.0,0.0]] - The initial RGB value of the color picker.
	 * @param {addColorOptions} [options] - Additional options for the color picker.
	 * @returns The created color picker element.
	 */
    addColorPosition(name: string, value: [number, number, number], options: addColorOptions)
    {    
		return AddColorPosition(this, name, value, options);
    };
    
	/**
	 * Adds a file input widget to the inspector with the specified name, value, and options.
	 * @method addFile
	 *
	 * @param {string} name - The name of the file input widget.
	 * @param {string} [value] - The initial value of the file input widget.
	 * @param {((data: FileAddedResponse) => void) | AddFileOptions} [options] - The options for the file input widget.
	 * @returns The created file input widget element.
	 */
    addFile(name: string, value?: string, options?: ((data:FileAddedResponse)=>void) | addFileOptions)
    {
        return AddFile(this, name, value, options);
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