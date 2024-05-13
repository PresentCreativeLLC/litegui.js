import { LiteGUIObject } from "./@types/globals";
import { LiteGUI } from "./core";

export interface PanelRoot extends HTMLDivElement
{
	panel: Panel;
	id: string;
}

export interface PanelOptions
{
	scroll?: boolean;
	position?: Array<number | string>;
	height?: number | string;
	width?: number | string;
	title?: string;
	className?: string;
	content?: string;
}

/** **************** PANEL **************/
export class Panel
{
	static titleHeight: string = "20px";
	root: PanelRoot;
	options: PanelOptions;
	content: HTMLDivElement;
	footer: HTMLDivElement;
	header?: HTMLDivElement;

	constructor(id: string | PanelOptions, options?: PanelOptions)
	{
		if (typeof id != 'string')
		{
			const temp = id;
			id = "";
			if (!options && temp != undefined)
			{
				options = temp;
			}
		}

		const op = this.options = options = options ?? {};

		const root = this.root = document.createElement("div") as PanelRoot;
		root.id = id;

		root.className = "litepanel " + (op.className ?? "");
		root.panel = this;

		let code = "";
		if (op.title) {code += "<div class='panel-header'>" + op.title + "</div>";}
		code += "<div class='content'>" + (op.content ?? "") + "</div>";
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

		if (op.scroll == true) {this.content.style.overflow = "auto";}
	}

	add(item: LiteGUIObject)
	{
		if (item.root)
		{
			this.content.appendChild(item.root);
		}
	}

	clear()
	{
		const content = this.content;
		while (content.firstChild != undefined)
		{
			content.removeChild(content.firstChild);
		}
	};
}