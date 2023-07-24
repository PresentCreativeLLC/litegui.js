// Enclose in a scope
/** **************** AREA **************/

import { AreaOptions, HTMLDivElementPlus, LiteguiObject, ParentNodePlus } from "./@types/globals";
import { LiteGUI } from "./core";



/**
 * An Area is an stretched container.
 * Areas can be split several times horizontally or vertically to fit different columns or rows
 *
 * @class Area
 * @constructor
 * @param {Object} options
 */
export class Area
{
    root: HTMLDivElementPlus;
    options: AreaOptions;
    content: HTMLDivElement;
    _computed_size: number[];
    split_direction: string;
    sections: Area[];
    direction: string | undefined;
    splitbar: HTMLDivElement | undefined;
    dynamic_section: Area | undefined;
    size: number | string | null | undefined;
    onresize: Function | undefined;
    public static VERTICAL = "vertical";
	public static HORIZONTAL = "horizontal";
	public static splitbar_size = 4;
    
    constructor(options?: AreaOptions)
    {
        let optionsTemp: AreaOptions | undefined = options;

        /* The root element containing all sections */
        const root = document.createElement("div") as HTMLDivElementPlus;
        root.className = "litearea";
        if (optionsTemp?.id)
        {root.id = optionsTemp.id;}
        if (optionsTemp?.className)
        {root.className +=  " " + optionsTemp.className;}

        this.root = root;
        this.root.litearea = this; // Dbl link

        let width = optionsTemp?.width || "100%";
        let height = optionsTemp?.height || "100%";

        if (typeof (width) == 'number' && width < 0)
        {width = 'calc( 100% - '+Math.abs(width as number)+'px)';}
        if (typeof (height) == 'number' && height < 0)
        {height = 'calc( 100% - '+ Math.abs(height as number)+'px)';}

        root.style.width = width as string;
        root.style.height = height as string;

        this.options = optionsTemp!;

        const thisArea = this;
        this._computed_size = [ this.root.offsetWidth, this.root.offsetHeight ];

        const content = document.createElement("div");
        if (options?.content_id)
        {content.id = options.content_id;}
        content.className = "liteareacontent";
        content.style.width = "100%";
        content.style.height = "100%";
        this.root.appendChild(content);
        this.content = content;

        this.split_direction = "none";
        this.sections = [];

        if (options?.autoresize)
        {
            LiteGUI.bind(LiteGUI, "resized", () =>
            {
                thisArea.onResize();
            });
        }
    }
    /* Get container of the section */
    getSection(num: number)
    {
        num = num || 0;
        if (this.sections.length > num)
        {
            return this.sections[num];
        }
        return null;
    };

    onResize(e?: Function)
    {
        const computed_size = [ this.root.offsetWidth, this.root.offsetHeight ];
        if (e && this._computed_size && computed_size[0] == 
            this._computed_size[0] && computed_size[1] == this._computed_size[1])
        {return;}

        this.sendResizeEvent(e);
    }

    // Sends the resize event to all the sections
    sendResizeEvent(e?: Function)
    {
        if (this.sections.length)
        {
            for (const i in this.sections)
            {
                const section = this.sections[i];
                section.onResize(e);
            }
        }
        else // Send it to the children
        {
            for (let j = 0; j < this.root.childNodes.length; j++)
            {
                const element: HTMLDivElementPlus = this.root.childNodes[j] as HTMLDivElementPlus;
                if (element.litearea)
                {element.litearea.onResize();}
                else
                {LiteGUI.trigger(element, "resize");}
            }
        }
        LiteGUI.sizeToCSS()
        // Inner callback
        if (this.onresize) { this.onresize(); }
    }

    public get getWidth(): number | null | string
    {
        return this.root.offsetWidth;
    }

    public get getHeight(): number | null | string
    {
        return this.root.offsetHeight;
    }

    public get isVisible(): boolean
    {
        return this.root.style.display != "none";
    }

    adjustHeight()
    {
        if (!this.root.parentNode)
        {
            console.error("Cannot adjust height of LiteGUI.Area without parent");
            return;
        }

        // Check parent height
        const h = (this.root.parentNode as ParentNodePlus).offsetHeight;

        // Check position
        const y = this.root.getClientRects()[0].top;

        // Adjust height
        this.root.style.height = "calc( 100% - " + y + "px )";
    }

    split(direction: string, sizes: (string | null | number)[], editable: boolean)
    {
        if (!direction || direction.constructor !== String)
        {throw ("First parameter must be a string: 'vertical' or 'horizontal'");}

        if (!sizes)
        {sizes = ["50%",null];}

        if (direction != "vertical" && direction != "horizontal")
        {throw ("First parameter must be a string: 'vertical' or 'horizontal'");}

        if (this.sections.length)
        {throw "cannot split twice";}

        // Create areas
        const area1 = new Area({ content_id: this.content.id } as AreaOptions);
        area1.root.style.display = "inline-block";
        const area2 = new Area();
        area2.root.style.display = "inline-block";

        let splitinfo = "";
        let splitbar = null;
        let dynamic_section;
        if (editable)
        {
            splitinfo = " - " + (Area.splitbar_size + 2) +"px"; // 2 px margin �?
            splitbar = document.createElement("div");
            splitbar.className = "litesplitbar " + direction;
            if (direction == "vertical")
            {splitbar.style.height = Area.splitbar_size + "px";}
            else
            {splitbar.style.width = Area.splitbar_size + "px";}
            this.splitbar = splitbar;
            splitbar.addEventListener("mousedown", inner_mousedown);
        }

        sizes = sizes || ["50%",null];

        if (direction == "vertical")
        {
            area1.root.style.width = "100%";
            area2.root.style.width = "100%";

            if (sizes[0] == null)
            {
                let h = sizes[1];
                if (typeof(h) == "number")
                {
                    h = sizes[1] + "px";
                }

                area1.root.style.height = "-moz-calc( 100% - " + h + splitinfo + " )";
                area1.root.style.height = "-webkit-calc( 100% - " + h + splitinfo + " )";
                area1.root.style.height = "calc( 100% - " + h + splitinfo + " )";
                area2.root.style.height = h!;
                area2.size = h;
                dynamic_section = area1;
            }
            else if (sizes[1] == null)
            {
                let h = sizes[0];
                if (typeof(h) == "number")
                {
                    h = sizes[0] + "px";
                }

                area1.root.style.height = h;
                area1.size = h;
                area2.root.style.height = "-moz-calc( 100% - " + h + splitinfo + " )";
                area2.root.style.height = "-webkit-calc( 100% - " + h + splitinfo + " )";
                area2.root.style.height = "calc( 100% - " + h + splitinfo + " )";
                dynamic_section = area2;
            }
            else
            {
                let h1 = sizes[0];
                if (typeof(h1) == "number")
                {
                    h1 = sizes[0] + "px";
                }
                let h2 = sizes[1];
                if (typeof(h2) == "number")
                {h2 = sizes[1] + "px";}
                area1.root.style.height = h1;
                area1.size = h1;
                area2.root.style.height = h2;
                area2.size = h2;
            }
        }
        else // Horizontal
        {
            area1.root.style.height = "100%";
            area2.root.style.height = "100%";

            if (sizes[0] == null)
            {
                let w = sizes[1];
                if (typeof(w) == "number")
                {w = sizes[1] + "px";}
                area1.root.style.width = "-moz-calc( 100% - " + w + splitinfo + " )";
                area1.root.style.width = "-webkit-calc( 100% - " + w + splitinfo + " )";
                area1.root.style.width = "calc( 100% - " + w + splitinfo + " )";
                area2.root.style.width = w!;
                area2.size = sizes[1];
                dynamic_section = area1;
            }
            else if (sizes[1] == null)
            {
                let w = sizes[0];
                if (typeof(w) == "number")
                {w = sizes[0] + "px";}

                area1.root.style.width = w;
                area1.size = w;
                area2.root.style.width = "-moz-calc( 100% - " + w + splitinfo + " )";
                area2.root.style.width = "-webkit-calc( 100% - " + w + splitinfo + " )";
                area2.root.style.width = "calc( 100% - " + w + splitinfo + " )";
                dynamic_section = area2;
            }
            else
            {
                let w1 = sizes[0];
                if (typeof(w1) == "number")
                {w1 = sizes[0] + "px";}
                let w2 = sizes[1];
                if (typeof(w2) == "number")
                {w2 = sizes[1] + "px";}

                area1.root.style.width = w1;
                area1.size = w1;
                area2.root.style.width = w2;
                area2.size = w2;
            }
        }

        area1.root.removeChild(area1.content);
        area1.root.appendChild(this.content);
        area1.content = this.content;

        this.root.appendChild(area1.root);
        if (splitbar)
        {this.root.appendChild(splitbar);}
        this.root.appendChild(area2.root);

        this.sections = [area1, area2];
        this.dynamic_section = dynamic_section;
        this.direction = direction;

        // SPLITTER DRAGGER INTERACTION
        const that = this;
        const last_pos = [0,0];
        function inner_mousedown(e: MouseEvent)
        {
            const doc = that.root.ownerDocument;
            doc.addEventListener("mousemove",inner_mousemove);
            doc.addEventListener("mouseup",inner_mouseup);
            last_pos[0] = e.pageX;
            last_pos[1] = e.pageY;
            e.stopPropagation();
            e.preventDefault();
        }

        function inner_mousemove(e: MouseEvent)
        {
            if (direction == "horizontal")
            {
                if (last_pos[0] != e.pageX)
                {that.moveSplit(last_pos[0] - e.pageX);}
            }
            else if (direction == "vertical")
            {
                if (last_pos[1] != e.pageY)
                {that.moveSplit(e.pageY - last_pos[1]);}
            }

            last_pos[0] = e.pageX;
            last_pos[1] = e.pageY;
            e.stopPropagation();
            e.preventDefault();
            if (that.options?.immediateResize) // Immediate is for legacy...
            {that.onResize();}
        }

        function inner_mouseup(e: MouseEvent)
        {
            const doc = that.root.ownerDocument;
            doc.removeEventListener("mousemove",inner_mousemove);
            doc.removeEventListener("mouseup",inner_mouseup);
            that.onResize();
        }
    };

    hide()
    {
        this.root.style.display = "none";
    };

    show()
    {
        this.root.style.display = "block";
    };

    showSection(num: number)
    {
        let section = this.sections[num];
        let size: string | number = 0;

        if (section && section.root.style.display != "none") {return;} // Already visible

        if (this.direction == "horizontal")
        {
            size = section.root.style.width;
        }
        else
        {
            size = section.root.style.height;
        }

        if (size.indexOf("calc") != -1) {size = "50%";}

        for (const i in this.sections)
        {
            section = this.sections[i];

            if (i == num.toString())
            {
                section.root.style.display = "inline-block";
            }
            else
            {
                if (this.direction == "horizontal")
                {
                    section.root.style.width = "calc( 100% - " + size + " - 5px)";
                }
                else
                {
                    section.root.style.height = "calc( 100% - " + size + " - 5px)";
                }
            }
        }

        if (this.splitbar) {this.splitbar.style.display = "inline-block";}

        this.sendResizeEvent();
    };

    hideSection(num: number)
    {
        for (const i in this.sections)
        {
            const section = this.sections[i];

            if (i == num.toString())
            {
                section.root.style.display = "none";
            }
            else
            {
                if (this.direction == "horizontal")
                {section.root.style.width = "100%";}
                else
                {section.root.style.height = "100%";}
            }
        }

        if (this.splitbar)
        {this.splitbar.style.display = "none";}

        this.sendResizeEvent();
    };

    moveSplit(delta: number)
    {
        if (!this.sections) {return;}

        const area1 = this.sections[0];
        const area2 = this.sections[1];
        const splitinfo = " - "+ Area.splitbar_size +"px";

        const min_size = this.options?.minSplitSize || 10;

        if (this.direction == "horizontal")
        {

            if (this.dynamic_section == area1)
            {
                let size = (area2.root.offsetWidth + delta);
                if (size < min_size)
                {size = min_size;}
                area1.root.style.width = "-moz-calc( 100% - " + size + "px " + splitinfo + " )";
                area1.root.style.width = "-webkit-calc( 100% - " + size + "px " + splitinfo + " )";
                area1.root.style.width = "calc( 100% - " + size + "px " + splitinfo + " )";
                area2.root.style.width = size + "px"; // Other split
            }
            else
            {
                let size = (area1.root.offsetWidth - delta);
                if (size < min_size)
                {size = min_size;}
                area2.root.style.width = "-moz-calc( 100% - " + size + "px " + splitinfo + " )";
                area2.root.style.width = "-webkit-calc( 100% - " + size + "px " + splitinfo + " )";
                area2.root.style.width = "calc( 100% - " + size + "px " + splitinfo + " )";
                area1.root.style.width = size + "px"; // Other split
            }
        }
        else if (this.direction == "vertical")
        {
            if (this.dynamic_section == area1)
            {
                let size = (area2.root.offsetHeight - delta);
                if (size < min_size)
                {size = min_size;}
                area1.root.style.height = "-moz-calc( 100% - " + size + "px " + splitinfo + " )";
                area1.root.style.height = "-webkit-calc( 100% - " + size + "px " + splitinfo + " )";
                area1.root.style.height = "calc( 100% - " + size + "px " + splitinfo + " )";
                area2.root.style.height = size + "px"; // Other split
            }
            else
            {
                let size = (area1.root.offsetHeight + delta);
                if (size < min_size)
                {size = min_size;}
                area2.root.style.height = "-moz-calc( 100% - " + size + "px " + splitinfo + " )";
                area2.root.style.height = "-webkit-calc( 100% - " + size + "px " + splitinfo + " )";
                area2.root.style.height = "calc( 100% - " + size + "px " + splitinfo + " )";
                area1.root.style.height = size + "px"; // Other split
            }
        }

        LiteGUI.trigger(this.root, "split_moved");
        // Trigger split_moved event in all areas inside this area
        const areas = this.root.querySelectorAll(".litearea");
        for (let i = 0; i < areas.length; ++i)
        {LiteGUI.trigger(areas[i], "split_moved");}
    };

    addEventListener(a: any, b: any, c?: any, d?: any)
    {
        return this.root.addEventListener(a, b, c);
        // return this.root.addEventListener(a, b, c, d);
    };

    setAreaSize(area: Area, size: number)
    {        
        const splitinfo = (size + Area.splitbar_size) + "px";
        area.root.style.width = "-moz-calc( 100% - " + splitinfo + " )";
        area.root.style.width = "-webkit-calc( 100% - " + splitinfo + " )";
        area.root.style.width = "calc( 100% - " + splitinfo + " )";
    };

    merge(main_section?: number)
    {
        if (this.sections.length == 0) {throw "not splitted";}

        const main = this.sections[main_section || 0];

        this.root.appendChild(main.content);
        this.content = main.content;

        this.root.removeChild(this.sections[0].root);
        this.root.removeChild(this.sections[1].root);

        this.sections = [];
        this._computed_size = [];
        this.onResize();
    };

    add(v: LiteguiObject | HTMLElement)
    {
        let value = v;
        if (typeof(value) == "string")
        {
            const element = document.createElement("div");
            element.innerHTML = value;
            value = element;
        }

        this.content.appendChild(((value as LiteguiObject).root as HTMLElement) || value);
    };

    query(v: any)
    {
        return this.root.querySelector(v);
    };
}

// LiteGUI.Area = Area;

/** *************** SPLIT ******************/

/**
 * Split
 *
 * @class Split
 * @constructor
 */
export class Split 
{
    root: HTMLDivElementPlus;
    sections: any;
    constructor(sections: any, options: any, legacy: any) 
    {
        options = options || {};

        if (sections && sections.constructor === String) {
            const id = sections;
            sections = options;
            options = legacy || {};
            options.id = id;
            console.warn("LiteGUI.Split legacy parameter, use sections as first parameter instead of id.");
        }

        const root = document.createElement("div") as HTMLDivElementPlus;
        this.root = root;
        if (options.id) { root.id = options.id; }
        root.className = "litesplit " + (options.vertical ? "vsplit" : "hsplit");
        this.sections = [];

        for (const i in sections) {
            const section: any = document.createElement("div");

            section.className = "split-section split" + i;
            if (typeof (sections[i]) == "number") {
                if (options.vertical) { section.style.height = sections[i].toFixed(1) + "%"; }

                else { section.style.width = sections[i].toFixed(1) + "%"; }
            }
            else if (typeof (sections[i]) == "string") {
                if (options.vertical) { section.style.height = sections[i]; }

                else { section.style.width = sections[i]; }
            }

            else 
            {
                if (sections[i].id)
                { 
                    section.id = sections[i].id; 
                }
                if (options.vertical) 
                {
                    section.style.height = (typeof (sections[i].height) == "number" ?
                        sections[i].height.toFixed(1) + "%" : sections[i].height);
                }
                else 
                {
                    section.style.width = (typeof (sections[i].width) == "number" ?
                        sections[i].width.toFixed(1) + "%" : sections[i].width);
                }
            }

            section.add = function (element: any) 
            {
                this.appendChild(element.root || element);
            };

            this.sections.push(section);
            root.appendChild(section);
        }

        if (options.parent) {
            if (options.parent.root) { options.parent.root.appendChild(root); }

            else { options.parent.appendChild(root); }
        }
    }
    
    getSection(n: number) 
    {
        return this.sections[n];
    };
}
// LiteGUI.Split = Split;