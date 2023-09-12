import { AddCheckboxOptions, AddFlagsOptions, InspectorCheckboxWidget } from "../@types/Inspector";
import { Inspector } from "../inspector";

/**
 * Widget to edit a set of boolean values using checkboxes
 * @function AddFlags
 *
 * @param {Inspector} that
 * @param {{[key:string]:boolean}} value object that contains all the booleans
 * @param {{[key:string]:(boolean | undefined)}} force_flags object with extra flags to insert
 * @param {{AddCheckboxOptions | AddFlagsOptions}} options The options to set the checkboxes to
 * @return {InspectorCheckboxWidget[]} the widgets in the form of the DOM element that contains it
 *
 */
export function AddFlags(that:Inspector, flags: {[key:string]:boolean}, force_flags?: {[key:string]:(boolean | undefined)},
	options?: AddCheckboxOptions | AddFlagsOptions): InspectorCheckboxWidget[]
{
	options = options ?? {};
	const f:{[key:string]:boolean} = {};
	for (const i in flags)
	{
		f[i] = flags[i];
	}
	if (force_flags)
	{
		for (const i in force_flags)
		{
			if (typeof f[i] == "undefined")
			{
				f[i] = force_flags[i] ?? false;
			}
		}
	}
	let defaultOpt:AddCheckboxOptions | undefined = undefined;
	if (options.hasOwnProperty('default'))
	{
		defaultOpt = (options as AddFlagsOptions).default;
	}
	const result:InspectorCheckboxWidget[] = [];
	for (const i in f)
	{
		let opt:AddCheckboxOptions | undefined = undefined;
		if (options.hasOwnProperty(i))
		{
			opt = (options as AddFlagsOptions)[i];
		}
		else if (defaultOpt)
		{
			opt = defaultOpt;
		}
		else
		{
			opt = options as AddCheckboxOptions;
		}

		const flag_options:AddCheckboxOptions = {};
		for (const j in opt)
		{
			(flag_options as any)[j] = (opt as any)[j];
		}

		flag_options.callback = function(v: boolean)
		{
			flags[i] = v;
		};

		result.push(that.addCheckbox(i, f[i], flag_options));
	}
	return result;
};