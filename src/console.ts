import { HTMLElementPlus } from "./@types/globals/index"

interface ConsoleOptions
{
	prompt: string;
}
export class Console
{
	options: ConsoleOptions;
	root: HTMLDivElement;
	log_element: Element;
	input: HTMLInputElement;
	_prompt: string;
	history: string[];
	_history_offset: number;
	_input_blocked?: boolean;

	constructor(options: ConsoleOptions)
	{
		this.options = options || {};

		this.root = document.createElement("div");
		this.root.className = "liteconsole";
		this.root.innerHTML = "<div class='log'></div><div class='foot'><input type='text'/></div>";

		this.log_element = this.root.querySelector('.log')!;
		this.input = this.root.querySelector('input')!;

		this.input?.addEventListener("keydown", this.processKeyDown.bind(this));
		this._prompt = options.prompt || "]";

		//this.onAutocomplete = null; // Receives string, must return final string
		//this.onProcessCommand = null; // Receives input value

		this.history = [];
		this._history_offset = 0;
	}

	processKeyDown(e: KeyboardEvent)
	{
		if (this._input_blocked || !this.input)
		{return;}

		if (e.key == "enter")//(e.keyCode == 13) // Return and exec
		{
			
			const value = this.input.value;
			const cmd = value.trim();
			this.addMessage(this._prompt + cmd, "me",true);
			this.input.value = "";
			this.history.push(cmd);
			if (this.history.length > 10) {this.history.shift();}
			this.onProcessCommand(cmd);
			this._history_offset = 0;
		}
		else if (e.key == "up arrow" || e.key == "down arrow") // Up & down history e.keyCode == 38 || e.keyCode == 40)
		{
			this._history_offset += (e.key == "up arrow" ? -1 : 1);//(e.keyCode == 38 ? -1 : 1);
			if (this._history_offset > 0)
			{
				this._history_offset = 0;
			}
			else if (this._history_offset < -this.history.length)
			{
				this._history_offset = -this.history.length;
			}
			const pos = this.history.length + this._history_offset;
			if (pos < 0) {return;}
			if (pos >= this.history.length)
			{
				this.input.value = "";
			}
			else
			{
				this.input.value = this.history[ pos ];
			}
		}
		else if (e.key == "tab") // Tab autocompletion = keycode 9
		{
			this.input.value = this.onAutocomplete(this.input.value);
		}
		else
		{
			return;
		}
		e.preventDefault();
		e.stopPropagation();
	};

	addMessage(text: string | string[], className: string, as_text: boolean = true)
	{
		const content = this.log_element;
		let element!: HTMLElementPlus; // Contains the last message sent

		if (text && text.constructor === Array)
		{
			for (let i = 0; i < text.length; ++i)
			{
				add(text[i]);
			}
		}
		else if (text && text.constructor === Object)
		{
			add(JSON.stringify(text,null,""));
		}
		else
		{
			add(text as string);
		}

		function add(txt: string)
		{
			element = document.createElement("pre");
			if (as_text)
			{element.innerText = txt;}
			else
			{element.innerHTML = txt;}
			element.className = "msg";
			if (className)
			{element.className += " " + className;}
			content.appendChild(element);
			if (content.children.length > 1000)
			{content.removeChild(content.children[0]);}
		}

		this.log_element.scrollTop = 1000000;
		if (!element) { return; }
		element.update = function(v: string)
		{
			this.innerHTML = v;
		};

		return element;
	}

	log()
	{
		const args = Array.prototype.slice.call(arguments);
		const d = args.join(",");
		return this.addMessage(d, "msglog");
	}

	warn()
	{
		const args = Array.prototype.slice.call(arguments);
		const d = args.join(",");
		return this.addMessage(d, "msgwarn");
	}

	error()
	{
		const args = Array.prototype.slice.call(arguments);
		const d = args.join(",");
		return this.addMessage(d, "msgerror");
	}

	clear()
	{
		if(this.log_element)
		{
			this.log_element.innerHTML = "";
		}
	}

	onAutocomplete(value: string)
	{
		//This wasn't declared, just used so...
	
		//The function is supposed to return something so i will return the same parameter
		return value;
	}

	onProcessCommand(cmd: string)
	{
		//This wasn't declared, just used so...
	}
}