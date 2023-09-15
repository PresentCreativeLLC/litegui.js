import { AddFileOptions, FileAddedResponse } from "../@types/Inspector";
import { Inspector } from "../inspector";

/**
 * Adds a file input widget to the inspector with the specified name, value, and options.
 * @function AddFile
 *
 * @param {string} name - The name of the file input widget.
 * @param {string} [value] - The initial value of the file input widget.
 * @param {((data: FileAddedResponse) => void) | AddFileOptions} [options] - The options for the file input widget.
 * @returns The created file input widget element.
 */
export function AddFile(that:Inspector, name: string, value?: string, options?: ((data:FileAddedResponse)=>void) | AddFileOptions)
{
	that.values.set(name, {name:value??""});
	const processedOptions:AddFileOptions = that.processOptions(options);

	const element = that.createWidget(name,"<span class='inputfield full whidden' style='width: calc(100% - 26px)'><span class='filename'></span></span><button class='litebutton' style='width:20px; margin-left: 2px;'>...</button><input type='file' size='100' class='file' value='"+value+"'/>", processedOptions);
	const content = element.querySelector(".wcontent") as HTMLElement;
	content.style.position = "relative";
	const input = element.querySelector(".wcontent input") as HTMLInputElement;
	if (processedOptions.accept)
	{
		input.accept = typeof(processedOptions.accept) === "string" ? processedOptions.accept : processedOptions.accept.toString();
	}
	const filename_element = element.querySelector(".wcontent .filename") as HTMLElement;
	if (value) {filename_element.innerText = value;}

	input.addEventListener("change", (e: Event) =>
	{
		if(!e || !e.target) {return;}
		const target = e.target as HTMLInputElement;
		if(!target.files) {return;}
		if (!target.files.length)
		{
			// Nothing
			filename_element.innerText = "";
			that.onWidgetChange.call(that, element, name, undefined, processedOptions);
			return;
		}

		const url = null;
		// Var data = { url: url, filename: e.target.value, file: e.target.files[0], files: e.target.files };
		const result = target.files[0] as FileAddedResponse;
		result.files = target.files
		if (processedOptions.generate_url) {result.url = URL.createObjectURL(target.files[0]);}
		filename_element.innerText = result.name;

		if (processedOptions.read_file)
		{
				const reader = new FileReader();
				reader.onload = (e2: ProgressEvent<FileReader>) =>
			{
				result.data = e2.target?.result;
				that.onWidgetChange.call(that, element, name, result, processedOptions);
				};
				if (processedOptions.read_file == "binary")
				{
					reader.readAsArrayBuffer(result);
				}
				else if (processedOptions.read_file == "data_url")
				{
					reader.readAsDataURL(result);
				}
				else
				{
					reader.readAsText(result);
				}
		}
		else
		{
			that.onWidgetChange.call(that, element, name, result, processedOptions);
		}
	});

	that.appendWidget(element,processedOptions);
	return element;
};