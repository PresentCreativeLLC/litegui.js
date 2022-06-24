/*const utilities = require('../src/Utilities.ts');
import html2canvas from "html2canvas";

describe('This should try to create html', () => {
    afterEach(() => {
        jest.resetAllMocks();
      });
      afterAll(() => {
        jest.clearAllMocks();
      });
    
    const { getComputedStyle } = window;
    window.getComputedStyle = (elt) => getComputedStyle(elt);
    document.documentElement.innerHTML = "<html><head></head><body><div id='capture' style='padding: 10px; background: #f5da55;'><h4>Hello world!</h4></div></body></html>";
    const h1 = document.querySelector('h4');
    
    test('h1 should be defined', function() {
        expect(h1).toBeDefined();
    });
    test('h1.content should be hello world', function() {
        expect(h1?.textContent).toEqual('Hello world!');
    });

    test('Debería tomar ss', async() =>
    {
        window.scrollTo = jest.fn();
        const objetivo = document.body;
        //const objetivo = document.querySelector('#capture') as HTMLElement;
        try
        {
            await html2canvas(objetivo).then((canvas: any) => {
                console.log("I'm here");
                console.warn("Without you babe");
                // Cuando se resuelva la promesa traerá el canvas
                // Crear un elemento <a>
                let enlace = document.createElement('a');
                enlace.download = "Captura de página web - Parzibyte.me.png";
                // Convertir la imagen a Base64
                enlace.href = canvas.toDataURL();
                // Hacer click en él
                //enlace.click();
                
                jest.spyOn(enlace, 'click');
                expect(enlace.click).toHaveBeenCalled();
            });
        }
        catch(e: any)
        {
            console.log(e);
        }
        //expect(utilities.takeAndDownloadImage(objetivo));
    });
});
*/