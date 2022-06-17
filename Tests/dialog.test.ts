import { Dialog } from "../src/dialog";

function Construct (options: any)
{
    return new Dialog(options);
}

describe("Dialog initialize test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    expect(Construct(options)).toBeDefined();
});

describe("Dialog get dialog test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    const dialog = Construct(options);

    expect(dialog.getDialog("testDialog")).toBeDefined();
});


describe("Dialog ctor test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    const dialog = Construct(options);

    expect();
});


describe("Dialog add test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    const dialog = Construct(options);

    expect();
});

describe("Dialog enable properties test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    const dialog = Construct(options);

    expect();
});
describe("Dialog set resizable test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    const dialog = Construct(options);

    expect();
});

describe("Dialog xxx test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    const dialog = Construct(options);

    expect();
});
