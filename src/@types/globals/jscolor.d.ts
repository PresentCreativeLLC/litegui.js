
// declare module jscolor
// {
//     // declare var jscolor
//     // declare namespace jscolor
//     // {
//         declare var dir: string;
//         declare var bindClass: string;
//         declare var preloading: boolean;
//         declare var binding: boolean;
        
//         declare type Position =
//         {
//             x: number,
//             y: number
//         }
//         declare type PickerMode = 'HSV' | 'HVS';
//         declare type PickerPosition = 'left' | 'right' | 'top' | 'bottom';

//         function install();
//         function init();
//         function getDir();
//         function detectDir(): string | boolean;
//         function bind();
//         function preload();
//         function requireImage(filename: string);
//         function loadImage(filename: string);
//         function loadImage(filename: string);
//         function fetchElement(mixed: any): any;
//         function addEvent(el: any, evnt: string, func: any);
//         function fireEvent(el: any, evnt: string);
//         function getElementPos(e: any): Array<number>;
//         function getElementSize(e: any): Array<number>;
//         function getRelMousePos(e: any): Position;
//         function getViewPos(): Array<number>;
//         function getViewSize(): Array<number>;
//         declare class URI
//         {
//             constructor(uri?: string)
//             parse(uri: string): URI;
//             toString(): string;
//             toAbsolute(base: string): URI;
//             removeDotSegments(path: string): string;
//         }
//         // function color(target: any, prop?: any): jscolor.color;
//         declare class color
//         {
//             constructor(target: any, prop?: any);
//             required: boolean;
//             adjust: boolean;
//             hash: boolean;
//             caps: boolean;
//             slider: boolean;
//             valueElement: any;
//             styleElement: any;
//             onImmediateChange: any;//string | Function;
//             declare get hsv(): Array<number>;
//             declare get rgb(): Array<number>;

//             pickerOnfocus: boolean;
//             pickerMode: PickerMode;
//             pickerPosition: PickerPosition;
//             pickerSmartPosition: boolean;
//             pickerButtonHeight: number;
//             pickerClosable: boolean;
//             pickerCloseText: string;
//             pickerButtonColor: any;
//             pickerFace: number;
//             pickerFaceColor: string;
//             pickerBorder: number;
//             pickerBorderColor: string;
//             pickerInset: number;
//             pickerInsetColor: string;
//             pickerZIndex: number;



//             hidePicker(): void;
//             showPicker(): void;
//             importColor(): void;
//             exportColor(flags: boolean);
//             fromHSV(h: number, s: number, v: number, flags?: boolean);
//             fromRGB(r: number, g: number, b: number, flags?: boolean);
//             fromString(hex: string, flags?: boolean): boolean;
//             toString(): string;
//             RGB_HSV(r: number, g: number, b: number): Array<number>;
//             HSV_RGB(h: number, s: number, v: number): Array<number>;
//             removePicker();
//             drawPicker(x: number, y: number);
//             getPickerDims(o: any): Array<any>;
//             redrawPad();
//             redrawSld();
//             isPickerOwner(): boolean;
//             blurTarget();
//             blurValue();
//             setPad(e: Position);
//             setSld(e: Position);
//             dispatchImmediateChange();
//         }
//     // }
// }
// // declare global
// // {
// //     interface Window
// //     {
// //         jscolor: any;
// //     }
// // }