import { widget } from "../src/widgets";

/* function Construct ()
{
    return new widget();
}

describe('Construct widget', () => {
    it(`Should be defined`, () =>{
        expect(Construct()).toBeDefined();
    });
});

describe('Construct button', () => {
    const widget = Construct();
    it(`Should create button`, () =>
    {
        expect(widget.createButton("Button01", {callback: () => {console.log("button clicked");}}));
    });
});

describe('click button', () => {
    const widget = Construct();
    const button = widget.createButton("Button01", {callback: () => {console.log("button clicked");}});
    it(`Should click button`, () =>
    {
        expect(button.click());
    });
});

describe('Construct searchbox', () => {
    const widget = Construct();
    it(`Should construct searchbox`, () =>
    {
        expect(widget.createSearchBox("Searchbox01", {callback: () => {console.log("searchbox clicked");}, placeholder: "type to search"}));
    });
});

describe('setValue searchbox', () => {
    const widget = Construct();
    const searchbox = widget.createSearchBox("Searchbox01", {callback: () => {console.log("searchbox clicked");}, placeholder: "type to search"});
    it(`Should set busqueda genérica`, () =>
    {
        expect(searchbox.setValue("busqueda genérica"));
    });
});

describe('getValue searchbox', () => {
    const widget = Construct();
    const searchbox = widget.createSearchBox("Searchbox01", {callback: () => {console.log("searchbox clicked");}, placeholder: "type to search"});
    searchbox.setValue("busqueda genérica");
    it(`Should get busqueda genérica`, () =>
    {
        expect(searchbox.getValue()).toBe("busqueda genérica");
    });
});

describe('Construct ContextMenu', () => {
    const widget = Construct();
    const values = ["Valor1", "Valor2", "Valor3"];
    const options = {title: "Titulo genérico"};
    it(`Should construct contextMenu`, () =>
    {
        expect(widget.createContextMenu(values, options));
    });
});

describe('close ContextMenu', () => {
    const widget = Construct();
    const values = ["Valor1", "Valor2", "Valor3"];
    const options = {title: "Titulo genérico"};
    const context = widget.createContextMenu(values, options);
    it(`Should close the contextMenu`, () =>
    {
        expect(context.close(undefined, false));
    });
});

describe('getTopMenu ContextMenu', () => {
    const widget = Construct();
    const values = ["Valor1", "Valor2", "Valor3"];
    const options = {title: "Titulo genérico"};
    const context = widget.createContextMenu(values, options);
    it(`Should get the topMenu`, () =>
    {
        expect(context.getTopMenu());
    });
});

describe('getFirstEvent ContextMenu', () => {
    const widget = Construct();
    const values = ["Valor1", "Valor2", "Valor3"];
    const options = {title: "Titulo genérico"};
    const context = widget.createContextMenu(values, options);
    it(`Should get Valor1`, () =>
    {
        expect(context.getFirstEvent());
    });
});

describe('construct Checkbox', () => {
    const widget = Construct();
    it(`Should construct checkbox`, () =>
    {
        expect(widget.createCheckbox(false, () => {console.log("checkbox changed")}));
    });
});

describe('setValue Checkbox', () => {
    const widget = Construct();

    const check = widget.createCheckbox(false, () => {console.log("checkbox changed")});
    it(`Should set it as true`, () =>
    {
        expect(check.setValue(true));
    });
});

describe('getValue Checkbox', () => {
    const widget = Construct();

    const check = widget.createCheckbox(false, () => {console.log("checkbox changed")});
    check.setValue(true);
    it(`Should get a true`, () =>
    {
        expect(check.getValue());
    });
});

describe('onClick Checkbox', () => {
    const widget = Construct();

    const check = widget.createCheckbox(false, () => {console.log("checkbox changed")});
    it(`Should click in it`, () =>
    {
        expect(check.onClick(new MouseEvent("onclick")));
    });
});

describe('createCheckbox litebox', () => {
    it(`Should create liteBox`, () =>
    {
        expect(widget.createLitebox(true, () => {console.log("litebox changed")}));
    });
});

describe('setValue litebox', () => {

    const litebox = widget.createLitebox(true, () => {console.log("litebox changed")});
    it(`Should set as true`, () =>
    {
        expect(litebox.setValue(true));
    });
});

describe('getElement litebox', () => {
    const litebox = widget.createLitebox(true, () => {console.log("litebox changed")});
    it(`Should get element`, () =>
    {
        expect(litebox.getValue()).toBeDefined();
    });
});

describe('Construct List', () => {
    const widget = Construct();
    interface item{
        name: string,
        title: string,
        id: string
    };

    const items: item[] = [
        {name: "Pos0", title: "Title0", id: "Pos0"},
        {name: "Pos1", title: "Title1", id: "Pos1"},
        {name: "Pos2", title: "Title2", id: "Pos2"},
        {name: "Pos3", title: "Title3", id: "Pos3"},
    ];
    it(`Should construct list`, () =>
    {
        expect(widget.createList("List01", items, {callback: () => {console.log("litebox changed")}}));
    });
});

describe('getSelectedItem List', () => {
    const widget = Construct();
    interface item{
        name: string,
        title: string,
        id: string
    };

    const items: item[] = [
        {name: "Pos0", title: "Title0", id: "Pos0"},
        {name: "Pos1", title: "Title1", id: "Pos1"},
        {name: "Pos2", title: "Title2", id: "Pos2"},
        {name: "Pos3", title: "Title3", id: "Pos3"},
    ];
    const list = widget.createList("List01", items, {callback: () => {console.log("litebox changed")}});
    list.setSelectedItem("Pos1");
    it(`Should get Pos1, title 1`, () =>
    {
        expect(list.getSelectedItem());
    });
});

describe('setSelectedItem List', () => {
    const widget = Construct();
    interface item{
        name: string,
        title: string,
        id: string
    };

    const items: item[] = [
        {name: "Pos0", title: "Title0", id: "Pos0"},
        {name: "Pos1", title: "Title1", id: "Pos1"},
        {name: "Pos2", title: "Title2", id: "Pos2"},
        {name: "Pos3", title: "Title3", id: "Pos3"},
    ];
    const list = widget.createList("List01", items, {callback: () => {console.log("litebox changed")}});
    it(`Should select Pos1`, () =>
    {
        expect(list.setSelectedItem("Pos1"));
    });
});

describe('Construct Slider', () => {
    const widget = Construct();
    it(`Should construct slider`, () =>
    {
        expect(widget.createSlider(0.3, {min: 0, max: 1}));
    });
});

describe('setFromX Slider', () => {
    const widget = Construct();

    const slider = widget.createSlider(0.3, {min: 0, max: 1});
    it(`Should set x in 1`, () =>
    {
        expect(slider.setFromX(1));
    });
});

describe('onMouseMove Slider', () => {
    const widget = Construct();

    const slider = widget.createSlider(0.3, {min: 0, max: 1});
    it(`Should move mouse`, () =>
    {
        expect(slider.onMouseMove(new MouseEvent("onmousemove")));
    });
});

describe('onMouseUp Slider', () => {
    const widget = Construct();

    const slider = widget.createSlider(0.3, {min: 0, max: 1});
    it(`Should up the click`, () =>
    {
        expect(slider.onMouseUp(new MouseEvent("onmouseup")));
    });
});

describe('setValue Slider', () => {
    const widget = Construct();

    const slider = widget.createSlider(0.3, {min: 0, max: 1});
    it(`Should down the click`, () =>
    {
        expect(slider.setValue(0.3, false));
    });
});

describe('Construct LineEditor', () => {
    const widget = Construct();
    const valuesArray = [[0,0], [50,50], [100,100], [200,200]];
    it(`Should construct lineEditor`, () =>
    {
        expect(widget.createLineEditor(valuesArray,{}));
    });
});

describe('getValueAt LineEditor', () => {
    const widget = Construct();
    const valuesArray = [[0,0], [50,50], [100,100], [200,200]];
    const lineEditor = widget.createLineEditor(valuesArray,{});
    it(`Should value at half`, () =>
    {
        expect(lineEditor.getValueAt(0.5));
    });
});

describe('resample LineEditor', () => {
    const widget = Construct();
    const valuesArray = [[0,0], [50,50], [100,100], [200,200]];
    const lineEditor = widget.createLineEditor(valuesArray,{});
    it(`Should sample in 4`, () =>
    {
        expect(lineEditor.resample(4));
    });
});

describe('addValue LineEditor', () => {
    const widget = Construct();
    const valuesArray = [[0,0], [50,50], [100,100], [200,200]];
    const lineEditor = widget.createLineEditor(valuesArray,{});
    it(`Should add 300,300`, () =>
    {
        expect(lineEditor.addValue([300,300]));
    });
});

describe('convert LineEditor', () => {
    const widget = Construct();
    const valuesArray = [[0,0], [50,50], [100,100], [200,200]];
    const lineEditor = widget.createLineEditor(valuesArray,{});
    it(`Should convert 300,300`, () =>
    {
        expect(lineEditor.convert([300,300]));
    });
});

describe('unconvert LineEditor', () => {
    const widget = Construct();
    const valuesArray = [[0,0], [50,50], [100,100], [200,200]];
    const lineEditor = widget.createLineEditor(valuesArray,{});
    it(`Should unconvert 300,300`, () =>
    {
        expect(lineEditor.unconvert([300,300]));
    });
});

describe('redraw LineEditor', () => {
    const widget = Construct();
    const valuesArray = [[0,0], [50,50], [100,100], [200,200]];
    const lineEditor = widget.createLineEditor(valuesArray,{});
    lineEditor.redraw();
    
    it(`Should add 300,300 and redraw it`, () =>
    {
        lineEditor.addValue([300,300]);
        expect(lineEditor.redraw());
    });
});

describe('onmousedown LineEditor', () => {
    const widget = Construct();
    const valuesArray = [[0,0], [50,50], [100,100], [200,200]];
    const lineEditor = widget.createLineEditor(valuesArray,{});
    const evt = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: 0,
        clientY: 0
    });
    it(`Should mouse down`, () =>
    {
        expect(lineEditor.onmousedown(evt));
    });
});

describe('onmousemove LineEditor', () => {
    const widget = Construct();
    const valuesArray = [[0,0], [50,50], [100,100], [200,200]];
    const lineEditor = widget.createLineEditor(valuesArray,{});
    const evt = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: 0,
        clientY: 0
    });
    it(`Should mouse move`, () =>
    {
        expect(lineEditor.onmousemove(evt));
    });
});

describe('onmouseup LineEditor', () => {
    const widget = Construct();
    const valuesArray = [[0,0], [50,50], [100,100], [200,200]];
    const lineEditor = widget.createLineEditor(valuesArray,{});
    const evt = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: 0,
        clientY: 0
    });
    it(`Should mouse up`, () =>
    {
        expect(lineEditor.onmouseup(evt));
    });
});

describe('onresize LineEditor', () => {
    const widget = Construct();
    const valuesArray = [[0,0], [50,50], [100,100], [200,200]];
    const lineEditor = widget.createLineEditor(valuesArray,{});
    it(`Should resize it`, () =>
    {
        expect(lineEditor.onresize({}));
    });
});

describe('onchange LineEditor', () => {
    const widget = Construct();
    const valuesArray = [[0,0], [50,50], [100,100], [200,200]];
    const lineEditor = widget.createLineEditor(valuesArray,{});
    it(`Should trigger the on change`, () =>
    {
        expect(lineEditor.onchange());
    });
});

describe('distance LineEditor', () => {
    const widget = Construct();
    const valuesArray = [[0,0], [50,50], [100,100], [200,200]];
    const lineEditor = widget.createLineEditor(valuesArray,{});
    it(`Should be 70.71`, () =>
    {
        expect(lineEditor.distance(valuesArray[1], valuesArray[2]));
    });
});

describe('computeSelected LineEditor', () => {
    const widget = Construct();
    const valuesArray = [[0,0], [50,50], [100,100], [200,200]];
    const lineEditor = widget.createLineEditor(valuesArray,{});
    it(`Should compute 0,0`, () =>
    {
        expect(lineEditor.computeSelected(0, 0));
    });
});

describe('sortValues LineEditor', () => {
    const widget = Construct();
    const valuesArray = [[0,0], [50,50], [100,100], [200,200]];
    const lineEditor = widget.createLineEditor(valuesArray,{});
    it(`Should sort the values`, () =>
    {
        expect(lineEditor.sortValues());
    });
});

describe('Construct ComplexList', () => {
    const widget = Construct();
    it(`Should construct complexList`, () =>
    {
        expect(widget.createComplexList({height: 50}));
    });
});

describe('addTitle ComplexList', () => {
    const widget = Construct();
    const list = widget.createComplexList({height: 50});
    it(`Should add titulo de lista`, () =>
    {
        expect(list.addTitle("Titulo de lista"));
    });
});

describe('addHTML ComplexList', () => {
    const widget = Construct();
    const list = widget.createComplexList({height: 50});
    const callableFunction: CallableFunction = () => {console.log("aditional list clicked")};
    it(`Should aditional list`, () =>
    {
        expect(list.addHTML("aditional list", callableFunction));
    });
});

describe('clear ComplexList', () => {
    const widget = Construct();
    const list = widget.createComplexList({height: 50});
    it(`Should clear it`, () =>
    {
        expect(list.clear());
    });
});

describe('addItem ComplexList', () => {
    const widget = Construct();
    const list = widget.createComplexList({height: 50});
    const item = document.createElement("div") as HTMLDivElement;
    it(`Should add item generico`, () =>
    {
        expect(list.addItem(item, "item generico", true, true));
    });
}); */
