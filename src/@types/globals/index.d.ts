import { tabs } from "./tabs"
export interface HTMLDivElementPlus extends HTMLDivElement
{
    closingTimer: number;
    stServiceCtr: stServiceController;
    value: number;
    valuesArray: number[number[]];
    data: any;
    tabs: any;
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
}

export interface HTMLParagraphElementPlus extends HTMLParagraphElement
{
    data: any;
}
declare global
{
    //declare const PubSub: any;
    //declare const Playzido: any;

    //declare const __PLAYZIDO__: boolean | undefined;
}