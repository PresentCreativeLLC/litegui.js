import { AddInfoOptions, InspectorInfoWidget } from "../@types/Inspector";
import { LiteGUI } from "../core";
import { Inspector } from "../inspector";

/**
 * Widget to show plain information in HTML (not interactive)
 * @method AddInfo
 * 
 * @param {Inspector} that
 * @param {string | undefined} name
 * @param {string | undefined} value HTML code
 * @param {AddInfoOptions | undefined} options, here is a list for that widget (check createWidget for a list of generic options):
 * - className: to specify a classname of the content
 * - height: to specify a height
 * @return {InspectorInfoWidget} the widget in the form of the DOM element that contains it
 *
 */
export function AddInfo(that:Inspector, name?: string, value?: string, options?: AddInfoOptions): InspectorInfoWidget
{
	value = value ?? '';
	options = options ?? {};
	let element:InspectorInfoWidget | undefined = undefined;
	if (name !== undefined)
	{
		element = that.createWidget(name, value, options) as InspectorInfoWidget;
	}
	else
	{
		element = document.createElement("div") as InspectorInfoWidget;
		if (options.className) {element.className = options.className;}

		element.innerHTML = "<span class='winfo'>"+value+"</span>";
	}

	const info:HTMLElement = element.querySelector(".winfo") ?? element.querySelector(".wcontent") as HTMLElement;

	if (options.callback) {element.addEventListener("click",options.callback.bind(element));}

	element.setValue = function(value?: string)
	{
		if (value == undefined) {return;}
		if (info) {info.innerHTML = value;}
	};

	let content = element.querySelector("span.info_content") as HTMLElement;
	if (!content) {content = element.querySelector(".winfo") as HTMLElement;}
	element.content = content;

	if (options.width)
	{
		element.style.width = LiteGUI.sizeToCSS(options.width) ?? '0';
		element.style.display = "inline-block";
		if (!name) {info.style.margin = "2px";}
	}
	if (options.height)
	{
		content.style.height = LiteGUI.sizeToCSS(options.height) ?? '0';
		content.style.overflow = "auto";
	}

	element.scrollToBottom = function()
	{
		content.scrollTop = content.offsetTop;
	};

	element.add = function(e: Node)
	{
		content.appendChild(e);
	};

	that.appendWidget(element, options);
	that.processElement(element, options);
	return element;
};