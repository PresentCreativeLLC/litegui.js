import { Slider } from "../../widgets";
import { Dragger } from "../../dragger";
import { Inspector } from "../../inspector";

/************************************************************************************************
 * Inspector types
 */

export type InspectorValue = number | string | boolean | InspectorValue[] |
	{[key:string]:InspectorValue} | undefined;
export type InspectorWidgetTypes = 'null' | 'undefined' |
	'title' | 'info' | 'number' | 'slide' |
	'string' | 'text' | 'textarea' | 'color' |
	'boolean' | 'checkbox' | 'icon' | 'vec2' |
	'vector2' | 'vec3' | 'vector3' | 'vec4' |
	'vector 4' | 'enum' | 'string' | 'dropdown' |
	'combo' | 'button' | 'buttons' | 'file' |
	'line' | 'list' | 'tree' | 'datatree' |
	'pad' | 'array' | 'separator';

/************************************************************************************************
 * Inspector options
 */

export interface InspectorOptions
{
    type?: string;
    parent?: HTMLElement;
    onchange?: (name?:string, value?: InspectorValue, element?: InspectorWidget)=>void;
    noscroll?: boolean;
    widgets_width?: number;
    name_width?: number;
    height?: string | number;
    width?: string | number;
    one_line?: boolean;
    full?: boolean;
    offsetWidth?: number;
    offsetHeight?: number;
    className?: string;
    id?: string;
    collapsed?: boolean;
    no_collapse?: boolean;
    instance?: any;
    widgets_per_row?: number;
	callback?: (value:boolean) => void;
}

export interface ProcessElementOptions
{
	callback_update?: Function;
}

export interface AppendOptions
{
	widget_parent? : HTMLDivElement;
	replace?: HTMLDivElement;
}

export interface HTMLDivElementOptions
{
	className?: string;
    id?: string;
    width?: string | number;
    height?: string | number;
}

export interface CreateWidgetOptions extends AppendOptions, ProcessElementOptions, HTMLDivElementOptions
{
	title?:string | string[];
	pre_title?:string;
	widget_name?: string;
	name_width?: number | string; 
	content_width?: number | string;
}

export interface WidgetChangeOptions
{
	skip_wchange?: boolean;
	callback?: ((value:any, e?:Event)=>void)  | ((...args:any[])=>void);
}

export interface GenericCreationOptions extends CreateWidgetOptions
{
	type?: InspectorWidgetTypes;
	name?: string;
	value?: InspectorValue;
	options?: CreateWidgetOptions;
}

export interface AddStringOptions extends CreateWidgetOptions, WidgetChangeOptions
{
	password?: true;
	focus?: boolean; 
	immediate?: boolean; 
	disabled?: boolean; 
	placeHolder?: string; 
	align?: string;
	icon?: string;
	callback_enter?: ()=>void; 
}

export interface AddStringButtonOptions extends CreateWidgetOptions, WidgetChangeOptions
{
	disabled?: boolean;
	button?: string;
	icon?: string;
	button_width?: string | number;
	callback_button?: (value:string, e: Event)=>void;
}

export interface AddTextAreaOptions extends CreateWidgetOptions, WidgetChangeOptions
{
	immediate?: boolean; 
	disabled?: boolean; 
	placeHolder?: string; 
	align?: string;
	icon?: string;
	callback_keydown?: ()=>void; 
}

export interface DraggerOptions
{
    precision?: number;
    extra_class?: string;
    full?: boolean;
    disabled?: boolean;
    dragger_class?: string;
    tab_index?: number;
    units?: string;
    horizontal?: boolean;
    linear?: boolean;
    step?: number;
    min?: number;
    max?: number;
}

export interface AddNumberOptions extends CreateWidgetOptions, DraggerOptions, WidgetChangeOptions
{
	tab_index?: number;
	extra_class?: string;
	full_num?: boolean;
	precision?: number;
	step?:number;
	units?: string;
	disabled?: boolean;
	on_change?: (value: number) => number|void;
	callback?: (value: number) => void;
	callback_before?: () => void;
}

export interface AddVectorOptions extends CreateWidgetOptions, DraggerOptions, WidgetChangeOptions
{
    fullVector?: boolean;
    callback?: (value:number[])=>void;
    on_change?: (value:number[])=>number[]|void;
    callback_before?: (e:Event)=>void;
}

export interface AddPadOptions extends CreateWidgetOptions, DraggerOptions, WidgetChangeOptions
{
	min?: number;
	max?: number;
	min_x?: number;
	min_y?: number;
	max_x?: number;
	max_y?: number;
	background?: string;
	callback?: (values: [number, number])=>[number, number];
}

export interface AddInfoOptions extends CreateWidgetOptions, WidgetChangeOptions
{
	callback?: ()=>void;
}

export interface AddSliderOptions extends CreateWidgetOptions, WidgetChangeOptions
{
	min?: number;
	max?: number;
	step?: number;
	callback?: (value:number)=>void;
}

export interface AddCheckboxOptions extends CreateWidgetOptions, WidgetChangeOptions
{
	// If label on or label off aren't set it will take this value
	label?: string;
	label_on?: string;
	label_off?: string;
	callback?: (value:boolean)=>void;
}

export interface AddFlagsOptions
{
	default: AddCheckboxOptions,
	[key:string]:AddCheckboxOptions
}

export interface AddComboOptions extends CreateWidgetOptions, WidgetChangeOptions
{
	values?: string[];
	disabled?: boolean;
	callback?: (value:string)=>void;
}

export interface TagElement extends HTMLDivElement
{
	data: string;
}

export interface AddTagOptions extends CreateWidgetOptions, WidgetChangeOptions
{
	default_tags?: string[];
	values?: string[];
	disabled?: boolean;
	callback?: (value:{[key: string]: boolean})=>void;
}

export interface ItemOptions
{
	content: any;
	title: string;
	name: string;
	style: string;
	icon: string;
	selected: boolean;
}

export interface AddListOptions extends CreateWidgetOptions, WidgetChangeOptions
{
	height?: number;
	disabled?: boolean;
	multiselection?: boolean;
	selected?: string;
	callback_dblclick?: (value:string)=>void;
}

export interface AddButtonOptions extends CreateWidgetOptions, WidgetChangeOptions
{
	disabled?: boolean;
	micro?: boolean;
	button_text?: string;
	callback?: (value?:string)=>void;
}

export interface AddArrayOptions extends CreateWidgetOptions, WidgetChangeOptions
{
	data_type?: InspectorWidgetTypes;
	max_items?: number;
	data_options?: any;
	callback?: Function; 
}

/************************************************************************************************
 * Inspector Widgets
 */

export interface InspectorSection extends HTMLElement
{
	section?: InspectorSection;
    sectionTitle?: Element;
	instance?: any;
    _last_container_stack?: any[];
	refresh: () => void;
	on_refresh: (widget: InspectorSection) => void;
	end: () => void;
}

export interface InspectorWidget extends HTMLDivElement
{
	inspector?: Inspector;
	section?: InspectorSection;
	options?: CreateWidgetOptions;
	name?: string;
	content?: HTMLElement;
	on_update?: (widget:InspectorWidget)=>void;
	getValue?: ()=>InspectorValue;
	setValue?: (value?: any, skip_event?: boolean)=>void;
	setIcon?: (img: string)=>void;
	disable?: ()=>void;
	enable?: ()=>void;
}

export interface InspectorActiveWidget extends InspectorWidget
{
	inspector: Inspector;
	section: InspectorSection;
	options: CreateWidgetOptions;
	name: string;
	content: HTMLElement;
	on_update: (widget:InspectorWidget)=>void;
	getValue: ()=>InspectorValue;
	setValue: (value?: any, skip_event?: boolean)=>void;
	setIcon: (img: string)=>void;
	disable: ()=>void;
	enable: ()=>void;
}

export interface InspectorStringWidget extends InspectorActiveWidget
{
	setValue: (value?: string, skip_event?: boolean)=>void;
}

export interface InspectorNumberWidget extends InspectorActiveWidget
{
	dragger: Dragger;
	setRange: (min: number, max: number)=>void;
	setValue: (value?: number | string, skip_event?: boolean)=>void;
}

export interface InspectorNumberVectorWidget extends InspectorActiveWidget
{
	draggers: Dragger[];
	setRange: (min: number, max: number)=>void;
	setValue: (value?: (number|string)[], skip_event?: boolean)=>void;
}

export interface VectorInput extends HTMLInputElement
{
	dragger: Dragger;
}

export interface InspectorPadWidget extends InspectorActiveWidget
{
	setValue: (values?: [number, number])=>void;
}

export interface InspectorInfoWidget extends InspectorActiveWidget
{
	add: (e:Node)=>void;
	setValue: (value?: string)=>void;
	scrollToBottom: ()=>void;
}

export interface InspectorSliderWidget extends InspectorActiveWidget
{
	slider: Slider;
	setValue: (value?: number, skip_event?: boolean)=>void;
}

export interface InspectorCheckboxWidget extends InspectorActiveWidget
{
	setValue: (value?: boolean, skip_event?: boolean)=>void;
}

export interface InspectorComboWidget extends InspectorActiveWidget
{
	setOptionValues: (v: string[], selected?: string)=>void;
	setValue: (value: string, skip_event?: boolean)=>void;
}

export interface InspectorComboButtonsWidget extends InspectorWidget
{
	buttons: NodeListOf<HTMLButtonElement>;
}

export interface InspectorTagsWidget extends InspectorWidget
{
	tags: {[key: string]: boolean};
}

export interface InspectorListWidget extends InspectorActiveWidget
{
	addItem: (value: string, selected: boolean)=>void;
	removeItem: (value: string)=>void;
	updateItems: (new_values: string[], item_selected?: string)=>void;
	getSelected: ()=>string[];
	getByIndex: (index: number)=>HTMLElement;
	selectIndex: (index: number, add_to_selection?: boolean)=>HTMLElement;
	deselectIndex: (index: number)=>HTMLElement;
	scrollToIndex: (index: number)=>void;
	selectAll: ()=>void;
	deselectAll: ()=>void;
	setValue: (value: string[])=>void;
	getNumberOfItems: ()=>void;
	filter: (callback?: string |
		((value:number, item:HTMLElement, selected:boolean)=>boolean),
		case_sensitive?: boolean)=>void;
	selectByFilter: (callback: ((value:number, item:HTMLElement, selected:boolean)=>boolean))=>void;
}

export interface InspectorButtonWidget extends InspectorWidget
{
	wclick: (callback: Function)=>void;
}