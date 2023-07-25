import { DocumentPlus, HTMLElementPlus, HTMLInputElementPlus, MouseEventPlus } from "./@types/globals";

type Position =
{
    x: number,
    y: number
}
type PickerMode = 'HSV' | 'HVS';
type PickerPosition = 'left' | 'right' | 'top' | 'bottom';

interface Picker
{
	box : HTMLDivElement;
	boxB : HTMLDivElement;
	pad : HTMLDivElement;
	padB : HTMLDivElement;
	padM : HTMLDivElement;
	sld : HTMLDivElement;
	sldB : HTMLDivElement;
	sldM : HTMLDivElement;
	btn : HTMLDivElement;
	btnS : HTMLSpanElement;
	btnT : any;
	owner? : any;
}
export abstract class jscolor
{
    static dir: string | boolean = '';
    static bindClass: string = 'color';
    static preloading: boolean =true;
    static binding: boolean = true;
    
    static images = 
    {
		pad : [ 181, 101 ],
		sld : [ 16, 101 ],
		cross : [ 15, 15 ],
		arrow : [ 7, 11 ]
	}
    static imgRequire: any = {}
	static imgLoaded: any = {}
    static picker: Picker;

    static install()
    {
        jscolor.addEvent(window, 'load', jscolor.init);
    }

    static init()
    {
		if(jscolor.binding) {
			jscolor.bind();
		}
		if(jscolor.preloading) {
			jscolor.preload();
		}
    }
    
    static getDir()
    {
		if(!jscolor.dir) {
			var detected = jscolor.detectDir();
			jscolor.dir = detected!==false ? detected : 'jscolor/';
		}
		return jscolor.dir;
    }

    static detectDir(): string | boolean
    {
		let base = location.href;
		let baseElements = document.getElementsByTagName('base');
		for(let i=0; i<baseElements.length; i+=1) 
        {
			if(baseElements[i].href) { base = baseElements[i].href; }
		}

		let e = document.getElementsByTagName('script');
		for(var i=0; i<e.length; i+=1) {
			if(e[i].src && /(^|\/)jscolor(.*).js([?#].*)?$/i.test(e[i].src)) {
				var src = new jscolor.URI(e[i].src);
				var srcAbs = src.toAbsolute(base) as any;
				srcAbs.path = srcAbs.path.replace(/[^\/]+$/, ''); // remove filename
				srcAbs.query = null;
				srcAbs.fragment = null;
				return srcAbs.toString();
			}
		}
		return false;
    }
    
    static bind()
    {
        var matchClass = new RegExp('(^|\\s)('+jscolor.bindClass+')\\s*(\\{[^}]*\\})?', 'i');
		var e = document.getElementsByTagName('input') as HTMLCollectionOf<HTMLInputElementPlus>;
		for(var i=0; i<e.length; i+=1) {
			var m;
			if(!e[i].color && e[i].className && (m = e[i].className.match(matchClass))) {
				var prop = {};
				if(m[3]) {
					try {
						eval('prop='+m[3]);
					} catch(eInvalidProp) {}
				}
				e[i].color = new jscolor.color(e[i], prop);
			}
		}
    }

    static preload()
    {
        for(var fn in jscolor.imgRequire) {
			if(jscolor.imgRequire.hasOwnProperty(fn)) {
				jscolor.loadImage(fn);
			}
		}
    }

    static requireImage(filename: string)
    {
        jscolor.imgRequire[filename] = true;
    }

    static loadImage(filename: string)
    {
        if(!jscolor.imgLoaded[filename]) 
        {
			jscolor.imgLoaded[filename] = new Image();
			jscolor.imgLoaded[filename].src = jscolor.getDir()+filename;
		}
    }

    static fetchElement(mixed: string | HTMLElement): HTMLElement | null
    {
        return typeof mixed === 'string' ? document.getElementById(mixed) : mixed;
    }

    static addEvent(el: HTMLElement | Window, evnt: string, func: Function)
    {
        if(el.addEventListener)
		{
			el.addEventListener(evnt, func as EventListenerOrEventListenerObject, false);
		}
		else if((el as any).attachEvent)
		{
			(el as any).attachEvent('on'+evnt, func);
		}
    }

    static fireEvent(el: HTMLElementPlus, evnt: string)
    {
        if(!el) {
			return;
		}
        var ev;
		if(document.createEvent) 
        {
			ev = document.createEvent('HTMLEvents');
			ev.initEvent(evnt, true, true);
			el.dispatchEvent(ev);
		} 
        else if((document as DocumentPlus).createEventObject) 
        {
			ev = (document as DocumentPlus).createEventObject!();
			el.fireEvent!('on'+evnt, ev);
		} 
        else if(el['on'+evnt as keyof object]) { // alternatively use the traditional event model (IE5)
			(el['on'+evnt as keyof object] as Function)();
		}
    }

    static getElementPos(e: HTMLElement): Array<number>
    {
        var e1 : HTMLElement=e, e2=e;
		var x=0, y=0;
		if(e1.offsetParent) {
			do {
				x += e1.offsetLeft;
				y += e1.offsetTop;
			} while(e1 = (e1.offsetParent as HTMLElement));
		}
		while((e2 = (e2.parentNode as HTMLElement)) && e2.nodeName.toUpperCase() !== 'BODY') {
			x -= e2.scrollLeft;
			y -= e2.scrollTop;
		}
		return [x, y];
    }

    static getElementSize(e: HTMLElement): Array<number>
    {
        return [e.offsetWidth, e.offsetHeight];
    }

    static getRelMousePos(e: MouseEventPlus): Position
    {
        var x = 0, y = 0;
		if (!e) { e = window.event as MouseEventPlus; }
		if (typeof e.offsetX === 'number') {
			x = e.offsetX;
			y = e.offsetY;
		} else if (typeof e.layerX === 'number') {
			x = e.layerX;
			y = e.layerY;
		}
		return { x: x, y: y };
    }

    static getViewPos(): Array<number>
    {
        if(typeof window.pageYOffset === 'number') {
			return [window.pageXOffset, window.pageYOffset];
		} else if(document.body && (document.body.scrollLeft || document.body.scrollTop)) {
			return [document.body.scrollLeft, document.body.scrollTop];
		} else if(document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
			return [document.documentElement.scrollLeft, document.documentElement.scrollTop];
		} else {
			return [0, 0];
		}
    }

    static getViewSize(): Array<number>
    {
        if(typeof window.innerWidth === 'number') {
			return [window.innerWidth, window.innerHeight];
		} else if(document.body && (document.body.clientWidth || document.body.clientHeight)) {
			return [document.body.clientWidth, document.body.clientHeight];
		} else if(document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
			return [document.documentElement.clientWidth, document.documentElement.clientHeight];
		} else {
			return [0, 0];
		}
    }

    static URI = class URI
    {
        scheme: string | null;
        authority: string | null;
        path: string | null;
        query: string | null;
        fragment: string | null;

        constructor(uri?: string)
        {
            this.scheme = null;
            this.authority = null;
            this.path = '';
            this.query = null;
            this.fragment = null;
            if(uri) 
            {
                this.parse(uri);
            }
        }

        parse(uri: string)
        {
            var m: RegExpMatchArray | null = uri.match(/^(([A-Za-z][0-9A-Za-z+.-]*)(:))?((\/\/)([^\/?#]*))?([^?#]*)((\?)([^#]*))?((#)(.*))?/);
			const a : string  = m![0];
			this.scheme = m![3] ? m![2] : null;
			this.authority = m![5] ? m![6] : null;
			this.path = m![7];
			this.query = m![9] ? m![10] : null;
			this.fragment = m![12] ? m![13] : null;
			return this;
        }

        toString(): string
        {
            var result = '';
			if(this.scheme !== null) { result = result + this.scheme + ':'; }
			if(this.authority !== null) { result = result + '//' + this.authority; }
			if(this.path !== null) { result = result + this.path; }
			if(this.query !== null) { result = result + '?' + this.query; }
			if(this.fragment !== null) { result = result + '#' + this.fragment; }
			return result;
        }
        
        toAbsolute(_base: string)
        {
            var base = new jscolor.URI(_base);
			var r = this;
			var t = new jscolor.URI();

			if(base.scheme === null) { return false; }

			if(r.scheme !== null && r.scheme.toLowerCase() === base.scheme.toLowerCase()) {
				r.scheme = null;
			}

			if(r.scheme !== null) {
				t.scheme = r.scheme;
				t.authority = r.authority;
				t.path = this.removeDotSegments(r.path!);
				t.query = r.query;
			} else {
				if(r.authority !== null) {
					t.authority = r.authority;
					t.path = this.removeDotSegments(r.path!);
					t.query = r.query;
				} else {
					if(r.path === '') { // TODO: == or === ?
						t.path = base.path;
						if(r.query !== null) {
							t.query = r.query;
						} else {
							t.query = base.query;
						}
					} else {
						if(r.path!.substring(0,1) === '/') {
							t.path = this.removeDotSegments(r.path!);
						} else {
							if(base.authority !== null && base.path === '') { // TODO: == or === ?
								t.path = '/'+r.path;
							} else {
								t.path = base.path!.replace(/[^\/]+$/,'')+r.path;
							}
							t.path = this.removeDotSegments(t.path!);
						}
						t.query = r.query;
					}
					t.authority = base.authority;
				}
				t.scheme = base.scheme;
			}
			t.fragment = r.fragment;

			return t;
        }

        removeDotSegments(path: string): string
        {
            var out = '';
			while(path) {
				if(path.substring(0,3)==='../' || path.substring(0,2)==='./') {
					path = path.replace(/^\.+/,'').substring(1);
				} else if(path.substring(0,3)==='/./' || path==='/.') {
					path = '/'+path.substring(3);
				} else if(path.substring(0,4)==='/../' || path==='/..') {
					path = '/'+path.substring(4);
					out = out.replace(/\/?[^\/]*$/, '');
				} else if(path==='.' || path==='..') {
					path = '';
				} else {
					var rm = path.match(/^\/?[^\/]*/)![0];
					path = path.substring(rm.length);
					out = out + rm;
				}
			}
			return out;
        }
    }
    // function color(target: an.y, prop?: an.y): jscolor.color;
    static color = class color
    {
        required: boolean;
        adjust: boolean;
        hash: boolean;
        caps: boolean;
        slider: boolean;
        onImmediateChange?: string | Function;
        pickerOnfocus: boolean;
        pickerMode: PickerMode;
        pickerPosition: PickerPosition;
        pickerSmartPosition: boolean;
        pickerButtonHeight: number;
        pickerClosable: boolean;
        pickerCloseText: string;
        pickerButtonColor: string;
        pickerFace: number;
        pickerFaceColor: string;
        pickerBorder: number;
        pickerBorderColor: string;
        pickerInset: number;
        pickerInsetColor: string;
        pickerZIndex: number;
        hsv: Array<number>;
        rgb: Array<number>;
        leaveValue: number;
        leaveStyle: number;
        leavePad: number;
        leaveSld: number;
        modeID: number;
        abortBlur: boolean;
        target: HTMLElement;
        valueElement: HTMLElementPlus;
        styleElement: HTMLElementPlus;
        holdPad: boolean;
        holdSld: boolean;
        get Hsv(): Array<number>
        {
            return this.hsv;
        }
        get Rgb(): Array<number>
        {
            return this.rgb;
        }
        constructor(target: HTMLElement, prop?: object)
        {
            this.required = true; // refuse empty values?
            this.adjust = true; // adjust value to uniform notation?
            this.hash = false; // prefix color with # symbol?
            this.caps = true; // uppercase?
            this.slider = true; // show the value/saturation slider?
            this.valueElement = target; // value holder
            this.styleElement = target; // where to reflect current color
            this.onImmediateChange = undefined; // onchange callback (can be either string or function)
            this.hsv = [0, 0, 1]; // read-only  0-6, 0-1, 0-1
            this.rgb = [1, 1, 1]; // read-only  0-1, 0-1, 0-1
    
            this.pickerOnfocus = true; // display picker on focus?
            this.pickerMode = 'HSV'; // HSV | HVS
            this.pickerPosition = 'bottom'; // left | right | top | bottom
            this.pickerSmartPosition = true; // automatically adjust picker position when necessary
            this.pickerButtonHeight = 20; // px
            this.pickerClosable = false;
            this.pickerCloseText = 'Close';
            this.pickerButtonColor = 'ButtonText'; // px
            this.pickerFace = 10; // px
            this.pickerFaceColor = 'ThreeDFace'; // CSS color
            this.pickerBorder = 1; // px
            this.pickerBorderColor = 'ThreeDHighlight ThreeDShadow ThreeDShadow ThreeDHighlight'; // CSS color
            this.pickerInset = 1; // px
            this.pickerInsetColor = 'ThreeDShadow ThreeDHighlight ThreeDHighlight ThreeDShadow'; // CSS color
            this.pickerZIndex = 10000;
            this.leaveValue = 1<<0,
            this.leaveStyle = 1<<1,
            this.leavePad = 1<<2,
            this.leaveSld = 1<<3;
            this.modeID = this.pickerMode.toLowerCase()==='hvs' ? 1 : 0;
            this.abortBlur = false;
            this.valueElement = jscolor.fetchElement(this.valueElement) as HTMLElementPlus,
            this.styleElement = jscolor.fetchElement(this.styleElement) as HTMLElementPlus;
            this.holdPad = false,
            this.holdSld = false;
            this.target = target;
            for(var p in prop) 
            {
                if(prop.hasOwnProperty(p)) 
                {
                    (this as any)[p] = prop[p as keyof object];
                }
            }
            // target
            jscolor.addEvent(target, 'focus', ()=> 
            {
                if(this.pickerOnfocus) 
                { 
                    this.showPicker(); 
                }
            });
            jscolor.addEvent(target, 'blur', ()=>
            {
                this.blurTarget(); 
                this.abortBlur = false; return; //tamat hack
                // if(!abortBlur) 
                // {
                //     window.setTimeout(function(){ abortBlur || this.blurTarget(); abortBlur=false; }, 0);
                // } else {
                //     abortBlur = false;
                // }
            });

            // valueElement
            if(this.valueElement) 
            {
                var updateField = () => 
                {
                    this.fromString(this.valueElement.value, this.leaveValue);
                    this.dispatchImmediateChange();
                };
                jscolor.addEvent(this.valueElement, 'keyup', updateField);
                jscolor.addEvent(this.valueElement, 'input', updateField);
                jscolor.addEvent(this.valueElement, 'blur', this.blurValue);
                this.valueElement.setAttribute('autocomplete', 'off');
            }

            // styleElement
            if(this.styleElement) 
            {
                this.styleElement.jscStyle = {
                    backgroundImage : this.styleElement.style.backgroundImage,
                    backgroundColor : this.styleElement.style.backgroundColor,
                    color : this.styleElement.style.color
                };
            }

            // require images
            switch(this.modeID) {
                case 0: jscolor.requireImage('hs.png'); break;
                case 1: jscolor.requireImage('hv.png'); break;
            }
            jscolor.requireImage('cross.gif');
            jscolor.requireImage('arrow.gif');

            this.importColor();
        }

        hidePicker(): void
        {
			if(this.isPickerOwner()) 
            {
				this.removePicker();
			}
        }

        showPicker(): void
        {
            if(!this.isPickerOwner()) 
            {
				var tp = jscolor.getElementPos(this.target); // target pos
				var ts = jscolor.getElementSize(this.target); // target size
				var vp = jscolor.getViewPos(); // view pos
				var vs = jscolor.getViewSize(); // view size
				var ps = this.getPickerDims(this); // picker size
				var a, b, c;
				switch(this.pickerPosition.toLowerCase()) {
					case 'left': a=1; b=0; c=-1; break;
					case 'right':a=1; b=0; c=1; break;
					case 'top':  a=0; b=1; c=-1; break;
					default:     a=0; b=1; c=1; break;
				}
				var l = (ts[b]+ps[b])/2;

				// picker pos
				if (!this.pickerSmartPosition) 
                {
					var pp = [
						tp[a],
						tp[b]+ts[b]-l+l*c
					];
				} else {
					var pp = [
						-vp[a]+tp[a]+ps[a] > vs[a] ?
							(-vp[a]+tp[a]+ts[a]/2 > vs[a]/2 && tp[a]+ts[a]-ps[a] >= 0 ? tp[a]+ts[a]-ps[a] : tp[a]) :
							tp[a],
						-vp[b]+tp[b]+ts[b]+ps[b]-l+l*c > vs[b] ?
							(-vp[b]+tp[b]+ts[b]/2 > vs[b]/2 && tp[b]+ts[b]-l-l*c >= 0 ? tp[b]+ts[b]-l-l*c : tp[b]+ts[b]-l+l*c) :
							(tp[b]+ts[b]-l+l*c >= 0 ? tp[b]+ts[b]-l+l*c : tp[b]+ts[b]-l-l*c)
					];
				}
				this.drawPicker(pp[a], pp[b]);
			}
        }

        importColor(): void
        {
            if(!this.valueElement) 
            {
				this.exportColor();
			} 
            else 
            {
				if(!this.adjust) 
                {
					if(!this.fromString(this.valueElement.value, this.leaveValue)) 
                    {
						this.styleElement.style.backgroundImage = this.styleElement.jscStyle.backgroundImage;
						this.styleElement.style.backgroundColor = this.styleElement.jscStyle.backgroundColor;
						this.styleElement.style.color = this.styleElement.jscStyle.color;
						this.exportColor(this.leaveValue | this.leaveStyle);
					}
				} 
                else if(!this.required && /^\s*$/.test(this.valueElement.value)) 
                {
					this.valueElement.value = '';
					this.styleElement.style.backgroundImage = this.styleElement.jscStyle.backgroundImage;
					this.styleElement.style.backgroundColor = this.styleElement.jscStyle.backgroundColor;
					this.styleElement.style.color = this.styleElement.jscStyle.color;
					this.exportColor(this.leaveValue | this.leaveStyle);

				} 
                else if(this.fromString(this.valueElement.value)) 
                {
					// OK
				} 
                else 
                {
					this.exportColor();
				}
			}
        }

        exportColor(flags?: number)
        {
            flags = flags ? flags : 0;
            if(!(flags & this.leaveValue!) && this.valueElement) {
				var value = this.toString();
				if(this.caps) { value = value.toUpperCase(); }
				if(this.hash) { value = '#'+value; }
				this.valueElement.value = value;
			}
			if(!(flags & this.leaveStyle) && this.styleElement) {
				this.styleElement.style.backgroundImage = "none";
				this.styleElement.style.backgroundColor =
					'#'+this.toString();
				this.styleElement.style.color =
					0.213 * this.rgb[0] +
					0.715 * this.rgb[1] +
					0.072 * this.rgb[2]
					< 0.5 ? '#FFF' : '#000';
			}
			if(!(flags & this.leavePad) && this.isPickerOwner()) {
				this.redrawPad();
			}
			if(!(flags & this.leaveSld) && this.isPickerOwner()) {
				this.redrawSld();
			}
        }

        fromHSV(h: number | null, s: number | null, v: number | null, flags?: number)
        {
            h ?? (h! < 0 && (h=0) || h! > 6 && (h = 6));
			s ?? (s!<0 && (s=0) || s!>1 && (s=1));
			v ?? (v!<0 && (v=0) || v!>1 && (v=1));
			this.rgb = this.HSV_RGB(
				h===null ? this.hsv[0] : (this.hsv[0]=h),
				s===null ? this.hsv[1] : (this.hsv[1]=s),
				v===null ? this.hsv[2] : (this.hsv[2]=v)
			);
			this.exportColor(flags);
        }

        fromRGB(r: number, g: number, b: number, flags?: number | undefined)
        {
            r<0 && (r=0) || r>1 && (r=1);
			g<0 && (g=0) || g>1 && (g=1);
			b<0 && (b=0) || b>1 && (b=1);
			var hsv = this.RGB_HSV(
				r===null ? this.rgb[0] : (this.rgb[0]=r),
				g===null ? this.rgb[1] : (this.rgb[1]=g),
				b===null ? this.rgb[2] : (this.rgb[2]=b)
			) as Array<number>;
			if(hsv[0] !== null) {
				this.hsv[0] = hsv[0];
			}
			if(hsv[2] !== 0) {
				this.hsv[1] = hsv[1];
			}
			this.hsv[2] = hsv[2];
			this.exportColor(flags);
        }
        
        fromString(hex: string, flags?: number | undefined): boolean
        {
			var m = hex.match(/^\W*([0-9A-F]{3}([0-9A-F]{3})?)\W*$/i);
			if(!m) 
            {
				return false;
			} 
            else 
            {
				if(m[1].length === 6) { // 6-char notation
					this.fromRGB(
						parseInt(m[1].substring(0,2),16) / 255,
						parseInt(m[1].substring(2,2),16) / 255,
						parseInt(m[1].substring(4,2),16) / 255,
						flags
					);
				} else { // 3-char notation
					this.fromRGB(
						parseInt(m[1].charAt(0)+m[1].charAt(0),16) / 255,
						parseInt(m[1].charAt(1)+m[1].charAt(1),16) / 255,
						parseInt(m[1].charAt(2)+m[1].charAt(2),16) / 255,
						flags
					);
				}
				return true;
			}
        }
        
        toString(): string
        {
			return (
				(0x100 | Math.round(255*this.rgb[0])).toString(16).substring(1) +
				(0x100 | Math.round(255*this.rgb[1])).toString(16).substring(1) +
				(0x100 | Math.round(255*this.rgb[2])).toString(16).substring(1)
			);
        }
        
        RGB_HSV(r: number, g: number, b: number): Array<number | null>
        {
			var n = Math.min(Math.min(r,g),b);
			var v = Math.max(Math.max(r,g),b);
			var m = v - n;
			if(m === 0) { return [ null, 0, v ]; }
			var h = r===n ? 3+(b-g)/m : (g===n ? 5+(r-b)/m : 1+(g-r)/m);
			return [ h===6 ? 0 : h, m/v, v ];
        }
        
        HSV_RGB(h: number, s: number, v: number): Array<number>
        {
			if(h === null) { return [ v, v, v ]; }
			var i = Math.floor(h);
			var f = i%2 ? h-i : 1-(h-i);
			var m = v * (1 - s);
			var n = v * (1 - s*f);
			switch(i) {
				case 6:
				case 0: return [v,n,m];
				case 1: return [n,v,m];
				case 2: return [m,v,n];
				case 3: return [m,n,v];
				case 4: return [n,m,v];
				case 5: return [v,m,n];
                default: return [v,n,m];
			}

        }

        removePicker()
        {
			var doc = jscolor.picker.owner.valueElement.ownerDocument;
			delete jscolor.picker.owner;
			doc.getElementsByTagName('body')[0].removeChild(jscolor.picker.boxB);
        }

        drawPicker(x: number, y: number)
        {
			if(!jscolor.picker) {
				jscolor.picker = {
					box : document.createElement('div'),
					boxB : document.createElement('div'),
					pad : document.createElement('div'),
					padB : document.createElement('div'),
					padM : document.createElement('div'),
					sld : document.createElement('div'),
					sldB : document.createElement('div'),
					sldM : document.createElement('div'),
					btn : document.createElement('div'),
					btnS : document.createElement('span'),
					btnT : document.createTextNode(this.pickerCloseText)
				};
				for(var i=0,segSize=4; i<jscolor.images.sld[1]; i+=segSize) 
                {
					var seg = document.createElement('div');
					seg.style.height = segSize+'px';
					seg.style.fontSize = '1px';
					seg.style.lineHeight = '0';
					jscolor.picker.sld.appendChild(seg);
				}
				jscolor.picker.sldB.appendChild(jscolor.picker.sld);
				jscolor.picker.box.appendChild(jscolor.picker.sldB);
				jscolor.picker.box.appendChild(jscolor.picker.sldM);
				jscolor.picker.padB.appendChild(jscolor.picker.pad);
				jscolor.picker.box.appendChild(jscolor.picker.padB);
				jscolor.picker.box.appendChild(jscolor.picker.padM);
				jscolor.picker.btnS.appendChild(jscolor.picker.btnT);
				jscolor.picker.btn.appendChild(jscolor.picker.btnS);
				jscolor.picker.box.appendChild(jscolor.picker.btn);
				jscolor.picker.boxB.appendChild(jscolor.picker.box);
			}

			var p = jscolor.picker;

			// controls interaction
			p.box.onmouseup =
			p.box.onmouseout = ()=> { this.target.focus(); };
			p.box.onmousedown = (e: MouseEvent)=> 
            { 
                this.abortBlur = true; e.preventDefault(); 
                return false; 
            };
			p.box.onmousemove = (e: MouseEvent)=> 
            {
				if (this.holdPad || this.holdSld) 
                {
					this.holdPad && this.setPad(e);
					this.holdSld && this.setSld(e);
					if (document.getSelection()) 
                    {
						document.getSelection()!.empty();
					} 
                    else if (window.getSelection) 
                    {
						window.getSelection()!.removeAllRanges();
					}
					this.dispatchImmediateChange();
				}
			};
			p.padM.onmouseup =
			p.padM.onmouseout = ()=> 
            { 
                if(this.holdPad) 
                { 
                    this.holdPad=false; 
                    jscolor.fireEvent(this.valueElement,'change'); 
                } 
            };
			p.padM.onmousedown = (e: MouseEvent)=> 
            {
				this.holdPad=true;
				this.setPad(e);
				this.dispatchImmediateChange();
			};
			p.sldM.onmouseup =
			p.sldM.onmouseout = ()=> 
            { 
                if(this.holdSld) 
                { 
                    this.holdSld = false; 
                    jscolor.fireEvent(this.valueElement,'change'); 
                } 
            };
			p.sldM.onmousedown = (e: MouseEvent)=> 
            {
				this.holdSld=true;
				this.setSld(e);
				this.dispatchImmediateChange();
			};

			// picker
			var dims = this.getPickerDims(this);
			p.box.style.width = dims[0] + 'px';
			p.box.style.height = dims[1] + 'px';

			// picker border
			p.boxB.style.position = 'absolute';
			p.boxB.style.clear = 'both';
			p.boxB.style.left = x+'px';
			p.boxB.style.top = y+'px';
			p.boxB.style.zIndex = this.pickerZIndex.toString();
			p.boxB.style.border = this.pickerBorder+'px solid';
			p.boxB.style.borderColor = this.pickerBorderColor;
			p.boxB.style.background = this.pickerFaceColor;

			// pad image
			p.pad.style.width = jscolor.images.pad[0]+'px';
			p.pad.style.height = jscolor.images.pad[1]+'px';

			// pad border
			p.padB.style.position = 'absolute';
			p.padB.style.left = this.pickerFace+'px';
			p.padB.style.top = this.pickerFace+'px';
			p.padB.style.border = this.pickerInset+'px solid';
			p.padB.style.borderColor = this.pickerInsetColor;

			// pad mouse area
			p.padM.style.position = 'absolute';
			p.padM.style.left = '0';
			p.padM.style.top = '0';
			p.padM.style.width = this.pickerFace + 2 * this.pickerInset + jscolor.images.pad[0] +
                jscolor.images.arrow[0] + 'px';
			p.padM.style.height = p.box.style.height;
			p.padM.style.cursor = 'crosshair';

			// slider image
			p.sld.style.overflow = 'hidden';
			p.sld.style.width = jscolor.images.sld[0]+'px';
			p.sld.style.height = jscolor.images.sld[1]+'px';

			// slider border
			p.sldB.style.display = this.slider ? 'block' : 'none';
			p.sldB.style.position = 'absolute';
			p.sldB.style.right = this.pickerFace+'px';
			p.sldB.style.top = this.pickerFace+'px';
			p.sldB.style.border = this.pickerInset+'px solid';
			p.sldB.style.borderColor = this.pickerInsetColor;

			// slider mouse area
			p.sldM.style.display = this.slider ? 'block' : 'none';
			p.sldM.style.position = 'absolute';
			p.sldM.style.right = '0';
			p.sldM.style.top = '0';
			p.sldM.style.width = jscolor.images.sld[0] + jscolor.images.arrow[0] + this.pickerFace + 2*this.pickerInset + 'px';
			p.sldM.style.height = p.box.style.height;
			try {
				p.sldM.style.cursor = 'pointer';
			} catch(eOldIE) {
				p.sldM.style.cursor = 'hand';
			}
            let THIS = this;
			// "close" button
			function setBtnBorder() 
            {
				let insetColors = THIS.pickerInsetColor.split(/\s+/);
				let pickerOutsetColor = insetColors.length < 2 ? insetColors[0] :
                    insetColors[1] + ' ' + insetColors[0] + ' ' + insetColors[0] +
                    ' ' + insetColors[1];
				p.btn.style.borderColor = pickerOutsetColor;
			}
			p.btn.style.display = this.pickerClosable ? 'block' : 'none';
			p.btn.style.position = 'absolute';
			p.btn.style.left = this.pickerFace + 'px';
			p.btn.style.bottom = this.pickerFace + 'px';
			p.btn.style.padding = '0 15px';
			p.btn.style.height = '18px';
			p.btn.style.border = this.pickerInset + 'px solid';
			setBtnBorder();
			p.btn.style.color = this.pickerButtonColor;
			p.btn.style.font = '12px sans-serif';
			p.btn.style.textAlign = 'center';
			try {
				p.btn.style.cursor = 'pointer';
			} catch(eOldIE) {
				p.btn.style.cursor = 'hand';
			}
			p.btn.onmousedown = () => {
				this.hidePicker();
			};
			p.btnS.style.lineHeight = p.btn.style.height;
            var padImg;
			// load images in optimal order
			switch(this.modeID) 
            {
				case 0: padImg = 'hs.png'; break;
				case 1: padImg = 'hv.png'; break;
			}
			p.padM.style.backgroundImage = "url('"+jscolor.getDir()+"cross.gif')";
			p.padM.style.backgroundRepeat = "no-repeat";
			p.sldM.style.backgroundImage = "url('"+jscolor.getDir()+"arrow.gif')";
			p.sldM.style.backgroundRepeat = "no-repeat";
			p.pad.style.backgroundImage = "url('"+jscolor.getDir() + padImg + "')";
			p.pad.style.backgroundRepeat = "no-repeat";
			p.pad.style.backgroundPosition = "0 0";

			// place pointers
			this.redrawPad();
			this.redrawSld();

			jscolor.picker.owner = this;

			let doc = jscolor.picker.owner.valueElement.ownerDocument;
			doc.getElementsByTagName('body')[0].appendChild(p.boxB);
        }

        getPickerDims(o: color): Array<number>
        {
            let dims = [
				2*o.pickerInset + 2*o.pickerFace + jscolor.images.pad[0] +
                (o.slider ? 2*o.pickerInset + 2*jscolor.images.arrow[0] +
                jscolor.images.sld[0] : 0), o.pickerClosable ?
                4*o.pickerInset + 3*o.pickerFace + jscolor.images.pad[1] +
                o.pickerButtonHeight : 2*o.pickerInset + 2*o.pickerFace +
                jscolor.images.pad[1]
			];
			return dims;
        }

        redrawPad()
        {
            var yComponent: number = 0;
            // redraw the pad pointer
			switch(this.modeID) {
				case 0: yComponent = 1; break;
				case 1: yComponent = 2; break;
			}
			let x = Math.round((this.hsv[0] / 6) * (jscolor.images.pad[0]-1));
			let y = Math.round((1 - this.hsv[ yComponent ]) * (jscolor.images.pad[1]-1));
			jscolor.picker.padM.style.backgroundPosition =
				(this.pickerFace+this.pickerInset+x - Math.floor(jscolor.images.cross[0]/2)) + 
                'px ' + (this.pickerFace+this.pickerInset+y - Math.floor(jscolor.images.cross[1]/2)) + 'px';

			// redraw the slider image
			let seg = jscolor.picker.sld.childNodes;
            let rgb, s, c;
			switch(this.modeID) 
            {
				case 0:
					rgb = this.HSV_RGB(this.hsv[0], this.hsv[1], 1);
					for(let i=0; i<seg.length; i+=1) {
						(seg[i] as any).style.backgroundColor = 'rgb('+
							(rgb[0]*(1-i/seg.length)*100)+'%,'+
							(rgb[1]*(1-i/seg.length)*100)+'%,'+
							(rgb[2]*(1-i/seg.length)*100)+'%)';
					}
					break;
				case 1:
					rgb = [ this.hsv[2], 0, 0 ];
                    s = [ this.hsv[2], 0, 0 ];
                    c = [ this.hsv[2], 0, 0 ];
					let i = Math.floor(this.hsv[0]);
					let f = i % 2 ? this.hsv[0] - i : 1 - (this.hsv[0]-i);
					switch(i) 
                    {
						case 6:
						case 0: rgb = [0,1,2]; break;
						case 1: rgb = [1,0,2]; break;
						case 2: rgb = [2,0,1]; break;
						case 3: rgb = [2,1,0]; break;
						case 4: rgb = [1,2,0]; break;
						case 5: rgb = [0,2,1]; break;
					}
					for(let i=0; i < seg.length; i+=1) 
                    {
						s = 1 - 1 / (seg.length-1) * i;
						c[1] = c[0] * (1 - s * f);
						c[2] = c[0] * (1 - s);
						(seg[i] as any).style.backgroundColor = 'rgb(' +
							(c[rgb[0]]*100)+'%,' +
							(c[rgb[1]]*100)+'%,' +
							(c[rgb[2]]*100)+'%)';
					}
					break;
			}
        }

        redrawSld()
        {
            var yComponent: number = 0;
			// redraw the slider pointer
			switch(this.modeID) 
            {
				case 0: yComponent = 2; break;
				case 1: yComponent = 1; break;
			}
			var y = Math.round((1-this.hsv[yComponent]) * (jscolor.images.sld[1]-1));
			jscolor.picker.sldM.style.backgroundPosition =
				'0 ' + (this.pickerFace+this.pickerInset + y -
                Math.floor(jscolor.images.arrow[1]/2)) + 'px';
        }

        isPickerOwner(): boolean
        {
            return jscolor.picker && jscolor.picker.owner === this;
        }

        blurTarget()
        {
            if(this.valueElement === this.target) 
            {
				this.importColor();
			}
			if(this.pickerOnfocus) 
            {
				this.hidePicker();
			}
        }

        blurValue()
        {
            if(this.valueElement !== this.target) 
            {
				this.importColor();
			}
        }

        setPad(e: MouseEvent)
        {
			var mpos = jscolor.getRelMousePos(e as MouseEventPlus);
			var x = mpos.x - this.pickerFace - this.pickerInset;
			var y = mpos.y - this.pickerFace - this.pickerInset;
			switch(this.modeID) {
				case 0: this.fromHSV(x*(6/(jscolor.images.pad[0]-1)), 1 -
                    y/(jscolor.images.pad[1]-1), null, this.leaveSld); break;
				case 1: this.fromHSV(x*(6/(jscolor.images.pad[0]-1)), null, 1 -
                    y/(jscolor.images.pad[1]-1), this.leaveSld); break;
			}
        }

        setSld(e: MouseEvent)
        {
			var mpos = jscolor.getRelMousePos(e as MouseEventPlus);
			var y = mpos.y - this.pickerFace - this.pickerInset;
			switch(this.modeID) 
            {
				case 0: this.fromHSV(null, null, 1 - y/(jscolor.images.sld[1]-1), this.leavePad); break;
				case 1: this.fromHSV(null, 1 - y/(jscolor.images.sld[1]-1), null, this.leavePad); break;
			}
        }

        dispatchImmediateChange()
        {
			if (this.onImmediateChange) {
				if (typeof this.onImmediateChange === 'string') 
                {
					eval(this.onImmediateChange);
				} 
                else 
                {
					this.onImmediateChange(this);
				}
			}
        }
    }
}
// export const jscolor = new jscolorCore();