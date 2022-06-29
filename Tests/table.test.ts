/* import { LiteGUI } from "../src/core";

const testRows = [
    { name: "test1", age: 1, address: "none" }, 
    { name: "test2", age: 2, address: "none" }, 
    { name: "test3", age: 3, address: "none" },
];


function Construct (options: any)
{
    return new LiteGUI.Table(options);
}

describe("Table Init test", () => {
    const options = { height : "40px", scrollable: false  }; 
    it("Should be defined", () => {
        expect(Construct(options)).toBeDefined();
    });
});


describe("Table set row test", () => {
    const options = { height : "40px", scrollable: false  }; 
    const table = Construct(options);
    table.setColumns(["Name",{ name: "Age", width: 50 },"Address"]);
    table.setRows(testRows, true);
    it("Table length should be greater than 0", () => {
        expect(table.rows.length).toBeGreaterThan(0);
    });
});


describe("Table add row test", () => {
    const options = { height : "40px", scrollable: false  }; 
    const table = Construct(options);
    table.setColumns(["Name",{ name: "Age", width: 50 },"Address"]);
    table.setRows(testRows, false);
    const extraRow = { name: "test4", age: 4, address: "none"};

    table.addRow(extraRow, false);

    it("Table length should be 4", () => {
        expect(table.rows.length).toBe(4);
    });
});

describe("Table update row test", () => {
    const options = { height : "40px", scrollable: false  }; 
    const table = Construct(options);
    table.setColumns(["Name",{ name: "Age", width: 50 },"Address"]);
    table.setRows(testRows, false);

    const extraRow = { name: "test4", age: 4, address: "none"};
    table.updateRow(0, extraRow);
    it("Table first element should be test4", () => {
        expect(table.rows[0].cells.item(0)!.innerHTML).toBe("test4");
    });
});

describe("Table update cell test", () => {
    const options = { height : "40px", scrollable: false  }; 
    const table = Construct(options);
    table.setColumns(["Name",{ name: "Age", width: 50 },"Address"]);
    table.setRows(testRows, false);
    it("Should create and return a cell", () => {
        expect(table.updateCell(0, 0, "fixedTest" )).toBeDefined();
    });
});

describe("Table set column test", () => {
    const options = { height : "40px", scrollable: false  }; 
    const table = Construct(options);
    table.setColumns(["Name",{ name: "Age", width: 50 },"Address"]);

    it("Table columns length should be greater than 0", () => {
        expect(table.columns.length).toBeGreaterThan(0);
    });
    
});

describe("Table update content test", () => {
    const options = { height : "40px", scrollable: false  }; 
    const table = Construct(options);
    table.data = testRows;
    table.updateContent(true);

    it("Table row length should be greater than 0", () => {
        expect(table.rows.length).toBeGreaterThan(0);
    });
}); */