import { Tabs } from "../src/tabs";
import { HTMLLIElementPlus } from "../src/@types/globals/index"

function Construct (options: any, legacy: boolean)
{
    return new Tabs(options);
}

describe("Test de creacion de tab", () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    it(`Debería resultar ${5}`, () =>{
        expect(Construct(options, false)).toBeDefined();
    });
});

describe('Mouse wheel', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);
    const mouseSimulation = { deltaY: 3.5 } as WheelEvent;
    it(`Debería subir en el menú`, () =>
    {
        expect(tab.onMouseWheel(mouseSimulation));
    });
});

describe('Show', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);
    const options2 = { callback: function () {console.log("Tab is being clicked")}, title: "Este es el titulo",
    button: true, closable: true, tab_width: 120, id: "tab02", size: "full", width: 120, height: 50, selected: true}
    tab.addTab("tab02", options2);
    it(`Debería agregar un tab y mostrarlo`, () =>
    {
        expect(tab.show());
    });
});

describe('Hide', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);
    const options2 = { callback: function () {console.log("Tab is being clicked")}, title: "Este es el titulo",
    button: true, closable: true, tab_width: 120, id: "tab02", size: "full", width: 120, height: 50, selected: true}
    tab.addTab("tab02", options2);
    it(`Debería esconder el tab`, () =>
    {
        expect(tab.hide());
    });
});

describe('selectTab', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);

    const options2 = { callback: function () {console.log("Tab is being clicked")}, title: "Este es el titulo",
    button: true, closable: true, tab_width: 120, id: "tab02", size: "full", width: 120, height: 50, selected: true}
    tab.addTab("tab02", options2);
    it(`Debería seleccionar tab02`, () =>
    {
        expect(tab.selectTab("tab02", false));
    });
});

describe('getCurrentTab', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);

    const options2 = { callback: function () {console.log("Tab is being clicked")}, title: "Este es el titulo",
    button: true, closable: true, tab_width: 120, id: "tab02", size: "full", width: 120, height: 50, selected: true}
    tab.addTab("tab02", options2);
    tab.selectTab("tab02", false);
    it(`Debería seleccionar el tab02 y agarrarlo`, () =>
    {
        expect(tab.getCurrentTab());
    });
});

describe('getCurrentTabId', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);

    const options2 = { callback: function () {console.log("Tab is being clicked")}, title: "Este es el titulo",
    button: true, closable: true, tab_width: 120, id: "tab02", size: "full", width: 120, height: 50, selected: true}
    tab.addTab("tab02", options2);
    tab.selectTab("tab02", false);
    it(`Debería devolver tab02`, () =>
    {
        expect(tab.getCurrentTabId()).toBe("tab02");
    });
});

describe('getPreviousTab', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);

    const options2 = { callback: function () {console.log("Tab is being clicked")}, title: "Este es el titulo",
    button: true, closable: true, tab_width: 120, id: "tab02", size: "full", width: 120, height: 50, selected: true}
    tab.addTab("tab02", options2);
    tab.selectTab("tab02", false);
    tab.selectTab("tab02", false);
    it(`Debería agarrar a tab02`, () =>
    {
        expect(tab.getPreviousTab());
    });
});

describe('appendTo', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);

    const options2 = { callback: function () {console.log("Tab is being clicked")}, title: "Este es el titulo",
    button: true, closable: true, tab_width: 120, id: "tab02", size: "full", width: 120, height: 50, selected: true}
    tab.addTab("tab02", options2);
    options.id = "tab03";
    options.callback = function () {console.log("Tab03 is being clicked")};
    const tab2 = Construct(options, false);
    it(`Debería appendear tab en tab2`, () =>
    {
        expect(tab.appendTo(tab2.root));
    });
});

describe('getTab', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);

    const options2 = { callback: function () {console.log("Tab is being clicked")}, title: "Este es el titulo",
    button: true, closable: true, tab_width: 120, id: "tab02", size: "full", width: 120, height: 50, selected: true}
    tab.addTab("tab02", options2);
    it(`Debería agarrar tab02`, () =>
    {
        expect(tab.getTab("tab02"));
    });
});

describe('getTabByIndex', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);

    const options2 = { callback: function () {console.log("Tab is being clicked")}, title: "Este es el titulo",
    button: true, closable: true, tab_width: 120, id: "tab02", size: "full", width: 120, height: 50, selected: true}
    tab.addTab("tab02", options2);
    it(`Debería obtiene a tab02`, () =>
    {
        expect(tab.getTabByIndex(0));
    });
});

describe('getNumOfTabs', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);

    const options2 = { callback: function () {console.log("Tab is being clicked")}, title: "Este es el titulo",
    button: true, closable: true, tab_width: 120, id: "tab02", size: "full", width: 120, height: 50, selected: true}
    tab.addTab("tab02", options2);
    it(`Debería devolver 1`, () =>
    {
        expect(tab.getNumOfTabs()).toBe(1);
    });
});

describe('getTabContent', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);

    const options2 = { callback: function () {console.log("Tab is being clicked")}, title: "Este es el titulo",
    button: true, closable: true, tab_width: 120, id: "tab02", size: "full", width: 120, height: 50, selected: true}
    tab.addTab("tab02", options2);
    it(`Debería obtener tab02`, () =>
    {
        expect(tab.getTabContent("tab02"));
    });
});

describe('getTabIndex', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);

    const options2 = { callback: function () {console.log("Tab is being clicked")}, title: "Este es el titulo",
    button: true, closable: true, tab_width: 120, id: "tab02", size: "full", width: 120, height: 50, selected: true}
    tab.addTab("tab02", options2);
    it(`Debería ser 1`, () =>
    {
        expect(tab.getTabIndex("tab02"));
    });
});

describe('addTab', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);

    const options2 = { callback: function () {console.log("Tab is being clicked")}, title: "Este es el titulo",
    button: true, closable: true, tab_width: 120, id: "tab02", size: "full", width: 120, height: 50, selected: true}
    it(`Debería añadir otro tab`, () =>
    {
        expect(tab.addTab("tab02", options2));
    });
});

describe('addPlusTab', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);

    const callback: Function = function () {console.log("Tab is being clicked")};
    it(`Debería añadir un tab plus`, () =>
    {
        expect(tab.addPlusTab(callback));
    });
});

describe('addButtonTab', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);

    const callback: Function = function () {console.log("Tab is being clicked")};
    it(`Debería añadir un tab botón`, () =>
    {
        expect(tab.addButtonTab("tab02", "titulo", callback));
    });
});

describe('onTabClicked', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);

    const element: HTMLLIElementPlus = document.createElement("li") as HTMLLIElementPlus;
    element.selected = false;
    it(`Debería clickear en el tab01`, () =>
    {
        expect(tab.onTabClicked({} as MouseEvent, element));
    });
});

describe('setTabVisibility', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);
    it(`Debería hacer visible tab01`, () =>
    {
        expect(tab.setTabVisibility("tab01", true));
    });
});

describe('recomputeTabsByIndex', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);
    it(`Debería recomputarizar`, () =>
    {
        expect(tab.recomputeTabsByIndex());
    });
});

describe('removeTab', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);

    const options2 = { callback: function () {console.log("Tab is being clicked")}, title: "Este es el titulo",
    button: true, closable: true, tab_width: 120, id: "tab02", size: "full", width: 120, height: 50, selected: true}
    it(`Debería agregar y quitar tab02`, () =>
    {
        tab.addTab("tab02", options2);
        expect(tab.removeTab("tab02"));
    });
});

describe('removeAllTabs', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);

    const options2 = { callback: function () {console.log("Tab is being clicked")}, title: "Este es el titulo",
    button: true, closable: true, tab_width: 120, id: "tab02", size: "full", width: 120, height: 50, selected: true}
    it(`Debería agregar y quitar todos los tabs`, () =>
    {
        tab.addTab("tab02", options2);
        expect(tab.removeAllTabs());
    });
});

describe('clear', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);

    const options2 = { callback: function () {console.log("Tab is being clicked")}, title: "Este es el titulo",
    button: true, closable: true, tab_width: 120, id: "tab02", size: "full", width: 120, height: 50, selected: true}
    it(`Debería añadir otro tab y limpiar el original`, () =>
    {
        tab.addTab("tab02", options2);
        expect(tab.clear());
    });
});

describe('hideTab', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);

    const options2 = { callback: function () {console.log("Tab is being clicked")}, title: "Este es el titulo",
    button: true, closable: true, tab_width: 120, id: "tab02", size: "full", width: 120, height: 50, selected: true}
    
    it(`Debería agregar y ocultar tab02`, () =>
    {
        tab.addTab("tab02", options2);
        expect(tab.hideTab("tab02"));
    });
});

describe('showTab', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);

    const options2 = { callback: function () {console.log("Tab is being clicked")}, title: "Este es el titulo",
    button: true, closable: true, tab_width: 120, id: "tab02", size: "full", width: 120, height: 50, selected: true}
    it(`Debería agregar y ocultar un tab y al final mostrarlo`, () =>
    {
        tab.addTab("tab02", options2);
        tab.hideTab("tab02");
        expect(tab.showTab("tab02"));
    });
});

describe('transferTab', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);

    options.id = "tab02";
    options.callback = function () {console.log("Tab02 is being clicked")};
    const tab2 = Construct(options, false);
    it(`Debería crear y transferir otro tab`, () =>
    {
        expect(tab.transferTab("tab01", tab2));
    });
});

describe('detachTab', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);
    it(`Debería desatachear el tab01`, () =>
    {
        expect(tab.detachTab("tab01", function () {console.log("Tab complete")},
            function () {console.log("Tab on close")}));
    });
});

describe('destroy Tab', () => {
    const options = { mode: "horizontal", id: "tab01", size: "full", width: 120, height: 50,
        callback: function () {console.log("Tab is being clicked")}};
    const tab = Construct(options, false);
    it(`Debería destruir tab01`, () =>
    {
        expect(tab.destroy("tab01"));
    });
});
