import { Dialog } from "stun/dialog";
import { Inspector } from "stun/inspector";
import { Menubar } from "stun/menubar";
import { Panel } from "stun/panel";
import { Table } from "stun/table";
import { Tree } from "stun/tree";
import { widget } from "stun/widgets";
import { Area } from "stun/area";
import { Inspector } from "stun/inspector";
import { jscolor } from "stun/jscolor";
import { Tabs } from "./tabs"
import { Dragger } from "stun/dragger";

export interface HTMLDivElementPlus extends HTMLDivElement
{
    disabled?: boolean;
    content?: HTMLElementPlus;
    name?: string | null;
    end?: () => void;
    on_refresh?: Function;
    refresh?: () => void;
    closingTimer?: TimeOut;
    stServiceCtr?: stServiceController;
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
    canvas?: canvas;
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
	widget?: any;
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
    item?: any;
}

export interface HTMLScriptElementPlus extends HTMLScriptElement
{
	original_src: string;
	num: string;
}

export interface EventTargetPlus extends EventTarget
{
	dataset: any;
	value: any;
	data(data: any);
	classList: any;
    setValue: Function;
}

export interface HTMLLIElementPlus extends HTMLLIElement
{
    data: any;
    options: any;
    tabs: tabs;
    selected: boolean;
    title_element : HTMLDivElementPlus;
    parent_id : string;
}

export interface HTMLElementPlus extends HTMLElement
{
	__events?: any;
	add?: Function;
	root?: HTMLElement;
    update?: Function;
    dialog? : any;
}

export interface HTMLButtonElementPlus extends HTMLButtonElement
{
    root: any;
}

export interface ParentNodePlus extends ParentNode
{
    offsetHeight: number;
    scrollTop: number;
}

export interface ChildNodePlus extends ChildNode
{
    listbox : LiteBox;
    offsetTop : number;
    classList : DOMTokenList;
    parent_id : string;
    dataset : any;
    data : any;
    title_element: HTMLDivElementPlus;
    id: string
    innerHTML : any;
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
	layerY: any;
	layerX: any;
}

type LiteguiObject = Area | Console | Dialog | Dragger | Inspector | Menubar | Panel | Tabs | Table | Tree | widget;

interface AreaOptions
{
    minSplitSize?: number;
    immediateResize?: boolean;
    id?: string,
    className?: string,
    width?: any,
    height?: any,
    content_id?: string,
    autoresize?: boolean,
    id?: string,
    main?: boolean,
    inmediateResize?: boolean,
}

interface AreaRoot
{
    offsetWidth?: number,
    offsetHeight?: number,
    className?: string,
    id?: string,
    litearea?: Area,
    style?: any,

}

interface InspectorOptions
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

interface ButtonOptions
{
	callback? : Function;
}

interface SearchBoxOptions
{
	placeholder?: string;
	callback?: Function
}

interface ContextMenuOptions
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

interface ListOptions
{
	parent?: LiteguiObject | HTMLDivElementPlus;
	callback?: Function;
}

interface SliderOptions
{
	min?: number;
	max?: number;
}

interface LineEditorOptions
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

interface ComplexListOptions
{
	height?: string | number;
	item_code?: string;
}

interface DialogOptions
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

interface DialogButtonOptions
{
	name: string;
	className?: string;
	callback?: Function;
	close?: boolean;
}

interface MessageOptions
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

interface InstanceObject extends Object
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