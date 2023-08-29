import { LiteguiObject, PanelOptions, PanelRoot } from "./@types/globals";
import { LiteGUI } from "./core";

/** **************** PANEL **************/
export class Panel
{
	root: PanelRoot;
	title_height: string;
	options: PanelOptions;
	content: HTMLDivElement | string;
	header?: HTMLDivElement;
	footer: HTMLDivElement;

	constructor(id: string | PanelOptions, options?: PanelOptions)
	{
		if (!options && id && typeof id != 'string')
		{
			options = id;
			id = "";
		}

		const op = this.options = options = options ?? {};
	
		this.content = op.content ?? "";

		const root = this.root = document.createElement("div") as PanelRoot;
		if (id) {root.id = id as string;}

		root.className = "litepanel " + (op.className ?? "");
		root.data = this;

		let code = "";
		if (op.title) {code += "<div class='panel-header'>"+op.title+"</div>";}
		code += "<div class='content'>"+this.content+"</div>";
		code += "<div class='panel-footer'></div>";
		root.innerHTML = code;

		if (op.title) {this.header = this.root.querySelector(".panel-header")!;}

		this.content = this.root.querySelector(".content") as HTMLDivElement;
		this.footer = this.root.querySelector(".panel-footer") as HTMLDivElement;

		if (op.width) {this.root.style.width = LiteGUI.sizeToCSS(op.width) as string;}
		if (op.height) {this.root.style.height = LiteGUI.sizeToCSS(op.height) as string;}
		if (op.position)
		{
			this.root.style.position = "absolute";
			this.root.style.left = LiteGUI.sizeToCSS(op.position[0]) as string;
			this.root.style.top = LiteGUI.sizeToCSS(op.position[1]) as string;
		}

		// If(options.scroll == false)	this.content.style.overflow = "hidden";
		if (op.scroll == true) {this.content.style.overflow = "auto";}
		this.title_height = "20px";
	}

	add(litegui_item: LiteguiObject)
	{
		(this.content as Element).appendChild(litegui_item.root!);
	}

	clear()
	{
		while ((this.content as Element).firstChild)
		{
			(this.content as Element).removeChild((this.content as Element).firstChild!);
		}
	};
}