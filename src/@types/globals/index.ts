import { Dialog } from "../../dialog";
import { Inspector } from "../../inspector";
import { Menubar } from "../../menubar";
import { Panel } from "../../panel";
import { Table } from "../../table";
import { Tree } from "../../tree";
import { widget, LiteBox } from "../../widgets";
import { Area } from "../../area";
import { jscolor } from "../../jscolor";
import { Tabs } from "../../tabs"
import { Dragger } from "../../dragger";

export interface HTMLDivElementPlus extends HTMLDivElement
{
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

export interface EventTargetPlus extends EventTarget
{
	value: any;
	data(data: any);
	classList: any;
    setValue: Function;
}

export interface HTMLLIElementPlus extends HTMLLIElement
{
    data: any;
    options: any;
    tabs: Tabs;
    selected: boolean;
    title_element : HTMLDivElementPlus;
    parent_id : string;
}

export interface HTMLElementPlus extends HTMLElement
{
    update?: Function;
    dialog? : any;
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

export type LiteguiObject = Area | Console | Dialog | Dragger | Inspector | Menubar | Panel | Tabs | Table | Tree | widget;

export interface AreaOptions
{
    minSplitSize?: number;
    immediateResize?: boolean;
    id?: string,
    className?: string,
    width?: any,
    height?: any,
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