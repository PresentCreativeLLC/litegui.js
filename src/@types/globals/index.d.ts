import { Area } from "stun/area";
import { Dialog } from "stun/dialog";
import { Inspector } from "stun/inspector";
import { jscolor } from "stun/jscolor";
import { Tabs } from "./tabs"

export interface HTMLDivElementPlus extends HTMLDivElement
{
    disabled?: boolean;
    content?: HTMLElementPlus;
    name?: string | null;
    end?: () => void;
    on_refresh?: Function;
    refresh?: () => void;
    closingTimer?: number;
    stServiceCtr?: stServiceController;
    value?: number;
    valuesArray?: number[][];
    data?: any;
    tabs?: Tabs;
    dialog?: Dialog;
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
    // parentNode?: ParentNode;
}

export interface HTMLSpanElementPlus extends HTMLSpanElement
{
    setValue: Function;
    getValue: Function;
    setEmpty: Function;
    expand: Function;
    collapse: Function;
}

export interface EventTargetPlus extends EventTarget
{
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

export interface HTMLParagraphElementPlus extends HTMLParagraphElement
{
    data: any;
}

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