import { HTMLDivElementPlus, LiteguiObject, PanelOptions } from "./@types/globals";
import { LiteGUI } from "./core";

/** **************** PANEL **************/
export class Panel
{
	root?: HTMLDivElementPlus;
	static title_height: string;
	options: PanelOptions | {};
	content?: Element | string | null;
	header?: Element;
	footer?: Element;

	constructor(id: string, options?: PanelOptions | string | {})
	{
		if (!options && id && id.constructor !== String)
		{
			options = id;
			id = "";
		}

		this.options = options = options || {};

		const op = options as PanelOptions;

		this.content = op.content || "";

		const root = this.root = document.createElement("div") as HTMLDivElementPlus;
		if (id)
		{root.id = id;}

		root.className = "litepanel " + (op.className || "");
		root.data = this;

		let code = "";
		if (op.title)
		{code += "<div class='panel-header'>"+op.title+"</div>";}
		code += "<div class='content'>"+this.content+"</div>";
		code += "<div class='panel-footer'></div>";
		root.innerHTML = code;

		if (op.title)
		{this.header = this.root.querySelector(".panel-header")!;}

		this.content = this.root.querySelector(".content");
		this.footer = this.root.querySelector(".panel-footer")!;

		if (op.width)
		{this.root.style.width = LiteGUI.sizeToCSS(op.width) as string;}
		if (op.height)
		{this.root.style.height = LiteGUI.sizeToCSS(op.height) as string;}
		if (op.position)
		{
			this.root.style.position = "absolute";
			this.root.style.left = LiteGUI.sizeToCSS(op.position[0]) as string;
			this.root.style.top = LiteGUI.sizeToCSS(op.position[1]) as string;
		}

		// If(options.scroll == false)	this.content.style.overflow = "hidden";
		if (op.scroll == true)
		{(this.content as HTMLDivElementPlus).style.overflow = "auto";}
		Panel.title_height = "20px";
	}

	add(litegui_item: LiteguiObject)
	{
		(this.content as Element).appendChild(litegui_item.root!);
	}

	clear()
	{
		while ((this.content as Element).firstChild)
		{(this.content as Element).removeChild((this.content as Element).firstChild!);}
	};
}