import { LiteGUI } from "./core";

export class Table
{
	root : any;
	columns : Array<any>;
	rows : Array<any>;
	column_fields : Array<any>;
	data : Array<any>;
	header : any;

	_must_update_header : boolean;

	constructor(options : any)
	{
		options = options || {};

		this.root = document.createElement("table");
		this.root.classList.add("litetable");

		this.columns = [];
		this.column_fields = [];
		this.rows = [];
		this.data = [];

		this._must_update_header = true;

		if (options.colums)
		{this.setColumns(options.colums);}

		if (options.scrollable)
		{this.root.style.overflow = "auto";}

		if (options.height)
		{this.root.style.height = LiteGUI.sizeToCSS(options.height);}

		if (options.columns)
		{this.setColumns(options.columns);}

		if (options.rows)
		{this.setRows(options.data);}
	}

	setRows(data : any, reuse : boolean = false)
	{
		this.data = data;
		this.updateContent(reuse);
	}

	addRow(row : Array<any>, skip_add : boolean)
	{
		const tr = document.createElement("tr");

		// Create cells
		for (let j = 0; j < this.column_fields.length; ++j)
		{
			const td = document.createElement("td");

			let value = null;

			if (row.constructor === Array)
			{value = row[ j ];}
			else // Object
			{value = row[ this.column_fields[j] ];}
			if (value === undefined)
			{value = "";}

			td.innerHTML = value;

			const column = this.columns[j];
			if (column === undefined)
			{break;}

			if (column.className)
			{td.className = column.className;}
			if (column.width)
			{td.style.width = column.width;}
			tr.appendChild(td);
		}

		this.root.appendChild(tr);
		this.rows.push(tr);
		if (!skip_add)
		{this.data.push(row);}

		return tr;
	}

	updateRow(index : number, row : Array<any>)
	{
		this.data[ index ] = row;

		const tr = this.rows[index];
		if (!tr)
		{return;}

		const cells = tr.querySelectorAll("td");
		for (let j = 0; j < cells.length; ++j)
		{
			const column = this.columns[j];

			let value = null;

			if (row.constructor === Array)
			{value = row[ j ];}
			else
			{value = row[ column.field ];}

			if (value === undefined)
			{value = "";}

			cells[j].innerHTML = value;
		}
		return tr;
	}

	updateCell(row : any, cell : number, data : any)
	{
		const tr = this.rows[ row ];
		if (!tr)
		{return;}
		const newCell = tr.childNodes[cell];
		if (!newCell) {return;}
		newCell.innerHTML = data;
		return newCell;
	}


	setColumns(columns : Array<any>)
	{
		this.columns.length = 0;
		this.column_fields.length = 0;

		const avg_width = ((Math.floor(100 / columns.length)).toFixed(1)) + "%";

		const rest = [];

		for (let i = 0; i < columns.length; ++i)
		{
			let c = columns[i];

			if (c === null || c === undefined)
			{continue;}

			// Allow to pass just strings or numbers instead of objects
			if (c.constructor === String || c.constructor === Number)
			{c = { name: String(c) };}

			const column = {
				name: c.name || "",
				width: LiteGUI.sizeToCSS(c.width || avg_width),
				field: (c.field || c.name || "").toLowerCase(),
				className: c.className
			};

			// Last
			if (i == columns.length - 1)
			{column.width = " calc( 100% - ( " + rest.join(" + ") + " ) )";}
			else
			{rest.push(column.width);}

			this.columns.push(column);
			this.column_fields.push(column.field);
		}

		this._must_update_header = true;
		this.updateContent();
	}

	updateContent(reuse : boolean = false)
	{
		this.root.innerHTML = "";

		// Update header
		if (this._must_update_header)
		{
			this.header = document.createElement("tr");
			for (let i = 0; i < this.columns.length; ++i)
			{
				const column = this.columns[i];
				const th = document.createElement("th");
				th.innerHTML = column.name;
				if (column.width)
				{th.style.width = column.width;}
				column.th = th;
				this.header.appendChild(th);
			}
			this._must_update_header = false;
		}
		this.root.appendChild(this.header);

		if (!this.data)
		{return;}

		if (this.data.length != this.rows.length)
		{reuse = false;}

		if (reuse)
		{
			for (let i = 0; i < this.rows.length; ++i)
			{
				const data_row = this.data[i];
				const tr = this.updateRow(i, data_row);
				this.root.appendChild(tr);
			}
		}
		else
		{
			this.rows.length = 0;

			// Create rows
			for (let i = 0; i < this.data.length; ++i)
			{
				const row = this.data[i];
				this.addRow(row, true);
			}
		}
	}

}