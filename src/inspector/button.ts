import { AddButtonOptions, InspectorButtonWidget } from "../@types/Inspector";
import { LiteGUI } from "../core";
import { Inspector } from "../inspector";

/**
 * Creates an HTML button widget with optional name, value, and options.
 * @function AddButton
 *
 * @param {Inspector} that- The Inspector instance.
 * @param {string} [name] - The name of the button.
 * @param {string} [value] - The value of the button.
 * @param {AddButtonOptions | (() => void)} [options] - The options for the button.
 * @returns {InspectorButtonWidget} - The created button widget element.
 */
export function AddButton(that:Inspector, name?: string, value?: string, options?: AddButtonOptions | (()=>void)): InspectorButtonWidget
{    
	const processedOptions = that.processOptions(options) as AddButtonOptions;
	value = processedOptions.button_text ?? value;
	value = value ?? "";
	name = name ?? value;
	name = that.getValueName(name, processedOptions);

	let button_classname = "";
	if (name == null) {button_classname = "single";}
	if (processedOptions.micro) {button_classname += " micro";}

	let attrs = "";
	if (processedOptions.disabled) {attrs = "disabled='disabled'";}

	const title = processedOptions.title?.toString() ?? "";

	const element = that.createWidget(name,"<button tabIndex='" +
		that.tab_index + "' "+attrs+"></button>", processedOptions) as InspectorButtonWidget;
	that.tab_index++;
	const button = element.querySelector("button") as HTMLButtonElement;
	button.setAttribute("title",title);
	button.className = "litebutton " + button_classname;
	button.innerHTML = value;
	button.addEventListener("click", (event: any) =>
	{
		that.onWidgetChange.call(that, element, name!, button.innerHTML, processedOptions, false, event);
		LiteGUI.trigger(button, "wclick", value);
	});
	that.appendWidget(element,processedOptions);

	element.wclick = function(callback: Function)
	{
		if (!processedOptions.disabled) {LiteGUI.bind(element, "wclick", callback);}
	};

	element.setValue = function(v: string)
	{
		button.innerHTML = v;
	};

	element.disable = function() { button.disabled = true; };
	element.enable = function() { button.disabled = false; };

	that.processElement(element, processedOptions);
	return element;
};

/**
 * Creates an HTML buttons widget with optional name, value, and options.
 * @function AddButtons
 *
 * @param {Inspector} that - The Inspector instance.
 * @param {string} [name] - The name of the buttons.
 * @param {string[]} [values] - The values to be displayed on the buttons.
 * @param {AddButtonOptions | (() => void)} [options] - The options for the buttons.
 * @returns {HTMLElement} - The element containing the buttons.
 */
export function AddButtons(that:Inspector, name?: string, values?: string[], options?: AddButtonOptions | (()=>void)): InspectorButtonWidget
{
	const processedOptions = that.processOptions(options) as AddButtonOptions;
	values = values ?? [];
	name = that.getValueName(name, processedOptions);

	let code = "";
	// Var w = "calc("+(100/value.length).toFixed(3)+"% - "+Math.floor(16/value.length)+"px);";
	const w = "calc( " + (100/values.length).toFixed(3) + "% - 4px )";
	const style = "width:"+w+"; width: -moz-"+w+"; width: -webkit-"+w+"; margin: 2px;";
	for (const i in values)
	{
		let title = "";
		if (processedOptions.title) {Array.isArray(processedOptions.title) ? title = processedOptions.title[i] : title = processedOptions.title as string}
		code += "<button class='litebutton' title='"+title+"' tabIndex='"+that.tab_index+"' style='"+style+"'>"+values[i]+"</button>";
		that.tab_index++;
	}
	
	const element = that.createWidget(name, code, processedOptions) as InspectorButtonWidget;
	const buttons = element.querySelectorAll("button");
	const buttonCallback = (button: any, evt: any) =>
	{
		that.onWidgetChange.call(that, element, name!, button.innerHTML, processedOptions, false, evt);
		LiteGUI.trigger(element, "wclick",button.innerHTML);
	};
	for (let i = 0; i < buttons.length; ++i)
	{
		const button = buttons[i];
		button.addEventListener("click", buttonCallback.bind(undefined,button));
	}

	that.appendWidget(element,processedOptions);
	that.processElement(element, processedOptions);
	return element;
};