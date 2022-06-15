import { Menubar } from "../src/menubar";
import { HTMLLIElementPlus } from "../src/@types/globals/index";

/*function Construct (id: string, options: any)
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
    expect(menu.add("Printeador", clickCallback));
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
    expect(menu.findMenu("Printeador")).toBeDefined();
});

describe('Update', () => {
    const options = { auto_open: true, sort_entries: false };
    const menu = Construct("Menubar01", options);

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

    const clickCallback = function(element: HTMLLIElementPlus, e: MouseEvent)
    {
        const el = element;
        const item = el.data;

        if (item.data && item.data.callback && typeof(item.data.callback) == "function")
        {
            item.data.callback(item.data);
        }
        expect(menu.showMenu(item, e, el));
        element.addEventListener("click", clickCallback.bind(undefined,element));
    };
    const element = document.createElement("li") as HTMLLIElementPlus;
    element.innerHTML = "<span class='icon'></span><span class='name'>" + menu.menu[0].name + "</span>";
    menu.content.appendChild(element);
    element.data = menu.menu[0];
    menu.menu[0].element = element;
    element.addEventListener("click", clickCallback.bind(undefined,element));
});
*/