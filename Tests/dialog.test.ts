import { LiteGUI } from "../src/core";
import { Dialog } from "../src/dialog";
import { Dragger } from "../src/dragger";

/* function Construct (options: any)
{
    return new Dialog(options);
}

describe("Dialog initialize test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    it("Should be defined", () => {
        expect(Construct(options)).toBeDefined();
    });
});

describe("Dialog get dialog test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    const dialog = Construct(options);
    it("Should return dialog", () => {
        expect(dialog.getDialog("testDialog")).toBeDefined();
    });
});


describe("Dialog ctor test", () => {
    const dialog = Construct({});
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    dialog._ctor(options);

    it("Root should be defined", () => {
        expect(dialog.root).toBeDefined();
    });
});


describe("Dialog add test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: false, detachable: true };
    const dialog = Construct(options);
    const dragger = new Dragger(0, { disabled : false });
    dialog.add(dragger);
    it("Dialog should contain a dragger element", () => {
        expect(dialog.content?.childNodes[0]).toBe(dragger.root);
    });
});

describe("Dialog enable properties test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
    width: 300, scroll: true, resizable: false, draggable: false, detachable: true };
    const dialog = Construct(options);
    jest.spyOn(dialog, 'setResizable');
    it("Dialog resizable and draggable should be active", () => {
        dialog.enableProperties({resizable: true, draggable: true,});
        expect(dialog.setResizable).toBeCalled();
        expect(dialog.draggable).toBe(true);
    });
});
describe("Dialog set resizable test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable: false, draggable: true, detachable: true };
    const dialog = Construct(options);
    dialog.setResizable();
    it("Resizable property should be true", () => {
        expect(dialog.resizable);
    });
});

describe("Dialog dock to test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    LiteGUI.init({wrapped: true, width: 800, height: 800});
    const dialog = Construct(options);
    it("Dialog should dock to main window", () => {
        dialog.dockTo(LiteGUI);
        expect(dialog.root!.style.width).toBe("100%");
        expect(dialog.root!.style.height).toBe("100%");
    });
});

describe("Dialog add button test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    const dialog = Construct(options);
    const button = dialog.addButton("myButton", {});
    it("Dialog should add button", () => {
        expect(button).toBeInstanceOf(HTMLButtonElement);
    });
});

describe("Dialog highlight test", () => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
    const focus = window.focus;
    window.focus = jest.fn(() => ({}));
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    const highlightTime = 200;
    LiteGUI.init({wrapped: true});
    const dialog = Construct(options);
    LiteGUI.add(dialog);
    it("Dialog should highlight", () => {
        dialog.highlight(highlightTime);
        expect(setTimeout).toHaveBeenCalled();
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), highlightTime)
        window.focus = focus;
    });
});

describe("Dialog minimize test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true, fullcontent: true };
    LiteGUI.init({wrapped: true});
    const dialog = Construct(options);
    LiteGUI.add(dialog);
    dialog.setSize(1000, 1200);
    dialog.minimize();
    it("Dialog should minimize", () => {
        expect(dialog.root?.style.width).toBe(Dialog.MINIMIZED_WIDTH + "px");
    });
});

describe("Dialog arrange minimized test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    LiteGUI.init({wrapped: true});
    const dialog = Construct(options);
    LiteGUI.add(dialog);
    dialog.setSize(1000, 1200);
    dialog.minimize();
    it("Dialog should have a top property", () => {
        dialog.arrangeMinimized();
        expect(dialog.root!.style.top).toBe("-20px");
    });
});

describe("Dialog maximize test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true, fullcontent: true };
    LiteGUI.init({wrapped: true});
    const dialog = Construct(options);
    LiteGUI.add(dialog);
    dialog.minimize();
    it("Dialog should maximize", () => {
        dialog.maximize();
        expect(dialog.root?.style.width).toBe(dialog.old_box!.width + "px");
    });
});

describe("Dialog make modal test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    const dialog = Construct(options);
    it("modaldiv should contain dialog", () => {
        dialog.makeModal();
        expect(LiteGUI.modalbg_div?.childNodes.length).toBeGreaterThan(0);
    });
});

describe("Dialog bring to front test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
    width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    LiteGUI.init({wrapped: true});
    const dialog = Construct(options);
    LiteGUI.add(dialog);
    it("Dialog should bring its root to front", () => {
        dialog.bringToFront();
        expect(dialog.root?.parentNode?.childNodes[dialog.root?.parentNode?.childNodes.length - 1]).toBe(dialog.root);
    });
});

describe("Dialog show test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    const dialog = Construct(options);
    dialog.hide();
    it("Dialog should show", () => {
        dialog.show();
        expect(dialog.root!.style.display).toBe("");
    });
});

describe("Dialog hide test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    const dialog = Construct(options);
    it("Dialog should hide", () => {
        dialog.hide();
        expect(dialog.root!.style.display).toBe("none");
    });
});

describe("Dialog fade in test", () => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    const dialog = Construct(options);
    const fadeTime = 300;
    it("Dialog should fade in", () => {
        dialog.fadeIn(fadeTime)
        expect(setTimeout).toHaveBeenCalled();
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100);
    });
});

describe("Dialog set position test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    LiteGUI.init({wrapped: true});
    const dialog = Construct(options);
    LiteGUI.add(dialog);
    const x = 450;
    const y = 550;
    dialog.setPosition(x, y);
    it("Dialog should correctly positionate", () => {
        expect(dialog.root!.style.left).toBe( x + "px");
        expect(dialog.root!.style.top).toBe( y + "px");
    });
});

describe("Dialog set size test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    const dialog = Construct(options);
    const w = 400;
    const h = 400;
    dialog.setSize(w, h);
    it("Dialog should resize", () => {
        expect(dialog.root!.style.width).toBe( w + "px");
        expect(dialog.root!.style.height).toBe( h + "px");
    });
});

describe("Dialog set title test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    const dialog = Construct(options);
    const title = "myNewTitle";
    dialog.setTitle(title);
    it("Dialog should change title", () => {
        expect(dialog.header!.innerHTML).toBe(title);
    });
});

describe("Dialog center test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    LiteGUI.init({wrapped: true});
    const dialog = Construct(options);
    LiteGUI.add(dialog);
    dialog.setPosition(0,0);
    it("Dialog should be centered", () => {
        dialog.center();
        expect(dialog.root?.style.left !== "0px");
        expect(dialog.root?.style.top !== "0px");
    });
});

describe("Dialog adjust size test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 3000, scroll: true, resizable:true, draggable: true, detachable: true };
    const dialog = Construct(options);
    const dragger = new Dragger(0, { disabled : false });
    dialog.add(dragger);
    it("Dialog should adjust size", () => {
        dialog.adjustSize(0, true);
        expect(dialog);
    });
});

describe("Dialog clear test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    const dialog = Construct(options);
    dialog.clear();
    it("Dialog content should be empty", () => {
        expect(dialog.content!.innerHTML).toBe("");
    });
});

describe("Dialog detach window test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    const windowOpenSpy = jest.spyOn(window, "open");
    LiteGUI.init({wrapped: true, width: 800, height: 800});
    const dialog = Construct(options);
    dialog.setSize(1000, 1200);
    LiteGUI.add(dialog);
    it("Detached window should exists", () => {
        windowOpenSpy.mockImplementation(() => ({
            document: window.document,
            onbeforeunload: null,
        } as Window & typeof globalThis));
        const clientRects = dialog.root!.getClientRects;
        dialog.root!.getClientRects = jest.fn(()=>{ return [{width: 100, height: 100}] as any });
        dialog.detachWindow();
        expect(windowOpenSpy).toBeCalledWith("","","width=100, height=100, location=no, status=no, menubar=no, titlebar=no, fullscreen=yes");
        windowOpenSpy.mockRestore();
        dialog.root!.getClientRects = clientRects;
    });
});

describe("Dialog reattach window test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    const windowOpenSpy = jest.spyOn(window, "open");
    LiteGUI.init({wrapped: true, width: 800, height: 800});
    const dialog = Construct(options);
    dialog.setSize(1000, 1200);
    LiteGUI.add(dialog);
    windowOpenSpy.mockImplementation(() => ({
        document: window.document,
        close: ()=>{},
        onbeforeunload: null,
    } as Window & typeof globalThis));
    const clientRects = dialog.root!.getClientRects;
    dialog.root!.getClientRects = jest.fn(()=>{ return [{width: 100, height: 100}] as any });
    dialog.detachWindow();
    it("Detached window should reattach", () => {
        dialog.reattachWindow();
        expect(dialog.dialog_window).toBeUndefined();
        windowOpenSpy.mockRestore();
        dialog.root!.getClientRects = clientRects;
    });
});

describe("Dialog close test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    const openSpy = jest.spyOn(window, "open");
    LiteGUI.init({wrapped: true, width: 800, height: 800});
    const dialog = Construct(options);
    dialog.setSize(1000, 1200);
    LiteGUI.add(dialog);
    openSpy.mockImplementation(() => ({
        document: window.document,
        close: ()=>{},
        onbeforeunload: null,
    } as Window & typeof globalThis));
    const clientRects = dialog.root!.getClientRects;
    dialog.root!.getClientRects = jest.fn(()=>{ return [{width: 100, height: 100}] as any });
    dialog.detachWindow();
    it("Dialog window should close", () => {
        dialog.close();
        expect(dialog.dialog_window).toBeUndefined();
        openSpy.mockRestore();
        openSpy.mockClear();
        dialog.root!.getClientRects = clientRects;
    });
});

describe("Dialog show all test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    LiteGUI.init({wrapped: true});
    const dialog = Construct(options);
    LiteGUI.add(dialog);
    jest.spyOn(dialog, 'show');
    it("All dialogs should show", () => {
        dialog.showAll();
        expect(dialog.show).toHaveBeenCalledTimes(document.body.querySelectorAll("litedialog").length);
    });
});

describe("Dialog hide all test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    LiteGUI.init({wrapped: true});
    const dialog = Construct(options);
    LiteGUI.add(dialog);
    jest.spyOn(dialog, 'hide');
    it("All dialogs should hide", () => {
        dialog.hideAll();
        expect(dialog.hide).toHaveBeenCalledTimes(document.body.querySelectorAll("litedialog").length);
    });
});

describe("Dialog close all test", () => {
    const options = { id: "testDialog", title:"testDialog", close: true, minimize: true, 
        width: 300, scroll: true, resizable:true, draggable: true, detachable: true };
    LiteGUI.init({wrapped: true});
    const dialog = Construct(options);
    LiteGUI.add(dialog);
    jest.spyOn(dialog, 'close');
    it("All dialogs should close", () => {
        dialog.closeAll();
        expect(dialog.close).toHaveBeenCalledTimes(document.body.querySelectorAll("litedialog").length);
    });
});
 */