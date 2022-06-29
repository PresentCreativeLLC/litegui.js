
// declare type Position =
// {
//     x: number,
//     y: number
// }
// declare type PickerMode = 'HSV' | 'HVS';
// declare type PickerPosition = 'left' | 'right' | 'top' | 'bottom';
// declare abstract class jscolor
// {
//     // declare var jscolor
//     // declare namespace jscolor
//     // {
//         dir: string;
//         bindClass: string;
//         preloading: boolean;
//         binding: boolean;
        

//         install();
//         init();
//         getDir();
//         detectDir(): string | boolean;
//         bind();
//         preload();
//         requireImage(filename: string);
//         loadImage(filename: string);
//         loadImage(filename: string);
//         fetchElement(mixed: any): any;
//         addEvent(el: any, evnt: string, func: any);
//         fireEvent(el: any, evnt: string);
//         getElementPos(e: any): Array<number>;
//         getElementSize(e: any): Array<number>;
//         getRelMousePos(e: any): Position;
//         getViewPos(): Array<number>;
//         getViewSize(): Array<number>;
//         static URI = class URI
//         {
//             constructor(uri?: string)
//             parse(uri: string): URI;
//             toString(): string;
//             toAbsolute(base: string): URI;
//             removeDotSegments(path: string): string;
//         }
//         // function color(target: any, prop?: any): jscolor.color;
//         static color = class color
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