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
    it(`Debería limpiar el menu`, () =>
    {
        expect(menu.clear());
    });
});

describe('attachToPanel in menu', () => {
    const options = { auto_open: true, sort_entries: false };
    const menu = Construct("Menubar01", options);

    const options2 = { className: "panel-header", title: "Hola mundo", content: "Hola, esta es una prueba de creación de panel",
    width: "300", height: "150", position: [10, 10], scroll: true};
    const panel0 = Construct("Panel01", options2);
    it(`Debería attachear menu a panel0`, () =>
    {
        expect(menu.attachToPanel(panel0));
    });
});

describe('add in menu', () => {
    const options = { auto_open: true, sort_entries: false };
    const menu = Construct("Menubar01", options);
    const clickCallback = function()
    {
        console.log("A menu was clicked");
    }
    menu.add("Printeador", clickCallback)
    it(`Debería agregar algo al menu y ser mayor que 0`, () =>
    {
        expect(menu.menu.length).toBeGreaterThan(0);
    });
});

describe('remove', () => {
    const options = { auto_open: true, sort_entries: false };
    const menu = Construct("Menubar01", options);

    const clickCallback = function()
    {
        console.log("A menu was clicked");
    }
    menu.add("Printeador", clickCallback);
    it(`Debería borrar el printeador recién agregado`, () =>
    {
        expect(menu.remove("Printeador"));
    });
});

describe('separator', () => {
    const options = { auto_open: true, sort_entries: false };
    const menu = Construct("Menubar01", options);

    const clickCallback = function()
    {
        console.log("A menu was clicked");
    }
    menu.add("Printeador", clickCallback);
    it(`Debería separar el printeador`, () =>
    {
        expect(menu.separator("Printeador", 2));
    });
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
    it(`Debería encontrar printeador`, () =>
    {
        expect(menu.findMenu("Printeador"));
    });
});

describe('Update', () => {
    const options = { auto_open: true, sort_entries: false };
    const menu = Construct("Menubar01", options);
    const clickCallback = function()
    {
        console.log("A menu was clicked");
    }
    menu.add("Printeador", clickCallback);
    it(`Debería update the menu`, () =>
    {
        expect(menu.updateMenu());
    });
});

describe('HidePanels', () => {
    const options = { auto_open: true, sort_entries: false };
    const menu = Construct("Menubar01", options);
    it(`Debería esconder los paneles`, () =>
    {
        expect(menu.hidePanels());
    });
});

describe('showmenu', () => {
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
    it(`Debería mostrar el menu recién agregado`, () =>
    {
        expect(menu.showMenu(menu.menu[0], evt, menu.root));
    });
});
*/