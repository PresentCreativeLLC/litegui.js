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
    // parentNode?: ParentNode;
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
	getValue() : any;
}

export interface HTMLElementPlus extends HTMLElement
{
	name?: string;
	order?: number;
	separator?: boolean;
	data?: any;
	__events?: any;
	add?: Function;
	root?: HTMLElement;
    update?: Function;
    dialog? : HTMLElementPlus;
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
    offsetHeight: number;
    scrollTop: number;
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

export interface ParentNodePlus extends ParentNode
{
    offsetWidth : number;
    offsetHeight : number;
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
	children?: Array<TreeNode>
}

export interface InspectorOptions
{
    type?: string;
    parent?: HTMLElementPlus;
    onchange?: Function;
    noscroll?: boolean;
    widgets_width?: number | null;
    name_width?: number | null;
    height?: string | number | null | undefined;
    width?: string | number | null | undefined;
    one_line?: boolean;
    full?: boolean;
    offsetWidth?: number,
    offsetHeight?: number,
    className?: string,
    id?: string,
    collapsed?: boolean,
    no_collapse?: boolean,
    instance?: any,
    widgets_per_row?: number,
    
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

export interface LineEditorOptions
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