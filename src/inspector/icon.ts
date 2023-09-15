import { LiteGUI } from "../core";
import { Inspector } from "../inspector";
import { AddIconOptions, InspectorIconWidget } from "../@types/Inspector";

/**
 * Adds an icon widget to the Inspector.
 *
 * @param {Inspector} that - The Inspector instance.
 * @param {string} name - The name of the icon widget.
 * @param {boolean} value - The initial value of the icon widget.
 * @param {AddIconOptions} [options] - Additional options for the icon widget.
 * @returns {InspectorIconWidget} - The created icon widget element.
 */
export function AddIcon(that:Inspector, name?: string, value?: boolean, options?: AddIconOptions): InspectorIconWidget
{		
	const processedOptions = that.processOptions(options) as AddIconOptions;

	name = name ?? '';
	value = value ?? false;
	const img_url = processedOptions.image;
	const width = processedOptions.width ?? processedOptions.size ?? 20;
	const height = processedOptions.height ?? processedOptions.size ?? 20;

	const element = that.createWidget(name,"<span class='icon' " +
		(processedOptions.title ? "title='"+processedOptions.title+"'" : "") +
		" tabIndex='"+ that.tab_index + "'></span>", processedOptions) as InspectorIconWidget;
	that.tab_index++;
	const content = element.querySelector("span.wcontent") as HTMLElement;
	const icon = element.querySelector("span.icon") as HTMLElement;

	let x = processedOptions.x ?? 0;
	if (processedOptions.index) {x = processedOptions.index * -width;}
	const y = value ? height : 0;

	element.style.minWidth = element.style.width = (width) + "px";
	element.style.margin = "0 2px";
	element.style.padding = "0";
	content.style.margin = "0";
	content.style.padding = "0";

	icon.style.display = "inline-block";
	icon.style.cursor = "pointer";
	icon.style.width = width + "px";
	icon.style.height = height + "px";
	icon.style.backgroundImage = "url('"+img_url+"')";
	icon.style.backgroundPosition = x + "px " + y + "px";

	icon.addEventListener("mousedown", (e: MouseEvent) =>
	{
		e.preventDefault();
		value = !value;
		const ret = that.onWidgetChange.call(that,element,name!, value, processedOptions);
		LiteGUI.trigger(element, "wclick", value);

		if (ret !== undefined) {value = ret;}

		const y = value ? height : 0;
		icon.style.backgroundPosition = x + "px " + y + "px";

		if (processedOptions.toggle === false) // Blink
		{
			setTimeout(()=> { icon.style.backgroundPosition = x + "px 0px"; value = false; },200);
		}

	});
	that.appendWidget(element,options);

	element.setValue = (v: boolean, skip_event?: boolean) =>
	{
		value = v;
		const y = value ? height : 0;
		icon.style.backgroundPosition = x + "px " + y + "px";
		if (!skip_event)
		{
			that.onWidgetChange.call(that,element,name!, value, processedOptions);
		}
	};
	element.getValue = function() { return value; };
	that.processElement(element, processedOptions);
	return element;
};