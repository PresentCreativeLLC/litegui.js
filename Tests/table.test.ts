import { LiteGUI } from "../src/core";

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
    expect(Construct(options)).toBeDefined();
});


describe("Table set row test", () => {
    const options = { height : "40px", scrollable: false  }; 
    const table = Construct(options);

    table.setRows(testRows, true);
    expect(table.rows.length > 0);
});


describe("Table add row test", () => {
    const options = { height : "40px", scrollable: false  }; 
    const table = Construct(options);
    
    table.setRows(testRows, true);
    const extraRow = { name: "test4", age: 4, address: "none"};

    table.addRow(extraRow, false);
    expect(table.rows.length === 4);
});

describe("Table update row test", () => {
    const options = { height : "40px", scrollable: false  }; 
    const table = Construct(options);
    table.setRows(testRows, true);

    const extraRow = { name: "test4", age: 4, address: "none"};
    table.updateRow(0, extraRow);
    expect((table.rows[0] as any).name === "test4");
});

describe("Table update cell test", () => {
    const options = { height : "40px", scrollable: false  }; 
    const table = Construct(options);

    table.setRows(testRows, true);

    expect(table.updateCell(0, 0, "fixedTest" )).toBeDefined();
});

describe("Table set column test", () => {
    const options = { height : "40px", scrollable: false  }; 
    const table = Construct(options);
    table.setColumns(["Name",{ name: "Age", width: 50 },"Address"]);
    expect(true);
});

describe("Table update content test", () => {
    const options = { height : "40px", scrollable: false  }; 
    const table = Construct(options);
    table.data = testRows;
    table.updateContent(true);
    expect(table.rows.length > 0);
});