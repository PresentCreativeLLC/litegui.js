import { Dialog } from "../../dialog";
import { Inspector } from "../../inspector";
import { Menubar } from "../../menubar";
import { Panel } from "../../panel";
import { Table } from "../../table";
import { Tree } from "../../tree";
import { Console } from "../../console";
import { Button, SearchBox, ContextMenu, Checkbox, LiteBox, List, Slider, LineEditor, ComplexList } from "../../widgets";
import { Area } from "../../area";
import { jscolor } from "../../jscolor";
import { Tabs } from "../../tabs"
import { Dragger } from "../../dragger";

export interface HTMLDivElementPlus extends HTMLDivElement
{
	_editing: boolean;
    disabled?: boolean;
    content?: HTMLElementPlus;
    name?: string | null;
    end?: () => void;
    on_refresh?: Function;
    refresh?: () => void;
    closingTimer?: NodeJS.Timeout;
    value?: number;
    valuesArray?: number[][];
    data?: any;
    tabs?: Tabs;
    dialog?: Dialog;
    dragger?: Dragger | HTMLDivElementPlus;
    litearea?: Area;
    inspector?: Inspector;
    bgcolor?: string;
    pointscolor?: string;
    linecolor?: string;
    xrange?: number[];
    yrange?: number[];
    defaulty?: number;
    no_trespassing?: boolean;
    show_samples?: number;
    options?: any;
    canvas?: HTMLCanvasElement;
    getValueAt?: Function;
    position?: string;
    instance?: any;
    _last_container_stack?: any[];
    sectiontitle?: Element;
    input?: HTMLInputElement;
    parentNode: ParentNode | null;
}

export interface HTMLSpanElementPlus extends HTMLSpanElement
{
	stopPropagation?: boolean;
	widget?: HTMLElementPlus;
	hide: () => void;
	show: () => void;
	setSelected: (v: boolean) => void;
	setContent: (v: string, is_html: boolean) => void;
	toggleEnabled: () => void;
    setValue: Function;
    getValue: Function;
    setEmpty: Function;
    expand: Function;
    collapse: Function;
    item?: HTMLDivElementPlus;
	liteBox: LiteBox;
}

export interface HTMLScriptElementPlus extends HTMLScriptElement
{
	original_src: string;
	num: string;
}

export interface EventTargetPlus extends EventTarget
{
    dragger: any;
	parentNode: ParentNodePlus;
	dataset: DOMStringMap;
	value: any;
	data: any;
	classList: DOMTokenList;
    setValue: Function;
}

export interface HTMLLIElementPlus extends HTMLLIElement
{
	listbox: any;
    data: any;
    options: any;
    tabs: Tabs;
    selected: boolean;
    title_element : HTMLDivElementPlus;
    parent_id : string;
}

export interface HTMLInputElementPlus extends HTMLInputElement
{
	color: any;
	getValue() : any;
}

export interface HTMLElementPlus extends HTMLElement
{
    group?: boolean;
	name?: string;
	order?: number;
	separator?: boolean;
	data?: any;
	__events?: any;
	add?: Function;
	root?: HTMLElement;
    update?: Function;
    dialog? : HTMLElementPlus;
	setValue?: Function;
}

export interface HTMLButtonElementPlus extends HTMLButtonElement
{
    root?: HTMLButtonElement;
}

export interface ParentNodePlus extends ParentNode
{
	data?: any;
	dataset: any;
	getBoundingClientRect: any;
	scrollLeft: number;
    scrollTop: number;
	offsetWidth : number;
    offsetHeight : number;
}

export interface ElementPlus extends Element
{
	_old_name?: string;
	_editing?: boolean;

}

export interface ChildNodePlus extends ChildNode
{
	querySelector(arg0: string): any;
    listbox : LiteBox | HTMLSpanElementPlus;
    offsetTop : number;
    classList : DOMTokenList;
    parent_id : string;
    dataset : any;
    data : any;
    title_element: HTMLDivElementPlus;
    id: string
    innerHTML : string;
}

export interface DocumentPlus extends Document
{
    parentWindow : Window;
}

export interface HTMLParagraphElementPlus extends HTMLParagraphElement
{
    data: any;
}

export interface MouseEventPlus extends MouseEvent
{
	layerY: number;
	layerX: number;
}

export type LiteguiObject = Area | Console | Dialog | Dragger | Inspector | Menubar | Panel | Tabs | Table | Tree | Button |
    SearchBox | ContextMenu |Checkbox | LiteBox | List | Slider | LineEditor | ComplexList;

export interface AreaOptions
{
    minSplitSize?: number;
    immediateResize?: boolean;
    id?: string,
    className?: string,
    width?: number | string,
    height?: number | string,
    content_id?: string,
    autoresize?: boolean,
    main?: boolean,
    inmediateResize?: boolean,
}

export interface AreaRoot
{
    offsetWidth?: number,
    offsetHeight?: number,
    className?: string,
    id?: string,
    litearea?: Area,
    style?: any,

}

export interface MenubarOptions
{
	auto_open: boolean;
	sort_entries: boolean;
}

export interface addTreeOptions extends createWidgetOptions, appendOptions, processElementOptions
{
	tree_options: TreeOptions;
}
export interface TreeOptions
{
	allow_drag?: boolean;
	allow_rename?: boolean;
	allow_multiselection?: boolean;
	selected?: boolean;
	collapsed?: boolean;
	collapsed_depth?: number;
	indent_offset?: number;
	id?: string;
	height?: string | number;
}

export interface TreeNode
{
	skipdrag?: boolean;
	onDragData?: Function;
	callback?: Function;
	visible?: boolean;
	postcontent?: string;
	precontent?: string;
	className?: string;
	DOM?: any;
	dataset?: any;
	content?: any;
	id?: string;
	children?: Array<TreeNode>;
}

export interface InspectorOptions
{
    type?: string;
    parent?: HTMLElementPlus;
    onchange?: Function;
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
}

export interface PanelOptions
{
	scroll?: boolean;
	position?: Array<number | string>;
	height?: number | string;
	width?: number | string;
	title?: string;
	className?: string;
	content?: string;
}

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

export interface ButtonOptions
{
	callback? : Function;
}

export interface SearchBoxOptions
{
	placeholder?: string;
	callback?: Function
}

export interface ContextMenuOptions
{
	autoopen?: boolean;
	ignore_item_callbacks?: boolean;
	callback?: Function;
	top?: number;
	left?: number;
	title?: string;
	event?: MouseEvent | PointerEvent | CustomEvent;
	parentMenu?: ContextMenu;
}

export interface ListOptions
{
	parent?: LiteguiObject | HTMLDivElementPlus;
	callback?: Function;
}

export interface SliderOptions
{
	min?: number;
	max?: number;
}

export interface LineEditorOptions extends appendOptions
{
	callback?: Function;
	height?: number;
	width?: number;
	show_samples?: number;
	no_trespassing?: boolean;
	defaulty?: number;
	xrange?: number[];
	linecolor?: string;
	pointscolor?: string;
	bgcolor?: string;
	extraclass?: string;
}

export interface ComplexListOptions
{
	height?: string | number;
	item_code?: string;
	onItemSelected: Function | null;
	onItemToggled: Function | null;
	onItemRemoved: Function | null;
}

export interface DialogOptions
{
	min_height?: number;
	noclose?: boolean;
	parent?: string | HTMLElementPlus;
	attach?: boolean;
	scroll?: boolean;
	buttons?: Array<DialogButtonOptions>;
	fullcontent?: boolean;
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
}

export interface DialogButtonOptions
{
	name: string;
	className?: string;
	callback?: Function;
	close?: boolean;
}

export interface MessageOptions
{
	textarea?: boolean;
	value?: string;
	className?: string; 
    title? : string;
    width? : number; 
    height? : number; 
    content? : string; 
    noclose? : boolean; 
}

export interface InstanceObject extends Object
{
    getProperties: Function,
    getInspectorProperties: Function,

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
export interface createWidgetOptions
{
	focus?: boolean;
	password?: boolean;
	immediate?:any;
	disabled?: boolean; 
	callback?: Function; 
	callback_keydown?: Function; 
	height?: number | string;
	widget_name?: string;
	width?: number | string; 
	name_width?: number | string; 
	content_width?: number | string; 
	pre_title?:string;
	title?:string | string[];
	className?:string; 
	pretitle?: string;
}
export interface properties_info
{
	name?: string;
	callback?: Function;
	type?: string;
	callback_update?: Function;
	instance?: any;
	varname?: string | number;
	widget?: any;
}

export interface addSliderOptions extends processElementOptions
{
	min?: number;
	max?: number;
	step?: any;
	callback?: Function;
}

export interface addStringButtonOptions extends addSliderOptions
{
	values?: any;
	disabled?: boolean;
	button?: string;
	callback_button?: Function;
	icon?: any;
	button_width?: string | number;
	widget_parent?: HTMLDivElementPlus;
	replace?: HTMLDivElementPlus;
}

export interface addComboOptions extends createWidgetOptions, appendOptions, processElementOptions
{
	value?: string[];
	values?: string[];
	disabled?: boolean;
	callback?: Function;
}

export interface setupOptions
{
	type: string | object;
	name: string | null;
	value: string;
	options: any;
}

export interface addListOptions extends createWidgetOptions, processElementOptions
{
	height?: number;
	disabled?: boolean;
	callback_dblclick?: Function;
	multiselection?: boolean;
	skip_wchange?: boolean;
	selected?: string;
}

export interface addButtonOptions extends createWidgetOptions, appendOptions, processElementOptions
{
	micro?: boolean;
	button_text?: string;
}

export interface addIconOptions extends createWidgetOptions, processElementOptions
{
	image: string;
	size?: number;
	x?: number;
	index?: number;
	toggle: boolean;
}

export interface addColor extends createWidgetOptions, processElementOptions
{
	show_rgb: boolean;
	finalCallback?: Function;
	add_dragger?: boolean;
	step?: number;
	dragger_class?: string;
	position?: number;
}

export interface addFileOptions extends createWidgetOptions, appendOptions
{
	accept: boolean;
	generate_url: boolean;
	read_file: string;
}
export interface addArrayOptions
{
	data_type?: string;
	max_items?: number;
	callback?: Function;
	data_options?: any;
}
export interface applyOptions
{
	className?: string;
    id?: string;
    width?: string | number;
    height?: string | number;
}

export interface containerOptions extends applyOptions, addArrayOptions
{
	widgets_per_row?: number;
}
export interface beginGroupOptions
{
	title?: string;
	collapsed: boolean;
	height: number | string;
	scrollable: boolean;
}
export interface addTitleOptions extends appendOptions
{
	help?: string;
}
export interface addInfoOptions
{
	className?: string;
	name_width?: string;
	width?: string | number;
	height?: string | number;
	callback?: Function;
}
export interface appendOptions
{
	widget_parent? : HTMLDivElementPlus;
	replace?: HTMLDivElementPlus;
}

export interface processElementOptions
{
	callback_update?: Function;
}
declare global
{
    interface Window
    {
        tabs: Tabs;
    }
    //declare const PubSub: any;
    //declare const Playzido: any;

    //declare const __PLAYZIDO__: boolean | undefined;
}