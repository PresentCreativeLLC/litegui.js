/* import { Inspector } from "../src/inspector";

function Construct ()
{
    return new Inspector();
}

describe("Inspector Constructor Test", () => 
{
    it(`Should be defined:`, () =>
    {
        expect(Construct()).toBeDefined();
    });
});

describe('Get Values Test', () => 
{
    it('should get the stored values', () => 
    {
        const inspector = Construct();
        expect(inspector.getValues()).toBeDefined();
    });
});

describe('Add Number Test', () => 
{
    it('should Add Number value', () => 
    {
        const inspector = Construct();
        let width = 1000;
        inspector.addNumber("Width: ", 1000,
        {
            position: 1000, min: 1, step: 1, precision: 0, add_dragger: true, units: "px",
            callback: function(value: any) { width = value; },
            finalCallback: function(value: any) { width = value; }
        });
        let a = inspector.getValue("Width: ");
        console.log('Width is: ' + a);
        expect(a).toBe(width);
    });
});

describe('Add Vector 2 Test', () => 
{
    it('should Add Vector2 value', () => 
    {
        const inspector = Construct();
        let Point0V2 = { x: 200, y: 400};
        const point0Callback = function(value: any, updateInterface: any)
        {
            Point0V2.x = value[0];
            Point0V2.y = value[1];
        };
        inspector.addVector2("Point0",[Point0V2.x, Point0V2.y], { min: 0, max: 1, step: 0.01, precision: 2,
            callback: function(value: any) {point0Callback(value, false);},
            finalCallback: function(value: any) {point0Callback(value, true);}
        });
        let a = inspector.getValue("Point0");
        console.log('Vector2 values are: ' + a);
        expect(a[1]).toBe(Point0V2.y);
    });
});

describe('Add Vector 3 Test', () => 
{
    it('should Add Vector3 value', () => 
    {
        const inspector = Construct();
        let Point0V3 = { x: 200, y: 400, z: 300};
        const point0Callback = function(value: any, updateInterface: any)
        {
            Point0V3.x = value[0];
            Point0V3.y = value[1];
            Point0V3.z = value[2];
        };
        inspector.addVector3("Vector3_0",[Point0V3.x, Point0V3.y, Point0V3.z], { min: 0, max: 1, step: 0.01, precision: 2,
                callback: function(value: any) {point0Callback(value, false);},
                finalCallback: function(value: any) {point0Callback(value, true);}
            });
        let a = inspector.getValue("Vector3_0");
        console.log('Vector3 values are: ' + a);
        expect(a[2]).toBe(Point0V3.z);
    });
});

describe('Add Vector 4 Test', () => 
{
    it('should Add Vector4 value', () => 
    {
        const inspector = Construct();
        let Point0V4 = { x: 200, y: 400, z: 300, w: 500};
        const point0Callback = function(value: any, updateInterface: any)
        {
            Point0V4.x = value[0];
            Point0V4.y = value[1];
            Point0V4.z = value[2];
            Point0V4.w = value[3];
        };
        inspector.addVector4("Vector4_0",[Point0V4.x, Point0V4.y, Point0V4.z, Point0V4.w], { min: 0, max: 1, step: 0.01, precision: 2,
                callback: function(value: any) {point0Callback(value, false);},
                finalCallback: function(value: any) {point0Callback(value, true);}
            });
        let a = inspector.getValue("Vector4_0");
        console.log('Vector4 values are: ' + a);
        expect(a[3]).toBe(Point0V4.w);
    });
});

describe('Add Pad Test', () => 
{
    it('should Add Pad', () => 
    {
        const inspector = Construct();
        let ObjName = "Pad0";
        inspector.addPad(ObjName, [0.5, 0.5], function(v: any){ console.log(v); });
        let a = inspector.getValue(ObjName);
        console.log('Pad values are: ' + a);
        expect(inspector.getValue(ObjName)).toBeDefined();
    });
});

describe('Add Info Test', () => 
{
    it('should Add Info', () => 
    {
        const inspector = Construct();
        let ObjName = "Info0";
        let ObjInfo = "a really long silly text";
        inspector.addInfo(ObjName, ObjInfo);
        let a = inspector.getValue(ObjName);
        console.log('Info values are: ' + a);
        expect(inspector.getWidget(ObjName)).toBeDefined();
    });
});

describe('Add Slider Test', () => 
{
    it('should Add Slider', () => 
    {
        const inspector = Construct();
        let ObjName = "slider0";
        let ObjValue = 10;
        inspector.addSlider(ObjName, ObjValue, {min:1,max:100,step:1});
        let a = inspector.getValue(ObjName);
        console.log('Slider value is: ' + a);
        expect(inspector.getValue(ObjName)).toBe(ObjValue);
    });
});

describe('Add Checkbox Test', () => 
{
    it('should Add Checkbox', () => 
    {
        const inspector = Construct();
        let ObjName = "checkbox0";
        let ObjValue = true;
        inspector.addCheckbox(ObjName, ObjValue);
        let a = inspector.getValue(ObjName);
        console.log('Checkbox value is: ' + a);
        expect(inspector.getValue(ObjName)).toBe(ObjValue);
    });
});

describe('Add Flags Test', () => 
{
    it('should Add Flags', () => 
    {
        const inspector = Construct();
        let ObjValue = [true, false, true];
        inspector.addFlags(ObjValue);
        let a = inspector.getValue("2");
        console.log('Flag widget is: ' + a);
        expect(a).toBe(ObjValue[2]);
    });
});

describe('Add Combo Test', () => 
{
    it('should Add Combo', () => 
    {
        const inspector = Construct();
        let ObjName = "combo0";
        let ObjValue = "javi";
        let enumValues = ["foo","faa","super largo texto que no cabe entero","javi","nada"]
        inspector.addCombo(ObjName, ObjValue, {values: enumValues});
        let a = inspector.getValue(ObjName);
        console.log('Combo value is: ' + a);
        expect(inspector.getValue(ObjName)).toBe(ObjValue);
    });
});

describe('Add Combo Buttons Test', () => 
{
    it('should Add Combo Buttons', () => 
    {
        const inspector = Construct();
        let ObjName = "combobuttons0";
        let ObjValue = "javi";
        let enumValues = ["foo","faa","javi","nada"]
        inspector.addComboButtons(ObjName, ObjValue, 
            {
                values: enumValues, callback: function(name: any) 
                { 
                    console.log("Combo button selected: " + name); 
                }
            });
        let a = inspector.getValue(ObjName);
        console.log('Combo buttons value is: ' + a);
        expect(inspector.getValue(ObjName)).toBe(ObjValue);
    });
});

describe('Add Tags Test', () => 
{
    it('should Add Tags', () => 
    {
        const inspector = Construct();
        let ObjName = "tags0";
        let ObjValue = "pop";
        let enumValues = ["rap","blues","pop","jazz"]
        inspector.addTags(ObjName, ObjValue, 
            {
                values: enumValues, callback: function(tags: any) 
                { 
                    console.log("Tag added: " + JSON.stringify(tags) ); 
                }
            });
        let a = inspector.getValue(ObjName);
        console.log('Tags value is: ' + a);
        expect(inspector.getValue(ObjName)).toBe(ObjValue);
    });
});

describe('Add List Test', () => 
{
    it('should Add List', () => 
    {
        const inspector = Construct();
        let ObjName = "list0";
        let enumValues = ["rap","blues","pop","jazz"]
        inspector.addList(ObjName, enumValues, 
            {
                values: enumValues, callback: function(name: any) 
                { 
                    console.log("List added: " + JSON.stringify(name) ); 
                }
            });
        let a = inspector.getValue(ObjName);
        console.log('List value is: ' + a);
        expect(inspector.getWidget(ObjName)).toBeDefined();
    });
});

describe('Add Button Test', () => 
{
    it('should Add Button', () => 
    {
        const inspector = Construct();
        let ObjName = "Serialize";
        let ObjValue = "Save";
        inspector.addButton(ObjName, ObjValue, 
            {
                callback: function(name: any) 
                { 
                    console.log("Button pressed: " + name); 
                }
            });
        let a = inspector.getWidget(ObjName);
        console.log('Button Obj: ' + a);
        expect(a).toBeDefined();
    });
});

describe('Add Buttons Test', () => 
{
    it('should Add Buttons', () => 
    {
        const inspector = Construct();
        let ObjName = "Serialize";
        let ObjValue = ["Save","Load","New"];
        inspector.addButtons(ObjName, ObjValue, 
            {
                callback: function(name: any) 
                { 
                    console.log("Button pressed: " + name); 
                }
            });
        let a = inspector.getWidget(ObjName);
        console.log('Button Obj: ' + a);
        expect(a).toBeDefined();
    });
});

describe('Add Icon Test', () => 
{
    it('should Add Icon', () => 
    {
        const inspector = Construct();
        let ObjName = "Icon";
        let ObjValue = 100;
        inspector.addIcon(ObjName, ObjValue, 
            {
                callback: function(name: any) 
                { 
                    console.log("Button pressed: " + name); 
                }
            });
        let a = inspector.getWidget(ObjName);
        console.log('Icon Obj: ' + a);
        expect(a).toBeDefined();
    });
});

describe('Add Color Test', () => 
{
    it('should Add Color value', () => 
    {
        const inspector = Construct();
        const colorRef = [0,1,0];
        inspector.addColor("Color", colorRef);
        let a = inspector.getValue("Color");
        console.log('color is: ' + a);
        expect(a).toBe(colorRef);
    });
});

describe('Add Color Position Test', () => 
{
    it('should Add Color Position', () => 
    {
        const inspector = Construct();
        let ObjName = "ColorPos";
        let ObjValue = [0, 1, 0];
        inspector.addColorPosition(ObjName, ObjValue, 
            {
                position: 100, min: 0, max: 100, step: 1,
                precision: 0,units: "%",add_dragger: true,
                callback: function() 
                { 
                    console.log("Color Position changed?"); 
                }
            });
        let a = inspector.getValue(ObjName);
        console.log('Color Position Value: ' + a);
        expect(a).toBe(ObjValue);
    });
});

describe('Add File Test', () => 
{
    it('should Add File', () => 
    {
        const inspector = Construct();
        let ObjName = "File";
        let ObjValue = "test.png";
        inspector.addFile(ObjName, ObjValue, 
            {
                callback: function() 
                { 
                    console.log("File Added"); 
                }
            });
        let a = inspector.getWidget(ObjName);
        console.log('File: ' + a);
        expect(a).toBeDefined();
    });
});

describe('Add Line Test', () => 
{
    it('should Add Line', () => 
    {
        const inspector = Construct();
        let ObjName = "Line";
        let ObjValue = [[0.5, 1], [0.75, 0.25]];
        inspector.addLine(ObjName, ObjValue, 
            {
                defaulty:0,
                width:120
            });
        let a = inspector.getValue(ObjName);
        console.log('Line: ' + a);
        expect(a).toBe(ObjValue);
    });
});

describe('Add Tree Test', () => 
{
    it('should Add Tree', () => 
    {
        const inspector = Construct();
        let ObjName = "tree";
        let ObjValue = 
            { 
                person: "javi", 
                info: 
                    { 
                        age: 32, 
                        location: "barcelona" 
                    }, 
                role: "worker"
            };
        inspector.addTree(ObjName, ObjValue);
        let a = inspector.getWidget(ObjName);
        console.log('Tree: ' + a);
        expect(a).toBeDefined();
    });
});

describe('Add DataTree Test', () => 
{
    it('should Add DataTree', () => 
    {
        const inspector = Construct();
        let ObjName = "dataTree";
        let ObjValue = 
            { 
                person: "javi", 
                info: 
                    { 
                        age: 32, 
                        location: "barcelona" 
                    }, 
                role: "worker"
            };
        inspector.addDataTree(ObjName, ObjValue);
        let a = inspector.getWidget(ObjName);
        console.log('DataTree: ' + a);
        expect(a).toBeDefined();
    });
});

describe('Add Array Test', () => 
{
    it('should Add Array', () => 
    {
        const inspector = Construct();
        let ObjName = "array";
        let ObjValue = [0, 1, 2, 3, 4];
        inspector.addArray(ObjName, ObjValue);
        let a = inspector.getWidget(ObjName);
        console.log('Array: ' + a);
        expect(a).toBeDefined();
    });
});

describe('Add Container Test', () => 
{
    it('should Add Container', () => 
    {
        const inspector = Construct();
        let ObjName = "container";
        // let ObjValue = [0, 1, 2, 3, 4];
        let a = inspector.addContainer(ObjName);
        console.log('Container: ' + a);
        expect(a).toBeDefined();
    });
});

describe('Start Container Test', () => 
{
    it('should Start Container', () => 
    {
        const inspector = Construct();
        let ObjName = "container";
        // let ObjValue = [0, 1, 2, 3, 4];
        let a = inspector.startContainer(ObjName);
        console.log('started Container: ' + a);
        expect(a).toBeDefined();
    });
});

describe('Add Section Test', () => 
{
    it('should Add Section', () => 
    {
        const inspector = Construct();
        let ObjName = "Text stuff";
        let a = inspector.addSection(ObjName);
        console.log('Section: ' + a);
        expect(a).toBeDefined();
    });
});

describe('Set/Get Current Section Test', () => 
{
    it('should Set/Get Current Section', () => 
    {
        const inspector = Construct();
        let ObjName = "Text stuff";
        let section = inspector.addSection(ObjName);
        inspector.setCurrentSection(section);
        let a = inspector.getCurrentSection();
        console.log('Current Section: ' + a);
        expect(a).toBe(section);
    });
});

describe('Begin Group Test', () => 
{
    it('should Begin Group', () => 
    {
        const inspector = Construct();
        let ObjName = "Group name";
        let a = inspector.beginGroup(ObjName);
        console.log('Current Group: ' + a);
        expect(a).toBeDefined();
    });
});

describe('Add Title Test', () => 
{
    it('should Add Title', () => 
    {
        const inspector = Construct();
        let ObjName = "Title";
        let a = inspector.beginGroup(ObjName);
        console.log('Current Title: ' + a);
        expect(a).toBeDefined();
    });
}); */