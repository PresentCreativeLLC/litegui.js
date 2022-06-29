import { Tree } from "../src/tree";
import { LiteGUI } from "../src/core";
import { ChildNodePlus } from "./../src/@types/globals";

/*
const myTree =
{
		id: "root",
		children: [
				{id: "Scene"},
				{id: "Sun"},
				{
						id: "Cameras",
						children: [
								{id: "Camera 1"},
								{id: "Camera 2"},
								{id: "Camera 3"}
						]
				},
				{
						id: "Planets",
						children: [
								{id: 'Planet 1'},
								{id: 'Planet 2'},
								{id: 'Moon'}
						]
				},
				{
						id: "Stations",
						children: [
								{id: 'Station 1'},
								{id: 'Station 2'},
								{id: 'Station 3'},
								{id: 'Station 4'}
						]
				}
		]
};


const myNewTree =
{
		id: "new tree",
		children: [
				{
						id: "Moons",
						children: [
								{id: 'Moon 1'},
								{id: 'Moon 2'}
						]
				}
		]
};


const newItem =
{
						id: "Moons",
						children: [
								{id: 'Moon 1'},
								{id: 'Moon 2'}
						]
			
};
function Construct (data: any, options: any, legacy:any)
{
	return new LiteGUI.Tree(data, options, legacy);
}
//For the tests to run I commented the lines that used this._updateListBox, since I was getting an error about using "box" before initializing it, I think this is something visual
describe("Test de creacion tree", () => {
	const options = { height:200, allow_rename: false, allow_drag: true, allow_multiselection: false };
	const legacy = "";
	const data = ["1", "2", "3"]

	it(`Debería resultar ${5}`, () =>{
			expect(Construct(myTree, options, legacy)).toBeDefined();
	});
});

describe('get children', () => {
	const options = {  height:200, allow_rename: false, allow_drag: true, allow_multiselection: false};
	const legacy = "";
	const tree = Construct(myTree, options, legacy);
	const children = tree.getChildren("Planets", true) as ChildNodePlus[];
	it(`Los children de planets`, () =>{
		expect(	children.length).toBe(3);
});
})

describe('get parent', () => {
	const options = {  height:200, allow_rename: false, allow_drag: true, allow_multiselection: false};
	const legacy = "";
	const tree = Construct(myTree, options, legacy);
	const parent = tree.getParent("Moon") as ChildNodePlus;
	const parentId = parent.data.id;

	it(`El parent de Moon`, () =>{
		expect (parentId).toBe("Planets");
});
})

describe('clear tree', () => {
	const options = {  height:200, allow_rename: false, allow_drag: true, allow_multiselection: false};
	const legacy = "";
	const tree = Construct(myTree, options, legacy);
	tree.updateTree(myTree);
	tree.clear(true);
	const children = tree.getChildren("root", true) as ChildNodePlus[];
	it(`Clear tree`, () =>{
		expect (children.length).toBe(0);
});
})

describe('update tree', () => {
	const options = {  height:200, allow_rename: false, allow_drag: true, allow_multiselection: false};
	const legacy = "";
	const tree = Construct(myTree, options, legacy);
	//double check this function, since the old data is not being discarded as the description says
	tree.updateTree(myNewTree);
	const children = tree.getChildren("new tree", true) as ChildNodePlus[];
	it(`Clear tree`, () =>{
		expect (children.length).toBe(1);
});
})

describe('insert item', () => {
	const options = {  height:200, allow_rename: false, allow_drag: true, allow_multiselection: false};
	const legacy = "";
	const tree = Construct(myTree, options, legacy);
	tree.updateTree(myTree);
	tree.insertItem(newItem, "Stations", 0, options)
	const children = tree.getChildren("Stations", true) as ChildNodePlus[];
	it(`i should have new item`, () =>
	{
			expect(children.length).toBe(5);
	});
});

describe('remove item', () => {
	const options = {  height:200, allow_rename: false, allow_drag: true, allow_multiselection: false};
	const legacy = "";
	const tree = Construct(myTree, options, legacy);
	tree.updateTree(myTree);
	tree.removeItem("Planets", true)
	const children = tree.getChildren("root", true) as ChildNodePlus[];
	it(`we have one less child`, () =>
	{
			expect(children.length).toBe(4);
	});
});


describe('filter by name', () => {
	const options = {  height:200, allow_rename: false, allow_drag: true, allow_multiselection: false};
	const legacy = "";
	const tree = Construct(myTree, options, legacy);
	tree.updateTree(myTree);
	console.log(tree)
	const filtered = tree.filterByName("Planet");
	console.log(filtered)
	console.log(tree)

	it(`Quiero el nuevo data`, () =>
	{
			expect(2+2).toBe(4);
	});
});
*/