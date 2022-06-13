import { HTMLDivElementPlus } from "./@types/globals";
import { LiteGUI } from "./core";

/** **************** PANEL **************/
export class Panel
{
	root?: HTMLDivElementPlus;
	title_height: string;
	options: any;
	content: any;
	header?: Element;
	footer?: Element;

	constructor(id: string, options: any)
	{
		if (!options && id && id.constructor !== String)
		{
			options = id;
			id = "";
		}

		this.options = options || {};

		this.content = options.content || "";

		const root = this.root = document.createElement("div") as HTMLDivElementPlus;
		if (id)
		{root.id = id;}

		root.className = "litepanel " + (options.className || "");
		root.data = this;

		let code = "";
		if (options.title)
		{code += "<div class='panel-header'>"+options.title+"</div>";}
		code += "<div class='content'>"+this.content+"</div>";
		code += "<div class='panel-footer'></div>";
		root.innerHTML = code;

		if (options.title)
		{this.header = this.root.querySelector(".panel-header")!;}

		this.content = this.root.querySelector(".content");
		this.footer = this.root.querySelector(".panel-footer")!;

		if (options.width)
		{this.root.style.width = LiteGUI.sizeToCSS(options.width) as string;}
		if (options.height)
		{this.root.style.height = LiteGUI.sizeToCSS(options.height) as string;}
		if (options.position)
		{
			this.root.style.position = "absolute";
			this.root.style.left = LiteGUI.sizeToCSS(options.position[0]) as string;
			this.root.style.top = LiteGUI.sizeToCSS(options.position[1]) as string;
		}

		// If(options.scroll == false)	this.content.style.overflow = "hidden";
		if (options.scroll == true)
		{this.content.style.overflow = "auto";}
		this.title_height = "20px";
	}

	add(litegui_item: any)
	{
		this.content.appendChild(litegui_item.root);
	}

	clear()
	{
		while (this.content.firstChild)
		{this.content.removeChild(this.content.firstChild);}
	};
}