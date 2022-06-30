import { Area } from "../src/area";
import { LiteGUI } from "../src/core";

function Construct ()
{
    LiteGUI.init(); 
    let mainArea = new Area({ id: "mainArea", content_id:"canvasarea",
        height: "calc( 100% - 20px )", main: true, inmediateResize: true});
	LiteGUI.add( mainArea );
    return mainArea;
}

describe("Area Constructor Test", () => 
{
    it(`Should be defined:`, () =>
    {
        expect(Construct()).toBeDefined();
    });
});

describe('Split Test Vertical', () => 
{
    it('should Split Vertically', () => 
    {
        const area = Construct();
        let direction = Area.VERTICAL;
        area.onresize = function() 
        { 
            console.log('resize callback'); 
        };
        area.split(direction, [null,"100px"], true);
		let botArea = area.getSection(0);
		let topArea = area.getSection(1);
        let a = topArea;
        console.log('Section top area: ' + a);
        expect(a).toBeDefined();
    });
});

describe('Split Test Horizontally', () => 
{
    it('should Split Horizontally', () => 
    {
        const area = Construct();
        let direction = Area.HORIZONTAL;
        area.onresize = function() 
        { 
            console.log('resize callback'); 
        };
        area.split(direction, [null,"100px"], true);
		let leftArea = area.getSection(0);
		let rightArea = area.getSection(1);
        let a = rightArea;
        console.log('Section right area: ' + a);
        expect(a).toBeDefined();
    });
});

describe('Split Test nested', () => 
{
    it('should Split Vertically and then Horizontally', () => 
    {
        const area = Construct();
        let direction = Area.VERTICAL;
        area.onresize = function() 
        { 
            console.log('resize callback'); 
        };
        area.split(direction, [null,"100px"], true);
		let botArea = area.getSection(0);
		let topArea = area.getSection(1);

        direction = Area.HORIZONTAL;
		topArea!.split(direction, [null,340],true);
		let rightArea = topArea!.getSection(1);
        console.log('Section right area: ' + rightArea);
        expect(rightArea).toBeDefined();
    });
});

describe('Set Area Size Test', () => 
{
    it('should set the Area size', () => 
    {
        const area = Construct();
        let direction = Area.VERTICAL;
        let width = 100;
        area.onresize = function() 
        { 
            console.log('resize callback'); 
        };
        area.split(direction, [null,"100px"], true);
		let botArea = area.getSection(0);
		let topArea = area.getSection(1);
        area?.setAreaSize(area, width);
        console.log('Section h: ' + topArea);
        expect(topArea).toBeDefined();
    });
});

describe('Merge Area Test', () => 
{
    it('should merge the Area', () => 
    {
        const area = Construct();
        let direction = Area.VERTICAL;
        area.onresize = function() 
        { 
            console.log('resize callback'); 
        };
        area.split(direction, [null,"100px"], true);
		let botArea = area.getSection(0);
		let topArea = area.getSection(1);
        console.log('Section pre merge: ' + area.sections.length);
        area?.merge();
        console.log('Section post merge: ' + area.sections.length);
        expect(area.sections.length).toBe(0);
    });
});

describe('Add Object Area Test', () => 
{
    it('should add object to Area', () => 
    {
        const area = Construct();
        let direction = Area.VERTICAL;
        area.onresize = function() 
        { 
            console.log('resize callback'); 
        };
        area.split(direction, [null,"100px"], true);
        var docked = new LiteGUI.Panel("right_panel", {title:'Docked panel', close: true});
		let botArea = area.getSection(0);
		let topArea = area.getSection(1);
        console.log('Section pre add: ' + topArea?.content.childNodes.length);
        topArea?.add(docked);
        console.log('Section post add: ' + topArea?.content.childNodes.length);
        expect(topArea?.content!).toBeDefined();
    });
});