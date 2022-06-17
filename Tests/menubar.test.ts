import { Menubar } from "../src/menubar";

/*
function Construct (id: string, options: any)
{
    return new Menubar(id, options);
}
describe("Test de creacion de menu bar", () => {
    const options = { auto_open: true, sort_entries: false };
    it(`Debería resultar ${5}`, () =>{
        expect(Construct("Menubar01", options)).toBeDefined();
    });
});

describe('Clear the menubar', () => {
    const options = { auto_open: true, sort_entries: false };
    const menu = Construct("Menubar01", options);
    expect(menu.clear());
});

describe('attachToPanel in menu', () => {
    const options = { auto_open: true, sort_entries: false };
    const menu = Construct("Menubar01", options);

    const options2 = { className: "panel-header", title: "Hola mundo", content: "Hola, esta es una prueba de creación de panel",
    width: "300", height: "150", position: [10, 10], scroll: true};
    const panel0 = Construct("Panel01", options2);

    expect(menu.attachToPanel(panel0));
});

describe('add in menu', () => {
    const options = { auto_open: true, sort_entries: false };
    const menu = Construct("Menubar01", options);
    const clickCallback = function()
    {
        console.log("A menu was clicked");
    }
    menu.add("Printeador", clickCallback)
    expect(menu.menu.length).toBeGreaterThan(0);
});

describe('remove', () => {
    const options = { auto_open: true, sort_entries: false };
    const menu = Construct("Menubar01", options);

    const clickCallback = function()
    {
        console.log("A menu was clicked");
    }
    menu.add("Printeador", clickCallback);
    expect(menu.remove("Printeador"));
});

describe('separator', () => {
    const options = { auto_open: true, sort_entries: false };
    const menu = Construct("Menubar01", options);

    const clickCallback = function()
    {
        console.log("A menu was clicked");
    }
    menu.add("Printeador", clickCallback);
    expect(menu.separator("Printeador", 2));
});

describe('findMenu', () => {
    const options = { auto_open: true, sort_entries: false };
    const menu = Construct("Menubar01", options);

    const clickCallback = function()
    {
        console.log("A menu was clicked");
    }
    menu.add("Printeador", clickCallback);
    console.warn("menu: " + menu.menu[0].name);
    const menu2 = menu.findMenu("Printeador");
    if (menu2 != undefined)
    {
        if (Array.isArray(menu2))
        {
            console.warn("Findmenu: " + menu2[0].name);
        }
        else
        {
            console.warn("Findmenu: " + menu2.name);
        }
    }
    expect(menu.findMenu("Printeador"));
});

describe('Update', () => {
    const options = { auto_open: true, sort_entries: false };
    const menu = Construct("Menubar01", options);
    const clickCallback = function()
    {
        console.log("A menu was clicked");
    }
    menu.add("Printeador", clickCallback);
    expect(menu.updateMenu());
});

describe('HidePanels', () => {
    const options = { auto_open: true, sort_entries: false };
    const menu = Construct("Menubar01", options);

    expect(menu.hidePanels());
});

describe('HidePanels', () => {
    const options = { auto_open: true, sort_entries: false };
    const menu = Construct("Menubar01", options);

    const clickCallbackmenu = function()
    {
        console.log("A menu was clicked");
    }
    menu.add("Printeador", clickCallbackmenu);

    const evt = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: 0,
        clientY: 0
      });
    expect(menu.showMenu(menu.menu[0], evt, menu.root));
});*/