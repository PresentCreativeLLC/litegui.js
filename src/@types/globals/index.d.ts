import { Tabs } from "./tabs"

export interface HTMLDivElementPlus extends HTMLDivElement
{
    closingTimer: number;
    stServiceCtr: stServiceController;
    value: number;
    valuesArray: number[number[]];
    data: any;
    tabs: any;
    dialog: any;
    bgcolor: string;
    pointscolor: string;
    linecolor: string;
    xrange: number[];
    yrange: number[];
    defaulty: number;
    no_trespassing: boolean;
    show_samples: number;
    options: any;
    canvas: canvas;
    getValueAt: Function;
    position : string;
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